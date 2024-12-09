// Chair.js
import React, { useState } from "react";
import "../css/Chair.css";
import styles from "../css/Chair.module.css";

import AvatatImage from "../images/boy.png";
import { connectWebSocket } from "../services/socketHandler";
import { seatInTable } from "../services/socketHandler";

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




const Chair = ({ position, index, isOccupied, playerName, playerBudget, playerAvatar, userPositoin, onClick }) => {


  const handleSeatClick = () => {
    seatInTable("1", "playerId", index, 500, "playerName", "boy.png");
    //setAvatar(AvatatImage); // Replace with a real avatar URL
    onClick(index);
  };
  
  return (
    
    <div className="chair-container">
      
      <div 
        className={`chair ${position} ${userPositoin || isOccupied ? 'occupied' : 'empty'}`}
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
        )
        }
        
      </div>
    </div>

  );
};

export default Chair;
