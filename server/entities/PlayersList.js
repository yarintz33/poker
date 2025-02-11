import PlayerNode from "./PlayerNode.js";
import { getIO } from "../services/ioService.js";
import * as PokerEvaluator from "poker-evaluator";

export default class PlayersList {
  #root;
  #size;
  #playersMap;
  #maxBet;
  #numOfParticipants;
  #notifyRoundOver;
  #bigBlindPosition;
  #doesBigBlindremoved;
  #smallBlindPosition;
  #firstSpeakerPosition;
  #UTGPosition;
  #tableId;
  #notifyTurnOver;
  #lastBetPosition;

  constructor(tableId) {
    this.#tableId = tableId;
    this.#root = null;
    this.#size = 0;
    this.#numOfParticipants = 0;
    /**@Type {Map<String, PlayerNode>} */
    this.#playersMap = new Map();
    this.#bigBlindPosition = -1;
    this.#smallBlindPosition = -1;
    this.#firstSpeakerPosition = -1;
    this.#lastBetPosition = -1;
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
    this.#lastBetPosition = this.#firstSpeakerPosition;
    this.resetPlayersTurnState();
  }

  resetRoundState() {
    if (this.#doesBigBlindremoved) {
      this.#smallBlindPosition = -1;
      this.#bigBlindPosition = this.#root.position;
      this.#firstSpeakerPosition = this.#bigBlindPosition;
      this.#doesBigBlindremoved = false;
      const utgPosition = this.#root.next.next.position;
      this.#UTGPosition = utgPosition;
      this.#lastBetPosition = utgPosition;
    } else {
      this.#bigBlindPosition = this.#root.next.position;
      this.#smallBlindPosition = this.#root.position;
      this.#firstSpeakerPosition = this.#smallBlindPosition;
      const utgPosition = this.#root.next.next.position;
      this.#UTGPosition = utgPosition;
      this.#lastBetPosition = utgPosition;
      this.#root = this.#root.next;
    }
    this.#maxBet = 0;
    this.#numOfParticipants = this.#size;

    this.resetPlayersRoundState();
  }

  resetPlayersRoundState() {
    let node = this.#root;
    for (let i = 0; i < this.#size; i++) {
      node.reset();
      node = node.next;
    }
  }

  resetPlayersTurnState() {
    let node = this.#root;
    for (let i = 0; i < this.#size; i++) {
      node.action = "none";
      node.bet = 0;
      node = node.next;
    }
  }

  //TODO: check if turn ended
  playerAction(socketId, actionData) {
    console.log("playerAction: ");
    console.log(actionData);
    let bet = 0;
    let nextPlayerPosition = -1;
    console.log("socketId: " + socketId);
    const playerNode = this.#playersMap.get(socketId); // this what cause the problem. the playersMap points to the table players.
    console.log("playerNode.action: " + playerNode.action);
    playerNode.action = actionData.action;

    let nextPlayerNode = playerNode.next;
    while (
      (nextPlayerNode.isParticipant == false || nextPlayerNode.isAllIn) &&
      nextPlayerNode.position != this.#lastBetPosition
    ) {
      nextPlayerNode = nextPlayerNode.next;
    }

    if (actionData.action == "bet") {
      playerNode.action = "bet";
      this.#lastBetPosition = playerNode.position;
      if (actionData.amount > this.#maxBet) {
        this.#maxBet = actionData.amount;
      }
      if (actionData.amount == playerNode.budget) {
        playerNode.isAllIn = true;
      }

      playerNode.bet = actionData.amount;
      playerNode.budget -= actionData.amount;
      bet = actionData.amount;
    } else if (actionData.action == "call") {
      playerNode.action = "call";
      let callAmount = this.#maxBet - playerNode.bet;
      if (callAmount > playerNode.budget) {
        callAmount = playerNode.bet + playerNode.budget;
        playerNode.isAllIn = true;
      }
      playerNode.budget -= callAmount;
      playerNode.bet = this.#maxBet;
      bet = callAmount;
    } else if (actionData.action == "fold") {
      playerNode.action = "fold";
      playerNode.isParticipant = false;
      this.#numOfParticipants--;
      // if (this.#numOfParticipants == 1) {
      //   this.#notifyRoundOver();
      // } else
      if (playerNode.position == this.#firstSpeakerPosition) {
        this.#firstSpeakerPosition = nextPlayerNode.position;
      }
    }

    playerNode.overallBet += bet;
    nextPlayerPosition = nextPlayerNode.position;
    let turnPot = 0;

    if (nextPlayerNode.position == this.#lastBetPosition) {
      console.log("lastBetPosition: " + this.#lastBetPosition);
      nextPlayerPosition = -1;
      turnPot = this.calcTurnPot();
      //this.#notifyTurnOver(turnPot);
      //this.#lastBetPosition = this.#firstSpeakerPosition;
    }

    return {
      position: playerNode.position,
      nextPosition: nextPlayerPosition,
      bet: bet,
      turnPot: turnPot,
    };
  }

  set notifyRoundOver(notifyRoundOver) {
    this.#notifyRoundOver = notifyRoundOver;
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

  #findWinners(players, boardsCards) {
    let winners = [];
    let maxHandRank = -1;
    let bestHand = null;
    players.forEach((playerNode) => {
      if (playerNode.isParticipant) {
        const playerCards = playerNode.cards.concat(boardsCards);
        const handRank = PokerEvaluator.evalHand(playerCards).value;
        if (handRank > maxHandRank) {
          maxHandRank = handRank;
          bestHand = playerCards;
          winners = [playerNode];
        } else if (handRank == maxHandRank) {
          winners.push(playerNode);
        }
      }
    });
    winners.forEach((winner) => {
      console.log("winner: " + winner.position);
    });

    return winners;
  }

  #updatePlayerBudget(socketId, amount) {
    const playerNode = this.#playersMap.get(socketId);
    if (playerNode != undefined && playerNode != null) {
      playerNode.budget = amount;
    } else {
      console.log("can't find winner from playersMap! ");
    }
  }

