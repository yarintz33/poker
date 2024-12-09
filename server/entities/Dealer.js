import Deck from './Deck.js';


export default class Dealer {
    constructor() {
        this.deck = new Deck(); 
      }

      dealPlayers(players){
        players.forEach(player => {
            player.cards = this.deck.get2cards();
        });
      }

      dealFlop(){

      }

      dealTurn(){

      }

      dealRiver(){
        
      }


  }
