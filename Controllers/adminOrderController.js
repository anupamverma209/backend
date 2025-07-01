// controllers/orderController.js

const Order = require("../Models/Order");
const User = require("../Models/user");
const Product = require("../Models/Product");
const Notification = require("../Models/Notification");

exports.getAllOrders = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      buyer,
      seller,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    // status filter
    if (status) {
      filter.orderStatus = status;
    }

    // date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // buyer filter by name or email
    if (buyer) {
      // get user id from name or email
      const userDoc = await User.findOne({
        $or: [
          { name: { $regex: buyer, $options: "i" } },
          { email: { $regex: buyer, $options: "i" } },
        ],
      });
      if (userDoc) {
        filter.user = userDoc._id;
      } else {
        // no matching buyer
        return res.status(200).json({
          success: true,
          message: "No orders found for buyer",
          data: [],
        });
      }
    }

    // seller filter
    if (seller) {
      // find products created by this seller
      const productsOfSeller = await Product.find({ createdBy: seller }).select(
        "_id"
      );
      const productIds = productsOfSeller.map((p) => p._id);
      filter["orderItems.product"] = { $in: productIds };
    }

    // pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // sort
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // total count
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("user", "name email accountType")
      .populate({
        path: "orderItems.product",
        select: "title category subCategory createdBy price",
        populate: [
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
          { path: "createdBy", select: "name email accountType" },
        ],
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    console.error("Error in getAllOrders controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body;
    const adminId = req.user.id; // assuming JWT auth middleware sets req.user

    // validate
    if (!orderId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "orderId and newStatus are required",
      });
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // optionally verify allowed transitions
    const allowedStatuses = [
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "refunded",
    ];
    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${newStatus}`,
      });
    }

    // change status
    order.orderStatus = newStatus;

    // if delivered, set deliveredAt
    if (newStatus === "Delivered") {
      order.deliveredAt = new Date();
    }

    // override log (you could extend orderSchema to store this, for now send in response)
    const statusUpdatedBy = adminId;

    await order.save();

    // notify buyer
    await Notification.create({
      recipient: order.user._id,
      sender: adminId,
      type: "order",
      message: `Your order status has been changed to ${newStatus}`,
      relatedOrder: order._id,
    });

    // optionally notify sellers of products in order
    const productIds = order.orderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const sellerIds = [...new Set(products.map((p) => p.createdBy.toString()))];

    for (const sellerId of sellerIds) {
      await Notification.create({
        recipient: sellerId,
        sender: adminId,
        type: "order",
        message: `An order containing your product has been marked as ${newStatus}`,
        relatedOrder: order._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      updatedBy: statusUpdatedBy,
      data: order,
    });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};

// controllers/orderController.js

exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const order = await Order.findById(orderId)
      .populate("user")
      .populate("orderItems.product");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // optional: allow only super-admin
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete orders",
      });
    }

    // simulate payment/refund check
    if (
      order.paymentStatus === "Completed" &&
      order.orderStatus !== "refunded"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete paid order without proper refund",
      });
    }

    // update stock for each product
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // remove order
    await order.deleteOne();

    // optional: notify user
    await Notification.create({
      recipient: order.user._id,
      sender: req.user.id,
      type: "order",
      message: `Your order with ID ${orderId} has been deleted by admin.`,
      relatedOrder: order._id,
    });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    console.error("deleteOrder error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while deleting order",
    });
  }
};

// controllers/orderController.js

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "user",
        select: "name email accountType",
      })
      .populate({
        path: "orderItems.product",
        populate: [
          {
            path: "category",
            select: "name slug",
          },
          {
            path: "subCategory",
            select: "name slug",
          },
          {
            path: "createdBy",
            select: "name email accountType",
          },
        ],
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};
