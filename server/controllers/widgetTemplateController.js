const WidgetTemplate = require("../models/WidgetTemplate");

exports.saveWidgetTemplate = async (req, res) => {
  try {
    const { name, settings } = req.body;

    if (!name || !settings) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingTemplate = await WidgetTemplate.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingTemplate) {
      return res.status(400).json({ message: `Template "${name}" already exists` });
    }

    const newTemplate = new WidgetTemplate({ name, settings });
    const savedTemplate = await newTemplate.save();
    res.status(201).json(savedTemplate);
  } catch (error) {
    console.error("Error saving widget template:", error);
    res.status(500).json({ message: "Error saving template", error: error.message });
  }
};

exports.getWidgetTemplates = async (req, res) => {
  try {
    const templates = await WidgetTemplate.find().lean();
    res.json(templates);
  } catch (error) {
    console.error("Error retrieving widget templates:", error);
    res.status(500).json({ message: "Error retrieving templates", error: error.message });
  }
};

exports.getWidgetTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await WidgetTemplate.findById(id).lean();
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    console.error("Error retrieving widget template:", error);
    res.status(500).json({ message: "Error retrieving template", error: error.message });
  }
};

exports.updateWidgetTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, settings } = req.body;

    if (!name || !settings) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingTemplate = await WidgetTemplate.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id },
    });
    if (existingTemplate) {
      return res.status(400).json({ message: `Template "${name}" already exists` });
    }

    const updatedTemplate = await WidgetTemplate.findByIdAndUpdate(
      id,
      { name, settings },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating widget template:", error);
    res.status(500).json({ message: "Error updating template", error: error.message });
  }
};

exports.deleteWidgetTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTemplate = await WidgetTemplate.findByIdAndDelete(id);
    if (!deletedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting widget template:", error);
    res.status(500).json({ message: "Error deleting template", error: error.message });
  }
};