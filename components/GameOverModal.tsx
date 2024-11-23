import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlayerColor } from '../types/Chess';

export type GameEndReason = 'checkmate' | 'timeout' | 'forfeit' | null;

interface GameOverModalProps {
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
  onReturnToMenu
}) => {
  const getGameOverMessage = () => {
    if (!gameOverReason || !winner) return "Game Over!";
    
    const winnerText = winner === PlayerColor.WHITE ? "White" : "Black";
    
    switch (gameOverReason) {
      case 'checkmate':
        return `Checkmate! ${winnerText} wins by checkmate!`;
      case 'timeout':
        return `Time's up! ${winnerText} wins by timeout!`;
      case 'forfeit':
        return `${winnerText} wins by forfeit!`;
      default:
        return "Game Over!";
    }
  };

  const getModalTitle = () => {
    if (!gameOverReason) return "Game Over";
    
    switch (gameOverReason) {
      case 'checkmate':
        return "Checkmate!";
      case 'timeout':
        return "Time's Up!";
      case 'forfeit':
        return "Game Forfeited";
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
          <Text style={styles.modalTitle}>{getModalTitle()}</Text>
          <Text style={styles.modalMessage}>{getGameOverMessage()}</Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.newGameButton]}
              onPress={onNewGame}
            >
              <Text style={styles.buttonText}>New Game</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.menuButton]}
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
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  newGameButton: {
    backgroundColor: '#4CAF50',  // Vert
  },
  menuButton: {
    backgroundColor: '#757575',  // Gris
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameOverModal;