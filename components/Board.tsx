import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Dimensions } from "react-native";
import Square from "./Square";
import HamburgerMenu from "./HamburgerMunu";
import CapturedPiecesDisplay from "./CapturedPiece";
import DiceRoller from "./DiceRoller";
import CoinTosser from "./CoinTosser";
import GameOverModal from "./GameOverModal";
import PurplePatternBackground from './Background';
import UserImg from './UserComponent';
import { PlayerColor, Position, PieceType, Piece, GameType, GameEndReason } from "../types/Chess";
import { CoinTossChessState } from "../gameLogic/CoinTossGameState";
import { DiceChessState } from "../gameLogic/DiceGameState";
import { DiceRoll } from "../types/DiceGame";
import { CoinToss } from "../types/CoinTossGame";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BOARD_SIZE = Math.min(screenWidth * 0.95, screenHeight * 0.6);

interface BoardProps {
  gameType: GameType;
  onReturnToMenu: () => void;
}

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
  const [castlingPartner, setCastlingPartner] = useState<Position | null>(null);
  const [castlingInitiator, setCastlingInitiator] = useState<Position | null>(null);
  const [hasWhiteMoved, setHasWhiteMoved] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [lastPlayedColor, setLastPlayedColor] = useState<PlayerColor | null>(null);

  const handleTimeUpdate = useCallback((time: number, color: PlayerColor) => {
    if (color === PlayerColor.WHITE) {
      setWhiteTime(time);
    } else {
      setBlackTime(time);
    }
  }, []);

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
      diceEngine.rollDice(result.value);
      const newState = diceEngine.getState();
      setCurrentPlayer(newState.currentTurn);
      forceUpdate();
    }
  }, [gameEngine, gameType, forceUpdate]);

  const handleCoinToss = useCallback((result: CoinToss) => {
    if (gameType === 'coinToss') {
        const coinEngine = gameEngine as CoinTossChessState;
        const tossResult = coinEngine.tossCoin(result.result);
        const newState = coinEngine.getState();

        // Update the current player and trigger UI updates
        setCurrentPlayer(newState.currentTurn);
        forceUpdate();
    }
}, [gameEngine, gameType, forceUpdate]);



  const confirmNewGame = useCallback(() => {
    gameEngine.resetGame();
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setTimeoutWinner(null);
    setCheckmateWinner(null);
    setGameOver(false);
    setGameEndReason(null);
    setCurrentPlayer(PlayerColor.WHITE);
    setCastlingPartner(null);
    setCastlingInitiator(null);
    setHasWhiteMoved(false);
    setWhiteTime(600);
    setBlackTime(600);
    setGameKey(prev => prev + 1);
    setShowConfirmDialog(false);
    forceUpdate();
  }, [gameEngine, forceUpdate]);

  const handleSquarePress = useCallback(
    (position: Position) => {
      const state = gameEngine.getState();
      
      if (state.isCheckmate || gameOver || timeoutWinner || 
          (gameType === 'coinToss' && state.waitingForCoinToss) ||
          (gameType === 'dice' && (state.waitingForDiceRoll || state.remainingMoves <= 0))) {
        return;
      }
 
      const targetSquare = state.board[position.row][position.col];
      const targetPiece = targetSquare.piece;
 
      if (state.selectedPiece) {
        // Handle deselection
        if (state.selectedPiece.row === position.row && state.selectedPiece.col === position.col) {
          gameEngine.unselectPiece();
          setCastlingPartner(null);
          setCastlingInitiator(null);
          forceUpdate();
          return;
        }
 
        // Handle castling
        if (castlingPartner && 
            position.row === castlingPartner.row && 
            position.col === castlingPartner.col &&
            castlingInitiator) {
          const selectedPiece = state.board[castlingInitiator.row][castlingInitiator.col].piece;
          const [kingPos, rookPos] = selectedPiece?.type === PieceType.KING 
            ? [castlingInitiator, position]
            : [position, castlingInitiator];
 
          if (gameEngine.performCastling(kingPos, rookPos)) {
            const newState = gameEngine.getState();
            setLastPlayedColor(currentPlayer);
            if (newState.isCheckmate) {
              setGameOver(true);
              setGameEndReason('checkmate');
              setCheckmateWinner(newState.currentTurn);
            }
            setCurrentPlayer(newState.currentTurn);
            setCastlingPartner(null);
            setCastlingInitiator(null);
            forceUpdate();
            return;
          }
        }
 
        // Handle regular move
        if (gameEngine.movePiece(state.selectedPiece, position)) {
          setLastPlayedColor(currentPlayer);
          
          if (!hasWhiteMoved && state.currentTurn === PlayerColor.WHITE) {
            setHasWhiteMoved(true);
          }
 
          if (targetPiece && state.selectedPiece) {
            const capturedList = targetPiece.color === PlayerColor.BLACK ? setCapturedByWhite : setCapturedByBlack;
            capturedList(prev => [...prev, { ...targetPiece }]);
          }
          
          const newState = gameEngine.getState();
          setCapturedByWhite(newState.capturedByWhite);
          setCapturedByBlack(newState.capturedByBlack);
          
          if (newState.isCheckmate) {
            setGameOver(true);
            setGameEndReason('checkmate');
            setCheckmateWinner(newState.currentTurn);
          }
          
          setCurrentPlayer(newState.currentTurn);
          setCastlingPartner(null);
          setCastlingInitiator(null);
          forceUpdate();
          return;
        }
      }
      
      // Handle piece selection
      if (targetPiece && targetPiece.color === state.currentTurn) {
        gameEngine.selectPiece(position);
        const castlingPartners = gameEngine.getCastlingPartners(position);
        const hasPartner = castlingPartners.length > 0;
        setCastlingPartner(hasPartner ? castlingPartners[0] : null);
        setCastlingInitiator(hasPartner ? position : null);
        forceUpdate();
      }
    },
    [gameEngine, gameOver, timeoutWinner, gameType, castlingPartner, castlingInitiator, 
     hasWhiteMoved, currentPlayer, forceUpdate]
 );

  const state = gameEngine.getState();
  
  return (
    <View style={styles.container}>
      <PurplePatternBackground>
        <View style={styles.mainContainer}>
          <HamburgerMenu 
            onNewGame={handleNewGame}
            onReturnToMenu={onReturnToMenu}
          />
    
          <View style={styles.capturedPiecesTop}>
            <CapturedPiecesDisplay 
              capturedPieces={capturedByBlack} 
              color={PlayerColor.BLACK} 
            />
          </View>
    
          <View style={styles.gameContainer}>
            <View style={styles.controlsContainer}>
              <View style={styles.topControls}>
                <View style={styles.userImageContainer}>
                  <UserImg color={PlayerColor.BLACK} size={60} />
                </View>
                <View style={styles.controlComponent}>
                  {gameType === 'dice' && (
                    <DiceRoller
                      onDiceRoll={handleDiceRoll}
                      isWaitingForRoll={state.waitingForDiceRoll}
                      currentPlayer={currentPlayer}
                      remainingMoves={state.remainingMoves}
                      gameKey={gameKey}
                      isActive={state.currentTurn === PlayerColor.BLACK && !state.isCheckmate && !timeoutWinner && !gameOver}
                      onTimeOut={handleTimeOut}
                      playerColor={PlayerColor.BLACK}
                      instructionText="Black's Turn to Roll"
                      currentTime={blackTime}
                      onTimeUpdate={(time) => handleTimeUpdate(time, PlayerColor.BLACK)}
                    />
                  )}
                  {gameType === 'coinToss' && (
                    <CoinTosser
                      onCoinToss={handleCoinToss}
                      isWaitingForToss={state.waitingForCoinToss}
                      currentPlayer={currentPlayer}
                      gameKey={gameKey}
                      isActive={state.currentTurn === PlayerColor.BLACK && !state.isCheckmate && !timeoutWinner && !gameOver}
                      onTimeOut={handleTimeOut}
                      playerColor={PlayerColor.BLACK}
                      instructionText="Black's Turn to Toss"
                      currentTime={blackTime}
                      onTimeUpdate={(time) => handleTimeUpdate(time, PlayerColor.BLACK)}
                      initialTurnsRemaining={state.initialTurnsRemaining}
                      canTossCoin={state.canTossCoin}
                    />
                  )}
                </View>
              </View>
    
              <View style={styles.boardSection}>
                <View style={styles.board}>
                  {state.board.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                      {row.map((square, colIndex) => {
                        const position = { row: rowIndex, col: colIndex };
                        const piece = square.piece;
                        const isKingInCheck = 
                          piece?.type === PieceType.KING &&
                          piece?.color === state.currentTurn &&
                          state.isInCheck != null &&
                          state.isInCheck === piece.color;
      
                        const isCastlingPartner = castlingPartner &&
                          rowIndex === castlingPartner.row &&
                          colIndex === castlingPartner.col;
      
                        return (
                          <Square
                            key={`${rowIndex}-${colIndex}`}
                            dark={(rowIndex + colIndex) % 2 === 1}
                            piece={piece}
                            position={position}
                            onPress={handleSquarePress}
                            selected={state.selectedPiece?.row === rowIndex && state.selectedPiece?.col === colIndex}
                            isValidMove={state.validMoves.some(move => move.row === rowIndex && move.col === colIndex)}
                            isKingInCheck={isKingInCheck}
                            isCastlingPartner={isCastlingPartner}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
    
              <View style={styles.bottomControls}>
                <View style={styles.userImageContainer}>
                  <UserImg color={PlayerColor.WHITE} size={60} />
                </View>
                <View style={styles.controlComponent}>
                  {gameType === 'dice' && (
                    <DiceRoller
                      onDiceRoll={handleDiceRoll}
                      isWaitingForRoll={state.waitingForDiceRoll}
                      currentPlayer={currentPlayer}
                      remainingMoves={state.remainingMoves}
                      gameKey={gameKey}
                      isActive={state.currentTurn === PlayerColor.WHITE && !state.isCheckmate && !timeoutWinner && !gameOver}
                      onTimeOut={handleTimeOut}
                      playerColor={PlayerColor.WHITE}
                      instructionText="White's Turn to Roll"
                      currentTime={whiteTime}
                      onTimeUpdate={(time) => handleTimeUpdate(time, PlayerColor.WHITE)}
                    />
                  )}
                  {gameType === 'coinToss' && (
                    <CoinTosser
                      onCoinToss={handleCoinToss}
                      isWaitingForToss={state.waitingForCoinToss}
                      currentPlayer={currentPlayer}
                      gameKey={gameKey}
                      isActive={state.currentTurn === PlayerColor.WHITE && !state.isCheckmate &&
                        !timeoutWinner && !gameOver}
                      onTimeOut={handleTimeOut}
                      playerColor={PlayerColor.WHITE}
                      instructionText="White's Turn to Toss"
                      currentTime={whiteTime}
                      onTimeUpdate={(time) => handleTimeUpdate(time, PlayerColor.WHITE)}
                      initialTurnsRemaining={state.initialTurnsRemaining}
                      canTossCoin={state.canTossCoin}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
    
          <View style={styles.capturedPiecesBottom}>
            <CapturedPiecesDisplay 
              capturedPieces={capturedByWhite} 
              color={PlayerColor.WHITE} 
            />
          </View>
  
          <GameOverModal
            isVisible={gameOver}
            winner={timeoutWinner || checkmateWinner}
            gameOverReason={gameEndReason}
            onNewGame={confirmNewGame}
            onReturnToMenu={onReturnToMenu}
          />
        </View>
      </PurplePatternBackground>
  
      <Modal
        visible={showConfirmDialog}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start New Game?</Text>
            <Text style={styles.modalText}>Current game progress will be lost.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmNewGame}
              >
                <Text style={styles.buttonText}>Start New Game</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleForfeit}
              >
                <Text style={styles.buttonText}>Forfeit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  mainContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 15,
  },
  capturedPiecesTop: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  capturedPiecesBottom: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  topControls: {
    marginBottom: 60,
    width: '100%',
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  bottomControls: {
    marginTop: 30,
    width: '100%',
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  userImageContainer: {
    position: 'absolute',
    left: 10,
  },
  controlComponent: {
    position: 'absolute',
    left: 60,
  },
  boardSection: {
    width: BOARD_SIZE,
    aspectRatio: 1,
    marginVertical: 10,
  },
  board: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#e0e0e0',
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
    backgroundColor: '#4CAF50',
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