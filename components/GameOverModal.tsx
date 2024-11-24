// Dans GameOverModal.tsx

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlayerColor, GameEndReason } from '../types/Chess';  // Import depuis types/Chess

export interface GameOverModalProps {
  isVisible: boolean;
  winner: PlayerColor | null;
  gameOverReason: GameEndReason;
  onNewGame: () => void;
  onReturnToMenu: () => void;
}


const GameOverModal: React.FC<GameOverModalProps> = ({
  isVisible,
  winner,
  gameOverReason,
  onNewGame,
  onReturnToMenu,
}) => {
  const getMessage = () => {
    switch (gameOverReason) {
      case 'checkmate':
        return `${winner === PlayerColor.WHITE ? 'White' : 'Black'} wins by checkmate!`;
      case 'timeout':
        return `${winner === PlayerColor.WHITE ? 'White' : 'Black'} wins by timeout!`;
      case 'forfeit':
        return `${winner === PlayerColor.WHITE ? 'White' : 'Black'} wins by forfeit!`;
      case 'stalemate':
        return "Game is a draw by stalemate!";
      default:
        return "Game Over";
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Game Over</Text>
          <Text style={styles.modalText}>{getMessage()}</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.newGameButton]}
              onPress={onNewGame}
            >
              <Text style={styles.buttonText}>New Game</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.menuButton]}
              onPress={onReturnToMenu}
            >
              <Text style={styles.buttonText}>Return to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 24,
    color: '#666',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  newGameButton: {
    backgroundColor: '#4CAF50',
  },
  menuButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameOverModal;