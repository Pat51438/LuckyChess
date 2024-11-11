import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayerColor } from '../types/Chess';

interface TimerProps {
  color: PlayerColor;
  isActive: boolean;
  initialTime: number;
  onTimeOut: (color: PlayerColor) => void;
}

const Timer: React.FC<TimerProps> = ({ color, isActive, initialTime, onTimeOut }) => {
  const timeLeftRef = useRef(initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [displayTime, setDisplayTime] = React.useState(initialTime);
  const hasCalledTimeoutRef = useRef(false);

  useEffect(() => {
    timeLeftRef.current = initialTime;
    setDisplayTime(initialTime);
    hasCalledTimeoutRef.current = false;
  }, [initialTime]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && timeLeftRef.current > 0) {
      intervalRef.current = setInterval(() => {
        timeLeftRef.current -= 1;
        setDisplayTime(timeLeftRef.current);
        
        if (timeLeftRef.current === 0 && !hasCalledTimeoutRef.current) {
          hasCalledTimeoutRef.current = true;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onTimeOut(color);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, color, onTimeOut]);

  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;

  return (
    <View style={[
      styles.container,
      isActive ? styles.activeContainer : styles.inactiveContainer,
      timeLeftRef.current === 0 && styles.timeoutContainer
    ]}>
      <Text style={[
        styles.timerText,
        displayTime < 30 && styles.lowTimeText,
        timeLeftRef.current === 0 && styles.timeoutText
      ]}>
        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 80,
    alignItems: 'center',
  },
  activeContainer: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  inactiveContainer: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  timeoutContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#ef9a9a',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  lowTimeText: {
    color: '#f44336',
  },
  timeoutText: {
    color: '#d32f2f',
  }
});

export default Timer;