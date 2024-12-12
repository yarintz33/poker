import { io } from "socket.io-client";

let socket = null;

export const connectWebSocket = (
  url,
  tableId,
  chairIndex,
  playerId,
  budget
) => {
  if (!socket) {
    console.log(url);
    socket = io("http://localhost:5000");

    // socket.on('connect', () => {
    //     console.log('Connected to server:', socket.id);

    //     // Join a table
    //socket.emit("seatInTable", tableId, playerId, chairIndex, budget);
    // });

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.on("playerJoined", (data) => {
      console.log("playerJoined:", data);
    });

    socket.on("tableState", (data) => {
      console.log("tableState:", data);
      console.log("players:", data.players);
    });

    socket.onmessage = (event) => {
      console.log("Received:", event.data);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      socket = null;
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }
};

export const seatInTable = (chairIndex, budget) => {
  socket.emit("seatInTable", chairIndex, budget);
};

export const joinToTable = (tableId, playerId) => {
  socket.emit("joinTable", tableId, playerId);
};

export const sendWebSocketMessage = (message) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not open");
  }
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
