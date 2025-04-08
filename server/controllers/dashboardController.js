const Dashboard = require("../models/Dashboard");
const ESBeacon = require("../models/ESBeacon");

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
    return { status: 201, data: dashboard };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};

// -------------------- 2. Retrieves all dashboards from the database --------------------
exports.getDashboards = async (req, res) => {
  try {
    const dashboards = await Dashboard.find();
    return { status: 200, data: dashboards };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};

// -------------------- 3. Retrieves a specific dashboard by its name --------------------
exports.getDashboard = async (req, res) => {
  try {
    const { name } = req.params;
    const dashboard = await Dashboard.findOne({ name });
    if (!dashboard) {
      return { status: 404, error: "Dashboard not found" };
    }
    return { status: 200, data: dashboard };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};

// -------------------- 4. Retrieves the most recently updated published dashboard --------------------
exports.getActiveDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ isPublished: true }).sort({
      updatedAt: -1,
    });
    if (!dashboard) {
      return { status: 404, error: "No active dashboard found" };
    }
    return { status: 200, data: dashboard };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};

// -------------------- 5. Updates selections (plant, terminals, measurements) for a specific widget in a dashboard --------------------
exports.updateWidgetSelections = async (req, res) => {
  try {
    const { name, widgetId } = req.params;
    const { selectedPlant, selectedTerminals, selectedMeasurements } = req.body;

    const dashboard = await Dashboard.findOne({ name });
    if (!dashboard) {
      return { status: 404, error: "Dashboard not found" };
    }

    const widget = dashboard.widgets.find((w) => w.id === Number(widgetId));
    if (!widget) {
      return { status: 404, error: "Widget not found" };
    }

    // ---------------- Update widget selections -----------------
    widget.selectedPlant = selectedPlant || widget.selectedPlant;
    widget.selectedTerminals =
      selectedTerminals || widget.selectedTerminals || [];
    widget.selectedMeasurements =
      selectedMeasurements || widget.selectedMeasurements || [];
    dashboard.updatedAt = Date.now();

    await dashboard.save();
    return { status: 200, data: widget };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};

// -------------------- 6. Creates a new widget in a specific dashboard with optional initial selections --------------------
exports.createWidget = async (req, res) => {
  try {
    const { name } = req.params;
    const widgetData = req.body;
    const dashboard = await Dashboard.findOne({ name });
    if (!dashboard) {
      return { status: 404, error: "Dashboard not found" };
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
      plantId: widgetData.plantId || "", // Save plantId
      terminalId: widgetData.terminalId || "", // Save terminalId
      measurandId: widgetData.measurandId || "", // Save measurandId
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = Date.now();
    await dashboard.save();
    return { status: 201, data: newWidget };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};
// -------------------- 7. Deletes a specific widget from a dashboard by widget ID --------------------
exports.deleteWidget = async (req, res) => {
  try {
    const { name, widgetId } = req.params;
    const dashboard = await Dashboard.findOne({ name });
    if (!dashboard) {
      return { status: 404, error: "Dashboard not found" };
    }

    dashboard.widgets = dashboard.widgets.filter(
      (w) => w.id !== Number(widgetId)
    );
    dashboard.updatedAt = Date.now();
    await dashboard.save();
    return { status: 200, data: { message: "Widget deleted" } };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};

// -------------------- 8. Publishes a specific dashboard --------------------
exports.publishDashboard = async (req, res) => {
  try {
    const { name } = req.params;

    // -------------------- Unpublish all other dashboards --------------------
    await Dashboard.updateMany({ name: { $ne: name } }, { isPublished: false });

    // -------------------- Publish the selected dashboard --------------------
    const dashboard = await Dashboard.findOneAndUpdate(
      { name },
      { isPublished: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!dashboard) {
      return { status: 404, error: "Dashboard not found" };
    }
    return { status: 200, data: dashboard };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};

// -------------------- 9. Updates a specific dashboard --------------------
exports.updateDashboard = async (req, res) => {
  try {
    const { name } = req.params;
    const updateData = req.body;

    const dashboard = await Dashboard.findOneAndUpdate(
      { name },
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    );

    if (!dashboard) {
      return { status: 404, error: "Dashboard not found" };
    }
    return { status: 200, data: dashboard };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};

// -------------------- 10. Deletes a specific dashboard and manages active status if needed --------------------
exports.deleteDashboard = async (req, res) => {
  try {
    const { name } = req.params;

    const dashboard = await Dashboard.findOneAndDelete({ name });
    if (!dashboard) {
      return { status: 404, error: "Dashboard not found" };
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

    return {
      status: 200,
      data: { message: `Dashboard "${name}" deleted successfully` },
    };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};
// -------------------- 11. Updates properties for a specific widget in a dashboard --------------------
// Modified updateWidgetProperties function
exports.updateWidgetProperties = async (req, res) => {
  try {
    const { widgetId } = req.params; // Removed 'name' parameter
    const properties = req.body;

    if (!properties || Object.keys(properties).length === 0) {
      return { status: 400, error: "Properties are required" };
    }

    // Find the dashboard containing this widget
    const dashboard = await Dashboard.findOne({
      "widgets.id": Number(widgetId),
    });
    if (!dashboard) {
      return { status: 404, error: "Dashboard or widget not found" };
    }

    const widgetIndex = dashboard.widgets.findIndex(
      (w) => w.id === Number(widgetId)
    );
    if (widgetIndex === -1) {
      return { status: 404, error: "Widget not found" };
    }

    // Update widget properties
    dashboard.widgets[widgetIndex].settings = {
      ...dashboard.widgets[widgetIndex].settings,
      ...properties,
    };
    dashboard.updatedAt = Date.now();

    await dashboard.save();
    return { status: 200, data: dashboard.widgets[widgetIndex] };
  } catch (error) {
    return { status: 500, error: "Server error", message: error.message };
  }
};

// -------------------- 12. Retrieves all beacons from the database --------------------
exports.GetBeacons = async (req, res) => {
  try {
    const beacon = await ESBeacon.find();
    res.status(200).json(beacon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch beacons" });
  }
};
