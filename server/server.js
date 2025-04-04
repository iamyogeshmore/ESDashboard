const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();
const { initializeWebSocket, broadcastUpdate } = require("./websocket");
const os = require("os");

const plantRoutes = require("./routes/plantRoutes");
const viewRoutes = require("./routes/viewRoutes");
const hddRoutes = require("./routes/hddRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const queryRoutes = require("./routes/logRoutes");

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to MongoDB
connectDB();

// New endpoint to return server configuration with detailed logging
app.get("/api/config", (req, res) => {
  console.log("Received request to /api/config from:", req.ip);

  const networkInterfaces = os.networkInterfaces();
  console.log(
    "All Network Interfaces:",
    JSON.stringify(networkInterfaces, null, 2)
  );

  let serverIp = null;
  console.log("Searching for a non-internal IPv4 address...");

  // Iterate over network interfaces to find a valid server IP
  for (const interfaceName in networkInterfaces) {
    console.log(`Checking interface: ${interfaceName}`);
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      console.log(
        `  - Address: ${iface.address}, Family: ${iface.family}, Internal: ${iface.internal}, Netmask: ${iface.netmask}, MAC: ${iface.mac}`
      );
      // Prefer non-internal IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        serverIp = iface.address;
        console.log(
          `Found non-internal IPv4 address: ${serverIp} on ${interfaceName}`
        );
        break;
      }
    }
    if (serverIp) break;
  }

  // Fallback logic if no non-internal IP is found
  if (!serverIp) {
    console.warn(
      "No non-internal IPv4 address found. Attempting to use an internal IP..."
    );
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        if (iface.family === "IPv4") {
          serverIp = iface.address;
          console.log(
            `Falling back to internal IPv4 address: ${serverIp} on ${interfaceName}`
          );
          break;
        }
      }
      if (serverIp) break;
    }
  }

  // Final fallback to 'localhost' if no IP is found
  if (!serverIp) {
    serverIp = "localhost";
    console.warn(
      "No IPv4 address found. Using 'localhost' as the final fallback."
    );
  } else {
    console.log(`Using server IP: ${serverIp}`);
  }

  const port = process.env.PORT || 6005;
  const config = {
    apiUrl: `http://${serverIp}:${port}/api`,
    wsUrl: `ws://${serverIp}:${port}`,
  };

  console.log("Returning configuration:", JSON.stringify(config, null, 2));
  res.json(config);
});

// Routes
app.use("/api", plantRoutes);
app.use("/api", viewRoutes);
app.use("/api/hdd", hddRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", queryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Server
const PORT = process.env.PORT || 6005;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Server hostname:", os.hostname());
  console.log("Checking initial network interfaces on startup:");
  console.log(JSON.stringify(os.networkInterfaces(), null, 2));
});

// WebSocket Server
initializeWebSocket(server);

// Log server startup details
console.log("Environment variables:", {
  PORT: process.env.PORT,
});

module.exports = { broadcastUpdate };
