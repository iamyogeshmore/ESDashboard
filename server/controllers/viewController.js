const SaveView = require("../models/SaveView");

exports.saveView = async (req, res) => {
  try {
    const { name, description, widgets, plant, terminal } = req.body;

    if (!name || !plant || !terminal || !widgets || !Array.isArray(widgets)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate widget positions
    const invalidWidgets = widgets.filter(
      (widget) =>
        !widget.position ||
        typeof widget.position.x !== "number" ||
        typeof widget.position.y !== "number" ||
        typeof widget.position.width !== "number" ||
        typeof widget.position.height !== "number"
    );

    if (invalidWidgets.length > 0) {
      console.log("Invalid widgets:", invalidWidgets);
      return res.status(400).json({ message: "Invalid widget position data" });
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
      widgets: widgets.map((widget) => ({
        ...widget,
        position: {
          x: widget.position.x,
          y: widget.position.y,
          width: widget.position.width,
          height: widget.position.height,
        },
      })),
      plant,
      terminal,
    });

    const savedView = await newView.save();
    console.log("Saved view:", savedView); // Debug log
    res.status(201).json(savedView);
  } catch (error) {
    console.error("Error saving view:", error);
    res
      .status(500)
      .json({ message: "Error saving view", error: error.message });
  }
};

exports.updateSavedView = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, widgets, plant, terminal } = req.body;

    if (!name || !plant || !terminal || !widgets || !Array.isArray(widgets)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate widget positions
    const invalidWidgets = widgets.filter(
      (widget) =>
        !widget.position ||
        typeof widget.position.x !== "number" ||
        typeof widget.position.y !== "number" ||
        typeof widget.position.width !== "number" ||
        typeof widget.position.height !== "number"
    );

    if (invalidWidgets.length > 0) {
      console.log("Invalid widgets:", invalidWidgets);
      return res.status(400).json({ message: "Invalid widget position data" });
    }

    const view = await SaveView.findById(id);
    if (!view) {
      return res.status(404).json({ message: "View not found" });
    }

    const existingView = await SaveView.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id },
    });
    if (existingView) {
      return res.status(400).json({ message: `View "${name}" already exists` });
    }

    const updatedView = await SaveView.findByIdAndUpdate(
      id,
      {
        name,
        description: description || "",
        widgets: widgets.map((widget) => ({
          ...widget,
          position: {
            x: widget.position.x,
            y: widget.position.y,
            width: widget.position.width,
            height: widget.position.height,
          },
        })),
        plant,
        terminal,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedView) {
      return res.status(404).json({ message: "View not found" });
    }

    console.log("Updated view:", updatedView); // Debug log
    res.json(updatedView);
  } catch (error) {
    console.error("Error updating view:", error);
    res
      .status(500)
      .json({ message: "Error updating view", error: error.message });
  }
};

// Keep other existing methods (getSavedViews, getSavedViewById, deleteSavedView, updateWidgetProperties) unchanged
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
