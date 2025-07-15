const Product = require("../../Models/Product");
const Categories = require("../../Models/Category");
const SubCategories = require("../../Models/SubCategory");
const cloudinary = require("cloudinary").v2;

// Helper: Check file type
function isFileTypeSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}

// Helper: Upload to Cloudinary with dynamic resource_type
async function fileUploadToCloudinary(file, folder, type) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type,
  });
}

// @desc    Create Product with variants and gallery
// @access  Private (Seller only)
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      description,
      price,
      discountedPrice,
      category,
      subCategory,
      stock,
      artisanName,
      artisanOrigin,
      material = "Mixed",
      tags = [],
      isFeatured = false,
      isHandmade = true,
      trending = false,
      variantAttributes = [],
      variants = [],
      status,
    } = req.body;

    const imageFiles = req.files?.image;
    const videoFiles = req.files?.video;

    if (
      !title ||
      !subTitle ||
      !description ||
      !price ||
      !category ||
      !subCategory ||
      !imageFiles
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields missing. Please provide title, subTitle, description, price, category, subCategory, and at least one image.",
      });
    }

    // Validate category & subcategory
    const categoryExists = await Categories.findById(category);
    const subCategoryExists = await SubCategories.findById(subCategory);
    if (!categoryExists || !subCategoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category or subCategory ID.",
      });
    }

    // Handle general images/videos upload
    const supportedImageTypes = ["png", "jpeg", "jpg", "webp"];
    const supportedVideoTypes = ["mp4", "mov", "webm"];
    const mediaArray = [];

    const imageList = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    const videoList = Array.isArray(videoFiles)
      ? videoFiles
      : videoFiles
      ? [videoFiles]
      : [];

    for (const file of imageList) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!isFileTypeSupported(ext, supportedImageTypes)) {
        return res
          .status(400)
          .json({ success: false, message: `Unsupported image type: ${ext}` });
      }
      const upload = await fileUploadToCloudinary(
        file,
        "Achichiz/images",
        "image"
      );
      mediaArray.push({
        public_id: upload.public_id,
        url: upload.secure_url,
        type: "image",
      });
    }

    for (const file of videoList) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!isFileTypeSupported(ext, supportedVideoTypes)) {
        return res
          .status(400)
          .json({ success: false, message: `Unsupported video type: ${ext}` });
      }
      const upload = await fileUploadToCloudinary(
        file,
        "Achichiz/videos",
        "video"
      );
      mediaArray.push({
        public_id: upload.public_id,
        url: upload.secure_url,
        type: "video",
      });
    }

    // Create product with variants
    const newProduct = new Product({
      title,
      subTitle,
      description,
      price,
      discountedPrice,
      category,
      subCategory,
      stock,
      artisan: { name: artisanName, origin: artisanOrigin },
      material,
      tags,
      isFeatured,
      isHandmade,
      trending,
      variantAttributes,
      variants,
      images: mediaArray,
      createdBy: req.user.id,
      ratings: 0,
      numReviews: 0,
      status: status || "Pending",
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully with variants.",
      data: savedProduct,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating product",
    });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Product.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("variantAttributes", "name") // Populate attribute groups like Size, Color
      .populate("variants.attributes.group", "name") // Populate group name inside variants
      .populate("variants.attributes.value", "value") // Populate actual value (e.g., M, Red)
      .populate("createdBy", "name email"); // Optional: if you want seller info

    return res.status(200).json({
      success: true,
      data: products,
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error("Error in getMyProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching products",
    });
  }
};
