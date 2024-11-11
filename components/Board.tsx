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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  mainContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'center',
  },
  boardContainer: {
    width: BOARD_SIZE,
    aspectRatio: 1,
    alignSelf: 'center',
  },
  capturedPiecesArea: {
    width: BOARD_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    marginVertical: 5,
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
  checkIndicator: {
    width: '100%',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ff4444',
    borderRadius: 8,
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
    alignItems: 'center',
  },
  turnIndicatorText: {
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
    columnGap: 10,
  },
  modalButton: {
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
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

const Board: React.FC = () => {
  const [gameEngine] = useState(new ChessGameState());
  const [, setUpdateTrigger] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]);
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [timeoutWinner, setTimeoutWinner] = useState<PlayerColor | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>(PlayerColor.WHITE);
  const [timerKey, setTimerKey] = useState(0);

  const forceUpdate = useCallback(() => {
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  const handleTimeOut = (color: PlayerColor) => {
    setGameOver(true);
    const winner = color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    setTimeoutWinner(winner);
    gameEngine.resetGame();
  };

  const handleNewGame = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const confirmNewGame = useCallback(() => {
    gameEngine.resetGame();
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
    setTimeoutWinner(null);
    setGameOver(false);
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

        if (
          moveSuccessful &&
          targetPiece &&
          movingPiece &&
          targetPiece.color !== movingPiece.color
        ) {
          const setCapturedPieces =
            movingPiece.color === PlayerColor.WHITE
              ? setCapturedByWhite
              : setCapturedByBlack;
          setCapturedPieces((prev) => [...prev, { ...targetPiece }]);

          const piece = state.board[position.row][position.col].piece;
          if (piece?.type === PieceType.PAWN) {
            if (
              (piece.color === PlayerColor.WHITE && position.row === 0) ||
              (piece.color === PlayerColor.BLACK && position.row === 7)
            ) {
              state.board[position.row][position.col].piece = {
                type: PieceType.QUEEN,
                color: piece.color,
              };
            }
          }
        }
      } else {
        if (targetPiece && targetPiece.color === state.currentTurn) {
          gameEngine.selectPiece(position);
        }
      }

      forceUpdate();
    },
    [gameEngine, forceUpdate, gameOver, timeoutWinner]
  );

  const state = gameEngine.getState();

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.buttonContainer}>
            <Button onNewGame={handleNewGame} variant="primary" size="medium" />
          </View>
        </View>

        <View style={styles.gameContainer}>
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

          <View style={styles.boardContainer}>
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
                      (move) => move.row === rowIndex && move.col === colIndex
                    );
                    const isInvalidMove = state.blockedMoves.some(
                      (move) => move.row === rowIndex && move.col === colIndex
                    );

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
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

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
            {timeoutWinner 
              ? `Game Over! ${timeoutWinner === PlayerColor.WHITE ? "White" : "Black"} wins by timeout!`
              : `${state.currentTurn === PlayerColor.WHITE ? "White" : "Black"}'s turn`}
          </Text>
        </View>
      </View>

      <Modal
        visible={gameOver || timeoutWinner !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Over!</Text>
            <Text style={styles.modalText}>
              {timeoutWinner 
                ? `${timeoutWinner === PlayerColor.WHITE ? "White" : "Black"} wins by timeout!` 
                : "Game Over!"}
            </Text>
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

      <Modal
        visible={showConfirmDialog}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Game</Text>
            <Text style={styles.modalText}>Do you really want to start a new game?</Text>
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