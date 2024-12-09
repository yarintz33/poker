export default class Round {
  #players;
  constructor(dealer) {
    this.dealer = dealer;
    this.#players = [];
  }
  start(players) {
    this.#players = players;
    console.log("in round.start(), players:", this.#players.size);
    this.setAllPlayersParticipants();
    this.dealer.dealPlayers(this.#players);

    // wait for players response..
    this.dealer.dealFlop();
    this.dealer.dealTurn();
    this.dealer.dealRiver();
  }

  setAllPlayersParticipants() {
    for (const player of this.#players.values()) player.isParticipant = true;
  }
}
