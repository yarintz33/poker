// Chair.js
import React, { useState } from "react";
import "../css/Chair.css";
import styles from "../css/Chair.module.css";
import { seatInTable } from "../services/socketHandler";
import BuyInDialog from "./BuyInDialog";

import AvatatImage from "../images/boy.png";
import { connectWebSocket } from "../services/socketHandler";

// const chairMap = new Map();
// chairMap.set("top-right", 0);
// chairMap.set("right-top", 1);
// chairMap.set("right-bottom",2);
// chairMap.set("bottom-right", 3);
// chairMap.set("bottom", 4);
// chairMap.set("bottom-left", 5);
// chairMap.set("left-bottom", 6);
// chairMap.set("left-top", 7);
// chairMap.set("top-left", 8);



const Chair = ({ position, index, isOccupied, playerName, playerBudget, playerAvatar, userPositoin, onClick, isCurrentTurn }) => {
  const [buyInDialogOpen, setBuyInDialogOpen] = useState(false);


  const handleSeatClick = () => {
    setBuyInDialogOpen(true);
  };

  const handleBuyInConfirm = (amount, nickname) => {
    seatInTable(index, amount, nickname);
    onClick(index, amount, nickname);
  };
  
  return (
    <div className={`chair-container ${position}`}>
      <div 
        className={`chair ${userPositoin || isOccupied ? 'occupied' : 'empty'} ${isCurrentTurn ? 'current-turn' : ''}`}
        onClick={!userPositoin ? handleSeatClick : undefined}
      >
        {isOccupied ? (
          <div className="player-info">
            <div className="player-name">{playerName}</div>
            {playerAvatar && <img className={styles.avatar} src={playerAvatar} alt="player avatar" />}
            <div className="player-budget">${playerBudget}</div>
          </div>
        ) : (
          <div className="empty-chair"> {userPositoin? "empty" : "seat"}</div>
        )}
      </div>
      {isCurrentTurn && (
        <svg className="timer-ring" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            fill="none" 
            stroke="#4CAF50"
            strokeWidth="4"
            className="timer-circle"
          />
        </svg>
      )}
      <BuyInDialog
        open={buyInDialogOpen}
        onClose={() => setBuyInDialogOpen(false)}
        onConfirm={handleBuyInConfirm}
        maxBuyIn={1000}  // You can make these props dynamic based on table limits
        minBuyIn={100}
      />
    </div>
  );
};

export default Chair;
