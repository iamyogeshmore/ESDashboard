// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.post("/dashboards", dashboardController.createDashboard);
router.get("/dashboards", dashboardController.getDashboards);
router.get("/dashboards/active", dashboardController.getActiveDashboard); // This was line 7
router.get("/dashboards/:name", dashboardController.getDashboard);
router.post("/dashboards/:name/widgets", dashboardController.createWidget);
router.delete(
  "/dashboards/:name/widgets/:widgetId",
  dashboardController.deleteWidget
);
router.put("/dashboards/:name", dashboardController.updateDashboard);
router.put("/dashboards/:name/publish", dashboardController.publishDashboard);
router.delete("/dashboards/:name", dashboardController.deleteDashboard);
module.exports = router;
