

export default class Deck {
    #cards;
    #remianedCards;
    constructor() { 
        this.#cards = [];
        this.#remianedCards = 52;
        for(let i = 0; i < 52; ++i){
            this.#cards[i] = i + 1;
        }

    }

    swap(cards, index1, index2){
        let temp = cards[index1];
        cards[index1] = cards[index2];
        cards[index2] = temp; 
    }

    getCard(){
        let cardIndex = Math.floor(Math.random() * this.#remianedCards);
        this.swap(this.#cards, cardIndex, this.#remianedCards - 1);
        this.#remianedCards -= 1;
        return cardIndex;
    }

    get2cards(){
        return [this.getCard(), this.getCard()];
    }

    resetDeck(){
        this.#remianedCards = 52;
    }

    
  } 