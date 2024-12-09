// Table.js
import React, { useState } from "react";
import Chair from "./Chair";
import Card from "./Card";
import "../css/Table.css";
import { useSocketListener } from "../services/socketHandler";
import "../css/App.css";
import { connectWebSocket, joinToTable } from "../services/socketHandler";
import { useEffect } from "react";
import { socket } from "../services/socketHandler";
import TableImage from "../images/table6.png";
import Avatar from "../images/avatar.png";
import {Image, Button, Slider, Box } from "@mui/material";
import { standUp } from "../services/socketHandler";

const Table9 = () => {
  const tableLength = 10;
  let player = {name:"yarin", budget: 400, avatar: "avatar" };
  const dealer = {name:"dealer", budget: undefined, avatar: "avatar" };
  const [betAmount, setBetAmount] = useState(100);
  const [sittingPosition, setSittingPosition] = useState(null);
  const [tableState, setTableState] = useState({
    players: [null,  dealer, null, null, null, null, null, null, null, null],
    numOfPlayers: 0
  });
  const chairPositions = [
    "top-left",
    "top",
    "top-right",
    "right-top",
    "right-bottom",
    "bottom-right",
    "bottom",
    "bottom-left",
    "left-bottom",
    "left-top"
  ];
  
    useEffect(() => {
      const tableId = "1";
      const playerId = "player123";

      // First connect
      connectWebSocket();
      
      // Then join table after connection is established
      socket.on("connect", () => {
        console.log("on connect is performing!");
        joinToTable(tableId, playerId);
      });

      return () => {
        socket.off("connect");
      };
    }, []);
  
  useSocketListener("tableState", (data) => {
    const newPlayers = [...tableState.players];
    
    data.players.forEach((player) => {
      newPlayers[player.position] = player;
      console.log(player);
    });

    setTableState({
      ...tableState,
      players: newPlayers
    });
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

  return (
    <div className="table-centerer">
      <header className="App-header"> </header>
      <div className="table-container">

        <img src={TableImage} className="table" />
        
        {/* Map over chairPositions instead of players */}
        {tableState.players.map((player, index) => {
          console.log(`Position ${index}:`, player); // Debug log
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

        <Card position="top" />
        <Card position="top-second" />
        <Card position="top-right" />
        <Card position="top-right-second" />
        <Card position="bottom-right" />
        <Card position="bottom-right-second" />
        
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
