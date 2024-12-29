import * as PokerEvaluator from "poker-evaluator";
import { getIO } from "../services/ioService.js";

export default class Round {
  /**@Type {PlayersList} */
  #inGame;
  /**@Type {Dealer} */
  #dealer;
  /**@Type {Function} */
  #onFinish;
  /**@Type {PlayersList} */
  #players;
  /**@Type {Number} */
  #pot;
  /**@Type {Number} */
  #roundState;
  #boardsCards;

  static ROUND_STATE = Object.freeze({
    PRE_FLOP: 0,
    FLOP: 1,
    TURN: 2,
    RIVER: 3,
    END: 4,
  });

  constructor(dealer, inGame, tableId, onFinish, bigBlind, smallBlind) {
    this.#dealer = dealer;
    this.tableId = tableId;
    this.#inGame = inGame;
    this.#inGame.printList();
    this.#inGame.notifyTurnOver = this.startNextTurn.bind(this); // bind this so it can access this and so private fields
    this.onFinish = onFinish;
    this.#roundState = Round.ROUND_STATE.PRE_FLOP;
    this.#boardsCards = [];
    this.#pot = 0;
  }

  start() {
    this.setAllPlayersParticipants();
    this.#dealer.dealPlayers(this.#inGame);
  }

  setAllPlayersParticipants() {
    let playerNode = this.#inGame.root;
    for (let i = 0; i < this.#inGame.size; i++) {
      playerNode.player.isParticipant = true;
      playerNode = playerNode.next;
    }
  }

  get inGame() {
    return this.#inGame;
  }

  playerAction(socketId, actionData) {
    const data = this.#inGame.playerAction(socketId, actionData);
    return data;
  }

  turnOver() {
    const turnPot = this.#inGame.turnOver();
    this.#pot += turnPot;
    this.#roundState++;
    this.#inGame.resetTurnState();
    const cards = this.#dealer.dealNext(this.#roundState);
  }

  startNextTurn(turnPot) {
    this.#pot += turnPot;
    if (this.#roundState == Round.ROUND_STATE.RIVER) {
      this.#roundState = Round.ROUND_STATE.END;
      this.#inGame.determineWinner(this.#boardsCards);
      this.onFinish();
    } else {
      this.#roundState++;
      this.#inGame.resetTurnState();
      const cards = this.#dealer.dealNext(this.#roundState);
      this.#boardsCards = this.#boardsCards.concat(cards);
      const io = getIO();
      io.to(this.tableId).emit("dealNext", {
        pot: this.#pot,
        speaker: this.#inGame.getSpeakerPosition(),
        roundState: this.#roundState,
        cards: cards,
      });
    }
  }
}
