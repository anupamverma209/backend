// controllers/categoryController.js

const Category = require("../Models/Category");
const SubCategory = require("../Models/SubCategory");
const slugify = require("slugify");
const mongoose = require("mongoose");

// create category controller

exports.createCategory = async (req, res) => {
  try {
    const { name, subCategories } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const slug = slugify(name, { lower: true });

    const categoryData = {
      name,
      slug,
    };

    // ✅ Check if subCategories is valid and convert to ObjectIds
    if (Array.isArray(subCategories) && subCategories.length > 0) {
      // Validate and convert
      categoryData.subCategories = subCategories.map((id) =>
        mongoose.Types.ObjectId(id)
      );
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating category",
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
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

//update category controller
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if the new name is used by another category
    const duplicate = await Category.findOne({ name });
    if (duplicate && duplicate._id.toString() !== categoryId) {
      return res.status(400).json({
        success: false,
        message: "Another category with this name already exists",
      });
    }

    // Update name and slug
    existingCategory.name = name;
    existingCategory.slug = slugify(name, { lower: true });

    const updatedCategory = await existingCategory.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating category",
      error: error.message,
    });
  }
};

// delete category controller
// controllers/categoryController.js

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Step 1: Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Step 2: Check if products are using this category
    const linkedProducts = await Product.find({ category: categoryId });
    if (linkedProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${linkedProducts.length} product(s) are still using this category.`,
      });
    }

    // Step 3: Delete all subcategories of this category
    await SubCategory.deleteMany({ category: categoryId });

    // Step 4: Delete the category
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: "Category and all its subcategories deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
      error: error.message,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .select("name slug _id")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: error.message,
    });
  }
};
