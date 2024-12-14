import Dealer from "./Dealer.js";
import Player from "./Player.js";
import Round from "./Round.js";
import { getIO } from "../services/ioService.js";
import PlayerNode from "./PlayerNode.js";
import PlayersList from "./PlayersList.js";

export default class Table {
  #numOfChairs;
  #tableId;
  /** @type {Array<String>} */
  #inRoom;
  /** @type {Dealer} */
  #dealer;
  /** @type {Round} */
  #round;
  #bigBlind;

  #playersList;

  constructor(numOfChairs, tableId) {
    this.#inRoom = [];
    this.#dealer = new Dealer(this.#tableId);
    this.#round = null;
    this.#tableId = tableId;
    this.#numOfChairs = numOfChairs; //max players in this table
    this.#playersList = new PlayersList();
  }

  onFinish(round) {
    if (this.#playersList.getSize() >= 2) {
      this.round.start();
    }
  }

  start() {
    this.round = new Round(
      this.dealer,
      this.#playersList.copy(),
      this.#tableId,
      this.onFinish
    );
    this.round.start();
  }

  /**@type {PlayerNode} */
  addPlayer(playerNode, position) {
    this.#playersList.add(playerNode, position);
    if (this.#playersList.getSize() >= 2) {
      this.start();
    }
    console.log(this.#playersList);
  }

  // isBetween(player, current, next) {
  //   return (
  //     (player.position > current.position && player.position < next.position) ||
  //     (current.position > next.position &&
  //       (player.position > current.position || player.position < next.position))
  //   );
  // }

  // copyCircularLinkedList() {
  //   let root = this.#playersCircularList.root;
  //   let last = root.prev;
  //   let newRoot = root.clone();
  //   let newList = { root: newRoot, size: this.#playersCircularList.size };
  //   while (root != last) {
  //     let newNode = root.next.clone();
  //     newRoot.next = newNode;
  //     newNode.prev = newRoot;
  //     newRoot = newNode;
  //     root = root.next;
  //   }
  //   newRoot.next = newList.root;
  //   newList.root.prev = newRoot;
  //   return newList;
  // }

  // isBetween(position, prevPosition, nextPosition) {
  //   return (
  //     (position > prevPosition && position < nextPosition) ||
  //     (prevPosition >= nextPosition &&
  //       (position > prevPosition || position < nextPosition))
  //   );
  // }

  // insertPlayerToCircularLinkedList(playerNode, position) {
  //   if (this.#playersCircularList.size == 0) {
  //     this.#playersCircularList.root = playerNode;
  //     playerNode.next = playerNode;
  //     playerNode.prev = playerNode;
  //     this.#playersCircularList.size++;
  //     return;
  //   }

  //   if (this.#playersCircularList.size == 1) {
  //     playerNode.prev = this.#playersCircularList.root;
  //     playerNode.next = this.#playersCircularList.root;
  //     this.#playersCircularList.root.next = playerNode;
  //     this.#playersCircularList.root.prev = playerNode;
  //     this.#playersCircularList.size++;
  //     return;
  //   }

  //   let node = this.#playersCircularList.root;

  //   while (!this.isBetween(position, node.position, node.next.position)) {
  //     node = node.next;
  //   }

  //   playerNode.next = node.next;
  //   playerNode.prev = node;
  //   node.next.prev = playerNode;
  //   node.next = playerNode;
  //   this.#playersCircularList.size++;
  //   //debug
  //   playerNode.printList();
  // }

  // removePlayerFromCircularLinkedList(playerNode) {
  //   if (this.#playersCircularList.size == 1) {
  //     this.#playersCircularList.root = null;
  //     this.#playersCircularList.size = 0;
  //     return;
  //   }

  //   playerNode.prev.next = playerNode.next;
  //   playerNode.next.prev = playerNode.prev;
  //   this.#playersCircularList.size--;
  // }

  joinRoom(socketID) {
    this.inRoom.push(socketID);
  }

  removePlayer(playerNode) {
    this.#playersList.remove(playerNode);
  }

  tableState() {
    let playerNode = this.#playersList.getRoot();
    let playersState = [];
    for (let i = 0; i < this.#playersList.getSize(); i++) {
      console.log(playerNode);
      playersState.push({
        position: playerNode.position,
        data: playerNode.player.toPlayerState(),
      });
      playerNode = playerNode.next;
    }
    return playersState;
  }

  get tableId() {
    return this.#tableId;
  }

  get inRoom() {
    return this.#inRoom;
  }

  get dealer() {
    return this.#dealer;
  }

  get round() {
    return this.#round;
  }

  set round(round) {
    this.#round = round;
  }

  set dealer(dealer) {
    this.#dealer = dealer;
  }

  set inRoom(inRoom) {
    this.#inRoom = inRoom;
  }
}
