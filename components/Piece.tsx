import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { PieceType, PlayerColor } from '../types/Chess';

interface PieceProps {
  type: PieceType;
  color: PlayerColor;
  onPress: () => void;
  selected?: boolean;
}

const pieceSymbols: Record<PieceType, Record<PlayerColor, string>> = {
  [PieceType.KING]: { [PlayerColor.WHITE]: '♚', [PlayerColor.BLACK]: '♚' },
  [PieceType.QUEEN]: { [PlayerColor.WHITE]: '♛', [PlayerColor.BLACK]: '♛' },
  [PieceType.ROOK]: { [PlayerColor.WHITE]: '♜', [PlayerColor.BLACK]: '♜' },
  [PieceType.BISHOP]: { [PlayerColor.WHITE]: '♝', [PlayerColor.BLACK]: '♝' },
  [PieceType.KNIGHT]: { [PlayerColor.WHITE]: '♞', [PlayerColor.BLACK]: '♞' },
  [PieceType.PAWN]: { [PlayerColor.WHITE]: '♟', [PlayerColor.BLACK]: '♟' },
};

const Piece: React.FC<PieceProps> = ({ type, color, onPress, selected }) => {
  return (
    <TouchableOpacity 
      style={[styles.piece, selected && styles.selectedPiece]} 
      onPress={onPress}
    >
      <Text style={[
        styles.pieceText,
        color === PlayerColor.WHITE ? styles.whitePiece : styles.blackPiece
      ]}>
        {pieceSymbols[type][color]}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  piece: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPiece: {
    backgroundColor: 'rgba(255, 255, 0, 0.5)',
  },
  pieceText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  whitePiece: Platform.select({
    web: {
      color: '#FFFFFF',
      filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.8))',
    },
    default: {
      color: '#FFFFFF',
      // Use a slightly darker white to simulate shadow
      backgroundColor: '#F0F0F0',
    },
  }),
  blackPiece: {
    color: '#000000',
  },
});

export default Piece;