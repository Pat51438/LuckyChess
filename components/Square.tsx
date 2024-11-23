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
  let backgroundColor = dark ? '#769656' : '#eeeed2'; // Retour aux couleurs vertes originales
  
  if (selected) {
    backgroundColor = 'rgba(255, 255, 0, 0.5)';  // Jaune semi-transparent pour la sélection
  } else if (isValidMove) {
    backgroundColor = 'rgba(0, 255, 0, 0.3)';    // Vert semi-transparent pour les mouvements valides
  } else if (isCastlingPartner) {
    backgroundColor = 'rgba(0, 0, 255, 0.3)';    // Bleu semi-transparent pour le partenaire de roque
  }

  if (isKingInCheck) {
    backgroundColor = 'rgba(255, 0, 0, 0.3)';    // Rouge semi-transparent pour l'échec
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
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkSquare: {
    backgroundColor: '#769656',  // Vert foncé original
  },
  lightSquare: {
    backgroundColor: '#eeeed2',  // Vert clair original
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