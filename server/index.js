// index.js

import express from "express";
import http from "http";
import cors from "cors";
import Table from "./entities/Table.js";
import initializeSocket from "./socketManager.js";

// /** @type {Map<String,Table>} */
// const tables = new Map();
// tables.set("1", new Table(9));

const app = express();
const port = 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO through socketManager and pass the tables Map
initializeSocket(server);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
