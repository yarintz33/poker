import Deck from "./Deck.js";
import Round from "./Round.js";

export default class Dealer {
  constructor(tableId) {
    this.tableId = tableId;
    this.deck = new Deck();
  }

  dealNext(roundState) {
    if (roundState == Round.ROUND_STATE.FLOP) {
      return this.dealFlop();
    } else if (roundState == Round.ROUND_STATE.TURN) {
      return this.dealTurn();
    } else if (roundState == Round.ROUND_STATE.RIVER) {
      return this.dealRiver();
    }
  }

  dealPlayers(/** @type {PlayersList} */ playersList) {
    this.deck.resetDeck();
    const cardPairs = [];
    for (let i = 0; i < playersList.size; i++) {
      cardPairs.push(this.deck.get2cards());
    }
    playersList.setPlayersCards(cardPairs);
    //playersList.sendCardsToPlayers();
  }

  dealFlop() {
    const flopCards = this.deck.get3cards();
    return flopCards;
  }

  dealTurn() {
    const turnCard = this.deck.getCard();
    return turnCard;
  }

  dealRiver() {
    const riverCard = this.deck.getCard();
    return riverCard;
  }
}
