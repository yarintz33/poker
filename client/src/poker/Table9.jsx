// Table.js
import React, { useState } from "react";
import Chair from "./Chair";
import "../css/Table.css";
import CardOld from "./Card";
import { useSocketListener } from "../services/socketHandler";
import "../css/App.css";
import { connectWebSocket, joinToTable } from "../services/socketHandler";
import { useEffect } from "react";
import { socket } from "../services/socketHandler";
import TableImage from "../images/table6.png";
import Avatar from "../images/avatar.png";
import {Image, Button, Slider, Box } from "@mui/material";
import { standUp } from "../services/socketHandler";
import CardImages from "../services/CardImages";

const Table9 = () => {
  const tableLength = 10;
  let player = {name:"yarin", budget: 400, avatar: "avatar" };
  const dealer = {name:"dealer", budget: undefined, avatar: "avatar" , position: 9};
  const [betAmount, setBetAmount] = useState(100);
  const [sittingPosition, setSittingPosition] = useState(null);
  const [cards, setCards] = useState([]);
  const [otherCards, setOtherCards] = useState([]);
  const [tableState, setTableState] = useState({
    players: [null, null , null, null, null, null, null, null, null, dealer],

    numOfPlayers: 0
  });
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

  const [isDealing, setIsDealing] = useState(false);
  const [dealtCards, setDealtCards] = useState([]);
  
    useEffect(() => {
      const tableId = "1";
      const playerId = "player123";

      // First connect
      connectWebSocket();
      
      // Then join table after connection is established
      socket.on("connect", () => {
        console.log("on connect is performing!");
        joinToTable(tableId, playerId, "playerName", "boy.png");
      });

      return () => {
        socket.off("connect");
      };
    }, []);
  
  useSocketListener("tableState", (data) => {
    const newPlayers = [...tableState.players];
    console.log(data);
    data.players.forEach((player) => {
      newPlayers[player.position] = player;
      console.log(player);
    });

    setTableState({
      ...tableState,
      players: newPlayers
    });
    setCardsToPlayer(data.players);
  });

  useSocketListener("dealtCards", (data) => {
    console.log(data);
    dealCardsToPlayers(data);
  });

  useSocketListener("playerJoined", (data) => {
    const newPlayers = [...tableState.players];
    newPlayers[data.position] = data.player;
    setTableState({
      ...tableState,
      players: newPlayers
    });
  });

  useSocketListener("playerLeft", (data) => {
    const newPlayers = [...tableState.players];
    newPlayers[data.position] = null;
    setTableState({
      ...tableState,
      players: newPlayers
    });
  });

  const handleChairClick = (index) => {
    if (!sittingPosition) {
      setSittingPosition(index);
      
      const newPlayers = [...tableState.players];
      newPlayers[index] = { ...player, position: index };
      
      setTableState({
        ...tableState,
        players: newPlayers
      });
    }
  };

  const handleStandUp = (index) => {
    setSittingPosition(null);
    standUp("1", "playerId", sittingPosition);
    const newPlayers = [...tableState.players];
      newPlayers[index] = null;
      
      setTableState({
        ...tableState,
        players: newPlayers
      });
  };  

  const handleBetChange = (event, newValue) => {
    setBetAmount(newValue);
  };

  const setMyCards = (cards) =>{
    setCards(prev => [...prev, cards]);
  }

  const dealCardsToPlayers = (data) =>{
    let timeout = 0;
    const timeoutInterval = 100;
    tableState.players.map((player, index) => {
      if(player != null && index != dealer.position){
        if(index === sittingPosition){
          setMyCards(data.cards)//
        }else{
          setTimeout(() => {
            dealCard(cardsPositions[2*index]);
            console.log(cardsPositions[2*index]);
          }, timeout);
          timeout += timeoutInterval;
          setTimeout(() => {
            dealCard(cardsPositions[2*index+1]);
            console.log(cardsPositions[2*index+1]);
          }, timeout);
          timeout += timeoutInterval;
        }
      }
    });
    //setCards(data.cards);
  }

  const setCardsToPlayer = (players) =>{
    console.log(players);
    if(!players) return;
    let cards = []; 
    players.map((player) => {
      if(player != null && player.isParticipant == true){
        cards.push(cardsPositions[player.position*2]);
        cards.push(cardsPositions[2*player.position+1]);
      }
    })
    console.log(cards);
    setOtherCards(cards);
  }

  const dealCard = (position) =>{
    // setIsDealing(true);
    // const cards = [
    //   { position: 'top-left', value: 'A♠', delay: 0 },
    //   { position: 'top-right', value: 'K♥', delay: 200 },
    // ];
    console.log("dealCard is performing! position : ", position);
    setOtherCards(prev => [...prev, position]);
  }

  // const dealCards = () => {
  //   setIsDealing(true);
  //   // Simulate dealing cards with delays
  //   const cards = [
  //     { position: 'top-left', value: 'A♠', delay: 0 },
  //     { position: 'top-right', value: 'K♥', delay: 200 },
  //     // ... more cards
  //   ];
    
  //   cards.forEach((card, index) => {
  //     setTimeout(() => {
  //       setDealtCards(prev => [...prev, card]);
  //     }, card.delay);
  //   });
  // };

  return (
    <div className="table-centerer">
      <header className="App-header"> </header>
      <div className="table-container">

        <img src={TableImage} className="table" />
        
        {/* Map over chairPositions instead of players */}
        {tableState.players.map((player, index) => {
          return (
            <Chair
              key={chairPositions[index]}
              position={chairPositions[index]}
              index={index}
              isOccupied={!!(player?.name)} // Check for player name instead
              playerName={player?.name}
              playerBudget={player?.budget}
              playerAvatar={Avatar}
              userPositoin={sittingPosition}
              onClick={() => handleChairClick(index)}
            />
          );
        })}

          {otherCards.map((card) => {
          return (
            <>
            <CardOld
              key={cardsPositions[card]}
              position={card}
            />
            {/* <CardOld
              key={cardsPositions[2*index+1]}
              position={cardsPositions[2*index+1]}
            /> */}
            </>
          );
        })}
{
        // <CardOld position="top center" />
        // <CardOld position="top center second" />
        // <CardOld position="top right" />
        // <CardOld position="top right second" />
        // <CardOld position="bottom right" />
        // <CardOld position="bottom right second" />
        // <CardOld position="bottom left" />
        // <CardOld position="bottom left second" />
        // <CardOld position="bottom center" />
        // <CardOld position="bottom center second" />
        // <CardOld position="top left" />
        // <CardOld position="top left second" />
        // <CardOld position="down left" />
        // <CardOld position="down left second" />
        // <CardOld position="down right" />
        // <CardOld position="down right second" />
        // <CardOld position="up left" />
        // <CardOld position="up left second" />
        // <CardOld position="up right" />
        // <CardOld position="up right second" />
}
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

          {sittingPosition && (
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
                <Slider
                  orientation="vertical"
                  value={betAmount}
                  onChange={handleBetChange}
                  min={100}
                  
                  max={1000}
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
                  
                  sx={{
                    borderRadius: 4,
                    bgcolor: 'red',

                    '&:hover': { bgcolor: 'darkred' }
                  }}
                >
                  Fold
                </Button>
                <Button 
                  variant="contained"
                  sx={{ 
                    borderRadius: 4,
                    bgcolor: 'green',
                    '&:hover': { bgcolor: 'darkgreen' }
                  }}
                >
                  Check
                </Button>
                <Button 
                  variant="contained"
                  sx={{ 
                    borderRadius: 4,

                    bgcolor: '#ffd700',
                    color: 'black',
                    '&:hover': { bgcolor: '#ccac00' }
                  }}
                >
                  Bet ${betAmount}
                </Button>
              </Box>
            </>
          )}
        </Box>

        
      </div>
    </div>
  );
};

export default Table9;