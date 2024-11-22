import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayerColor, GameType } from '../types/Chess';
import { DiceRoll } from '../types/DiceGame';
import { CoinToss } from '../types/CoinTossGame';

interface GameInfoProps {
  gameType: GameType;
  currentPlayer: PlayerColor;
  isInCheck: PlayerColor | null;
  lastMove: {
    piece: string;
    from: string;
    to: string;
  } | null;
  lastDiceRoll?: DiceRoll | null;
  lastCoinToss?: CoinToss | null;
  remainingMoves?: number;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameType,
  currentPlayer,
  isInCheck,
  lastMove,
  lastDiceRoll,
  lastCoinToss,
  remainingMoves,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Game Status</Text>
        <Text style={styles.text}>
          Game Type: {gameType === 'dice' ? 'Dice Chess' : 'Coin Toss Chess'}
        </Text>
        <Text style={styles.text}>
          Current Player: {currentPlayer === PlayerColor.WHITE ? 'White' : 'Black'}
        </Text>
        {isInCheck && (
          <Text style={styles.checkText}>
            {isInCheck === PlayerColor.WHITE ? 'White' : 'Black'} is in check!
          </Text>
        )}
      </View>

      {lastMove && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Last Move</Text>
          <Text style={styles.text}>
            {lastMove.piece}: {lastMove.from} → {lastMove.to}
          </Text>
        </View>
      )}

      {gameType === 'dice' && lastDiceRoll && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Last Dice Roll</Text>
          <Text style={styles.text}>Roll: {lastDiceRoll.value}</Text>
          <Text style={styles.text}>
            {lastDiceRoll.player === PlayerColor.WHITE ? 'White' : 'Black'} got {lastDiceRoll.moves} moves
          </Text>
          {remainingMoves !== undefined && (
            <Text style={styles.text}>Remaining Moves: {remainingMoves}</Text>
          )}
        </View>
      )}

      {gameType === 'coinToss' && lastCoinToss && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Last Coin Toss</Text>
          <Text style={styles.text}>
            Result: {lastCoinToss.result === PlayerColor.WHITE ? 'White' : 'Black'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  checkText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
  },
});

export default GameInfo;