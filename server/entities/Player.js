export default class Player {
  #isParticipant;
  #cards;
  #socketId;
  #budget;
  #name;
  #avatar;

  constructor(socketID, playerID, playerName, budget, avatar) {
    this.#socketId = socketID;
    this.#budget = budget;
    this.#name = playerName;
    this.#avatar = avatar;
    this.#isParticipant = false;
  }

  get isParticipant() {
    return this.#isParticipant;
  }

  set isParticipant(bool) {
    this.#isParticipant = bool;
  }

  get cards() {
    return this.#cards;
  }

  get socketId() {
    return this.#socketId;
  }

  set cards(cards) {
    this.#cards = cards;
    console.log("my cards are : " + cards);
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

  toJSON() {
    return {
      name: this.#name,
      budget: this.#budget,
      avatar: this.#avatar,
      isParticipant: this.#isParticipant,
    };
  }
}
