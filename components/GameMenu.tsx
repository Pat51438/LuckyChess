// components/GameMenu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { GameType } from '../types/Chess';

interface GameMenuProps {
  onSelectGame: (gameType: GameType) => void;
}

const { width } = Dimensions.get('window');
const buttonWidth = Math.min(width * 0.8, 400);

const GameMenu: React.FC<GameMenuProps> = ({ onSelectGame }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chess Variants</Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.diceButton]} 
          onPress={() => onSelectGame('dice')}
        >
          <Text style={styles.buttonText}>Dice Chess</Text>
          <Text style={styles.description}>
            Roll the dice to determine moves:{'\n'}
            1-3: White gets 1-3 moves{'\n'}
            4-6: Black gets 1-3 moves
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.coinButton]} 
          onPress={() => onSelectGame('coinToss')}
        >
          <Text style={styles.buttonText}>Coin Toss Chess</Text>
          <Text style={styles.description}>
            Toss a coin after each move{'\n'}
            to determine who plays next
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>Note:</Text>
        <Text style={styles.rulesText}>
          In both variants, when a king is in check,{'\n'}
          the normal rules apply and the threatened{'\n'}
          player must protect their king.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#2c3e50',
  },
  buttonsContainer: {
    width: buttonWidth,
    gap: 20,
  },
  button: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  diceButton: {
    backgroundColor: '#8e44ad',
  },
  coinButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.9,
  },
  rulesContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    width: buttonWidth,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  rulesText: {
    textAlign: 'center',
    color: '#7f8c8d',
    lineHeight: 20,
  },
});

export default GameMenu;