  determineWinner(boardsCards, pot) {
    let node = this.#root;
    let maxHandRank = 0;
    let bestHand = null;
    let copiedPlayers = this.#copyList();

    const output = [];
    let winners = [];
    while (pot > 0) {
      winners = this.#findWinners(copiedPlayers, boardsCards); // can't find winners??
      winners.forEach((winner) => {
        console.log("winner: " + winner.position + " " + winner.overallBet);
      });
      let winnersAmount = winners.length;
      let winnerChips = 0;
      winners.forEach((winner) => {
        copiedPlayers.forEach((player) => {
          winnerChips +=
            Math.min(winner.overallBet, player.overallBet) / winnersAmount;
        });
        output.push({
          position: winner.position,
          chips: winnerChips,
        });
        this.#updatePlayerBudget(
          winner.player.socketId,
          winner.budget + winnerChips
        );
      });
      copiedPlayers = copiedPlayers.filter(
        (player) => !winners.includes(player)
      );
      pot -= winnerChips;
    }
    console.log(output);
    return output;
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
      console.log("can't find player by his socket id!");
      return -1;
    }

    if (nodeToRemove.isParticipant) {
      this.#numOfParticipants--;
      if (this.#numOfParticipants == 1) {
        this.#notifyRoundOver();
      }
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

  getUTGPosition() {
    return this.#UTGPosition;
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

  get numOfParticipants() {
    return this.#numOfParticipants;
  }

  getSpeakerPosition() {
    return this.#firstSpeakerPosition;
  }

  setPlayersCards(cardsPairs) {
    let node = this.#root;
    for (let i = 0; i < this.#size; i++) {
      node.cards = cardsPairs[i];
      node = node.next;
    }
    this.sendCardsToPlayers();
  }

  emitCards(socket, playerNode) {
    socket.emit("cardsDealt", {
      cards: playerNode?.cards,
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
      player.isParticipant = playerNode.isParticipant;
      playersState.push({
        position: playerNode.position,
        data: player,
        bet: playerNode.bet == undefined ? 0 : playerNode.bet,
        isParticipant: playerNode.isParticipant,
      });
      playerNode = playerNode.next;
    }
    return {
      playersState: playersState,
      bigBlind: this.#bigBlindPosition,
      smallBlind: this.#smallBlindPosition,
    };
  }

  #copyList() {
    const copiedPlayers = [];
    let current = this.#root;
    for (let i = 0; i < this.#size; i++) {
      copiedPlayers.push(current.copy());
      current = current.next;
    }
    copiedPlayers.forEach((participant) => {});
    return copiedPlayers;
  }

  // copy() {
  //   let newList = new PlayersList(this.#tableId);
  //   let root = this.#root;
  //   const newRoot = root.clone();
  //   newList.#root = newRoot;
  //   let current = newRoot;
  //   let newPlayersMap = new Map();
  //   newPlayersMap.set(newRoot.player.socketId, newRoot);

  //   for (let i = 0; i < this.#size - 1; i++) {
  //     let nextNode = root.next.clone();
  //     current.next = nextNode;
  //     nextNode.prev = current;
  //     current = nextNode;
  //     root = root.next;
  //     newPlayersMap.set(nextNode.player.socketId, nextNode);
  //   }
  //   current.next = newList.#root;
  //   newList.#root.prev = current;
  //   newList.#size = this.#size;
  //   newList.#bigBlindPosition = this.#bigBlindPosition;
  //   newList.#smallBlindPosition = this.#smallBlindPosition;
  //   newList.#firstSpeakerPosition = this.#firstSpeakerPosition;
  //   newList.#UTGPosition = this.#UTGPosition;
  //   newList.#playersMap = newPlayersMap;
  //   // current.printList();
  //   //root is first speaker in pre-flop, bigBlind is last.
  //   return newList;
  // }

  printList() {
    let node = this.#root;
    while (this.#root.prev != node) {
      console.log(node.position + "->");
      node = node.next;
    }
    console.log(node.position);
  }

  getSocketIdByPosition(position) {
    let current = this.#root;
    for (let i = 0; i < this.#size; i++) {
      if (current.position === position) {
        return current.player.socketId;
      }
      current = current.next;
    }
    return null;
  }

  getCurrentBet() {
    return this.#maxBet;
  }
}
