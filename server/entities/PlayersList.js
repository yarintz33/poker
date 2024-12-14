export default class PlayersList {
  #root;
  #size;

  constructor() {
    this.#root = null;
    this.#size = 0;
  }

  isBetween(position, prevPosition, nextPosition) {
    return (
      (position > prevPosition && position < nextPosition) ||
      (prevPosition >= nextPosition &&
        (position > prevPosition || position < nextPosition))
    );
  }

  add(playerNode, position) {
    if (this.#size == 0) {
      this.#root = playerNode;
      playerNode.next = playerNode;
      playerNode.prev = playerNode;
      this.#size++;
      return;
    }

    // if (this.#size == 1) {
    //   playerNode.prev = this.#root;
    //   playerNode.next = this.#root;
    //   this.#root.next = playerNode;
    //   this.#root.prev = playerNode;
    //   this.#size++;
    //   return;
    // }
    let node = this.#root;

    while (!this.isBetween(position, node.position, node.next.position)) {
      node = node.next;
    }

    playerNode.next = node.next;
    playerNode.prev = node;
    node.next.prev = playerNode;
    node.next = playerNode;
    this.#size++;
    //debug
    playerNode.printList();
  }

  remove(playerNode) {
    if (this.#size == 1) {
      this.#root = null;
      this.#size = 0;
      return;
    }

    playerNode.prev.next = playerNode.next;
    playerNode.next.prev = playerNode.prev;
    this.#size--;
  }

  getRoot() {
    return this.#root;
  }

  getSize() {
    return this.#size;
  }

  copy() {
    let newList = new PlayersList();
    let root = this.#root;
    let last = root.prev;
    let current = root.clone();
    newList.root = current;
    for (let i = 0; i < this.#size - 1; i++) {
      let nextNode = root.next.clone();
      current.next = nextNode;
      nextNode.prev = current;
      current = nextNode;
      root = root.next;
    }
    current.next = newList.root;
    newList.root.prev = current;
    newList.size = this.#size;
    return newList;
  }
}
