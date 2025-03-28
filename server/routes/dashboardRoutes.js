const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { broadcastUpdate } = require("../websocket");

// -------------------- 1. Creates a new dashboard --------------------
router.post("/dashboards", async (req, res) => {
  const result = await dashboardController.createDashboard(req, res);
  if (result.status === 201) {
    broadcastUpdate({ type: "dashboardCreated", data: result.data });
    res.status(201).json(result.data);
  } else {
    res
      .status(result.status)
      .json({ error: result.error, message: result.message });
  }
});

// -------------------- 2. Retrieves all dashboards --------------------
router.get("/dashboards", async (req, res) => {
  const result = await dashboardController.getDashboards(req, res);
  if (result.status === 200) {
    res.status(200).json(result.data);
  } else {
    res
      .status(result.status)
      .json({ error: result.error, message: result.message });
  }
});

// -------------------- 3. Retrieves the active dashboard --------------------
router.get("/dashboards/active", async (req, res) => {
  const result = await dashboardController.getActiveDashboard(req, res);
  if (result.status === 200) {
    res.status(200).json(result.data);
  } else {
    res
      .status(result.status)
      .json({ error: result.error, message: result.message });
  }
});

// -------------------- 4. Retrieves a specific dashboard by name --------------------
router.get("/dashboards/:name", async (req, res) => {
  const result = await dashboardController.getDashboard(req, res);
  if (result.status === 200) {
    res.status(200).json(result.data);
  } else {
    res
      .status(result.status)
      .json({ error: result.error, message: result.message });
  }
});

// -------------------- 5. Creates a new widget in a specific dashboard --------------------
router.post("/dashboards/:name/widgets", async (req, res) => {
  const result = await dashboardController.createWidget(req, res);
  if (result.status === 201) {
    broadcastUpdate({ type: "widgetCreated", data: result.data });
    res.status(201).json(result.data);
  } else {
    res
      .status(result.status)
      .json({ error: result.error, message: result.message });
  }
});

// -------------------- 6. Deletes a specific widget from a dashboard --------------------
router.delete("/dashboards/:name/widgets/:widgetId", async (req, res) => {
  const result = await dashboardController.deleteWidget(req, res);
  if (result.status === 200) {
    broadcastUpdate({
      type: "widgetDeleted",
      data: { name: req.params.name, widgetId: req.params.widgetId },
    });
    res.status(200).json(result.data);
  } else {
    res
      .status(result.status)
      .json({ error: result.error, message: result.message });
  }
});

// -------------------- 7. Updates a specific dashboard --------------------
router.put("/dashboards/:name", async (req, res) => {
  const result = await dashboardController.updateDashboard(req, res);
  if (result.status === 200) {
    broadcastUpdate({ type: "dashboardUpdated", data: result.data });
    res.status(200).json(result.data);
  } else {
    res
      .status(result.status)
      .json({ error: result.error, message: result.message });
  }
});

// -------------------- 8. Publishes a specific dashboard --------------------
router.put("/dashboards/:name/publish", async (req, res) => {
  const result = await dashboardController.publishDashboard(req, res);
  if (result.status === 200) {
    broadcastUpdate({ type: "dashboardPublished", data: result.data });
    res.status(200).json(result.data);
  } else {
    res
      .status(result.status)
      .json({ error: result.error, message: result.message });
  }
});

// -------------------- 9. Deletes a specific dashboard --------------------
router.delete("/dashboards/:name", async (req, res) => {
  const result = await dashboardController.deleteDashboard(req, res);
  if (result.status === 200) {
    broadcastUpdate({
      type: "dashboardDeleted",
      data: { name: req.params.name },
    });
    res.status(200).json(result.data);
  } else {
    res
      .status(result.status)
      .json({ error: result.error, message: result.message });
  }
});

// -------------------- 10. Updates widget selections for a specific widget in a dashboard --------------------
router.put(
  "/dashboards/:name/widgets/:widgetId/selections",
  async (req, res) => {
    const result = await dashboardController.updateWidgetSelections(req, res);
    if (result.status === 200) {
      broadcastUpdate({ type: "widgetSelectionsUpdated", data: result.data });
      res.status(200).json(result.data);
    } else {
      res
        .status(result.status)
        .json({ error: result.error, message: result.message });
    }
  }
);

module.exports = router;
