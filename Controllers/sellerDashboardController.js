const Product = require("../Models/Product");
const Order = require("../Models/Order");

const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id;
    console.log("Seller ID:", sellerId);

    // 1. Total Products created by seller
    const totalProducts = await Product.countDocuments({ createdBy: sellerId });
    console.log("Total Products:", totalProducts);

    // 2. All orders that include products created by seller
    const orders = await Order.find({}).populate("orderItems.product");
    console.log("Total Orders fetched:", orders);

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalItemsSold = 0;
    const productSalesMap = {}; // for top selling products

    for (const order of orders) {
      for (const item of order.orderItems) {
        const product = item.product;

        if (product && product.createdBy.toString() === sellerId.toString()) {
          totalOrders++;
          totalRevenue += item.price * item.quantity;
          totalItemsSold += item.quantity;

          if (productSalesMap[product._id]) {
            productSalesMap[product._id].quantity += item.quantity;
          } else {
            productSalesMap[product._id] = {
              title: product.title,
              quantity: item.quantity,
            };
          }
        }
      }
    }

    // 3. Top 5 selling products
    const topSelling = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 4. Low stock products
    const lowStockProducts = await Product.find({
      createdBy: sellerId,
      stock: { $lt: 5 },
    }).select("title stock");

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalItemsSold,
        topSellingProducts: topSelling,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Error in getSellerStats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching seller stats",
    });
  }
};

module.exports = getSellerStats;
