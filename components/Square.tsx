import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Piece from './Piece';
import { Piece as PieceType, Position } from '../types/Chess';

interface SquareProps {
  dark: boolean;
  piece: PieceType | null;
  position: Position;
  selected: boolean;
  isValidMove: boolean;
  isKingInCheck: boolean;
  isCastlingPartner: boolean | null;
  onPress: (position: Position) => void;
}

const Square: React.FC<SquareProps> = ({
  dark,
  piece,
  position,
  selected,
  isValidMove,
  isKingInCheck,
  isCastlingPartner,
  onPress,
}) => {
  let backgroundColor = dark ? '#808080' : '#ffffff';
  
  if (selected) {
    backgroundColor = 'rgba(100, 100, 100, 0.5)';
  } else if (isValidMove) {
    backgroundColor = 'rgba(100, 100, 100, 0.3)';
  } else if (isCastlingPartner) {
    backgroundColor = 'rgba(100, 100, 100, 0.3)';
  }

  if (isKingInCheck) {
    backgroundColor = 'rgba(180, 0, 0, 0.4)';
  }

  return (
    <TouchableOpacity
      style={[
        styles.square,
        dark ? styles.darkSquare : styles.lightSquare,
        { backgroundColor }
      ]}
      onPress={() => onPress(position)}
    >
      {piece && (
        <Piece
          type={piece.type}
          color={piece.color}
          onPress={() => onPress(position)}
          selected={selected}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  square: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkSquare: {
    backgroundColor: '#707070',
   },
   lightSquare: {
    backgroundColor: '#ffffff',
   },
  squareOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Square;