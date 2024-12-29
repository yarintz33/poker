export default class Player {
  #socketId;
  #playerId;
  #tableId;
  #isParticipant;
  #action;
  #budget;
  #name;
  #avatar;
  #nextPlayer;
  #prevPlayer;

  constructor(socketID, playerID, playerName, avatar) {
    this.#socketId = socketID;
    this.#name = playerName;
    this.#avatar = avatar;
    this.#isParticipant = false;
    this.#playerId = playerID;
    this.#budget = 0;
  }

  get isParticipant() {
    return this.#isParticipant;
  }

  set prevPlayer(player) {
    this.#prevPlayer = player;
  }

  get prevPlayer() {
    return this.#prevPlayer;
  }

  get nextPlayer() {
    return this.#nextPlayer;
  }

  set nextPlayer(player) {
    this.#nextPlayer = player;
  }

  get socketId() {
    return this.#socketId;
  }

  get tableId() {
    return this.#tableId;
  }

  get name() {
    return this.#name;
  }

  get budget() {
    return this.#budget;
  }

  get avatar() {
    return this.#avatar;
  }

  set budget(budget) {
    this.#budget = budget;
  }

  get action() {
    return this.#action;
  }

  set action(action) {
    this.#action = action;
  }

  get budget() {
    return this.#budget;
  }

  set isParticipant(bool) {
    this.#isParticipant = bool;
  }

  set name(name) {
    this.#name = name;
  }

  set avatar(avatar) {
    this.#avatar = avatar;
  }

  set tableId(tableId) {
    this.#tableId = tableId;
  }

  toJSON() {
    return {
      name: this.#name,
      avatar: this.#avatar,
      isParticipant: this.#isParticipant,
      playerId: this.#playerId,
    };
  }

  toPlayerState() {
    return {
      name: this.#name,
      avatar: this.#avatar,
      isParticipant: this.#isParticipant,
      budget: this.#budget,
      //     nextPlayer: this.#nextPlayer?.name,
      //     prevPlayer: this.#prevPlayer?.name,
    };
  }
}
