import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { PieceType, PlayerColor } from '../types/Chess';

// Obtenir les dimensions de l'écran
const SCREEN = Dimensions.get('window');
const PIECE_SIZE = Math.min(SCREEN.width * 0.06, 32);

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
    fontSize: PIECE_SIZE,
    fontWeight: 'bold',
  },
  whitePiece: Platform.select({
    web: {
      color: '#FFFFFF',
      filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.8))',
    },
    default: {
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 1,
    },
  }),
  blackPiece: {
    color: '#000000',
  },
});

export default Piece;