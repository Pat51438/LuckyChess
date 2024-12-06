import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import { PlayerColor } from '../types/Chess';

interface TimerProps {
  color: PlayerColor;
  isActive: boolean;
  initialTime: number;
  onTimeOut: (color: PlayerColor) => void;
  onTimeUpdate: (time: number) => void;
  currentTime?: number;
  gameKey?: number;
}

const Timer: React.FC<TimerProps> = ({
  color,
  isActive,
  initialTime,
  onTimeOut,
  onTimeUpdate,
  currentTime,
  gameKey,
}) => {
  const timeLeftRef = useRef<number>(currentTime ?? initialTime);
  const intervalRef = useRef<number | null>(null); // Fixed the type here
  const [displayTime, setDisplayTime] = React.useState<number>(currentTime ?? initialTime);

  // Reset timer when gameKey changes
  useEffect(() => {
    timeLeftRef.current = initialTime;
    setDisplayTime(initialTime);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [gameKey, initialTime]);

  // Start or stop timer based on isActive
  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && timeLeftRef.current > 0) {
      intervalRef.current = setInterval(() => {
        timeLeftRef.current -= 1;
        setDisplayTime(timeLeftRef.current);
        onTimeUpdate(timeLeftRef.current);

        if (timeLeftRef.current === 0) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onTimeOut(color);
        }
      }, 1000) as unknown as number; // Cast to `number` for compatibility
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, color, onTimeOut, onTimeUpdate]);

  // Format time for display
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;

  return (
    <Text
      style={[
        styles.timerText,
        !isActive && styles.inactiveText,
        displayTime < 30 && styles.lowTimeText,
        displayTime === 0 && styles.timeoutText,
      ]}
    >
      {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
    </Text>
  );
};

const styles = StyleSheet.create({
  timerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  inactiveText: {
    opacity: 0.7,
  },
  lowTimeText: {
    color: '#ff4444',
  },
  timeoutText: {
    color: '#ff0000',
  },
});

export default Timer;
