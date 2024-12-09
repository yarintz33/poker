import Dealer from "./Dealer.js";
import Player from "./Player.js";
import Round from "./Round.js";

export default class Table {
  #numOfChairs;
  #numOfPlayers;

  constructor(numOfChairs) {
    this.inRoom = [];
    this.players = new Map();
    this.dealer = new Dealer();
    this.round = new Round(this.dealer, this.players);
    this.#numOfChairs = numOfChairs; //max players in this table
  }

  start() {
    //while (this.#numOfPlayers > 1) {
    this.startRound(this.players);
    //}
  }

  startRound() {
    console.log("starting");
    this.round.start(this.players);
  }

  addPlayer99(player, position) {
    if (this.players.get(position) == null) {
      //this.players[position] = player;
      this.players.set(position, player); //new Player("mike", 500);
      console.log("players:" + this.players.size);
      if (this.players.size >= 2) {
        this.start();
      }
    }
  }

  joinRoom(socketID) {
    this.inRoom.push(socketID);
  }

  removePlayer(position) {
    this.players.delete(position);
  }

  get numOfplayers() {
    return this.#numOfPlayers;
  }
}
