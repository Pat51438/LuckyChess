import React, { useState, useEffect } from 'react';
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
  playerColor: PlayerColor;
  instructionText: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
}

const DiceDots: React.FC<{ value: number }> = ({ value }) => {
  if (value === 0) {
    return (
      <View style={styles.realisticDiceContainer}>
        <Text style={styles.rollButtonText}>Roll</Text>
      </View>
    );
  }

  return (
    <View style={styles.realisticDiceContainer}>
      {value === 1 && <View style={[styles.dot, styles.centerDot]} />}
      {value === 2 && (
        <>
          <View style={[styles.dot, styles.topLeftDot]} />
          <View style={[styles.dot, styles.bottomRightDot]} />
        </>
      )}
      {value === 3 && (
        <>
          <View style={[styles.dot, styles.topLeftDot]} />
          <View style={[styles.dot, styles.centerDot]} />
          <View style={[styles.dot, styles.bottomRightDot]} />
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
          <View style={[styles.dot, styles.centerLeftDot]} />
          <View style={[styles.dot, styles.centerRightDot]} />
          <View style={[styles.dot, styles.bottomLeftDot]} />
          <View style={[styles.dot, styles.bottomRightDot]} />
        </>
      )}
    </View>
  );
};

const DiceRoller: React.FC<DiceRollerProps> = ({
  onDiceRoll,
  isWaitingForRoll,
  remainingMoves,
  gameKey,
  isActive,
  onTimeOut,
  playerColor,
  currentTime,
  onTimeUpdate,
}) => {
  const [spinValue] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);
  const [diceValue, setDiceValue] = useState<number>(0);

  useEffect(() => {
    if (remainingMoves === 0) {
      setDiceValue(0); // Automatically reset the dice to "Roll"
    }
  }, [remainingMoves]);

  useEffect(() => {
    if (gameKey !== 0) {
      setDiceValue(0); // Reset dice to "Roll" on new game
      setIsAnimating(false);
    }
  }, [gameKey]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleDiceRoll = () => {
    if (!isWaitingForRoll || isAnimating) return;

    setIsAnimating(true);
    setDiceValue(0); // Reset dice to "Roll"

    const roll = Math.floor(Math.random() * 6) + 1; // Generate random roll
    spinValue.setValue(0);

    Animated.timing(spinValue, {
      toValue: 4,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
      setDiceValue(roll); // Set rolled dice value
      onDiceRoll({
        value: roll,
        moves: roll <= 3 ? roll : roll - 3,
        player: roll <= 3 ? PlayerColor.WHITE : PlayerColor.BLACK,
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.darkContainer}>
        <View style={styles.horizontalContainer}>
          <Timer
            color={playerColor}
            isActive={isActive}
            initialTime={600}
            currentTime={currentTime}
            onTimeOut={onTimeOut}
            onTimeUpdate={onTimeUpdate}
            gameKey={gameKey}
          />
          <Text style={styles.movesText}>
            {isActive ? (remainingMoves === 0 ? "Roll the Dice" : `${remainingMoves} moves`) : ''}
          </Text>
          <TouchableOpacity
            style={[
              styles.diceButton,
              !isActive || !isWaitingForRoll ? styles.disabledDice : null,
              isAnimating ? styles.animatingDice : null,
            ]}
            onPress={handleDiceRoll}
            disabled={!isActive || !isWaitingForRoll || isAnimating}
          >
            <Animated.View style={[styles.dice, { transform: [{ rotate: spin }] }]}>
              <DiceDots value={diceValue} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 76,
    top: '50%',
    transform: [{ translateY: -30 }],
    zIndex: 1,
  },
  darkContainer: {
    backgroundColor: 'rgba(40, 40, 40, 0.3)',
    padding: 10,
    borderRadius: 12,
    minWidth: 140,
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  movesText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 10,
  },
  diceButton: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dice: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  realisticDiceContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  topLeftDot: { position: 'absolute', top: 8, left: 8 },
  topRightDot: { position: 'absolute', top: 8, right: 8 },
  bottomLeftDot: { position: 'absolute', bottom: 8, left: 8 },
  bottomRightDot: { position: 'absolute', bottom: 8, right: 8 },
  centerLeftDot: { position: 'absolute', left: 8, top: '50%', transform: [{ translateY: -20 }] },
  centerRightDot: { position: 'absolute', right: 8, top: '50%', transform: [{ translateY: -20 }] },
  centerDot: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -5 }, { translateY: -5 }] },
  rollButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  disabledDice: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  animatingDice: {
    backgroundColor: '#FFFFFF',
  },
});

export default DiceRoller;
