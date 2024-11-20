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
  // ... tous les styles restent identiques ...
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

  const getCastlingPartners = (position: Position): Position[] => {
    const state = gameEngine.getState();
    const piece = state.board[position.row][position.col].piece;
    if (!piece || piece.hasMoved) return [];
  
    const row = piece.color === PlayerColor.WHITE ? 7 : 0;
    const castlingPartners: Position[] = [];
  
    // Vérifie si c'est un roi ou une tour qui est sélectionné
    if (piece.type === PieceType.KING && position.col === 4) {
      // Vérifie la tour côté roi (petit roque)
      const kingRook = state.board[row][7].piece;
      if (kingRook && kingRook.type === PieceType.ROOK && !kingRook.hasMoved &&
          !state.board[row][5].piece && !state.board[row][6].piece) {
        castlingPartners.push({ row, col: 7 });
      }
  
      // Vérifie la tour côté reine (grand roque)
      const queenRook = state.board[row][0].piece;
      if (queenRook && queenRook.type === PieceType.ROOK && !queenRook.hasMoved &&
          !state.board[row][1].piece && !state.board[row][2].piece && !state.board[row][3].piece) {
        castlingPartners.push({ row, col: 0 });
      }
    } 
    // Ajoute cette partie pour gérer la sélection de la tour
    else if (piece.type === PieceType.ROOK && (position.col === 0 || position.col === 7)) {
      const king = state.board[row][4].piece;
      if (king && king.type === PieceType.KING && !king.hasMoved) {
        if (position.col === 7 && !state.board[row][5].piece && !state.board[row][6].piece) {
          castlingPartners.push({ row, col: 4 });
        } else if (position.col === 0 && !state.board[row][1].piece && 
                  !state.board[row][2].piece && !state.board[row][3].piece) {
          castlingPartners.push({ row, col: 4 });
        }
      }
    }
  
    return castlingPartners;
  };

  const handleSquarePress = useCallback(
    (position: Position) => {
      const state = gameEngine.getState();
      if (state.isCheckmate || gameOver || timeoutWinner) return;
  
      const targetSquare = state.board[position.row][position.col];
      const targetPiece = targetSquare.piece;
  
      if (state.selectedPiece) {
        const selectedPiece = state.board[state.selectedPiece.row][state.selectedPiece.col].piece;
        
        // Vérifie si on clique sur un partenaire de roque
        if (selectedPiece && 
            (selectedPiece.type === PieceType.KING || selectedPiece.type === PieceType.ROOK)) {
          const castlingPartners = getCastlingPartners(state.selectedPiece);
          const isCastlingPartner = castlingPartners.some(
            partner => partner.row === position.row && partner.col === position.col
          );
  
          if (isCastlingPartner) {
            const row = selectedPiece.color === PlayerColor.WHITE ? 7 : 0;
            let rookPos, kingPos, newKingCol, newRookCol;
  
            // Détermine les positions selon la pièce sélectionnée
            if (selectedPiece.type === PieceType.KING) {
              kingPos = state.selectedPiece;
              rookPos = position;
            } else {
              rookPos = state.selectedPiece;
              kingPos = position;
            }
  
            // Détermine s'il s'agit d'un petit ou grand roque
            const isKingSide = rookPos.col === 7;
            newKingCol = isKingSide ? 6 : 2;
            newRookCol = isKingSide ? 5 : 3;
  
            // Effectue le roque manuellement
            const king = state.board[kingPos.row][kingPos.col].piece;
            const rook = state.board[rookPos.row][rookPos.col].piece;
  
            if (king && rook) {
              // Déplace le roi et la tour
              gameEngine.getState().board[row][newKingCol].piece = { 
                ...king, 
                hasMoved: true 
              };
              gameEngine.getState().board[row][newRookCol].piece = { 
                ...rook, 
                hasMoved: true 
              };
              
              // Vide les positions initiales
              gameEngine.getState().board[kingPos.row][kingPos.col].piece = null;
              gameEngine.getState().board[rookPos.row][rookPos.col].piece = null;
  
              // Change le tour
              gameEngine.getState().currentTurn = 
                state.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
            }
  
            forceUpdate();
            return;
          }
        }
  

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

        const isEnPassantCapture = 
          movingPiece?.type === PieceType.PAWN && 
          state.lastMove?.piece.type === PieceType.PAWN &&
          Math.abs(position.col - state.selectedPiece.col) === 1 && 
          !targetPiece;

        const moveSuccessful = gameEngine.movePiece(state.selectedPiece, position);

        if (moveSuccessful) {
          if (targetPiece && movingPiece && targetPiece.color !== movingPiece.color) {
            const setCapturedPieces =
              movingPiece.color === PlayerColor.WHITE
                ? setCapturedByWhite
                : setCapturedByBlack;
            setCapturedPieces((prev) => [...prev, { ...targetPiece }]);
          }
          else if (isEnPassantCapture && movingPiece && state.lastMove) {
            const capturedPawn = {
              type: PieceType.PAWN,
              color: state.lastMove.piece.color,
              hasMoved: true
            };
            const setCapturedPieces =
              movingPiece.color === PlayerColor.WHITE
                ? setCapturedByWhite
                : setCapturedByBlack;
            setCapturedPieces((prev) => [...prev, capturedPawn]);
          }

          const newState = gameEngine.getState();
          if (newState.isCheckmate) {
            const winner = newState.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
            setCheckmateWinner(winner);
            setGameEndReason('checkmate');
            setGameOver(true);
          }

          setCurrentPlayer(newState.currentTurn);
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

                      const isCastlingPartner = state.selectedPiece ? 
                      getCastlingPartners(state.selectedPiece).some(
                        partner => partner.row === rowIndex && partner.col === colIndex
                      ) : false;

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
                        isCastlingPartner={isCastlingPartner}
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