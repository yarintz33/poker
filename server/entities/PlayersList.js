import PlayerNode from "./PlayerNode.js";
import { getIO } from "../services/ioService.js";
import * as PokerEvaluator from "poker-evaluator";

export default class PlayersList {
  #root;
  #size;
  #playersMap;
  #maxBet;
  #bigBlindPosition;
  #doesBigBlindremoved;
  #smallBlindPosition;
  #firstSpeakerPosition;
  #UTGPosition;
  #tableId;
  #notifyTurnOver;

  constructor(tableId) {
    this.#tableId = tableId;
    this.#root = null;
    this.#size = 0;
    /**@Type {Map<String, PlayerNode>} */
    this.#playersMap = new Map();
    this.#bigBlindPosition = -1;
    this.#smallBlindPosition = -1;
    this.#firstSpeakerPosition = -1;
    this.#maxBet = 0;
  }

  isBetween(position, prevPosition, nextPosition) {
    return (
      (position > prevPosition && position < nextPosition) ||
      (prevPosition >= nextPosition &&
        (position > prevPosition || position < nextPosition))
    );
  }

  resetTurnState() {
    this.#maxBet = 0;
    this.resetPlayersState();
  }

  resetRoundState() {
    if (this.#doesBigBlindremoved) {
      this.#smallBlindPosition = -1;
      this.#bigBlindPosition = this.#root.position;
      this.#firstSpeakerPosition = this.#bigBlindPosition;
      this.#doesBigBlindremoved = false;
      this.#UTGPosition = this.#root.next.position;
    } else {
      this.#bigBlindPosition = this.#root.next.position;
      this.#smallBlindPosition = this.#root.position;
      this.#firstSpeakerPosition = this.#smallBlindPosition;
      this.#UTGPosition = this.#root.next.next.position;
      this.#root = this.#root.next;
    }
  }

  resetPlayersState() {
    let node = this.#root;
    for (let i = 0; i < this.#size; i++) {
      node.action = "none";
      node.bet = -1;
      node = node.next;
    }
  }

  //TODO: check if turn ended
  playerAction(socketId, actionData) {
    let isTurnEnded = false;
    let bet = 0;
    const playerNode = this.#playersMap.get(socketId); // this what cause the problem. the playersMap points to the table players.
    playerNode.action = actionData.action;

    if (actionData.action == "bet") {
      if (actionData.amount > this.#maxBet) {
        this.#maxBet = actionData.amount;
      }
      playerNode.bet = actionData.amount;
      playerNode.budget -= actionData.amount;
      bet = actionData.amount;
    }

    // if (actionData.action == "check") {
    //   playerNode.action = "check";
    //   playerNode.bet = 0;
    //   if (playerNode.next.action == "check") {
    //     //move on to next turn // call nextTurn()
    //     isTurnEnded = true;
    //   }
    // }

    if (actionData.action == "call") {
      playerNode.action = "call";
      playerNode.bet = this.#maxBet;
      bet = this.#maxBet;
      playerNode.budget -= bet;
    }

    if (actionData.action == "fold") {
      playerNode.action = "fold";
    }

    if (playerNode.next.bet == this.#maxBet) {
      isTurnEnded = true;
      let turnPot = this.calcTurnPot();
      this.#notifyTurnOver(turnPot);
    }

    return {
      position: playerNode.position,
      nextPosition: isTurnEnded ? -1 : playerNode.next.position,
      bet: bet,
    };
  }

  calcTurnPot() {
    let pot = 0;
    let node = this.#root;
    for (let i = 0; i < this.#size; i++) {
      pot += node.bet;
      node = node.next;
    }
    return pot;
  }

  determineWinner(boardsCards, pot) {
    let node = this.#root;
    let winners = [];
    let maxHandRank = 0;
    let bestHand = null;
    for (let i = 0; i < this.#size; i++) {
      const playerCards = node.player.cards.concat(boardsCards);
      const handRank = PokerEvaluator.evalHand(playerCards).value;
      if (handRank > maxHandRank) {
        maxHandRank = handRank;
        bestHand = playerCards;
        winners = [node];
      } else if (handRank == maxHandRank) {
        winners.push(node);
      }
      node = node.next;
    }

    let potPerWinner = pot / winners.length;
    winners.forEach((winner) => {
      winner.budget += potPerWinner;
    });

    console.log("winners: ");
    winners.forEach((winner) => {
      console.log(winner.position);
    });
    console.log("best hand:" + bestHand);
  }

  add(player, socketId, position, budget) {
    const playerNode = new PlayerNode(player, position, budget);
    this.#playersMap.set(socketId, playerNode);
    if (this.#size == 0) {
      this.#root = playerNode;
      playerNode.next = playerNode;
      playerNode.prev = playerNode;
      this.#bigBlindPosition = playerNode.position;
      // root = speaker = smallBlind in 2 players table..
      this.#size++;
      return;
    }

    if (this.#size == 1) {
      this.#smallBlindPosition =
        this.#firstSpeakerPosition =
        this.#UTGPosition =
          playerNode.position;
    }

    let node = this.#root;

    while (!this.isBetween(position, node.position, node.next.position)) {
      node = node.next;
    }

    playerNode.next = node.next;
    playerNode.prev = node;
    node.next.prev = playerNode;
    node.next = playerNode;
    this.#size++;
  }

