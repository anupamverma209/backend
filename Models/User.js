const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  accountType: {
    type: String,
    enum: ["User", "Admin", "Seller"],
    required: true,
  },
<<<<<<< HEAD
  otp: String,
  otpExpires: Date,
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  image: String,
  mobileNumber: String,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dateOfBirth: Date,
  alternativeMobileNumber: String,
  hintName: String,
  location: String,

  // ✅ Fixed: Arrays of references
  addtowishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  addtocart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
=======
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
>>>>>>> refs/remotes/origin/master
});

module.exports = mongoose.model("User", userSchema);
