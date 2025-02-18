// Table.js
import React, { useState, useEffect } from "react";
import Chair from "./Chair";
import "../css/Table.css";
import "../css/Card.css";
import "../css/Chips.css";
import "../css/Bet.css";
import BetAmount from "./BetAmount";
import { useSocketListener } from "../services/socketHandler";
import "../css/App.css";
import { connectWebSocket, joinToTable } from "../services/socketHandler";
import { socket } from "../services/socketHandler";
import TableImage from "../images/table6.png";
import Avatar from "../images/boy.png";
import {Image, Button, Slider, Box } from "@mui/material";
import { standUp } from "../services/socketHandler";
import BackCardImage from "../images/back-card.png";
import cardImages from "../services/CardImages";
import ChipsImage from "../images/chips2.png";
import CardTry from "./CardTry";
import TurnTimer from "./TurnTimer";

const Table9 = () => {
  const tableLength = 10;
  let player = {name:"yarin", budget: 500, avatar: "avatar" };
  const dealer = {name:"dealer", budget: undefined, avatar: "avatar" , position: 9};
  const [betAmount, setBetAmount] = useState(100);
  const [sittingPosition, setSittingPosition] = useState(null);
  const [maxTurnBet, setMaxTurnBet] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [chipLeaderBudget, setChipLeaderBudget] = useState(1000);
  const [turnTimer, setTurnTimer] = useState(null);
  const TURN_TIME_LIMIT = 10000; // 10 seconds in milliseconds

  const [players, setPlayers] = useState([null, null, null, null, null, null, null, null, null, dealer]);
  const [cards, setCards] = useState([]);
  const [boardCards, setBoardCards] = useState([]);
  const [bets, setBets] = useState(Array(9).fill(0));
  const [pot, setPot] = useState(0);
  const [currentTurnPosition, setCurrentTurnPosition] = useState(-1);

  const boardPositions = ["board first", "board second", "board third", "board fourth", "board fifth"];

  const chairPositions = [
    "top right",
    "up right-edge",
    "down right-edge",
    "bottom right",
    "bottom center",
    "bottom left",
    "down left-edge",
    "up left-edge",
    "top left",
    "top center",
  ];

  const ROUND_STATE = {
    PRE_FLOP: 0,
    FLOP: 1,
    TURN: 2,
    RIVER: 3,
    END: 4,
  };

  const cardsPositions = [
    "top right",
    "top right second",
    "up right-edge",
    "up right-edge second",
    "down right-edge",
    "down right-edge second",
    "bottom right",
    "bottom right second",
    "bottom center",
    "bottom center second",
    "bottom left",
    "bottom left second",
    "down left-edge",
    "down left-edge second",
    "up left-edge",
    "up left-edge second",
    "top left",
    "top left second",
    "top center",
    "top center second",
  ];
  
    useEffect(() => {
      const tableId = "1";
      const playerId = "player123";

      connectWebSocket();
      
      socket.on("connect", () => {
        joinToTable(tableId, playerId, "playerName", "avt1");
      });

      return () => {
        socket.off("connect");
      };
    }, []);
  

  const HandleSeat = (chairIndex, buyInAmount) => {
    player.budget = buyInAmount;
    socket.emit("seatInTable", player);
  };

  const setBoard = (cards) => {
    if(!cards) return;
    let newBoardCards = [];
    for(let i = 0; i < cards.length; i++){
      newBoardCards.push({"position" :boardPositions[i], "card" : cards[i]});
    }
    setBoardCards(newBoardCards);
  }

  useSocketListener("tableState", (data) => {
    console.log(data);
    const newPlayers = [...players];
    const newBets = [...bets];
    console.log(data);
    data.players.forEach((player) => {
      newPlayers[player.position] = player.data;
      newBets[player.position] = player.bet;
    });

    setPlayers(newPlayers);
    setBets(newBets);
    setCardsToPlayer(data.players);
    setBoard(data.boardCards);
    setPot(data.pot);
  });

  useSocketListener("cardsDealt", (data) => {
    setBoardCards([]);
    setCards([]);
    setPot(0);
    setBets(Array(9).fill(0));
    setMaxTurnBet(0);
    findAndSetChipLeaderBudget();
    setCurrentTurnPosition(data.UTGPosition);

    if(data.UTGPosition === sittingPosition){
      setIsMyTurn(true);
    }
    console.log(data);
    dealCardsToPlayers(data);
  });

  useSocketListener("playerJoined", (data) => {
    console.log("playerJoined: " + data.position);
    const newPlayers = [...players];
    newPlayers[data.position] = data.player;
    setPlayers(newPlayers);
  });

  const updatePlayerBudget = (position, amount) =>{
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[position].budget = amount;
      return newPlayers;
    });
  }

  const findAndSetChipLeaderBudget = () =>{ 
    let maxBudget = 0;
    players.forEach((player, index) => {
      if(player != null && index != sittingPosition && player.budget > maxBudget){
        maxBudget = player.budget;
      }
    });
    setChipLeaderBudget(maxBudget);
  }

  useSocketListener("playerAction", (data) => {
    console.log(data);
    
    if(data.playerAction == "bet"){
      const newBets = [...bets];
      newBets[data.position] = data.bet;
      updatePlayerBudget(data.position, players[data.position].budget - data.bet);
      setBets(newBets);
      setMaxTurnBet(data.bet);
    }else if(data.playerAction == "call"){
      const newBets = [...bets];
      newBets[data.position] = maxTurnBet;
      setBets(newBets);
      updatePlayerBudget(data.position, players[data.position].budget - data.bet);
    }else if(data.playerAction == "fold"){
      setCards(cards.filter(card => card.position !== 2 * data.position && card.position !== 2 * data.position + 1));

      // setCards(prev => {
      //   const newCards = [...prev];
      //   newCards[2*data.position] = null;
      //   newCards[2*data.position + 1] = null;
      //   return newCards;
      // });
      
    }
    
    if (data.nextPlayer == -1) {
      resetBets();
    } 

    setCurrentTurnPosition(data.nextPlayer);

    if(isMyTurn){
      setIsMyTurn(false);
    }

    if (data.nextPlayer == sittingPosition) {
      setIsMyTurn(true);
      startTurnTimer();
    } else {
      clearTurnTimer();
    }
  });

  const resetBets = () => {
    const newBets = Array(9).fill(0);
    setBets(newBets);
    setMaxTurnBet(0);
  }

  useSocketListener("determineWinners", (data) => {
    //console.log("winner position: " + data[0].position + " winning pot: " + data[0].chips);
    resetBets();
    setBoardCards([]);
    setCards([]);
    let timeout = 0;
    data.forEach(winner => {

      setTimeout(() => {
        updatePlayerBudget(winner.position, players[winner.position].budget + winner.chips);
        setPot(pot - winner.chips);
      }, timeout);
      timeout += 2500;
    });
  });

  useSocketListener("nextTurn", (data) => {
    if(data.nextPlayer == -1){
      resetBets();
    }
    setCurrentTurnPosition(data.nextPlayer);
  });


  const dealFlop = (cards) => {
    
    for(let i = 0; i < 3; i++){
      setTimeout(() => {
        //        setTableState(prev => ({...prev, boardCards: [...prev.boardCards, {"position" :positionsMap[i], "card" : cards[i]}]}));
        setBoardCards(prev => ([...prev, {"position" :boardPositions[i], "card" : cards[i]}]));
      }, 400 * (i + 1));
    }
  }

  const dealTurn = (card) => {
    setBoardCards(prev => ([...prev, {"position" :boardPositions[3], "card" : card}]));
  }

  const dealRiver = (card) => {
    setBoardCards(prev => ([...prev, {"position" :boardPositions[4], "card" : card}]));
  }

  useSocketListener("dealNext", (data) => {
    setPot(data.pot);
    findAndSetChipLeaderBudget();
    setCurrentTurnPosition(data.speaker);

    if(data.speaker === sittingPosition){
      setIsMyTurn(true);
    }
    if(data.roundState == ROUND_STATE.FLOP){
      dealFlop(data.cards);
    }else if(data.roundState == ROUND_STATE.TURN){
      dealTurn(data.cards);
    }else if(data.roundState == ROUND_STATE.RIVER){
      dealRiver(data.cards);
    }
    
      
  });

  useSocketListener("playerLeft", (data) => {
    const newPlayers = [...players];
    const newBets = [...bets];
    const newCards = [...cards];
    console.log("data.position", data.position);
    newBets[data.position] = null;
    newPlayers[data.position] = null;
    //newCards = newCards.filter(card => card.position !== 2 * data.position && card.position !== 2 * data.position + 1);
    // newCards[2*data.position] = null;
    // newCards[2*data.position + 1] = null;

    setPlayers(newPlayers);
    setBets(newBets);
    setCards(newCards.filter(card => card.position !== 2 * data.position && card.position !== 2 * data.position + 1));
  });



  const handleChairClick = (index, buyInAmount, nickname) => {
    if (!sittingPosition) {
      setSittingPosition(index);
      
      const newPlayers = [...players];
      newPlayers[index] = { 
        ...player, 
        position: index, 
        budget: buyInAmount,
        name: nickname 
      };
      
      setPlayers(newPlayers);
    }
  };

  const handleStandUp = (index) => {
    setSittingPosition(null);
    standUp("1", "playerId", sittingPosition);
    const newPlayers = [...players];
      newPlayers[index] = null;
      
      setPlayers(newPlayers);
  };  

  const handleBetChange = (event, newValue) => {
    setBetAmount(newValue);
  };

  const dealCards = (position, cards, timeout, timeoutInterval) => {
      let firstCardToDeal = null; 
      let secondCardToDeal = null;
      if(position === sittingPosition){
        firstCardToDeal = cardImages[cards[0]];
        secondCardToDeal = cardImages[cards[1]];
        // setMyCards([firstCardToDeal, secondCardToDeal]);
      }else{
        firstCardToDeal = BackCardImage;
        secondCardToDeal = BackCardImage;
      }
        dealOneCard(timeout, cardsPositions[2*position], firstCardToDeal);
        timeout += timeoutInterval;
        dealOneCard(timeout, cardsPositions[2*position + 1], secondCardToDeal);
  }

  const dealCardsToPlayers = (data) =>{
    let timeout = 0;
    const timeoutInterval = 200; 

    for(let position = data.UTGPosition; position < players.length - 1 /* - 1 because of dealer */; position++){
      if(players[position] != null){
        dealCards(position, data.cards, timeout, timeoutInterval);
        timeout += 2 * timeoutInterval; 
      }
    }
    for(let position = 0; position < data.UTGPosition; position++){
      if(players[position] != null){
        dealCards(position, data.cards, timeout, timeoutInterval);
        timeout += 2 * timeoutInterval;   
      }
    }
    //setCards(data.cards);
  }

  const dealOneCard = (timeout, position, img) =>{
    setTimeout(() => {
      //      setTableState(prev => ({...prev, cards: [...prev.cards, {"position" :position, "card" : img}]}));

      setCards(prev => ([...prev, {"position" :position, "card" : img}]));
    }, timeout);
  };

  const setCardsToPlayer = (players) =>{
    if(!players) return;
    let cards = []; 
    players.map((player) => {
      if(player != null && player.isParticipant == true){
        cards.push({position: cardsPositions[2*player.position], card: BackCardImage});
        cards.push({position: cardsPositions[2*player.position+1], card: BackCardImage});
      }
    })

    setCards(cards);
  }

  const playerAction = (actionData) => {
    setIsMyTurn(false);
    socket.emit("playerAction", actionData); 
  };

  const handleBet = (amount) => {
    clearTurnTimer();
    playerAction({action: "bet", amount: amount});

    if(amount > maxTurnBet){
      setMaxTurnBet(amount);
    }
    const newBets = [...bets]; 
    newBets[sittingPosition] = amount;
    updatePlayerBudget(sittingPosition, players[sittingPosition].budget - amount);
    setBets(newBets);
  };


  const handleCheckOrCall = () => {
    clearTurnTimer();
    playerAction({action: "call"});
    updatePlayerBudget(sittingPosition, players[sittingPosition].budget - maxTurnBet + bets[sittingPosition]);

    setBets(prev => {
      const newBets = [...prev];
      newBets[sittingPosition] = maxTurnBet;
      return newBets;
    });

  };

  const handleFold = () => {
    clearTurnTimer();
    playerAction({action: "fold"});
    setBets(prev => {
      const newBets = [...prev];
      newBets[sittingPosition] = 0;
      return newBets;
    });
  };

  const buttonText = maxTurnBet === 0 ? "Check" : `Call ${maxTurnBet}`;

  useEffect(() => {
    socket.on("playerJoined", ({ position, player }) => {
      setPlayers(prev => {
        const newPlayers = [...prev];
        newPlayers[position] = player;
        return newPlayers;
      });
    });

    // socket.on("dealNext", ({ pot, cards }) => {
    //   setPot(pot);
    //   setBoardCards(prev => [...prev, ...cards]);
    // });

    socket.on("bet", ({ position, amount }) => {
      setBets(prev => {
        const newBets = [...prev];
        newBets[position] = amount;
        return newBets;
      });
      setPot(prev => prev + amount);
    });
  }, []);

  // Add this function to handle timer expiration
  // const handleTurnTimeout = () => {
  //   if (isMyTurn) {
  //     // Default action when time runs out (usually fold)
  //     if(maxTurnBet > 0){
  //       handleFold();
  //     }else{
  //       handleCheckOrCall();
  //     }
  //   }
  // };

  // Function to start timer
  const startTurnTimer = () => {
    // Clear any existing timer
    if (turnTimer) clearTimeout(turnTimer);
    
    // Set new timer
    //const newTimer = setTimeout(handleTurnTimeout, TURN_TIME_LIMIT);
    //setTurnTimer(newTimer);
  };

  // Clear timer when turn ends
  const clearTurnTimer = () => {
    if (turnTimer) {
      clearTimeout(turnTimer);
      // setTurnTimer(null);
    }
  };

  useEffect(() => {
    return () => {
      if (turnTimer) clearTimeout(turnTimer);
    };
  }, [turnTimer]);

  return (
    <div className="table-centerer">
      <header className="App-header"> </header>
      <div className="table-container">

        <img src={TableImage} className="table" />
        
        {/* Map over chairPositions instead of players */}
        {players.map((player, index) => {
          return (
            <>
            <Chair
              key={chairPositions[index]}
              position={chairPositions[index]}
              index={index}
              isOccupied={!!(player?.name)}
              playerName={player?.name}
              playerBudget={player?.budget}
              playerAvatar={Avatar}
              userPositoin={sittingPosition}
              onClick={handleChairClick}
              isCurrentTurn={index === currentTurnPosition}
            />
            </>
          );
        })}



        {bets.map((bet, index) => {
          return ( bet != null && bet != 0 && bet != -1 && (
            <>
            <BetAmount
              key={chairPositions[index]}
              position={chairPositions[index]}
              amount={bet}
            />
            <img   src={ChipsImage} className={`Chips ${chairPositions[index]}`} />
            </>
            )
          )
        })}


        {pot > 0 && 
        <>
        <BetAmount
              key={"top center"}
              position={"top center"}
              amount={pot}
        />
        <img   src={ChipsImage} className={"Chips top center"} />
        </>
          }
          {
          cards.map((card) => {
            
            
          return (card != null &&
            <>
            <CardTry
              key={cardsPositions[card.position]}
              position={card.position}
              card={card.card}
            />
            </>
          )
        })}

        

         {boardCards.map((card) => {
          return (
            <CardTry key={card.position} position={card.position} card={cardImages[card.card]} />
          )
         })}


        {/* Action buttons and slider */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'flex-end',
            width: '30%'
          }}
        >
          {sittingPosition && (
            <Button 
              variant="contained"
              onClick={() => handleStandUp(sittingPosition)}
              sx={{ 
                bgcolor: '#ff6b6b',
                '&:hover': { bgcolor: '#ff5252' }
              }}
            >
              Stand Up
            </Button>
          )}

          {sittingPosition != null && (
            <>
              {/* Bet slider */}
              <Box
                sx={{
                  height: '150px',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  '& .MuiSlider-root': {
                    padding: '0px',
                  }
                }}
              >
                {/* {isMyTurn && ( */}
                <Slider
                  orientation="vertical"
                  value={betAmount}
                  onChange={handleBetChange}
                  min={maxTurnBet}
                  max={players[sittingPosition].budget > chipLeaderBudget ? chipLeaderBudget : players[sittingPosition].budget}
                  step={10}
                  valueLabelDisplay="auto"
                  sx={{
                    marginRight: '15px',
                    color: '#ffd700',
                    '& .MuiSlider-valueLabel': {
                      left: '50%'
                    },
                    '& .MuiSlider-track': {
                      border: 'none',
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.5,
                    },
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#ffd700',
                    }
                  }}
                />
                 
              </Box>
              
              {/* Action buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="error"
                  disabled={!isMyTurn}
                  onClick={() => handleFold()}
                >
                  Fold
                </Button>

                <Button 
                  variant="contained" 
                  color="primary"
                  disabled={!isMyTurn}
                  onClick={() => handleCheckOrCall()}
                >
                  {buttonText}
                </Button>

                <Button 
                  variant="contained" 
                  color="success"
                  disabled={!isMyTurn}
                  onClick={() => handleBet(betAmount)}
                >
                  Bet
                </Button>
              </Box>
            </>
          )}
        </Box>

        {/* <TurnTimer 
          isActive={isMyTurn} 
          // onTimeout={handleTurnTimeout}
        /> */}

      </div>
    </div>
  );
};

export default Table9;