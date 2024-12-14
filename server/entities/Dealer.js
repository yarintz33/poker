import Deck from "./Deck.js";
import { getIO } from "../services/ioService.js";

export default class Dealer {
  constructor(tableId) {
    this.tableId = tableId;
    this.deck = new Deck();
  }

  dealPlayers(players) {
    this.deck.resetDeck();
    let playerNode = players.root;
    for (let i = 0; i < players.size; i++) {
      playerNode.player.cards = this.deck.get2cards();
      playerNode = playerNode.next;
    }

    this.sendCardsToPlayers(players);
  }

  sendCardsToPlayers(players) {
    const io = getIO();
    let playerNode = players.root;
    for (let i = 0; i < players.size; i++) {
      const socket = io.sockets.sockets.get(playerNode.player.socketId);
      socket.emit("dealtCards", {
        cards: playerNode.player.cards,
      });
      playerNode = playerNode.next;
    }
  }
  dealFlop() {}

  dealTurn() {}

  dealRiver() {}
}
