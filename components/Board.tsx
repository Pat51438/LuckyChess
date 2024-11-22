import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Dimensions } from "react-native";
import Square from "./Square";
import Button from "./Button";
import Timer from "./Timer";
import CapturedPiecesDisplay from "./CapturedPiece";
import CoinTosser from "./CoinTosser";
import DiceRoller from "./DiceRoller";
import GameInfo from "./GameInfo";
import { PlayerColor, Position, PieceType, Piece, GameType } from "../types/Chess";
import { CoinTossChessState } from "../gameLogic/CoinTossGameState";
import { DiceChessState } from "../gameLogic/DiceGameState";
import { DiceRoll } from "../types/DiceGame";
import { CoinToss } from "../types/CoinTossGame";

const INITIAL_TIME = 600; // 10 minutes in seconds

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BOARD_SIZE = Math.min(screenWidth * 0.95, screenHeight * 0.6);

interface BoardProps {
  gameType: GameType;
  onReturnToMenu: () => void;
}

type GameEndReason = 'checkmate' | 'timeout' | 'forfeit' | null;

const Board: React.FC<BoardProps> = ({ gameType, onReturnToMenu }) => {
  const [gameEngine] = useState(() => 
    gameType === 'coinToss' ? new CoinTossChessState() : new DiceChessState()
  );
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]);
  const [timeoutWinner, setTimeoutWinner] = useState<PlayerColor | null>(null);
  const [checkmateWinner, setCheckmateWinner] = useState<PlayerColor | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameEndReason, setGameEndReason] = useState<GameEndReason>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>(PlayerColor.WHITE);
  const [timerKey, setTimerKey] = useState(0);
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRoll | null>(null);
  const [lastCoinToss, setLastCoinToss] = useState<CoinToss | null>(null);
  const [lastMove, setLastMove] = useState<{
    piece: string;
    from: string;
    to: string;
  } | null>(null);

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

  const handleDiceRoll = useCallback((result: DiceRoll) => {
    if (gameType === 'dice') {
        const diceEngine = gameEngine as DiceChessState;
        // Pass the received roll result directly
        const diceResult = diceEngine.rollDice(result.value);
        const newState = diceEngine.getState();
        setCurrentPlayer(newState.currentTurn);
        forceUpdate();
    }
}, [gameEngine, setCurrentPlayer, forceUpdate]);

  const handleCoinToss = useCallback((result: CoinToss) => {
    if (gameType === 'coinToss') {
      const coinEngine = gameEngine as CoinTossChessState;
      const coinResult = coinEngine.tossCoin();
      const newState = coinEngine.getState();
      setCurrentPlayer(newState.currentTurn);
      forceUpdate();
    }
  }, [gameEngine, setCurrentPlayer, forceUpdate]);
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
    setLastDiceRoll(null);
    setLastCoinToss(null);
    setLastMove(null);
    forceUpdate();
    setShowConfirmDialog(false);
  }, [gameEngine, forceUpdate]);

  const getCastlingPartners = (position: Position): Position[] => {
    const state = gameEngine.getState();
    const piece = state.board[position.row][position.col].piece;
    if (!piece || piece.hasMoved) return [];
  
    const row = piece.color === PlayerColor.WHITE ? 7 : 0;
    const castlingPartners: Position[] = [];
  
    if (piece.type === PieceType.KING && position.col === 4) {
      const kingRook = state.board[row][7].piece;
      if (kingRook && kingRook.type === PieceType.ROOK && !kingRook.hasMoved &&
          !state.board[row][5].piece && !state.board[row][6].piece) {
        castlingPartners.push({ row, col: 7 });
      }
  
      const queenRook = state.board[row][0].piece;
      if (queenRook && queenRook.type === PieceType.ROOK && !queenRook.hasMoved &&
          !state.board[row][1].piece && !state.board[row][2].piece && !state.board[row][3].piece) {
        castlingPartners.push({ row, col: 0 });
      }
    } 
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
      
      // Prevent moves if game is over
      if (state.isCheckmate || gameOver || timeoutWinner) {
    
        return;
      }

      // Prevent moves if waiting for coin toss or dice roll
      if (gameType === 'coinToss' && state.waitingForCoinToss) {
        
        return;
      }
      if (gameType === 'dice' && (state.waitingForDiceRoll || state.remainingMoves <= 0)) {
      
        return;
      }

      const targetSquare = state.board[position.row][position.col];
      const targetPiece = targetSquare.piece;

      // Si une pièce est déjà sélectionnée
      if (state.selectedPiece) {

        
        // Clicking the same piece - deselect it
        if (state.selectedPiece.row === position.row && state.selectedPiece.col === position.col) {
        
          gameEngine.unselectPiece();
          forceUpdate();
          return;
        }

        // Try to move the selected piece
        const moveSuccessful = gameEngine.movePiece(state.selectedPiece, position);
    
        
        if (moveSuccessful) {
          // Handle captures
          if (targetPiece) {
            const selectedPiece = state.board[state.selectedPiece.row][state.selectedPiece.col].piece;
            if (selectedPiece) {
              const setCapturedPieces =
                selectedPiece.color === PlayerColor.WHITE
                  ? setCapturedByWhite
                  : setCapturedByBlack;
              setCapturedPieces(prev => [...prev, { ...targetPiece }]);
            }
          }
          setCurrentPlayer(gameEngine.getState().currentTurn);
          forceUpdate();
          return;
        }
        
        // If the move wasn't successful and we clicked another one of our pieces, select it instead
        if (targetPiece && targetPiece.color === state.currentTurn) {

          gameEngine.selectPiece(position);
          forceUpdate();
          return;
        }
      } else {
        // No piece is selected - try to select a piece
        if (targetPiece && targetPiece.color === state.currentTurn) {
       
          gameEngine.selectPiece(position);
          forceUpdate();
        }
      }
    },
    [gameEngine, gameOver, timeoutWinner, gameType, setCapturedByWhite, setCapturedByBlack, setCurrentPlayer, forceUpdate]
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
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={onReturnToMenu}
          >
            <Text style={styles.menuButtonText}>Return to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.gameContainer}>
        <View style={styles.topSection}>
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

          {gameType === 'coinToss' && (
            <View style={styles.gameControlsArea}>
              <CoinTosser
                onCoinToss={handleCoinToss}
                isWaitingForToss={state.waitingForCoinToss}
                currentPlayer={currentPlayer}
              />
            </View>
          )}
          
          {gameType === 'dice' && (
            <View style={styles.gameControlsArea}>
              <DiceRoller
                onDiceRoll={handleDiceRoll}
                isWaitingForRoll={state.waitingForDiceRoll}
                currentPlayer={currentPlayer}
                remainingMoves={state.remainingMoves}
              />
            </View>
          )}
        </View>

        <View style={styles.boardSection}>
          <View style={styles.board}>
            {state.board.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((square, colIndex) => {
                  const position = { row: rowIndex, col: colIndex };
                  const isSelected = 
                    state.selectedPiece?.row === rowIndex && 
                    state.selectedPiece?.col === colIndex;
                  const isValidMove = state.validMoves.some(
                    move => move.row === rowIndex && move.col === colIndex
                  );

                  return (
                    <Square
                      key={`${rowIndex}-${colIndex}`}
                      dark={(rowIndex + colIndex) % 2 === 1}
                      piece={square.piece}
                      position={position}
                      onPress={handleSquarePress}
                      selected={isSelected}
                      isValidMove={isValidMove}
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

    {/* Game Over Modal */}
    <Modal
      visible={gameOver}
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
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onReturnToMenu}
            >
              <Text style={styles.buttonText}>Return to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* New Game Confirmation Modal */}
    <Modal
      visible={showConfirmDialog && !gameOver}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Game</Text>
          <Text style={styles.modalText}>
            Do you want to forfeit the current game and start a new one?
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
              onPress={handleForfeit}
            >
              <Text style={styles.buttonText}>Forfeit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </View>
);}

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
    gap: 10,
  },
  menuButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  topSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  gameControlsArea: {
    width: 60,  // Adjusted for the coin tosser size
    alignItems: 'center',
    marginRight: 10,
  },
  upperArea: {
    flex: 1,
    marginRight: 10,
  },
  capturedPiecesArea: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  boardSection: {
    width: BOARD_SIZE,
    aspectRatio: 1,
    marginVertical: 10,
    alignSelf: 'center',
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
  lowerArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
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

export default Board;