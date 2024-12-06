import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { PlayerColor, Piece } from '../types/Chess';

interface CapturedPiecesDisplayProps {
  capturedPieces: Piece[];
  color: PlayerColor;
}

const piecePoints: { [key: string]: number } = {
  PAWN: 1,
  ROOK: 5,
  KNIGHT: 3,
  BISHOP: 3,
  QUEEN: 8,
};

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
  const totalPoints = capturedPieces.reduce(
    (acc, piece) => acc + (piecePoints[piece.type] || 0),
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.piecesContainer}>
        {capturedPieces.map((piece, index) => (
          <Text
            key={`${piece.type}-${piece.color}-${index}`}
            style={[
              styles.piece,
              { color: piece.color === PlayerColor.WHITE ? '#FFFFFF' : '#000000' },
            ]}
          >
            {getPieceSymbol(piece)}
          </Text>
        ))}
      </View>
      <Text style={styles.pointsText}>{` Score: ${totalPoints} `}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Align pieces and points horizontally
    alignItems: 'center',
    padding: 8,
    minHeight: 60,
  },
  piecesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  piece: {
    fontSize: 22,
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
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10, // Add spacing between pieces and points
   color: '#FFFFFF'
  },
});

export default CapturedPiecesDisplay;
