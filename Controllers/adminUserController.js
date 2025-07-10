//get All User details

const User = require("../Models/User");

exports.getAllUsers = async (req, res) => {
  try {
    // Exclude password & confirmPassword fields for security
    const users = await User.find().select("-password -confirmPassword");

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// get user details by ID

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Exclude password & confirmPassword
    const user = await User.findById(userId).select(
      "-password -confirmPassword"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error in getUserById controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user details",
    });
  }
};

// get all Sellers
exports.getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ accountType: "Seller" }).select(
      "-password -confirmPassword"
    );

    res.status(200).json({
      success: true,
      message: "Seller list fetched successfully",
      data: sellers,
    });
  } catch (error) {
    console.error("Error in getSellers controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching seller list",
    });
  }
};

// get all Buyers
exports.getBuyers = async (req, res) => {
  try {
    const buyers = await User.find({ accountType: "User" }).select(
      "-password -confirmPassword"
    );

    res.status(200).json({
      success: true,
      message: "Buyer list fetched successfully",
      data: buyers,
    });
  } catch (error) {
    console.error("Error in getBuyers controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching buyer list",
    });
  }
};

// get all Admin
exports.getAllAdmin = async (req, res) => {
  try {
    const allAdmin = await User.find({ accountType: "Admin" }).select(
      "-password -confirmPassword"
    );

    res.status(200).json({
      success: true,
      message: "Admin list fetched successfully",
      data: allAdmin,
    });
  } catch (error) {
    console.error("Error in Admin controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching Admin list",
    });
  }
};

// Block or Unblock User

exports.blockOrUnblockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // validate MongoDB ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // fetch the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // toggle the status
    user.isActive = !user.isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: user.isActive
        ? "User unblocked successfully"
        : "User blocked successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error in blockOrUnblockUser controller:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user status",
    });
  }
};
