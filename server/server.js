const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

const plantRoutes = require("./routes/plantRoutes");
const viewRoutes = require("./routes/viewRoutes");
const hddRoutes = require("./routes/hddRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// -------------------- Middleware --------------------
app.use(express.json({ limit: "50mb" })); // Add limit option here
app.use(express.urlencoded({ limit: "50mb", extended: true })); // For URL-encoded data
app.use(
  cors({
    origin: "http://localhost:5005", // Explicitly allow your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  })
);

// -------------------- Connect to MongoDB --------------------
connectDB();

//  -------------------- Routes --------------------
app.use("/api", plantRoutes);
app.use("/api", viewRoutes);
app.use("/api/hdd", hddRoutes);
app.use("/api", dashboardRoutes);

// -------------------- Error handling middleware --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// -------------------- Server --------------------
const PORT = process.env.PORT || 6005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
