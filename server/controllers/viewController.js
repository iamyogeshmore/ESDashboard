const SaveView = require("../models/SaveView");

// -------------------- 1. Save a new view --------------------
exports.saveView = async (req, res) => {
  try {
    const { name, description, widgets, plant, terminal } = req.body;

    if (!name || !plant || !terminal || !widgets || !Array.isArray(widgets)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingView = await SaveView.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingView) {
      return res.status(400).json({ message: `View "${name}" already exists` });
    }

    const newView = new SaveView({
      name,
      description: description || "",
      widgets,
      plant,
      terminal,
    });

    const savedView = await newView.save();
    res.status(201).json(savedView);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving view", error: error.message });
  }
};

//-------------------- 2. Retrieve all saved views --------------------
exports.getSavedViews = async (req, res) => {
  try {
    const views = await SaveView.find().lean();
    res.json(views);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving views", error: error.message });
  }
};

// -------------------- 3. Retrieve a specific saved view by ID --------------------
exports.getSavedViewById = async (req, res) => {
  try {
    const { id } = req.params;
    const view = await SaveView.findById(id).lean();
    if (!view) {
      return res.status(404).json({ message: "View not found" });
    }
    res.json(view);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving view", error: error.message });
  }
};

//  -------------------- 4. Delete a saved view by ID --------------------
exports.deleteSavedView = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedView = await SaveView.findByIdAndDelete(id);
    if (!deletedView) {
      return res.status(404).json({ message: "View not found" });
    }
    res.json({ message: "View deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting view", error: error.message });
  }
};

// -------------------- 5. Update widget properties --------------------
exports.updateWidgetProperties = async (req, res) => {
  try {
    const { viewId, widgetId } = req.params;
    const properties = req.body;

    if (
      !viewId ||
      !widgetId ||
      !properties ||
      Object.keys(properties).length === 0
    ) {
      return res.status(400).json({
        message: "Missing required fields: viewId, widgetId, or properties",
      });
    }

    const updatedView = await SaveView.findOneAndUpdate(
      { _id: viewId, "widgets.i": widgetId },
      { $set: { "widgets.$.properties": properties } },
      { new: true }
    ).lean();

    if (!updatedView) {
      return res.status(404).json({ message: "View or widget not found" });
    }

    res.json(updatedView);
  } catch (error) {
    res.status(500).json({
      message: "Error updating widget properties",
      error: error.message,
    });
  }
};
