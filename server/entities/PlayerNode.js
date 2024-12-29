export default class PlayerNode {
  #player;
  #position;
  #prev;
  #next;
  #amount;
  #bet;
  #action;
  #budget;

  constructor(player, position, budget) {
    this.#player = player;
    this.#position = position;
    this.#budget = budget;
    this.#prev = null;
    this.#next = null;
    this.#bet = -1;
    this.#action = "none";
  }

  get player() {
    return this.#player;
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

  clone() {
    return new PlayerNode(this.#player, this.#position, this.#budget);
  }
}
