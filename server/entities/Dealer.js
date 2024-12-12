import Deck from "./Deck.js";
import { getIO } from "../services/ioService.js";

export default class Dealer {
  constructor(tableId) {
    this.tableId = tableId;
    this.deck = new Deck();
  }

  dealPlayers(players) {
    this.deck.resetDeck();
    players.forEach((player) => {
      player.cards = this.deck.get2cards();
    });
    this.sendCardsToPlayers(players);
  }

  sendCardsToPlayers(players) {
    const io = getIO();
    for (const player of players.values()) {
      const socket = io.sockets.sockets.get(player.socketId);
      socket.emit("dealtCards", {
        cards: player.cards,
      });
    }
  }
  dealFlop() {}

  dealTurn() {}

  dealRiver() {}
}
