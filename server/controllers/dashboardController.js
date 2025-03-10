const Dashboard = require("../models/Dashboard");

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

exports.getDashboards = async (req, res) => {
  try {
    const dashboards = await Dashboard.find();
    res.json(dashboards);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

exports.createWidget = async (req, res) => {
  try {
    const { name } = req.params;
    const widgetData = req.body;
    const dashboard = await Dashboard.findOne({ name });
    if (!dashboard)
      return res.status(404).json({ message: "Dashboard not found" });

    dashboard.widgets.push(widgetData);
    dashboard.updatedAt = Date.now();
    await dashboard.save();
    res.status(201).json(widgetData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

// New Delete Dashboard API
exports.deleteDashboard = async (req, res) => {
      try {
        const { name } = req.params;
    
        // Find and delete the dashboard
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