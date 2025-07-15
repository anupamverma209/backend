const mongoose = require("mongoose");

const attributeGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attribute group name is required"],
      trim: true,
      unique: true, // e.g., Size, Color
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "SubCategory reference is required"],
    },

    isVariant: {
      type: Boolean,
      default: true, // true → used for product variant combinations
    },

    isFilterable: {
      type: Boolean,
      default: true, // true → show on frontend filters
    },

    // 🔥 NEW: seller can choose how this attribute appears on frontend
    displayType: {
      type: String,
      enum: ["dropdown", "radio", "swatch", "textbox"],
      default: "radio",
      required: [true, "Display type is required"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin/seller who created the attribute
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AttributeGroup", attributeGroupSchema);
