import React, { useEffect, useState } from 'react';
import { PlayerColor } from '../types/Chess';

interface TimerProps {
  color: PlayerColor;
  isActive: boolean;
  initialTime: number;
  onTimeOut: (color: PlayerColor) => void;
}

const Timer: React.FC<TimerProps> = ({ color, isActive, initialTime, onTimeOut }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime === 0) {
            onTimeOut(color);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, color, onTimeOut]);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div 
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: isActive ? '#e3f2fd' : '#f5f5f5',
        border: '1px solid',
        borderColor: isActive ? '#90caf9' : '#e0e0e0',
        width: '100%',
        maxWidth: '200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        transition: 'all 0.3s ease',
      }}
    >
      <span style={{ 
        fontWeight: 'bold',
        color: '#333',
      }}>
        {color === PlayerColor.WHITE ? "White" : "Black"}
      </span>
      <span style={{ 
        fontFamily: 'monospace',
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: timeLeft < 30 ? '#f44336' : '#333',
      }}>
        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </span>
    </div>
  );
};

export default Timer;