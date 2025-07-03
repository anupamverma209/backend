const Product = require("../Models/Product");
const Categories = require("../Models/Category");
const SubCategories = require("../Models/SubCategory");
const cloudinary = require("cloudinary").v2;

// Helper: Check file type
function isFileTypeSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}
// Helper: Upload to Cloudinary with dynamic resource_type
async function fileUploadToCloudinary(file, folder, type) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type, // 'image' or 'video'
  });
}

// createProduct function to handle product creation with images/videos only for Sellres
// exports.createProduct = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       price,
//       category,
//       stock,
//       artisanName,
//       artisanOrigin,
//       material,
//       tags,
//       isFeatured,
//     } = req.body;

//     const imageFiles = req.files?.image;
//     const videoFiles = req.files?.video;

//     if (
//       !title ||
//       !description ||
//       !price ||
//       !category ||
//       !stock ||
//       (!imageFiles && !videoFiles)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "title, description, price, category, stock and at least one media (image/video) is required",
//       });
//     }

//     const supportedImageTypes = ["png", "jpeg", "jpg", "webp"];
//     const supportedVideoTypes = ["mp4", "mov", "webm"];
//     const mediaArray = [];

//     // Ensure imageFiles and videoFiles are arrays
//     const imageList = Array.isArray(imageFiles)
//       ? imageFiles
//       : imageFiles
//       ? [imageFiles]
//       : [];
//     const videoList = Array.isArray(videoFiles)
//       ? videoFiles
//       : videoFiles
//       ? [videoFiles]
//       : [];

//     // Upload all images
//     for (const file of imageList) {
//       const ext = file.name.split(".").pop().toLowerCase();
//       if (!isFileTypeSupported(ext, supportedImageTypes)) {
//         return res.status(400).json({
//           success: false,
//           message: `Image file type '${ext}' is not supported`,
//         });
//       }

//       const upload = await fileUploadToCloudinary(
//         file,
//         "Achichiz/images",
//         "image"
//       );
//       mediaArray.push({
//         public_id: upload.public_id,
//         url: upload.secure_url,
//         type: "image",
//       });
//     }

//     // Upload all videos
//     for (const file of videoList) {
//       const ext = file.name.split(".").pop().toLowerCase();
//       if (!isFileTypeSupported(ext, supportedVideoTypes)) {
//         return res.status(400).json({
//           success: false,
//           message: `Video file type '${ext}' is not supported`,
//         });
//       }

//       const upload = await fileUploadToCloudinary(
//         file,
//         "Achichiz/videos",
//         "video"
//       );
//       mediaArray.push({
//         public_id: upload.public_id,
//         url: upload.secure_url,
//         type: "video",
//       });
//     }

//     // Create Product
//     const newProduct = new Product({
//       title,
//       description,
//       price,
//       category,
//       stock,
//       artisan: {
//         name: artisanName,
//         origin: artisanOrigin,
//       },
//       material,
//       tags,
//       isFeatured,
//       images: mediaArray,
//     });

//     const savedProduct = await newProduct.save();

//     return res.status(201).json({
//       success: true,
//       data: savedProduct,
//       message: "Product created successfully with images/videos",
//     });
//   } catch (error) {
//     console.error("Product creation error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while creating the product",
//     });
//   }
// };

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      subCategory,
      stock,
      artisanName,
      artisanOrigin,
      material = "Mixed",
      tags = [],
      isFeatured = false,
      isHandmade = true,
      color,
      size,
      weight,
    } = req.body;
    console.log("Request body:", size, color);

    const imageFiles = req.files?.image;
    const videoFiles = req.files?.video;

    // ✅ Only image is required
    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !imageFiles ||
      !subCategory
    ) {
      return res.status(400).json({
        success: false,
        message:
          "title, description, price, category, at least one image are required",
      });
    }
    if (!Categories.findById(category)) {
      return res.status(400).json({
        message: "Invalid category ID",
        success: false,
      });
    }
    if (!SubCategories.findById(subCategory)) {
      return res.status(400).json({
        message: "Invalid sub-category ID",
        success: false,
      });
    }

    const supportedImageTypes = ["png", "jpeg", "jpg", "webp"];
    const supportedVideoTypes = ["mp4", "mov", "webm"];
    const mediaArray = [];

    const imageList = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    const videoList = Array.isArray(videoFiles)
      ? videoFiles
      : videoFiles
      ? [videoFiles]
      : [];

    // ✅ Upload all images
    for (const file of imageList) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!isFileTypeSupported(ext, supportedImageTypes)) {
        return res.status(400).json({
          success: false,
          message: `Image file type '${ext}' is not supported`,
        });
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

    // ✅ Upload all videos (if provided)
    for (const file of videoList) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!isFileTypeSupported(ext, supportedVideoTypes)) {
        return res.status(400).json({
          success: false,
          message: `Video file type '${ext}' is not supported`,
        });
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

    // ✅ Create Product
    const newProduct = new Product({
      title,
      description,
      price,
      category,
      subCategory,
      stock,
      artisan: {
        name: artisanName,
        origin: artisanOrigin,
      },
      material,
      tags,
      isFeatured,
      isHandmade,
      images: mediaArray,
      createdBy: req.user.id,
      ratings: 0,
      numReviews: 0,
      reviews: [],
      size,
      color,
      weight,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      data: savedProduct,
      message: "Product created successfully with images/videos",
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the product",
    });
  }
};

