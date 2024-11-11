import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayerColor, Piece, PieceType } from '../types/Chess';

interface CapturedPiecesDisplayProps {
  capturedPieces: Piece[];
  color: PlayerColor;
}

const getPieceSymbol = (type: PieceType): string => {
  switch (type) {
    case PieceType.PAWN:
      return '♟';
    case PieceType.ROOK:
      return '♜';
    case PieceType.KNIGHT:
      return '♞';
    case PieceType.BISHOP:
      return '♝';
    case PieceType.QUEEN:
      return '♛';
    case PieceType.KING:
      return '♚';
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
      <Text style={styles.header}>
        {color === PlayerColor.WHITE ? "White's captures" : "Black's captures"}
      </Text>
      <View style={styles.piecesContainer}>
        {capturedPieces.map((piece, index) => (
          <Text 
            key={index} 
            style={[
              styles.piece,
              { color: piece.color === PlayerColor.WHITE ? '#fff' : '#000' }
            ]}
          >
            {getPieceSymbol(piece.type)}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  piecesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  piece: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default CapturedPiecesDisplay;