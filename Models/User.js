const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ["User", "Admin", "Seller"],
    required: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true, // true = active, false = blocked
  },
  image: {
    type: String,
  },
  mobileNumber: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"], // optional but safe to limit values
  },
  dateOfBirth: {
    type: Date,
  },
  alternativeMobileNumber: {
    type: String,
  },
  hintName: {
    type: String,
  },
  location: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
