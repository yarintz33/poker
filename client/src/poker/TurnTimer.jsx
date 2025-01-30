import React, { useState, useEffect } from 'react';

const TurnTimer = ({ isActive, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(10);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeout]);

  if (!isActive) return null;

  return (
    <div className="turn-timer">
      {timeLeft}s
    </div>
  );
};

export default TurnTimer; 