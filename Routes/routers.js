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
  addToCartController,
  removeCartItem,
  addToWishlistController,
  removeFromWishlistController
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
const User = require("../Models/user");
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

// router.get("/cards", getAllCards);

router.post("/send-otp", sendOtp); // mobile number signup
router.post("/verify-otp", verifyOtpAndLogin); // mobile number login user
router.post("/logout", auth, logout);
router.post("/signup", signup);
//router.post("/signupByMobile", SignupByMobile);
router.post("/verify", verifyOtp);//email login signup varification
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

// private routes for different user roles
router.get("/Admin", auth, isSeller, (req, res) => {
  res.send("Welcome to the Admin dashboard");
  res.status(200).json({
    message: "User authenticated successfully",
    success: true,
    user: req.user,
  });
});

router.get("/User", auth, isUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -confirmPassword")
      .populate("addtocart")
      .populate("orders")
      .populate("addtowishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user data",
      error: error.message,
    });
  }
});

router.get("/Seller", auth, isSeller, (req, res) => {
  res.send("Welcome to the Seller dashboard");
  res.status(200).json({
    message: "User authenticated successfully",
    success: true,
    user: req.user,
  });
});
router.put("/updateUserProfile", auth, updateUserProfile);
router.post("/addtocart/:productid",auth,isUser,addToCartController)
router.patch("/removeitem/:productid", auth,isUser, removeCartItem);
router.post("/addtowishlist/:productid", auth,isUser, addToWishlistController);
router.patch("/removefromwishlist/:productid", auth,isUser,removeFromWishlistController);

router.post("/createBlog", auth, createBlog); // create blog
router.put("/updateBlog/:id", auth, updateBlog); // update blog
router.delete("/deleteBlog/:id", auth, deleteBlog);
router.get("/getSingleBlogById/:id", getSingleBlogById);
router.get("/getAllBlogs", getAllBlogs); // first test this route
router.post("/commentOnBlog/:id", auth, commentOnBlog);
router.delete("/blogs/:blogId/comments/:commentId", auth, deleteComment);
router.patch("/blogs/:id/views", incrementViews);


module.exports = router;
