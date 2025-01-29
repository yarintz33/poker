import { Server } from "socket.io";
import Table from "./entities/Table.js";
import Player from "./entities/Player.js";
import { initIO } from "./services/ioService.js";

/** @type {Map<String,Table>} */
const tables = new Map();
tables.set("1", new Table(9, "1"));

/** @type {Map<String, {player: Player, position: Number, tableId: String}>} */
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
    socket.on("joinTable", (tableId, playerID, name, avatar) => {
      console.log(`Player ${playerID} joined table ${tableId}`);
      let table = tables.get(tableId);
      table.joinRoom(socket.id); // needed?
      let player = new Player(socket.id, playerID, name, avatar);
      // player.position = -1;
      connectedClients.set(socket.id, {
        player: player,
        tableId: tableId,
      });

      socket.join(tableId);

      const tableState = table.tableState();
      socket.emit("tableState", tableState);

      // Send message to ALL sockets in this table's room (except sender)
    });

    socket.on("bet", (amount) => {
      const connectedClient = connectedClients.get(socket.id);
      const { tableId } = connectedClient;
      let table = tables.get(tableId);
      const position = table.bet(socket.id, amount.amount);
      socket.to(tableId).emit("bet", {
        position: position,
        amount: amount.amount,
      });
    });

    socket.on("seatInTable", (chairIndex, budget) => {
      // should add chair isn't occupied check..
      const connectedClient = connectedClients.get(socket.id);
      const { player, tableId } = connectedClient;
      //player.budget = budget;
      //const playerNode = new PlayerNode(player, chairIndex);
      //connectedClient.playerNode = playerNode;
      //delete connectedClient.player;
      console.log(
        `Player ${player.socketId} seated in table ${tableId} in chair number ${chairIndex} with budget ${budget} and name ${player.name} and avatar ${player.avatar}`
      );
      let table = tables.get(tableId);

      table.addPlayer(player, socket.id, chairIndex, budget);
      socket.to(tableId).emit("playerJoined", {
        player: {
          ...player.toPlayerState(),
          budget: budget,
        },
        position: chairIndex,
        message: "New player joined the table!",
      });

      // io.in(tableId).emit("tableUpdate", {});
    });

    socket.on("standUp", () => {
      const { tableId } = connectedClients.get(socket.id);
      console.log(`Player ${socket.id} left the chair`);
      let table = tables.get(tableId);
      const position = table.removePlayer(socket.id);
      socket.to(tableId).emit("playerLeft", {
        position: position,
        message: "Player left the table!",
      });
    });

    socket.on("playerAction", (actionData) => {
      const { tableId } = connectedClients.get(socket.id);
      let table = tables.get(tableId);
      const { position, nextPosition, bet, turnPot } = table.playerAction(
        socket.id,
        actionData
      );
      socket.to(tableId).emit("playerAction", {
        position: position,
        nextPlayer: nextPosition,
        playerAction: actionData.action,
        bet: bet,
      });

      if (nextPosition == -1) {
        socket.emit("youWasLast", {});
        table.startNextTurn(turnPot);
      }
    });

    // socket.on("bet", (amount) => {
    //   const { tableId } = connectedClients.get(socket.id);
    //   let table = tables.get(tableId);
    //   const { position, nextPosition } = table.bet(socket.id, amount.amount);
    //   socket.to(tableId).emit("bet", {
    //     position: position,
    //     nextPosition: nextPosition,
    //     amount: amount.amount,
    //   });
    // });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      const clientInfo = connectedClients.get(socket.id);
      if (clientInfo) {
        if (clientInfo.player) {
          const { tableId, player } = clientInfo;
          const table = tables.get(tableId);
          if (table) {
            const position = table.removePlayer(socket.id);
            socket.to(tableId).emit("playerLeft", {
              position: position,
              message: "Player left the table!",
            });
          }
        }
        //connectedClients.delete(socket.id);
      }
    });
  });

  return io;
}

export default initializeSocket;
