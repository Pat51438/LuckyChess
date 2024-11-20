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
  isInCheck?: boolean;
  isCastlingPartner?: boolean;
}

const Square: React.FC<SquareProps> = ({ 
  dark, 
  piece, 
  position, 
  onPress, 
  selected,
  isValidMove,
  isInvalidMove,
  isInCheck = false,
  isCastlingPartner = false
}) => {
  const [checkFlashValue] = useState(new Animated.Value(0));
  const [castlingFlashValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isInCheck) {
      // Animation pour l'échec
      Animated.loop(
        Animated.sequence([
          Animated.timing(checkFlashValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(checkFlashValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      checkFlashValue.setValue(0);
    }
  }, [isInCheck]);

  useEffect(() => {
    if (isCastlingPartner) {
      // Animation pour le partenaire de roque
      Animated.loop(
        Animated.sequence([
          Animated.timing(castlingFlashValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(castlingFlashValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      castlingFlashValue.setValue(0);
      // Arrêter l'animation quand isCastlingPartner devient false
      castlingFlashValue.stopAnimation();
    }

    // Cleanup function pour arrêter l'animation quand le composant est démonté
    return () => {
      castlingFlashValue.stopAnimation();
    };
  }, [isCastlingPartner]);

  const checkBackgroundColor = checkFlashValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ff4444', '#ff8888'],
  });

  const castlingBackgroundColor = castlingFlashValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(65, 105, 225, 0.3)', 'rgba(65, 105, 225, 0.7)'], // Royal Blue avec différentes opacités
  });

  return (
    <Animated.View style={[
      styles.square,
      dark ? styles.darkSquare : styles.lightSquare,
      selected && styles.selectedSquare,
      isValidMove && styles.validMove,
      isInvalidMove && styles.invalidMove,
      isInCheck && { backgroundColor: checkBackgroundColor },
      isCastlingPartner && { backgroundColor: castlingBackgroundColor },
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