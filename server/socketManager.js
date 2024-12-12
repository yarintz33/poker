import { Server } from "socket.io";
import Table from "./entities/Table.js";
import Player from "./entities/Player.js";
import { initIO } from "./services/ioService.js";

/** @type {Map<String,Table>} */
const tables = new Map();
tables.set("1", new Table(9, "1"));

/** @type {Map<String, Player>} */
const connectedClients = new Map();

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  initIO(io); // Initialize the IO service

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinTable", (tableId, playerID, name, avatar) => {
      console.log(`Player ${playerID} joined table ${tableId}`);
      let table = tables.get(tableId);
      table.joinRoom(socket.id);
      let player = new Player(socket.id, playerID, name, avatar);
      player.tableId = tableId;
      player.isParticipant = false;
      player.position = -1;
      connectedClients.set(socket.id, player);

      socket.join(tableId);

      socket.emit("tableState", {
        players: Array.from(table.players.entries()).map(([_, player]) =>
          player.toPlayerState()
        ),
      });

      // Send message to ALL sockets in this table's room (except sender)
    });

    socket.on("seatInTable", (chairIndex, budget) => {
      // should add chair isn't occupied check..
      const player = connectedClients.get(socket.id);
      player.budget = budget;
      player.position = chairIndex;
      const tableId = player.tableId;
      console.log(
        `Player ${player.socketId} seated in table ${player.tableId} in chair number ${chairIndex} with budget ${budget} and name ${player.name} and avatar ${player.avatar}`
      );
      let table = tables.get(player.tableId);
      table.addPlayer(player);
      // connectedClients.set(socket.id, {
      //   userId: playerID,
      //   tableId: tableId,
      //   chairIndex: chairIndex,
      // });

      socket.to(tableId).emit("playerJoined", {
        player: player,
        position: chairIndex,
        message: "New player joined the table!",
      });

      io.in(tableId).emit("tableUpdate", {});
    });

    socket.on("standUp", (tableId, playerId, chairIndex) => {
      console.log(`Player ${socket.id} left the chair`);
      let table = tables.get(tableId);
      table.removePlayer(socket.id, chairIndex);
      socket.to(tableId).emit("playerLeft", {
        position: chairIndex,
        message: "Player left the table!",
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      const clientInfo = connectedClients.get(socket.id);
      if (clientInfo) {
        const { tableId, position } = clientInfo;
        console.log("left tableId:", tableId);
        const table = tables.get(tableId);
        if (table) {
          table.removePlayer(socket.id, position);
        }
        socket.to(tableId).emit("playerLeft", {
          position: position,
          message: "Player left the table!",
        });
        connectedClients.delete(socket.id);
      }
    });

    socket.on("playerAction", (tableId, action) => {
      // Broadcast the action to all OTHER players at this table
      socket.to(tableId).emit("playerMadeAction", {
        action: action,
        playerId: socket.id,
      });
    });
  });

  return io;
}

export default initializeSocket;
