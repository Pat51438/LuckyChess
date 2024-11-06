import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Piece from './Piece';
import { Piece as PieceType, Position } from '../types/Chess';

interface SquareProps {
  dark: boolean;
  piece: PieceType | null;
  position: Position;
  onPress: (position: Position) => void;
  selected?: boolean;
  isValidMove?: boolean;
}

const Square: React.FC<SquareProps> = ({ 
  dark, 
  piece, 
  position, 
  onPress, 
  selected, 
  isValidMove 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.square,
        dark ? styles.darkSquare : styles.lightSquare,
        selected && styles.selectedSquare,
        isValidMove && styles.validMove,
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
    aspectRatio: 1,
  },
  darkSquare: {
    backgroundColor: '#769656',
  },
  lightSquare: {
    backgroundColor: '#eeeed2',
  },
  selectedSquare: {
    backgroundColor: '#baca44',
  },
  validMove: {
    backgroundColor: '#f7f769',
  },
});

export default Square;