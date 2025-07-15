const mongoose = require("mongoose");

const attributeValueSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttributeGroup",
      required: [true, "Attribute group reference is required"],
    },

    value: {
      type: String,
      required: [true, "Attribute value is required"],
      trim: true,
    },

    code: {
      type: String,
      trim: true,
      default: "", // For hex color codes or shorthand (e.g. #FF0000)
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AttributeValue", attributeValueSchema);
