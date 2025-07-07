const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sub-category name is required"],
      trim: true,
      maxlength: 100,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
