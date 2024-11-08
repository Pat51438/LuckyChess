import React, { useState } from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity } from 'react-native';
import Square from './Square';
import Button from './Button';
import { PlayerColor, Position, PieceType } from '../types/Chess';
import { ChessGameState } from '../gameLogic/GameState';

const Board: React.FC = () => {
  const [gameEngine] = useState(new ChessGameState());
  const [, setUpdateTrigger] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const forceUpdate = () => {
    console.log("forceUpdate called");
    setUpdateTrigger(prev => prev + 1);
  };

  const handleNewGame = () => {
    console.log("handleNewGame called");
    setShowConfirmDialog(true);
  };

  const confirmNewGame = () => {
    console.log("Starting game reset");
    gameEngine.resetGame();
    console.log("Game reset complete");
    forceUpdate();
    setShowConfirmDialog(false);
    console.log("Force update called");
  };

  const handleSquarePress = (position: Position) => {
    const state = gameEngine.getState();
    if (state.isCheckmate) return;

    if (state.selectedPiece) {
      const moveSuccessful = gameEngine.movePiece(state.selectedPiece, position);
      if (moveSuccessful) {
        // Check if a pawn has reached the last rank
        const piece = state.board[position.row][position.col].piece;
        if (piece && piece.type === PieceType.PAWN) {
          // Promotion for white (rank 0)
          if (piece.color === PlayerColor.WHITE && position.row === 0) {
            // Update pawn to queen directly
            state.board[position.row][position.col].piece = {
              type: PieceType.QUEEN,
              color: piece.color
            };
            forceUpdate();
          }
          // Promotion for black (rank 7)
          else if (piece.color === PlayerColor.BLACK && position.row === 7) {
            // Update pawn to queen directly
            state.board[position.row][position.col].piece = {
              type: PieceType.QUEEN,
              color: piece.color
            };
            forceUpdate();
          }
        }
      } else {
        gameEngine.selectPiece(position);
      }
    } else {
      gameEngine.selectPiece(position);
    }
    
    forceUpdate();
  };

  const state = gameEngine.getState();

  return (
    <View style={styles.container}>
      <Modal
        visible={showConfirmDialog}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Game</Text>
            <Text style={styles.modalText}>
              Do you really want to start a new game?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmDialog(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmNewGame}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.headerContainer}>
        <View style={styles.buttonContainer}>
          <Button 
            onNewGame={() => {
              console.log("New game button pressed");
              handleNewGame();
            }}
            variant="primary"
            size="medium"
          />
        </View>
      </View>

      {state.isInCheck && (
        <View style={[styles.checkIndicator, state.isCheckmate && styles.checkmateIndicator]}>
          <Text style={styles.checkText}>
            {state.isCheckmate 
              ? `Checkmate! ${state.isInCheck === PlayerColor.WHITE ? "Black" : "White"} wins!`
              : `${state.isInCheck === PlayerColor.WHITE ? "White" : "Black"} is in check!`}
          </Text>
        </View>
      )}

      <View style={styles.board}>
        {state.board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((square, colIndex) => {
              const position = { row: rowIndex, col: colIndex };
              const isValidMove = state.validMoves.some(
                move => move.row === rowIndex && move.col === colIndex
              );
              const isInvalidMove = state.blockedMoves.some(
                move => move.row === rowIndex && move.col === colIndex
              );
              
              return (
                <Square
                  key={colIndex}
                  dark={(rowIndex + colIndex) % 2 === 1}
                  piece={square.piece}
                  position={position}
                  onPress={handleSquarePress}
                  selected={
                    state.selectedPiece?.row === rowIndex && 
                    state.selectedPiece?.col === colIndex
                  }
                  isValidMove={isValidMove}
                  isInvalidMove={isInvalidMove}
                />
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.turnIndicator}>
        {`${state.currentTurn === PlayerColor.WHITE ? "White" : "Black"}'s turn`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    width: '80%',
    minWidth: 200,
    maxWidth: 300,
  },
  board: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#666',
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  checkIndicator: {
    width: '80%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  checkmateIndicator: {
    backgroundColor: '#990000',
  },
  checkText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  turnIndicator: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Board;