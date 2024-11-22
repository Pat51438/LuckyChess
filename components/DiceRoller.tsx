import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { PlayerColor } from '../types/Chess';
import { DiceRoll } from '../types/DiceGame';

interface DiceRollerProps {
  onDiceRoll: (result: DiceRoll) => void;
  isWaitingForRoll: boolean;
  currentPlayer: PlayerColor;
  remainingMoves: number;
}

const DiceRoller: React.FC<DiceRollerProps> = ({
  onDiceRoll,
  isWaitingForRoll,
  currentPlayer,
  remainingMoves,
}) => {
  const [spinValue] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const handleDiceRoll = () => {
    if (!isWaitingForRoll || isAnimating) return;

    setIsAnimating(true);
    const roll = Math.floor(Math.random() * 6) + 1;
    setLastRoll(roll);

    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 4,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
      onDiceRoll({
        value: roll,
        moves: roll <= 3 ? roll : roll - 3,
        player: roll <= 3 ? PlayerColor.WHITE : PlayerColor.BLACK,
      });
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.diceButton,
          !isWaitingForRoll && styles.disabledButton,
          isAnimating && styles.animatingButton,
        ]}
        onPress={handleDiceRoll}
        disabled={!isWaitingForRoll || isAnimating}
      >
        <Animated.View
          style={[
            styles.dice,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Text style={styles.diceText}>
            {isAnimating ? '?' : lastRoll || 'Roll'}
          </Text>
        </Animated.View>
      </TouchableOpacity>
      {!isWaitingForRoll && remainingMoves > 0 && (
        <Text style={styles.movesText}>
          Moves: {remainingMoves}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  diceButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  animatingButton: {
    backgroundColor: '#3d7abf',
  },
  dice: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  diceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  movesText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DiceRoller;