import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { PlayerColor } from '../types/Chess';
import { DiceRoll } from '../types/DiceGame';
import Timer from './Timer';

interface DiceRollerProps {
  onDiceRoll: (result: DiceRoll) => void;
  isWaitingForRoll: boolean;
  currentPlayer: PlayerColor;
  remainingMoves: number;
  gameKey: number;
  isActive: boolean;
  onTimeOut: (color: PlayerColor) => void;
}

const DiceDots: React.FC<{ value: number }> = ({ value }) => {
  return (
    <View style={styles.dotContainer}>
      {value === 1 && <View style={[styles.dot, styles.centerDot]} />}
      {value === 2 && (
        <>
          <View style={[styles.dot, styles.topRightDot]} />
          <View style={[styles.dot, styles.bottomLeftDot]} />
        </>
      )}
      {value === 3 && (
        <>
          <View style={[styles.dot, styles.topRightDot]} />
          <View style={[styles.dot, styles.centerDot]} />
          <View style={[styles.dot, styles.bottomLeftDot]} />
        </>
      )}
      {value === 4 && (
        <>
          <View style={[styles.dot, styles.topLeftDot]} />
          <View style={[styles.dot, styles.topRightDot]} />
          <View style={[styles.dot, styles.bottomLeftDot]} />
          <View style={[styles.dot, styles.bottomRightDot]} />
        </>
      )}
      {value === 5 && (
        <>
          <View style={[styles.dot, styles.topLeftDot]} />
          <View style={[styles.dot, styles.topRightDot]} />
          <View style={[styles.dot, styles.centerDot]} />
          <View style={[styles.dot, styles.bottomLeftDot]} />
          <View style={[styles.dot, styles.bottomRightDot]} />
        </>
      )}
      {value === 6 && (
        <>
          <View style={[styles.dot, styles.topLeftDot]} />
          <View style={[styles.dot, styles.topRightDot]} />
          <View style={[styles.dot, styles.middleLeftDot]} />
          <View style={[styles.dot, styles.middleRightDot]} />
          <View style={[styles.dot, styles.bottomLeftDot]} />
          <View style={[styles.dot, styles.bottomRightDot]} />
        </>
      )}
      {value === 0 && <Text style={styles.rollButtonText}>Roll</Text>}
    </View>
  );
};

const DiceRoller: React.FC<DiceRollerProps> = ({
  onDiceRoll,
  isWaitingForRoll,
  currentPlayer,
  remainingMoves,
  gameKey,
  isActive,
  onTimeOut,
}) => {
  const [spinValue] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);
  const [diceValue, setDiceValue] = useState<number>(0);
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);

  useEffect(() => {
    if (gameKey === 0) {
      setWhiteTime(600);
      setBlackTime(600);
      setDiceValue(0);
      setIsAnimating(false);
    }
  }, [gameKey]);

  const handleTimeUpdate = (time: number) => {
    if (currentPlayer === PlayerColor.WHITE) {
      setWhiteTime(time);
    } else {
      setBlackTime(time);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const handleDiceRoll = () => {
    if (!isWaitingForRoll || isAnimating) return;
    
    setIsAnimating(true);
    setDiceValue(0);
    const roll = Math.floor(Math.random() * 6) + 1;
    
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 4,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
      setDiceValue(roll);
      onDiceRoll({ 
        value: roll, 
        moves: roll <= 3 ? roll : roll - 3, 
        player: roll <= 3 ? PlayerColor.WHITE : PlayerColor.BLACK 
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.gameInfoContainer}>
          <View style={styles.gameInfoSection}>
            <View style={[
              styles.timerPill, 
              currentPlayer === PlayerColor.BLACK ? styles.blackPill : styles.whitePill
            ]}>
              <Timer
                color={currentPlayer}
                isActive={isActive}
                initialTime={600}
                currentTime={currentPlayer === PlayerColor.WHITE ? whiteTime : blackTime}
                onTimeOut={onTimeOut}
                onTimeUpdate={handleTimeUpdate}
              />
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerText}>
                {currentPlayer === PlayerColor.WHITE ? "White" : "Black"}
              </Text>
              <Text style={styles.getsText}>Gets {remainingMoves} Move</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.diceButton,
                !isWaitingForRoll ? styles.disabledDice : null,
                isAnimating ? styles.animatingDice : null,
              ]}
              onPress={handleDiceRoll}
              disabled={!isWaitingForRoll || isAnimating}
            >
              <Animated.View style={[styles.dice, { transform: [{ rotate: spin }] }]}>
                <DiceDots value={diceValue} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingRight: 12,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  blackPill: {
    backgroundColor: '#000000',
  },
  whitePill: {
    backgroundColor: '#FFFFFF',
  },
  blackText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  blackTimerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  whiteTimerText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  gameInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#4B0082',
    borderRadius: 12,
    padding: 8,
  },
  playerInfo: {
    alignItems: 'center',
  },
  playerText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
  },
  getsText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
  },
  diceButton: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  disabledDice: {
    opacity: 0.7,
  },
  animatingDice: {
    backgroundColor: '#FFFFFF',
  },
  dice: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotContainer: {
    width: '100%',
    height: '100%',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  rollButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  centerDot: { left: '50%', top: '50%', transform: [{ translateX: -4 }, { translateY: -4 }] },
  topLeftDot: { left: '25%', top: '25%', transform: [{ translateX: -4 }, { translateY: -4 }] },
  topRightDot: { right: '25%', top: '25%', transform: [{ translateX: 4 }, { translateY: -4 }] },
  middleLeftDot: { left: '25%', top: '50%', transform: [{ translateX: -4 }, { translateY: -4 }] },
  middleRightDot: { right: '25%', top: '50%', transform: [{ translateX: 4 }, { translateY: -4 }] },
  bottomLeftDot: { left: '25%', bottom: '25%', transform: [{ translateX: -4 }, { translateY: 4 }] },
  bottomRightDot: { right: '25%', bottom: '25%', transform: [{ translateX: 4 }, { translateY: 4 }] },
});

export default DiceRoller;