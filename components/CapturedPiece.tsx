import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { PlayerColor, Piece } from '../types/Chess';

interface CapturedPiecesDisplayProps {
  capturedPieces: Piece[];
  color: PlayerColor;
}

const getPieceSymbol = (piece: Piece): string => {
  const isWhite = piece.color === PlayerColor.WHITE;
  switch (piece.type) {
    case 'PAWN':
      return isWhite ? '♙' : '♟';
    case 'ROOK':
      return isWhite ? '♖' : '♜';
    case 'KNIGHT':
      return isWhite ? '♘' : '♞';
    case 'BISHOP':
      return isWhite ? '♗' : '♝';
    case 'QUEEN':
      return isWhite ? '♕' : '♛';
    case 'KING':
      return isWhite ? '♔' : '♚';
    default:
      return '';
  }
};

const CapturedPiecesDisplay: React.FC<CapturedPiecesDisplayProps> = ({
  capturedPieces,
  color,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.piecesContainer}>
        {capturedPieces.map((piece, index) => (
          <Text 
            key={`${piece.type}-${piece.color}-${index}`}
            style={[
              styles.piece,
              { color: piece.color === PlayerColor.WHITE ? '#FFFFFF' : '#000000' }
            ]}
          >
            {getPieceSymbol(piece)}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    minHeight: 60,
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  piecesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  piece: {
    fontSize: 24,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
      },
      web: {
        textShadow: '0px 1px 1px rgba(0, 0, 0, 0.5)',
      },
    }),
  },
});

export default CapturedPiecesDisplay;