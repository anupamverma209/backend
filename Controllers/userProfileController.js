const User = require("../Models/user");
const bcrypt = require("bcrypt");

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // JWT se aya hua user
    const user = await User.findById(userId).select(
      "-password -confirmPassword -otp -otpExpires"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // get data from req body
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // check all field filed or not
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(401).json({
        success: false,
        message: "All fields are required",
      });
    }
    // check new password or confirmed password are equal or not
    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New passwords do not match" });
    }

    // here find this user exist in my database or not
    const user = await User.findById(userId);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Password change failed",
      error: err.message,
    });
  }
};
