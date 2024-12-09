import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { PlayerColor } from '../types/Chess';
import { CoinToss } from '../types/CoinTossGame';
import Timer from './Timer';

interface CoinTosserProps {
  onCoinToss: (result: CoinToss) => void;
  isWaitingForToss: boolean;
  currentPlayer: PlayerColor;
  gameKey: number;
  isActive: boolean;
  onTimeOut: (color: PlayerColor) => void;
  playerColor: PlayerColor;
  instructionText: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  initialTurnsRemaining: number;
  canTossCoin: boolean;
  lastPlayedColor?: PlayerColor | null;
}

const CoinTosser: React.FC<CoinTosserProps> = ({
  onCoinToss,
  isWaitingForToss,
  currentPlayer,
  gameKey,
  isActive,
  onTimeOut,
  playerColor,
  instructionText,
  currentTime,
  onTimeUpdate,
  initialTurnsRemaining,
  canTossCoin,
  lastPlayedColor
}) => {
  const [spinValue] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<PlayerColor | null>(null);

  // Reset coin when game restarts
  useEffect(() => {
    if (gameKey !== 0) {
      setResult(null);
      setIsAnimating(false);
      spinValue.setValue(0);
    }
  }, [gameKey, spinValue]);

  // Reset the coin when waiting for a new toss
  useEffect(() => {
    if (isWaitingForToss && !isAnimating) {
      setResult(null);
    }
  }, [isWaitingForToss, isAnimating]);

  const shouldShowCoin = isWaitingForToss && playerColor === currentPlayer;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'], // Increased to two full rotations for better effect
  });

  const handleCoinToss = () => {
    if (!shouldShowCoin || isAnimating || !canTossCoin) return;

    setIsAnimating(true);
    const newResult = Math.random() < 0.5 ? PlayerColor.WHITE : PlayerColor.BLACK;
    
    spinValue.setValue(0);
    
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
      setResult(newResult);
      onCoinToss({ result: newResult });
    });
  };

  const getCoinDisplay = () => {
    if (isAnimating) return '?';
    if (result === PlayerColor.WHITE) return 'W';
    if (result === PlayerColor.BLACK) return 'B';
    return '?';
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
          <Text style={styles.infoText}>
            {isActive ? 
              initialTurnsRemaining > 0 ? 
                `Initial moves: ${initialTurnsRemaining}` : 
                shouldShowCoin ? 
                  "Toss Coin" : 
                  "Your Turn" 
              : ''
            }
          </Text>
          <TouchableOpacity
            style={[
              styles.coinButton,
              !shouldShowCoin || !canTossCoin ? styles.disabledCoin : null,
              isAnimating ? styles.animatingCoin : null,
            ]}
            onPress={handleCoinToss}
            disabled={!shouldShowCoin || isAnimating || !canTossCoin}
          >
            <Animated.View 
              style={[
                styles.coin, 
                { transform: [{ rotate: spin }] }
              ]}
            >
              <Text style={styles.coinText}>
                {getCoinDisplay()}
              </Text>
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
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 10,
  },
  coinButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  coin: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DAA520',
  },
  coinText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  disabledCoin: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  animatingCoin: {
    backgroundColor: '#FFFFFF',
  },
});

export default CoinTosser;