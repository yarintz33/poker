export default class PlayerNode {
  #player;
  #position;
  #prev;
  #next;
  #amount;
  #bet;
  #action;
  #budget;
  #isParticipant;
  #startingBudget;
  #overallBet;
  #cards;
  #isAllIn;

  constructor(player, position, budget) {
    this.#player = player;
    this.#position = position;
    this.#budget = budget;
    this.#startingBudget = budget;
    this.#prev = null;
    this.#next = null;
    this.#bet = 0;
    this.#action = "none";
    this.#isParticipant = false;
    this.#isAllIn = false;
    this.#overallBet = 0;
  }

  get isAllIn() {
    return this.#isAllIn;
  }

  set isAllIn(isAllIn) {
    this.#isAllIn = isAllIn;
  }

  get cards() {
    return this.#cards;
  }

  set cards(cards) {
    this.#cards = cards;
  }

  get player() {
    return this.#player;
  }

  get overallBet() {
    return this.#overallBet;
  }

  set overallBet(overallBet) {
    this.#overallBet = overallBet;
  }

  get budget() {
    return this.#budget;
  }

  set budget(budget) {
    this.#budget = budget;
  }

  get position() {
    return this.#position;
  }

  get prev() {
    return this.#prev;
  }

  get next() {
    return this.#next;
  }

  get action() {
    return this.#action;
  }

  set prev(node) {
    this.#prev = node;
  }

  set action(action) {
    this.#action = action;
  }

  get amount() {
    return this.#amount;
  }

  set amount(amount) {
    this.#amount = amount;
  }

  get bet() {
    return this.#bet;
  }

  set bet(bet) {
    this.#bet = bet;
  }

  set prev(node) {
    this.#prev = node;
  }

  set next(node) {
    this.#next = node;
  }

  set isParticipant(isParticipant) {
    this.#isParticipant = isParticipant;
  }

  get isParticipant() {
    return this.#isParticipant;
  }

  printList() {
    let node = this;
    let prev = this.prev;
    while (node != prev) {
      console.log(node.position + "->");
      node = node.next;
    }

    console.log(node.position + "->");
    console.log(node.next.position + " ");
  }

  reset() {
    this.#bet = 0;
    this.#action = "none";
    this.#isAllIn = false;
    this.#overallBet = 0;
    this.#cards = [];
    this.#isParticipant = true;
  }

  clone() {
    return new PlayerNode(this.#player, this.#position, this.#budget);
  }

  copy() {
    const copy = new PlayerNode(this.#player, this.#position, this.#budget);
    copy.#overallBet = this.#overallBet;
    copy.#cards = this.#cards;
    copy.#isParticipant = this.#isParticipant;
    return copy;
  }
}
