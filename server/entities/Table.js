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
    this.#tableId = tableId;
    this.#numOfChairs = numOfChairs; //max players in this table
    this.#playersList = new PlayersList(tableId);
    this.#round = new Round(
      this.#dealer,
      this.#playersList,
      this.#tableId,
      this.onFinish.bind(this)
    );
  }

  startNextTurn(turnPot) {
    this.#round.startNextTurn(turnPot);
  }

  playerAction(socketId, actionData) {
    return this.#round.playerAction(socketId, actionData);
  }

  onFinish() {
    if (this.#playersList.getSize() >= 2) {
      this.start();
    }
  }

  resetParticipants() {
    this.#playersList.resetRoundState();
  }

  start() {
    this.#pot = 0;
    this.#playersList.resetRoundState();
    this.#round = this.createRound();
    this.#round.start();
  }

  createRound() {
    const round = new Round(
      this.dealer,
      this.#playersList,
      this.#tableId,
      this.onFinish.bind(this)
    );
    return round;
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
    const roundState = this.#round.returnTableState();
    let tableState = {
      players: [...roundState.playersState],
      bigBlind: roundState.bigBlind,
      smallBlind: roundState.smallBlind,
    };
    return {
      ...tableState,
      boardCards: this.#round?.boardCards,
      pot: this.#round?.pot,
      // roundState: this.#round.roundState,
    };
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
