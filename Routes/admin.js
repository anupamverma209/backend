const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../Middleware/Auth");

const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../Controllers/categoryController");
const {
  createSubCategory,
  getAllSubCategories,
  deleteSubCategory,
  updateSubCategory,
  getSubCategory,
} = require("../Controllers/subCategoryController");

// Create, Update, Delete, and Get Categories
router.post("/createCategory", auth, isAdmin, createCategory);
router.put("/updateCategory:id", auth, isAdmin, updateCategory);
router.delete("/deleteCategory:id", auth, isAdmin, deleteCategory);
router.get("/getAllCategories", auth, isAdmin, getAllCategories);

// create subcategory update delete and get subcategories
router.post("/createSubCategory", auth, isAdmin, createSubCategory);
router.get("/getAllSubCategories", auth, isAdmin, getAllSubCategories);
router.get("/getSubcategories/:id", getSubCategory);
router.put("/updateSubCategory:id", auth, isAdmin, updateSubCategory);
router.delete("/deleteSubCategory:id", auth, isAdmin, deleteSubCategory);

module.exports = router;
