import { io } from "socket.io-client";
import { useEffect } from "react";

// Create the socket but don't connect immediately
const socket = io("http://localhost:5000", {
  autoConnect: false, // This prevents automatic connection
});

socket.on("connect", () => {
  console.log("Connected to server with socket ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

export const connectWebSocket = () => {
  socket.connect(); // Explicitly connect when this function is called
};

export const joinToTable = (tableId, playerId, name, avatar) => {
  if (!socket.connected) {
    console.warn("Socket not connected, attempting to connect...");
    socket.connect();
  }
  socket.emit("joinTable", tableId, playerId, name, avatar);
};

export const standUp = (tableId, playerId, chairIndex) => {
  // if (!socket.connected) {
  //   console.warn("Socket not connected, attempting to connect...");
  //   socket.connect();
  // }
  socket.emit("standUp", tableId, playerId, chairIndex);
};

export const seatInTable = (chairIndex, budget) => {
  socket.emit("seatInTable", chairIndex, budget);
};

export const closeWebSocket = () => {
  socket.close();
};

export const sendWebSocketMessage = (message) => {
  socket.send(message);
};

// Add the custom hook for socket events
export const useSocketListener = (eventName, callback) => {
  useEffect(() => {
    socket.on(eventName, callback);

    // Cleanup subscription on unmount
    return () => socket.off(eventName);
  }, [eventName, callback]);
};

// Export socket instance if needed elsewhere
export { socket };
