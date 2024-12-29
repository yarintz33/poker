import Dealer from "./Dealer.js";
import Player from "./Player.js";
import Round from "./Round.js";
import { getIO } from "../services/ioService.js";
import PlayerNode from "./PlayerNode.js";
import PlayersList from "./PlayersList.js";

export default class Table {
  #numOfChairs;
  #pot;
  #tableId;
  /** @type {Array<String>} */
  #inRoom;
  /** @type {Dealer} */
  #dealer;
  /** @type {Round} */
  #round;
  #bigBlindPointer;
  #bigBlindAmount;
  #smallBlindAmount;

  #playersList;

  constructor(numOfChairs, tableId) {
    this.#inRoom = [];
    this.#dealer = new Dealer(this.#tableId);
    this.#round = null;
    this.#tableId = tableId;
    this.#numOfChairs = numOfChairs; //max players in this table
    this.#playersList = new PlayersList(tableId);
  }

  playerAction(socketId, actionData) {
    return this.#round.playerAction(socketId, actionData);
  }

  // bet(socketId, amount) {
  //   console.log("bet", socketId, amount);
  //   this.#pot += amount;
  //   return this.#playersList.bet(socketId, amount);
  // }

  onFinish() {
    if (this.#playersList.getSize() >= 2) {
      this.start();
    }
  }

  start() {
    this.#pot = 0;
    this.#playersList.resetRoundState();
    this.#round = new Round(
      this.dealer,
      this.#playersList.copy(),
      this.#tableId,
      this.onFinish.bind(this)
    );
    this.#round.start();
  }

  addPlayer(player, socketID, position, budget) {
    this.#playersList.add(player, socketID, position, budget);

    if (this.#playersList.getSize() == 2) {
      setTimeout(() => {
        this.start();
      }, 300);
    }
  }

  joinRoom(socketID) {
    this.inRoom.push(socketID);
  }

  removePlayer(socketId) {
    return this.#playersList.remove(socketId);
  }

  tableState() {
    return this.#playersList.returnTableState();
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

  set dealer(dealer) {
    this.#dealer = dealer;
  }

  set inRoom(inRoom) {
    this.#inRoom = inRoom;
  }
}
