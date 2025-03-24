const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// -------------------- 1. Creates a new dashboard --------------------
router.post("/dashboards", dashboardController.createDashboard);

// -------------------- 2. Retrieves all dashboards --------------------
router.get("/dashboards", dashboardController.getDashboards);

// -------------------- 3. Retrieves the active dashboard --------------------
router.get("/dashboards/active", dashboardController.getActiveDashboard);

// -------------------- 4. Retrieves a specific dashboard by name --------------------
router.get("/dashboards/:name", dashboardController.getDashboard);

// -------------------- 5. Creates a new widget in a specific dashboard --------------------
router.post("/dashboards/:name/widgets", dashboardController.createWidget);

// -------------------- 6. Deletes a specific widget from a dashboard --------------------
router.delete(
  "/dashboards/:name/widgets/:widgetId",
  dashboardController.deleteWidget
);

// -------------------- 7. Updates a specific dashboard --------------------
router.put("/dashboards/:name", dashboardController.updateDashboard);

// -------------------- 8. Publishes a specific dashboard --------------------
router.put("/dashboards/:name/publish", dashboardController.publishDashboard);

// -------------------- 9. Deletes a specific dashboard --------------------
router.delete("/dashboards/:name", dashboardController.deleteDashboard);

// -------------------- 10. Updates widget selections for a specific widget in a dashboard --------------------
router.put(
  "/dashboards/:name/widgets/:widgetId/selections",
  dashboardController.updateWidgetSelections
);

module.exports = router;
