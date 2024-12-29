const cardsMap = [
  "Ad",
  "2d",
  "3d",
  "4d",
  "5d",
  "6d",
  "7d",
  "8d",
  "9d",
  "Td",
  "Jd",
  "Qd",
  "Kd",
  "As",
  "2s",
  "3s",
  "4s",
  "5s",
  "6s",
  "7s",
  "8s",
  "9s",
  "Ts",
  "Js",
  "Qs",
  "Ks",
  "Ac",
  "2c",
  "3c",
  "4c",
  "5c",
  "6c",
  "7c",
  "8c",
  "9c",
  "Tc",
  "Jc",
  "Qc",
  "Kc",
  "Ah",
  "2h",
  "3h",
  "4h",
  "5h",
  "6h",
  "7h",
  "8h",
  "9h",
  "Th",
  "Jh",
  "Qh",
  "Kh",
];

export default class Deck {
  #cards;
  #remianedCards;
  constructor() {
    this.#cards = cardsMap;
    this.#remianedCards = 52;
  }

  swap(cards, index1, index2) {
    let temp = cards[index1];
    cards[index1] = cards[index2];
    cards[index2] = temp;
  }

  getCard() {
    let cardIndex = Math.floor(Math.random() * this.#remianedCards);
    let card = this.#cards[cardIndex];
    this.swap(this.#cards, cardIndex, this.#remianedCards - 1);
    this.#remianedCards = this.#remianedCards - 1;
    return card;
  }

  get2cards() {
    return [this.getCard(), this.getCard()];
  }

  get3cards() {
    return [this.getCard(), this.getCard(), this.getCard()];
  }

  resetDeck() {
    this.#remianedCards = 52;
  }
}
