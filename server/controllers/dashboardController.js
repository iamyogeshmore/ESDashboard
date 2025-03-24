const Dashboard = require("../models/Dashboard");

// -------------------- 1. Creates a new dashboard with provided name and optional widgets --------------------
exports.createDashboard = async (req, res) => {
  try {
    const { name, widgets } = req.body;
    const dashboard = new Dashboard({
      id: Date.now(),
      name,
      widgets: widgets || [],
      isPublished: false,
    });
    await dashboard.save();
    res.status(201).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 2. Retrieves all dashboards from the database --------------------
exports.getDashboards = async (req, res) => {
  try {
    const dashboards = await Dashboard.find();
    res.json(dashboards);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 3. Retrieves a specific dashboard by its name --------------------
exports.getDashboard = async (req, res) => {
  try {
    const { name } = req.params;
    const dashboard = await Dashboard.findOne({ name });
    if (!dashboard)
      return res.status(404).json({ message: "Dashboard not found" });
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 4. Retrieves the most recently updated published dashboard --------------------
exports.getActiveDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ isPublished: true }).sort({
      updatedAt: -1,
    });
    if (!dashboard)
      return res.status(404).json({ message: "No active dashboard found" });
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 5. Updates selections (plant, terminals, measurements) for a specific widget in a dashboard --------------------
exports.updateWidgetSelections = async (req, res) => {
  try {
    const { name, widgetId } = req.params;
    const { selectedPlant, selectedTerminals, selectedMeasurements } = req.body;

    const dashboard = await Dashboard.findOne({ name });
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

    const widget = dashboard.widgets.find((w) => w.id === Number(widgetId));
    if (!widget) {
      return res.status(404).json({ message: "Widget not found" });
    }

    // Update widget selections
    widget.selectedPlant = selectedPlant || widget.selectedPlant;
    widget.selectedTerminals =
      selectedTerminals || widget.selectedTerminals || [];
    widget.selectedMeasurements =
      selectedMeasurements || widget.selectedMeasurements || [];
    dashboard.updatedAt = Date.now();

    await dashboard.save();
    res.json(widget);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 6. Creates a new widget in a specific dashboard with optional initial selections --------------------
exports.createWidget = async (req, res) => {
  try {
    const { name } = req.params;
    const widgetData = req.body;
    const dashboard = await Dashboard.findOne({ name });
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

    const newWidget = {
      ...widgetData,
      id: Date.now(),
      type: widgetData.type,
      name: widgetData.name,
      rows: widgetData.rows,
      columns: widgetData.columns,
      addTimestamp: widgetData.addTimestamp || false,
      selectedPlant: widgetData.selectedPlant || "",
      selectedTerminals: widgetData.selectedTerminals || [],
      selectedMeasurements: widgetData.selectedMeasurements || [],
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = Date.now();
    await dashboard.save();
    res.status(201).json(newWidget);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 7. Deletes a specific widget from a dashboard by widget ID --------------------
exports.deleteWidget = async (req, res) => {
  try {
    const { name, widgetId } = req.params;
    const dashboard = await Dashboard.findOne({ name });
    if (!dashboard)
      return res.status(404).json({ message: "Dashboard not found" });

    dashboard.widgets = dashboard.widgets.filter(
      (w) => w.id !== Number(widgetId)
    );
    dashboard.updatedAt = Date.now();
    await dashboard.save();
    res.json({ message: "Widget deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 8. Updates a specific dashboard with provided data --------------------
exports.updateDashboard = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedData = req.body;
    const dashboard = await Dashboard.findOneAndUpdate(
      { name },
      { ...updatedData, updatedAt: Date.now() },
      { new: true }
    );
    if (!dashboard)
      return res.status(404).json({ message: "Dashboard not found" });
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 9. Publishes a specific dashboard and unpublishes all others --------------------
exports.publishDashboard = async (req, res) => {
  try {
    const { name } = req.params;

    // Unpublish all other dashboards
    await Dashboard.updateMany(
      { name: { $ne: name } }, // $ne means "not equal"
      { isPublished: false }
    );

    // Publish the selected dashboard
    const dashboard = await Dashboard.findOneAndUpdate(
      { name },
      { isPublished: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!dashboard)
      return res.status(404).json({ message: "Dashboard not found" });
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- 10. Deletes a specific dashboard and manages active status if needed --------------------
exports.deleteDashboard = async (req, res) => {
  try {
    const { name } = req.params;

    const dashboard = await Dashboard.findOneAndDelete({ name });
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

    // If the deleted dashboard was published, publish the most recently updated remaining dashboard
    if (dashboard.isPublished) {
      const nextDashboard = await Dashboard.findOne().sort({ updatedAt: -1 });
      if (nextDashboard) {
        await Dashboard.updateOne(
          { _id: nextDashboard._id },
          { isPublished: true, updatedAt: Date.now() }
        );
      }
    }

    res.json({ message: `Dashboard "${name}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
