const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price can't be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price can't be negative"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    //  Sub-category reference
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "Product sub-category is required"],
    },

    stock: {
      type: Number,
      default: 3,
      min: [0, "Stock can't be negative"],
    },
    artisan: {
      name: String,
      origin: String, // e.g., Rajasthan, Kashmir
    },
    material: {
      type: String,
      default: "Mixed",
    },
    tags: [String], // searchable keywords

    isHandmade: {
      type: Boolean,
      default: true,
    },

    images: [
      {
        public_id: String,
        url: String,
        type: {
          type: String,
          enum: ["image", "video"],
        },
      },
    ],

    ratings: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    trending: {
      type: Boolean,
      default: false, // true if product is trending
    },
    size: [String],
    color: [String], // Array of color options
    weight: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
