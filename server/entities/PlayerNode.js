export default class PlayerNode {
  #player;
  #position;
  #prev;
  #next;

  constructor(player, position) {
    this.#player = player;
    this.#position = position;
    this.#prev = null;
    this.#next = null;
  }

  get player() {
    return this.#player;
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
    return new PlayerNode(this.#player, this.#position);
  }
}
