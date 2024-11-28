import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayerColor } from '../types/Chess';

interface TimerProps {
  color: PlayerColor;
  isActive: boolean;
  initialTime: number;
  onTimeOut: (color: PlayerColor) => void;
  onTimeUpdate: (time: number) => void;
  currentTime?: number;  // Add this prop
}

const Timer: React.FC<TimerProps> = ({ 
  color, 
  isActive, 
  initialTime,
  onTimeOut,
  onTimeUpdate,
  currentTime  // Use this prop
}) => {
  const timeLeftRef = useRef(currentTime ?? initialTime);  // Use currentTime if provided
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [displayTime, setDisplayTime] = React.useState(currentTime ?? initialTime);
  const hasCalledTimeoutRef = useRef(false);

  // Remove the useEffect that resets timeLeftRef
  // This was causing the timer to reset

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && timeLeftRef.current > 0) {
      intervalRef.current = setInterval(() => {
        timeLeftRef.current -= 1;
        setDisplayTime(timeLeftRef.current);
        onTimeUpdate(timeLeftRef.current);
        
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
  }, [isActive, color, onTimeOut, onTimeUpdate]);

  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;

  return (
    <View style={[
      styles.container,
      !isActive && styles.inactiveContainer,
      timeLeftRef.current === 0 && styles.timeoutContainer
    ]}>
      <View style={styles.profileIcon}>
        <Text style={styles.profileText}>
          {color === PlayerColor.WHITE ? 'W' : 'B'}
        </Text>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 4,
    gap: 8,
  },
  inactiveContainer: {
    opacity: 0.7,
  },
  timeoutContainer: {
    backgroundColor: '#2a1a1a',
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  lowTimeText: {
    color: '#ff4444',
  },
  timeoutText: {
    color: '#ff0000',
  },
});

export default Timer;