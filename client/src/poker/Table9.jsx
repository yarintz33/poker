// Table.js
import React, { useState } from "react";
import Chair from "./Chair";
import "../css/Table.css";
import Card from "./Card";
import { useSocketListener } from "../services/socketHandler";
import "../css/App.css";
import { connectWebSocket, joinToTable } from "../services/socketHandler";
import { useEffect } from "react";
import { socket } from "../services/socketHandler";
import TableImage from "../images/table6.png";
import Avatar from "../images/avatar.png";
import {Image, Button, Slider, Box } from "@mui/material";
import { standUp } from "../services/socketHandler";
import BackCardImage from "../images/back-card.png";
import cardImages from "../services/CardImages";

const Table9 = () => {
  const tableLength = 10;
  let player = {name:"yarin", budget: 400, avatar: "avatar" };
  const dealer = {name:"dealer", budget: undefined, avatar: "avatar" , position: 9};
  const [betAmount, setBetAmount] = useState(100);
  const [sittingPosition, setSittingPosition] = useState(null);
  const [cards, setCards] = useState([]);
  const [myCards, setMyCards] = useState([]);
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
  
    useEffect(() => {
      const tableId = "1";
      const playerId = "player123";

      connectWebSocket();
      
      socket.on("connect", () => {
        console.log("on connect is performing!");
        joinToTable(tableId, playerId, "playerName", "avt1");
      });

      return () => {
        socket.off("connect");
      };
    }, []);
  
  useSocketListener("tableState", (data) => {
    const newPlayers = [...tableState.players];
    console.log(data);
    data.players.forEach((player) => {
      newPlayers[player.position] = player.data;
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

  const dealCardsToPlayers = (data) =>{
    let timeout = 0;
    const timeoutInterval = 150; 
    tableState.players.map((player, index) => {
      if(player != null && index != dealer.position){
        if(index === sittingPosition){
            dealCard(timeout, cardsPositions[2*index], cardImages[data.cards[0]]);
            timeout += timeoutInterval;
            dealCard(timeout, cardsPositions[2*index+1], cardImages[data.cards[1]]);
            setMyCards([data.cards[0], data.cards[1]]);
          }else{
            dealCard(timeout, cardsPositions[2*index], BackCardImage);
            timeout += timeoutInterval;
            dealCard(timeout, cardsPositions[2*index+1], BackCardImage);
        }
        timeout += timeoutInterval;
      }
    });
    //setCards(data.cards);
  }

  const dealCard = (timeout, position, img) =>{
    setTimeout(() => {
      setCards(prev => [...prev, {"position" :position, "card" : img}]);
    }, timeout);
  };

  const setCardsToPlayer = (players) =>{
    console.log(players);
    if(!players) return;
    let cards = []; 
    players.map((player) => {
      if(player != null && player.data.isParticipant == true){
        cards.push({position: cardsPositions[2*player.position], card: BackCardImage});
        cards.push({position: cardsPositions[2*player.position+1], card: BackCardImage});
      }
    })
    console.log(cards);
    setCards(cards);
  }


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

          {cards.map((card) => {
          return (
            <>
            <Card
              key={cardsPositions[card.position]}
              position={card.position}
              card={card.card}
            />
            </>
          );
        })}

        {/* {myCards.map((card) => {
          return (
            <>
            <Card
              key={cardsPositions[card]}
              position={card}
              card={CardImages[card]}
            />
            </>
          );
        })} */}

        
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