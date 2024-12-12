export default class Round {
  /**@Type {Array<Player>} */
  #inGame;
  constructor(dealer, players, tableId) {
    this.dealer = dealer;
    this.tableId = tableId;
    this.#inGame = [];
    players.forEach((player) => {
      this.#inGame.push(player);
    });
  }
  start() {
    console.log("in round.start(), players:", this.#inGame.length);
    this.setAllPlayersParticipants();
    console.log(this.#inGame);
    this.dealer.dealPlayers(this.#inGame);

    // wait for players response..
    this.dealer.dealFlop();
    this.dealer.dealTurn();
    this.dealer.dealRiver();
  }

  setAllPlayersParticipants() {
    for (const player of this.#inGame.values()) player.isParticipant = true;
  }

  get inGame() {
    return this.#inGame;
  }
}
