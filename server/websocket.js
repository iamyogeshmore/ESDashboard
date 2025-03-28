const WebSocket = require("ws");

let wss;

// -------------------- 1. Initialize WebSocket Server --------------------
function initializeWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected via WebSocket");
    ws.send(
      JSON.stringify({
        type: "connection",
        message: "WebSocket connection established",
      })
    );

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
}

// -------------------- 2. Broadcasts the data to all connected clients --------------------
//
const broadcastUpdate = (data) => {
  if (!wss) {
    console.error("WebSocket server not initialized");
    return;
  }
  console.log("Broadcasting update");
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = { initializeWebSocket, broadcastUpdate };
