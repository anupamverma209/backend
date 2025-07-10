const SubCategory = require("../Models/SubCategory");
const Product = require("../Models/Product");
const slugify = require("slugify");

//  Create SubCategory

exports.createSubCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Sub-category name is required",
      });
    }

    // ✅ Check if sub-category with same name exists globally
    const existing = await SubCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Sub-category already exists",
      });
    }

    // ✅ Create slug from name
    const slug = slugify(name, { lower: true, strict: true });

    const subCategory = await SubCategory.create({ name, slug });

    res.status(201).json({
      success: true,
      message: "Sub-category created successfully",
      subCategory,
    });
  } catch (error) {
    console.error("Create SubCategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating sub-category",
      error: error.message,
    });
  }
};

// Get all SubCategories with populated category

exports.getAllSubCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("subCategories") // populate referenced SubCategory documents
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get All Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: error.message,
    });
  }
};

exports.getSubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.id;

    // ✅ Validate ObjectId format
    if (!subCategoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub-category ID format",
      });
    }

    const subCategory = await SubCategory.findById(subCategoryId);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub-category not found",
      });
    }

    res.status(200).json({
      success: true,
      subCategory,
    });
  } catch (error) {
    console.error("Get SubCategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching sub-category",
      error: error.message,
    });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.id;
    const { name } = req.body;

    // ✅ Validate subCategoryId format
    if (!subCategoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub-category ID format",
      });
    }

    // ✅ Find sub-category
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub-category not found",
      });
    }

    // ✅ Check for duplicate name (optional)
    if (name && name !== subCategory.name) {
      const existing = await SubCategory.findOne({ name });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "A sub-category with this name already exists",
        });
      }

      subCategory.name = name;
      subCategory.slug = slugify(name, { lower: true, strict: true });
    }

    const updatedSubCategory = await subCategory.save();

    res.status(200).json({
      success: true,
      message: "Sub-category updated successfully",
      subCategory: updatedSubCategory,
    });
  } catch (error) {
    console.error("Update SubCategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating sub-category",
      error: error.message,
    });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.id;

    // ✅ Step 1: Validate ID format
    if (!subCategoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub-category ID format",
      });
    }

    // ✅ Step 2: Check if SubCategory exists
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub-category not found",
      });
    }

    // ✅ Step 3: Check if any products are linked to this sub-category
    const productsUsingSubCategory = await Product.find({
      subCategory: subCategoryId,
    });

    if (productsUsingSubCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${productsUsingSubCategory.length} product(s) are using this sub-category.`,
      });
    }

    // ✅ Step 4: Delete sub-category
    await SubCategory.findByIdAndDelete(subCategoryId);

    res.status(200).json({
      success: true,
      message: "Sub-category deleted successfully",
    });
  } catch (error) {
    console.error("Delete SubCategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting sub-category",
      error: error.message,
    });
  }
};