// get my products function to fetch products created by the seller
exports.getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id; // JWT ke through aya hua seller id

    const products = await Product.find({ createdBy: userId })
      .sort({
        createdAt: -1,
      })
      .populate("category", "name") // populate category name only
      .populate("subCategory", "name"); // populate subCategory name only; // Populate creator details

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

// update product fuction to handle product updates by the seller
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findById(productId);

    // Check if product exists
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if current user is owner
    if (product.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this product",
      });
    }

    // Update basic fields
    const updatableFields = [
      "title",
      "description",
      "price",
      "category",
      "stock",
      "material",
      "tags",
      "isFeatured",
      "artisanName",
      "artisanOrigin",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "artisanName" || field === "artisanOrigin") {
          product.artisan = {
            ...product.artisan,
            name: req.body.artisanName || product.artisan?.name,
            origin: req.body.artisanOrigin || product.artisan?.origin,
          };
        } else {
          product[field] = req.body[field];
        }
      }
    });

    const newImages = [];
    const supportedImageTypes = ["jpg", "jpeg", "png", "webp"];
    const supportedVideoTypes = ["mp4", "mov", "webm"];

    // Handle image uploads
    const imageFiles = req.files?.image;
    const videoFiles = req.files?.video;

    const imageList = Array.isArray(imageFiles)
      ? imageFiles
      : imageFiles
      ? [imageFiles]
      : [];
    const videoList = Array.isArray(videoFiles)
      ? videoFiles
      : videoFiles
      ? [videoFiles]
      : [];

    // Optional: Delete existing media if `req.body.clearMedia` is true
    if (req.body.clearMedia === "true") {
      for (const media of product.images) {
        await cloudinary.uploader.destroy(media.public_id, {
          resource_type: media.type === "video" ? "video" : "image",
        });
      }
      product.images = [];
    }

    // Upload new images
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
      newImages.push({
        public_id: upload.public_id,
        url: upload.secure_url,
        type: "image",
      });
    }

    // Upload new videos
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
      newImages.push({
        public_id: upload.public_id,
        url: upload.secure_url,
        type: "video",
      });
    }

    // Append to existing media
    if (newImages.length > 0) {
      product.images.push(...newImages);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the product",
    });
  }
};

// getSingleProduct function to fetch a single product by ID

exports.getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(productId)
      .populate("createdBy", "name email accountType") // show who created the product
      .populate("reviews.user", "name"); // show review user name

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
      message: "Product fetched successfully",
    });
  } catch (error) {
    console.error("Get single product error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching product",
    });
  }
};

// deleteProduct function to delete a product by ID

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Authorization check (only creator or admin can delete)
    if (
      req.user.accountType !== "Admin" &&
      product.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this product",
      });
    }

    // ✅ Delete media from Cloudinary
    for (const media of product.images) {
      await cloudinary.uploader.destroy(media.public_id, {
        resource_type: media.type === "video" ? "video" : "image",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting product",
    });
  }
};

exports.getAllProductsforHome = async (req, res) => {
  try {
    const products = await Product.find({ status: "Approved" })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 }) // latest first
      .limit();

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching products",
    });
  }
};

exports.getSingleProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("reviews.user", "name email"); // reviewer details

    if (!product || product.status !== "Approved") {
      return res.status(404).json({
        success: false,
        message: "Product not found or not approved",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching product details",
    });
  }
};
