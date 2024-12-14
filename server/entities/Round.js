export default class Round {
  /**@Type {Array<Player>} */
  #inGame;
  /**@Type {Dealer} */
  #dealer;
  /**@Type {Function} */
  #onFinish;

  constructor(dealer, players, tableId, onFinish, bigBlind, smallBlind) {
    this.#dealer = dealer;
    this.tableId = tableId;
    this.#inGame = players;
    this.onFinish = onFinish;
  }
  start() {
    console.log("in round.start(), players:", this.#inGame.size);
    this.setAllPlayersParticipants();
    console.log(this.#inGame);
    this.#dealer.dealPlayers(this.#inGame);

    // wait for players response..
    this.#dealer.dealFlop();
    this.#dealer.dealTurn();
    this.#dealer.dealRiver();
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
}
