const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");

// -------------------- 1. Save a new view --------------------
router.post("/saved-views", viewController.saveView);

// -------------------- 2. Get all saved views --------------------
router.get("/saved-views", viewController.getSavedViews);

// -------------------- 3. Get a specific saved view by ID --------------------
router.get("/saved-views/:id", viewController.getSavedViewById);

// -------------------- 4. Delete a saved view by ID --------------------
router.delete("/saved-views/:id", viewController.deleteSavedView);

// -------------------- 5. Update widget properties in a saved view --------------------
router.patch(
  "/saved-views/:viewId/widgets/:widgetId",
  viewController.updateWidgetProperties
);

// -------------------- 6. Update view --------------------
router.put("/saved-views/:id", viewController.updateSavedView);

module.exports = router;
