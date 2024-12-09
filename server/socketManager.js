import { Server } from "socket.io";
import Table from "./entities/Table.js";
import Player from "./entities/Player.js";

/** @type {Map<String,Table>} */
const tables = new Map();
tables.set("1", new Table(9));

/** @type {Map<String, {userId: String, tableId: String, chairIndex: Number}>} */
const connectedClients = new Map();

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  function addPlayer(
    /** @type {Table} */ table,
    /** @type {Player} */ player,
    chairIndex
  ) {
    table.addPlayer99(player, chairIndex);
  }

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinTable", (tableId, playerID) => {
      console.log("in join table " + tableId);
      console.log(`Player ${playerID} joined table ${tableId}`);
      let table = tables.get(tableId);
      table.joinRoom(socket.id);
      connectedClients.set(socket.id, {
        userId: playerID,
        tableId: tableId,
        earnings: 0,
      });

      // Join the socket to the table's room
      socket.join(tableId);

      // Send the current table state to the client
      socket.emit("tableState", {
        players: Array.from(table.players.entries()).map(
          ([position, player]) => ({
            position,
            name: player.name,
            budget: player.budget,
            avatar: player.avatar,
            // Add other relevant player data
          })
        ),
        // Add other relevant table data
        numOfPlayers: table.numOfplayers,
        // ... other table properties
      });

      // Send message to ALL sockets in this table's room (except sender)
    });

    socket.on(
      "seatInTable",
      (tableId, playerID, chairIndex, budget, name, userAvatar) => {
        console.log(
          `Player ${socket.id} seated in table ${tableId} in chair number ${chairIndex} with budget ${budget} and name ${name} and avatar ${userAvatar}`
        );
        //** @type {Table} */
        let table = tables.get(tableId);
        let player = new Player(socket.id, playerID, name, budget, userAvatar);
        addPlayer(table, player, chairIndex);
        connectedClients.set(socket.id, {
          userId: playerID,
          tableId: tableId,
          chairIndex: chairIndex,
        });

        socket.to(tableId).emit("playerJoined", {
          player: player,
          position: chairIndex,
          message: "New player joined the table!",
        });

        // Send message to ALL sockets in this table's room (including sender)
        io.in(tableId).emit("tableUpdate", {
          // table state data
        });
      }
    );

    socket.on("standUp", (tableId, playerId, chairIndex) => {
      console.log(`Player ${socket.id} left the chair`);
      //** @type {Table} */
      let table = tables.get(tableId);
      table.removePlayer(chairIndex);
      socket.to(tableId).emit("playerLeft", {
        position: chairIndex,
        message: "Player left the table!",
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      const clientInfo = connectedClients.get(socket.id);
      if (clientInfo) {
        const { tableId, chairIndex } = clientInfo;
        console.log("left tableId:", tableId);
        const table = tables.get(tableId);
        if (table) {
          table.removePlayer(chairIndex);
        }
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
