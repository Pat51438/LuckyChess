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
  
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
  
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
            // Important: pass the roll value directly
            onDiceRoll({ value: roll, moves: roll <= 3 ? roll : roll - 3, player: roll <= 3 ? PlayerColor.WHITE : PlayerColor.BLACK });
        });
    };
    
    

    return (
      <View style={styles.container}>
        <View style={styles.diceContainer}>
          <TouchableOpacity
            style={[
              styles.diceButton,
              !isWaitingForRoll ? styles.disabledDice : null,
              isAnimating ? styles.animatingDice : null,
            ]}
            onPress={handleDiceRoll}
            disabled={!isWaitingForRoll || isAnimating}
          >
            <Animated.View
              style={[
                styles.dice,
                {
                  transform: [{ rotate: spin }]
                }
              ]}
            >
              <Text style={styles.diceText}>
                {isAnimating ? '?' : lastRoll || 'Roll'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
          {!isWaitingForRoll && remainingMoves > 0 && (
    <Text 
        style={styles.singleLineText} 
        numberOfLines={1}
        ellipsizeMode="tail"
    >
        {currentPlayer === PlayerColor.WHITE ? 'White' : 'Black'} gets {remainingMoves} move{remainingMoves > 1 ? 's' : ''} • {remainingMoves} left
    </Text>
          )}
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      right: 0,
      alignItems: 'flex-end',
      backgroundColor: 'transparent',
    },
    diceContainer: {
      alignItems: 'flex-end',
    },
    diceButton: {
      width: 50,
      height: 50,
      borderRadius: 10,
      backgroundColor: '#4a90e2',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    disabledDice: {
      backgroundColor: '#ccc',
    },
    animatingDice: {
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
    singleLineText: {
      fontSize: 14,
      color: '#333',
      flexDirection: 'row',
      flexShrink: 1,
      marginRight: 10,
      textAlign: 'right',
    },
  });

  export default DiceRoller;