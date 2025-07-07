const router = require("express").Router();
// const getAllCards = require("../Controllers/Card");
const {
  signup,
  verifyOtp,
  reSendOtp,
  Login,
  sendOtp,
  verifyOtpAndLogin,
  logout,
  SignupByMobile,
} = require("../Controllers/Auth");
const { auth, isAdmin, isUser, isSeller } = require("../Middleware/Auth");
const { upload } = require("../Middleware/upload");
const {
  createReview,
  updateReview,
  deleteReview,
  getAllReviewsForProduct,
} = require("../Controllers/ratingControllers");
const {
  getUserProfile,
  changePassword,
  updateUserProfile,
} = require("../Controllers/userProfileController");
const {
  createOrder,
  getMyOrders,
  getSingleOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
} = require("../Controllers/userOrderController");
const {
  createBlog,
  updateBlog,
  deleteBlog,
  getSingleBlogById,
  getAllBlogs,
  commentOnBlog,
  deleteComment,
  incrementViews,
} = require("../Controllers/blogController");
const { addToCart, getCart } = require("../Controllers/Card");
const createContact = require("../Controllers/contactUsController");

router.post("/send-otp", sendOtp); // mobile number signup
router.post("/verify-otp", verifyOtpAndLogin); // mobile number login user
router.post("/logout", auth, logout);
router.post("/signup", signup);
router.post("/verify", verifyOtp);
router.post("/login", Login);
router.post("/reSendOtp", reSendOtp);

// signup By mobile number

// All Review Controllers
router.post("/createRating", auth, isUser, createReview);
router.put("/updateReview/:reviewId", auth, updateReview);
router.delete("/deleteReview/:reviewId", auth, deleteReview);
router.get("/getAllReviews/:productId", auth, getAllReviewsForProduct);

// user profile route
router.get("/userProfile", auth, getUserProfile);
router.post("/changePassword", auth, changePassword);
router.put("/updateUserProfile", auth, updateUserProfile);

// create order Router
router.post("/createOrder", auth, isUser, createOrder);
router.get("/getAllOrder", auth, isUser, getMyOrders);
router.get("/getSingleOrder:id", auth, getSingleOrder);
router.put("/cancelOrder:id", auth, cancelOrder);
router.put("/updateOrderStatus:id", auth, isAdmin, updateOrderStatus); // only for Admin
router.get("/getAllOrders", auth, isAdmin, getAllOrders); //private route for admin to get
router.delete("/deleteOrder:id", auth, deleteOrder); // delete order by id

// Blog Routes
router.post("/createBlog", auth, createBlog); // create blog
router.put("/updateBlog/:id", auth, updateBlog); // update blog
router.delete("/deleteBlog/:id", auth, deleteBlog);
router.get("/getSingleBlogById/:id", getSingleBlogById);
router.get("/getAllBlogs", getAllBlogs); // first test this route
router.post("/commentOnBlog/:id", auth, commentOnBlog);
router.delete("/blogs/:blogId/comments/:commentId", auth, deleteComment);
router.patch("/blogs/:id/views", incrementViews);

// Add to Card

// Add to Card
router.post("/addToCart", auth, isUser, addToCart);
router.get("/getCart", auth, isUser, getCart);

// contact US Route

router.post("/createContact", createContact);

module.exports = router;
