import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Dimensions } from "react-native";
import Square from "./Square";
import Button from "./Button";
import Timer from "./Timer";
import CapturedPiecesDisplay from "./CapturedPiece";
import { PlayerColor, Position, PieceType, Piece } from "../types/Chess";
import { ChessGameState } from "../gameLogic/GameState";

const INITIAL_TIME = 600; // 10 minutes in seconds

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BOARD_SIZE = Math.min(screenWidth * 0.95, screenHeight * 0.6);

type GameEndReason = 'checkmate' | 'timeout' | 'forfeit' | null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
  },
  mainContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonContainer: {
    width: '80%',
    minWidth: 200,
    maxWidth: 300,
  },
  gameContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  boardSection: {
    width: BOARD_SIZE,
    aspectRatio: 1,
    marginVertical: 10,
  },
  capturedPiecesArea: {
    width: BOARD_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  upperArea: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  lowerArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  board: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#666',
    backgroundColor: 'white',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  turnIndicator: {
    marginTop: 15,
    alignItems: 'center',
  },
  turnIndicatorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
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
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 24,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    columnGap: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const Board: React.FC = () => {
    const [gameEngine] = useState(new ChessGameState());
    const [, setUpdateTrigger] = useState(0);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]);
    const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]);
    const [timeoutWinner, setTimeoutWinner] = useState<PlayerColor | null>(null);
    const [checkmateWinner, setCheckmateWinner] = useState<PlayerColor | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [gameEndReason, setGameEndReason] = useState<GameEndReason>(null);
    const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>(PlayerColor.WHITE);
    const [timerKey, setTimerKey] = useState(0);
  
    const forceUpdate = useCallback(() => {
      setUpdateTrigger((prev) => prev + 1);
    }, []);
  
    const handleTimeOut = useCallback((color: PlayerColor) => {
      setGameOver(true);
      const winner = color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      setTimeoutWinner(winner);
      setGameEndReason('timeout');
    }, []);
  
    const handleNewGame = useCallback(() => {
      setShowConfirmDialog(true);
    }, []);
  
    const handleForfeit = useCallback(() => {
      const currentState = gameEngine.getState();
      setGameOver(true);
      setGameEndReason('forfeit');
      const winner = currentState.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      setTimeoutWinner(winner);
      setShowConfirmDialog(false);
    }, [gameEngine]);
  
    const confirmNewGame = useCallback(() => {
      gameEngine.resetGame();
      setCapturedByWhite([]);
      setCapturedByBlack([]);
      setTimeoutWinner(null);
      setCheckmateWinner(null);
      setGameOver(false);
      setGameEndReason(null);
      setCurrentPlayer(PlayerColor.WHITE);
      setTimerKey((prev) => prev + 1);
      forceUpdate();
      setShowConfirmDialog(false);
    }, [gameEngine, forceUpdate]);
  
    const handleSquarePress = useCallback(
      (position: Position) => {
        const state = gameEngine.getState();
        if (state.isCheckmate || gameOver || timeoutWinner) return;
  
        const targetSquare = state.board[position.row][position.col];
        const targetPiece = targetSquare.piece;
  
        if (state.selectedPiece) {
          if (
            state.selectedPiece.row === position.row &&
            state.selectedPiece.col === position.col
          ) {
            gameEngine.selectPiece(position);
            forceUpdate();
            return;
          }
  
          if (targetPiece && targetPiece.color === state.currentTurn) {
            gameEngine.selectPiece(position);
            forceUpdate();
            return;
          }
  
          const movingPiece =
            state.board[state.selectedPiece.row][state.selectedPiece.col].piece;
          const moveSuccessful = gameEngine.movePiece(state.selectedPiece, position);
  
          // Après avoir effectué le mouvement, vérifions l'état du jeu
          const newState = gameEngine.getState();
  
          if (moveSuccessful) {
            // Gestion des pièces capturées
            if (targetPiece && movingPiece && targetPiece.color !== movingPiece.color) {
              const setCapturedPieces =
                movingPiece.color === PlayerColor.WHITE
                  ? setCapturedByWhite
                  : setCapturedByBlack;
              setCapturedPieces((prev) => [...prev, { ...targetPiece }]);
            }
  
            // Promotion du pion
            const piece = newState.board[position.row][position.col].piece;
            if (piece?.type === PieceType.PAWN) {
              if (
                (piece.color === PlayerColor.WHITE && position.row === 0) ||
                (piece.color === PlayerColor.BLACK && position.row === 7)
              ) {
                newState.board[position.row][position.col].piece = {
                  type: PieceType.QUEEN,
                  color: piece.color,
                };
              }
            }
  
            // Vérification de l'échec et mat
            if (newState.isCheckmate) {
              const winner = newState.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
              setCheckmateWinner(winner);
              setGameEndReason('checkmate');
              setGameOver(true);
            }
          }
        } else {
          if (targetPiece && targetPiece.color === state.currentTurn) {
            gameEngine.selectPiece(position);
          }
        }
  
        forceUpdate();
      },
      [gameEngine, forceUpdate, gameOver, timeoutWinner, setCapturedByWhite, setCapturedByBlack]
    );
  
    const state = gameEngine.getState();
  
    const getGameOverMessage = () => {
      let winner;
      if (gameEndReason === 'checkmate') {
        winner = checkmateWinner;
      } else if (gameEndReason === 'timeout') {
        winner = timeoutWinner;
      } else {
        winner = timeoutWinner || checkmateWinner;
      }
      
      const winnerText = winner === PlayerColor.WHITE ? "White" : "Black";
      
      switch (gameEndReason) {
        case 'checkmate':
          return `Checkmate! ${winnerText} has won the game!`;
        case 'timeout':
          return `Time's up! ${winnerText} wins by timeout!`;
        case 'forfeit':
          return `${winnerText} wins by forfeit!`;
        default:
          return "Game Over!";
      }
    };
  
    const getModalTitle = () => {
      switch (gameEndReason) {
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
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.buttonContainer}>
              <Button onNewGame={handleNewGame} variant="primary" size="medium" />
            </View>
          </View>
  
          <View style={styles.gameContainer}>
            <View style={styles.upperArea}>
              <View style={styles.capturedPiecesArea}>
                <Timer
                  key={`black-${timerKey}`}
                  color={PlayerColor.BLACK}
                  isActive={state.currentTurn === PlayerColor.BLACK && !state.isCheckmate && !timeoutWinner && !gameOver}
                  initialTime={INITIAL_TIME}
                  onTimeOut={handleTimeOut}
                />
                <CapturedPiecesDisplay
                  capturedPieces={capturedByBlack}
                  color={PlayerColor.BLACK}
                />
              </View>
            </View>
  
            <View style={styles.boardSection}>
              <View style={styles.board}>
                {state.board.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((square, colIndex) => {
                      const position = { row: rowIndex, col: colIndex };
                      const isValidMove = state.validMoves.some(
                        (move) => move.row === rowIndex && move.col === colIndex
                      );
                      const isInvalidMove = state.blockedMoves.some(
                        (move) => move.row === rowIndex && move.col === colIndex
                      );
                      const isKingInCheck = !!(state.isInCheck && 
                        square.piece?.type === PieceType.KING && 
                        square.piece?.color === state.isInCheck);
  
                      return (
                        <Square
                          key={colIndex}
                          dark={(rowIndex + colIndex) % 2 === 1}
                          piece={square.piece}
                          position={position}
                          onPress={handleSquarePress}
                          selected={state.selectedPiece?.row === rowIndex && state.selectedPiece?.col === colIndex}
                          isValidMove={isValidMove}
                          isInvalidMove={isInvalidMove}
                          isInCheck={isKingInCheck}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
  
            <View style={styles.lowerArea}>
              <View style={styles.capturedPiecesArea}>
                <Timer
                  key={`white-${timerKey}`}
                  color={PlayerColor.WHITE}
                  isActive={state.currentTurn === PlayerColor.WHITE && !state.isCheckmate && !timeoutWinner && !gameOver}
                  initialTime={INITIAL_TIME}
                  onTimeOut={handleTimeOut}
                />
                <CapturedPiecesDisplay
                  capturedPieces={capturedByWhite}
                  color={PlayerColor.WHITE}
                />
              </View>
            </View>
  
            <View style={styles.turnIndicator}>
              <Text style={styles.turnIndicatorText}>
                {gameOver 
                  ? getGameOverMessage()
                  : `${state.currentTurn === PlayerColor.WHITE ? "White" : "Black"}'s turn`}
              </Text>
            </View>
          </View>
        </View>
  
        {/* Modal de fin de partie */}
        <Modal
          visible={gameOver || timeoutWinner !== null || checkmateWinner !== null}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{getModalTitle()}</Text>
              <Text style={styles.modalText}>{getGameOverMessage()}</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmNewGame}
                >
                  <Text style={styles.buttonText}>New Game</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
  
        {/* Modal de confirmation nouvelle partie */}
        <Modal
          visible={showConfirmDialog && !gameOver}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Game</Text>
              <Text style={styles.modalText}>Do you want to start a new game?</Text>
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
      </View>
    );
  };
  
  export default Board;