const Order = require("../Models/Order");
const Product = require("../Models/Product");
const mongoose = require("mongoose");

// create order by user only with user is User role based othentiation
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingInfo, paymentMethod, totalAmount } = req.body;

    //  Validation
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items to order",
      });
    }

    if (!shippingInfo || !paymentMethod || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    let calculatedTotal = 0;

    // Verify each product and calculate total
    for (let item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}`,
        });
      }

      // Total Calculation
      calculatedTotal += item.price * item.quantity;
    }

    //  Total Match Verification
    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Total amount mismatch",
      });
    }

    //  Create Order
    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingInfo,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === "Online" ? "Pending" : "Completed",
      isPaid: paymentMethod === "Online" ? false : true,
    });

    // Reduce Stock
    for (let item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Error while creating order:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while placing the order",
    });
  }
};

// Get all orders by user or admin
exports.getMyOrders = async (req, res) => {
  try {
    // 🧑‍💻 Get user ID from JWT middleware
    const userId = req.user.id;

    // 🔍 Fetch all orders by this user
    const orders = await Order.find({ user: userId })
      .populate("orderItems.product", "title price images")
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      orders,
    });
  } catch (err) {
    console.error("Error in getMyOrders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
    });
  }
};

// Get single order by ID
exports.getSingleOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    //  Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // 🔎 Find order and populate product and user
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("orderItems.product", "title price images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 🔐 Allow only owner or admin to access
    if (
      order.user._id.toString() !== req.user.id.toString() &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to this order",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (err) {
    console.error("Error in getSingleOrder:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // 📌 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 🔐 Only owner or admin can cancel
    const isAdmin = req.user.accountType === "Admin";
    const isOwner = order.user.toString() === req.user.id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }

    // 🛑 Already delivered/cancelled
    if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order already ${order.orderStatus.toLowerCase()}, cannot cancel`,
      });
    }

    // 🧾 Update order
    order.orderStatus = "Cancelled";
    order.paymentStatus = "Failed";
    order.deliveredAt = null;
    await order.save();

    // 🔁 Restore stock
    for (let item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while cancelling the order",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { newStatus } = req.body;

    // Check Admin Auth
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only",
      });
    }

    // 📌 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // 🔍 Fetch Order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 🚫 Can't update if already Cancelled or Delivered
    if (["Cancelled", "Delivered"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.orderStatus.toLowerCase()}, can't update`,
      });
    }

    // 🚫 Prevent invalid transitions
    const validStatus = ["Processing", "Shipped", "Delivered"];
    if (!validStatus.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided",
      });
    }

    //  Disallow backward flow (e.g. Shipped -> Processing)
    const currentIndex = validStatus.indexOf(order.orderStatus);
    const newIndex = validStatus.indexOf(newStatus);
    if (newIndex <= currentIndex) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order status backward`,
      });
    }

    // ✅ Update status
    order.orderStatus = newStatus;

    //  If delivered, set deliveredAt & mark isPaid
    if (newStatus === "Delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "Completed";
      order.isPaid = true;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      order,
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating order",
    });
  }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    // Check if admin
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // 📦 Fetch all orders, populate user & products
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "title price images")
      .sort({ createdAt: -1 }); // Latest first

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      message: "All orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching orders",
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // 🔍 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // 🔍 Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 🔐 Check if user is authorized
    if (
      req.user.accountType !== "Admin" &&
      order.user.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this order",
      });
    }

    // ❌ Disallow deleting delivered orders
    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be deleted",
      });
    }

    // 🗑 Delete the order
    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the order",
    });
  }
};
