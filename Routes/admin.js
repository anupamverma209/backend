const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../Middleware/Auth");

const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../Controllers/categoryController");
const {
  createSubCategory,
  getAllSubCategories,
  deleteSubCategory,
  updateSubCategory,
  getSubCategory,
} = require("../Controllers/subCategoryController");
const {
  getAllUsers,
  getUserById,
  getSellers,
  getBuyers,
  getAllAdmin,
  blockOrUnblockUser,
} = require("../Controllers/adminUserController");
const {
  getAllPendingProducts,
  approveProduct,
  rejectProduct,
  deleteProduct,
} = require("../Controllers/adminProductController");

const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
} = require("../Controllers/adminOrderController");
const {
  getOverviewStats,
  getTopSellingProducts,
  getRecentOrders,
  getMonthlyRevenueChart,
} = require("../Controllers/adminDashboardController");

// Create, Update, Delete, and Get Categories
router.post("/createCategory", auth, isAdmin, createCategory);
router.put("/updateCategory/:id", auth, isAdmin, updateCategory);
router.delete("/deleteCategory/:id", auth, isAdmin, deleteCategory);
router.get("/getAllCategories", auth, isAdmin, getAllCategories);

// create subcategory update delete and get subcategories
router.post("/createSubCategory", auth, isAdmin, createSubCategory);
router.get("/getAllSubCategories", auth, isAdmin, getAllSubCategories);
router.get("/getSubcategories/:id", getSubCategory);
router.put("/updateSubCategory/:id", auth, isAdmin, updateSubCategory);
router.delete("/deleteSubCategory/:id", auth, isAdmin, deleteSubCategory);

// Admin User Routes
router.get("/getAllUsers", auth, isAdmin, getAllUsers);
router.get("/getUserById/:id", auth, isAdmin, getUserById);
router.get("/getSellers", auth, isAdmin, getSellers);
router.get("/getBuyers", auth, isAdmin, getBuyers);
router.get("/getAllAdmin", auth, isAdmin, getAllAdmin);
router.patch("/blockOrUnblockUser/:id", auth, isAdmin, blockOrUnblockUser);

// Admin Product Routes
router.get("/getAllPendingProducts", auth, isAdmin, getAllPendingProducts);
router.patch("/approveProduct/:id", auth, isAdmin, approveProduct);
router.patch("/rejectProduct/:id", auth, isAdmin, rejectProduct);
router.delete("/deleteProducts/:id", deleteProduct);
//getAllProducts route likhna hai

// Admin Order Routes
router.get("/getAllOrders", auth, isAdmin, getAllOrders);
router.post("/updateOrderStatus", auth, isAdmin, updateOrderStatus);
router.delete("/deleteOrder/:orderId", auth, isAdmin, deleteOrder);
router.get("/getOrderById/:orderId", auth, isAdmin, getOrderById);

// Admin Dashboard Routes
router.get("/getOverviewStats", auth, isAdmin, getOverviewStats);
router.get("/getTopSellingProducts", auth, isAdmin, getTopSellingProducts);
router.get("/getRecentOrders", auth, isAdmin, getRecentOrders);
router.get("/getMonthlyRevenueChart", auth, isAdmin, getMonthlyRevenueChart);

module.exports = router;
