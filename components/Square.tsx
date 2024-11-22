import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Piece from './Piece';
import { Piece as PieceType, Position } from '../types/Chess';

interface SquareProps {
  dark: boolean;
  piece: PieceType | null;
  position: Position;
  onPress: (position: Position) => void;
  selected: boolean;
  isValidMove: boolean;
}

const Square: React.FC<SquareProps> = React.memo(({
  dark,
  piece,
  position,
  onPress,
  selected,
  isValidMove,
}) => {
  console.log(`Square rendering at ${position.row},${position.col} - selected: ${selected}`); // Debug log

  return (
    <TouchableOpacity
      style={[
        styles.square,
        dark ? styles.darkSquare : styles.lightSquare,
      ]}
      onPress={() => onPress(position)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.squareOverlay,
        selected && styles.selectedSquare,
        isValidMove && styles.validMove,
      ]}>
        {piece && (
          <Piece
            type={piece.type}
            color={piece.color}
            onPress={() => onPress(position)}
            selected={selected}
          />
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  square: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  squareOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkSquare: {
    backgroundColor: '#769656',
  },
  lightSquare: {
    backgroundColor: '#eeeed2',
  },
  selectedSquare: {
    backgroundColor: 'rgba(255, 255, 0, 0.5)',  // Semi-transparent yellow
  },
  validMove: {
    backgroundColor: 'rgba(0, 255, 0, 0.3)',    // Semi-transparent green
  },
});

export default Square;