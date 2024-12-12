import Dealer from "./Dealer.js";
import Player from "./Player.js";
import Round from "./Round.js";
import { getIO } from "../services/ioService.js";

export default class Table {
  #numOfChairs;
  #tableId;
  /** @type {Array<String>} */
  #inRoom;
  /** @type {Map<Number, Player>} */
  #players; //(seated in a chair already)
  /** @type {Dealer} */
  #dealer;
  /** @type {Round} */
  #round;
  #bigBlind;

  constructor(numOfChairs, tableId) {
    this.#inRoom = [];
    this.#players = new Map();
    this.#dealer = new Dealer(this.#tableId);
    this.#round = null;
    this.#tableId = tableId;
    this.#numOfChairs = numOfChairs; //max players in this table
  }

  start() {
    this.round = new Round(this.dealer, this.players, this.#tableId);
    this.round.start();
  }

  /**@type {Player} */
  addPlayer(player) {
    if (this.#players.get(player.position) == null) {
      this.insertPlayerToCircularLinkedList(player);
      this.#players.set(player.position, player);
      if (this.#players.size >= 2) {
        this.start();
      }
    }
    console.log(this.#players);
  }

  isBetween(player, current, next) {
    return (
      (player.position > current.position && player.position < next.position) ||
      (current.position > next.position &&
        (player.position > current.position || player.position < next.position))
    );
  }

  insertPlayerToCircularLinkedList(player) {
    let currentPlayer = this.players.values().next().value;
    if (this.#players.size == 0) {
      return;
    }

    if (this.#players.size == 1) {
      player.prevPlayer = currentPlayer;
      player.nextPlayer = currentPlayer;
      currentPlayer.prevPlayer = player;
      currentPlayer.nextPlayer = player;
      return;
    }

    while (!this.isBetween(player, currentPlayer, currentPlayer.nextPlayer)) {
      currentPlayer = currentPlayer.nextPlayer;
    }

    player.prevPlayer = currentPlayer;
    player.nextPlayer = currentPlayer.nextPlayer;
    currentPlayer.nextPlayer.prevPlayer = player;
    currentPlayer.nextPlayer = player;
  }

  joinRoom(socketID) {
    this.inRoom.push(socketID);
  }

  removePlayer(socketId, position) {
    const player = this.players.get(position);

    if (position == -1) {
      this.#inRoom.splice(this.#inRoom.indexOf(socketId), 1);
      return;
    }

    if (this.#players.size == 1) {
      this.#players.delete(position);
      return;
    }
    player.prevPlayer.nextPlayer = player.nextPlayer;
    player.nextPlayer.prevPlayer = player.prevPlayer;
    this.#players.delete(position);
  }

  get players() {
    return this.#players;
  }

  get tableId() {
    return this.#tableId;
  }

  get inRoom() {
    return this.#inRoom;
  }

  get dealer() {
    return this.#dealer;
  }

  get round() {
    return this.#round;
  }

  set round(round) {
    this.#round = round;
  }

  set players(players) {
    this.#players = players;
  }

  set dealer(dealer) {
    this.#dealer = dealer;
  }

  set inRoom(inRoom) {
    this.#inRoom = inRoom;
  }
}
