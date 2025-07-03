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

// router.get("/cards", getAllCards);

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
// create order Router
router.post("/createOrder", auth, isUser, createOrder);
router.get("/getAllOrder", auth, isUser, getMyOrders);
router.get("/getSingleOrder:id", auth, getSingleOrder);
router.put("/cancelOrder:id", auth, cancelOrder);
router.put("/updateOrderStatus:id", auth, isAdmin, updateOrderStatus); // only for Admin
router.get("/getAllOrders", auth, isAdmin, getAllOrders); //private route for admin to get
router.delete("/deleteOrder:id", auth, deleteOrder); // delete order by id

// private routes for different user roles
router.get("/Admin", auth, isSeller, (req, res) => {
  res.send("Welcome to the Admin dashboard");
  res.status(200).json({
    message: "User authenticated successfully",
    success: true,
    user: req.user,
  });
});

router.get("/User", auth, isUser, (req, res) => {
  res.send("Welcome to the User dashboard");
  res.status(200).json({
    message: "User authenticated successfully",
    success: true,
    user: req.user,
  });
});

router.get("/Seller", auth, isSeller, (req, res) => {
  res.send("Welcome to the Seller dashboard");
  res.status(200).json({
    message: "User authenticated successfully",
    success: true,
    user: req.user,
  });
});

module.exports = router;