  remove(socketId) {
    const nodeToRemove = this.#playersMap.get(socketId);
    if (!nodeToRemove) {
      ("can't find player by his socket id!");
      return -1;
    }

    const position = nodeToRemove.position;

    if (this.#size == 1) {
      this.#root =
        this.#bigBlindPosition =
        this.#smallBlindPosition =
        this.#firstSpeakerPosition =
          0;
      this.#size = 0;
      return position;
    }

    if (this.#firstSpeakerPosition == nodeToRemove.position) {
      this.#firstSpeakerPosition = nodeToRemove.next.position;
    }

    // if (this.#bigBlindPosition == playerNode.position) {
    //   this.#doesBigBlindremoved = true;
    // }
    if (this.#root == nodeToRemove) {
      this.#root = this.#root.next;
      this.#doesBigBlindremoved = true;
    }

    nodeToRemove.prev.next = nodeToRemove.next;
    nodeToRemove.next.prev = nodeToRemove.prev;
    this.#playersMap.delete(socketId);
    this.#size--;
    return position;
  }

  getRoot() {
    return this.#root;
  }

  getSize() {
    return this.#size;
  }

  set notifyTurnOver(notifyTurnOver) {
    this.#notifyTurnOver = notifyTurnOver;
  }

  get size() {
    return this.#size;
  }

  get root() {
    return this.#root;
  }

  getSpeakerPosition() {
    return this.#firstSpeakerPosition;
  }

  setPlayersCards(cardsPairs) {
    let node = this.#root;
    for (let i = 0; i < this.#size; i++) {
      node.player.cards = cardsPairs[i];
      node = node.next;
    }
    this.sendCardsToPlayers();
  }

  emitCards(socket, playerNode) {
    socket.emit("cardsDealt", {
      cards: playerNode?.player.cards,
      bigBlindPosition: this.#bigBlindPosition,
      smallBlindPosition: this.#smallBlindPosition,
      UTGPosition: this.#UTGPosition,
    });
  }

  async sendCardsToPlayers() {
    const io = getIO();
    // Get all socket IDs in the room
    const socketsInRoom = await io.in(this.#tableId).allSockets();
    const roomSocketIds = Array.from(socketsInRoom);

    const playerSocketIds = [];
    let playerNode = this.#root;
    for (let i = 0; i < this.#size; i++) {
      playerSocketIds.push(playerNode.player.socketId);
      const socket = io.sockets.sockets.get(playerNode.player.socketId);
      if (socket) {
        this.emitCards(socket, playerNode);
      } else {
        console.log(
          "can't find socket for player: ",
          playerNode.player.socketId
        );
      }
      playerNode = playerNode.next;
    }

    const notParticipantSocketIds = roomSocketIds.filter(
      (socketId) => !playerSocketIds.includes(socketId)
    );

    notParticipantSocketIds.forEach((socketId) => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        this.emitCards(socket);
      }
    });
  }

  returnTableState() {
    let playersState = [];
    let playerNode = this.#root;

    for (let i = 0; i < this.#size; i++) {
      if (!playerNode) {
        console.log("size > actual players.. " + this.#size);
      }
      const player = playerNode.player.toPlayerState();
      player.budget = playerNode.budget;
      playersState.push({
        position: playerNode.position,
        data: player,
        bet: playerNode.bet == undefined ? 0 : playerNode.bet,
      });
      playerNode = playerNode.next;
    }
    return {
      playersState: playersState,
      bigBlind: this.#bigBlindPosition,
      smallBlind: this.#smallBlindPosition,
    };
  }

  copy() {
    let newList = new PlayersList(this.#tableId);
    let root = this.#root;
    const newRoot = root.clone();
    newList.#root = newRoot;
    let current = newRoot;
    let newPlayersMap = new Map();
    newPlayersMap.set(newRoot.player.socketId, newRoot);

    for (let i = 0; i < this.#size - 1; i++) {
      let nextNode = root.next.clone();
      current.next = nextNode;
      nextNode.prev = current;
      current = nextNode;
      root = root.next;
      newPlayersMap.set(nextNode.player.socketId, nextNode);
    }
    current.next = newList.#root;
    newList.#root.prev = current;
    newList.#size = this.#size;
    newList.#bigBlindPosition = this.#bigBlindPosition;
    newList.#smallBlindPosition = this.#smallBlindPosition;
    newList.#firstSpeakerPosition = this.#firstSpeakerPosition;
    newList.#UTGPosition = this.#UTGPosition;
    newList.#playersMap = newPlayersMap;
    // current.printList();
    //root is first speaker in pre-flop, bigBlind is last.
    return newList;
  }

  printList() {
    let node = this.#root;
    while (this.#root.prev != node) {
      console.log(node.position + "->");
      node = node.next;
    }
    console.log(node.position);
  }
}
