import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Piece from './Piece';
import { Piece as PieceType, Position, PlayerColor, PieceType as ChessPieceType } from '../types/Chess';

interface SquareProps {
  dark: boolean;
  piece: PieceType | null;
  position: Position;
  onPress: (position: Position) => void;
  selected?: boolean;
  isValidMove?: boolean;
  isInvalidMove?: boolean;
  isInCheck?: boolean; // Nouvelle prop pour indiquer si la case contient un roi en échec
}

const Square: React.FC<SquareProps> = ({ 
  dark, 
  piece, 
  position, 
  onPress, 
  selected,
  isValidMove,
  isInvalidMove,
  isInCheck = false // Valeur par défaut false
}) => {
  const [flashValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isInCheck) {
      // Animation qui fait flasher entre rouge normal et rouge clair
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(flashValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      flashValue.setValue(0);
    }
  }, [isInCheck]);

  const backgroundColor = flashValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ff4444', '#ff8888'],
  });

  return (
    <Animated.View style={[
      styles.square,
      dark ? styles.darkSquare : styles.lightSquare,
      selected && styles.selectedSquare,
      isValidMove && styles.validMove,
      isInvalidMove && styles.invalidMove,
      isInCheck && { backgroundColor },
    ]}>
      <TouchableOpacity 
        style={styles.touchable}
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  square: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  touchable: {
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
    backgroundColor: '#baca44',
  },
  validMove: {
    backgroundColor: '#f7f769',
  },
  invalidMove: {
    backgroundColor: '#ff6b6b',
  },
});

export default Square;