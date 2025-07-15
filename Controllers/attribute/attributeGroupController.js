const AttributeGroup = require("../../Models/AttributeGroup");
const subcategories = require("../../Models/SubCategory");
const slugify = require("slugify");

exports.createAttributeGroup = async (req, res) => {
  try {
    const {
      name,
      subCategory,
      isVariant = true,
      isFilterable = true,
      displayType = "radio",
    } = req.body;

    // 1. Validation
    if (!name || !subCategory || !displayType) {
      return res.status(400).json({
        success: false,
        message: "Name, SubCategory and Display Type are required.",
      });
    }
    const existSubCategory = await subcategories.findById({ _id: subCategory });
    if (!existSubCategory) {
      return res.status(400).json({
        success: false,
        message: "subCategory Not founded",
      });
    }

    // 2. Check duplicate name
    const existing = await AttributeGroup.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attribute group with this name already exists.",
      });
    }

    // 3. Create slug from name
    const slug = slugify(name, { lower: true });

    // 4. Create the group
    const attributeGroup = await AttributeGroup.create({
      name: name.trim(),
      slug,
      subCategory,
      isVariant,
      isFilterable,
      displayType,
      createdBy: req.user.id, // If logged-in user info is available
    });

    res.status(201).json({
      success: true,
      message: "Attribute group created successfully.",
      data: attributeGroup,
    });
  } catch (error) {
    console.error("Error creating attribute group:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating attribute group.",
    });
  }
};

exports.getAllAttributeGroups = async (req, res) => {
  try {
    const { subCategory } = req.query;

    // Optional filtering
    const filter = {};
    if (subCategory) {
      filter.subCategory = subCategory;
    }

    const attributeGroups = await AttributeGroup.find(filter)
      .populate("subCategory", "name") // optional: show subCategory name
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attributeGroups.length,
      data: attributeGroups,
    });
  } catch (error) {
    console.error("Error fetching attribute groups:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attribute groups.",
    });
  }
};

exports.updateAttributeGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subCategory, isVariant, isFilterable, displayType } =
      req.body;

    // 1. Fetch existing group
    const group = await AttributeGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Attribute group not found",
      });
    }

    // 2. Update fields (only if provided)
    if (name) {
      group.name = name.trim();
      group.slug = slugify(name, { lower: true });
    }
    if (subCategory) group.subCategory = subCategory;
    if (isVariant !== undefined) group.isVariant = isVariant;
    if (isFilterable !== undefined) group.isFilterable = isFilterable;
    if (displayType) group.displayType = displayType;

    // 3. Save updated group
    await group.save();

    res.status(200).json({
      success: true,
      message: "Attribute group updated successfully",
      data: group,
    });
  } catch (error) {
    console.error("Error updating attribute group:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating attribute group",
    });
  }
};

exports.deleteAttributeGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await AttributeGroup.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Attribute group not found",
      });
    }

    await group.deleteOne();

    res.status(200).json({
      success: true,
      message: "Attribute group deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attribute group:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting attribute group",
    });
  }
};

exports.getAttributeGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await AttributeGroup.findById(id).populate(
      "subCategory",
      "name"
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Attribute group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error fetching attribute group by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching attribute group",
    });
  }
};
