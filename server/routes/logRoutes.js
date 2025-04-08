const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");

router.get("/queries", logController.getQueries);
router.post("/execute-query", logController.executeQuery);

module.exports = router;