import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { PlayerColor } from '../types/Chess';
import { CoinToss } from '../types/CoinTossGame';

interface CoinTosserProps {
  onCoinToss: (result: CoinToss) => void;
  isWaitingForToss: boolean;
  currentPlayer: PlayerColor;
}

const CoinTosser: React.FC<CoinTosserProps> = ({
  onCoinToss,
  isWaitingForToss,
  currentPlayer,
}) => {
  const [spinValue] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCoinToss = () => {
    if (!isWaitingForToss || isAnimating) return;

    setIsAnimating(true);
    const result = Math.random() < 0.5 ? PlayerColor.WHITE : PlayerColor.BLACK;

    spinValue.setValue(0);
    Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 4,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsAnimating(false);
      onCoinToss({ result });
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
          styles.coinButton,
          !isWaitingForToss && styles.disabledButton,
          isAnimating && styles.animatingButton
        ]}
        onPress={handleCoinToss}
        disabled={!isWaitingForToss || isAnimating}
      >
        <Animated.View
          style={[
            styles.coin,
            {
              transform: [{ rotateY: spin }]
            }
          ]}
        >
          <Text style={styles.coinText}>
            {isAnimating ? '?' : currentPlayer === PlayerColor.WHITE ? 'W' : 'B'}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  coinButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  coin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#daa520',
  },
  coinText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b8860b',
  },
});

export default CoinTosser;