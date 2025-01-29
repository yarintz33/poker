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
  #boardCards;

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
    this.#inGame.notifyTurnOver = this.startNextTurn.bind(this); // bind this so it can access this and so private fields
    this.#inGame.notifyRoundOver = this.roundOver.bind(this);
    this.onFinish = onFinish;
    this.#roundState = Round.ROUND_STATE.PRE_FLOP;
    this.#boardCards = [];
    this.#pot = 0;
  }

  start() {
    this.#inGame.resetRoundState();
    this.#dealer.dealPlayers(this.#inGame);
  }

  setAllPlayersParticipants() {
    let playerNode = this.#inGame.root;
    for (let i = 0; i < this.#inGame.size; i++) {
      //playerNode.player.isParticipant = true;
      playerNode.isParticipant = true;
      playerNode = playerNode.next;
    }
  }

  get inGame() {
    return this.#inGame;
  }

  get pot() {
    return this.#pot;
  }

  get roundState() {
    return this.#roundState;
  }

  get boardCards() {
    return this.#boardCards;
  }

  playerAction(socketId, actionData) {
    const data = this.#inGame.playerAction(socketId, actionData);

    return data;
  }

  // turnOver() {
  //   const turnPot = this.#inGame.turnOver();
  //   this.#pot += turnPot;
  //   this.#roundState++;
  //   this.#inGame.resetTurnState();
  //   const cards = this.#dealer.dealNext(this.#roundState);
  // }

  returnTableState() {
    return this.#inGame.returnTableState();
  }

  roundOver() {
    this.#roundState = Round.ROUND_STATE.END;
    const result = this.#inGame.determineWinner(this.#boardCards, this.#pot);
    const io = getIO();
    io.to(this.tableId).emit("determineWinners", result);
    this.#pot = 0;
    this.#boardCards = [];
    this.onFinish(result);
  }

  startNextTurn(turnPot) {
    this.#pot += turnPot;
    if (
      this.#roundState == Round.ROUND_STATE.RIVER ||
      this.#inGame.numOfParticipants <= 1
    ) {
      this.roundOver();
    } else {
      this.#roundState++;
      this.#inGame.resetTurnState();
      const cards = this.#dealer.dealNext(this.#roundState);
      this.#boardCards = this.#boardCards.concat(cards);
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
