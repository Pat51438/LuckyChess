import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Dimensions } from "react-native";
import Square from "./Square";
import Button from "./Button";
import Timer from "./Timer";
import CapturedPiecesDisplay from "./CapturedPiece";
import CoinTosser from "./CoinTosser";
import DiceRoller from "./DiceRoller";
import GameOverModal from "./GameOverModal";
import { PlayerColor, Position, PieceType, Piece, GameType, GameEndReason } from "../types/Chess";  // Ajout de GameEndReason ici
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
  const [castlingPartner, setCastlingPartner] = useState<Position | null>(null);
  const [castlingInitiator, setCastlingInitiator] = useState<Position | null>(null);
  const [hasWhiteMoved, setHasWhiteMoved] = useState(false);
  const [gameKey, setGameKey] = useState(0);

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
      const diceResult = diceEngine.rollDice(result.value);
      const newState = diceEngine.getState();
      setCurrentPlayer(newState.currentTurn);
      forceUpdate();
    }
  }, [gameEngine, setCurrentPlayer, forceUpdate, gameType]);

  const handleCoinToss = useCallback((result: CoinToss) => {
    if (gameType === 'coinToss') {
      const coinEngine = gameEngine as CoinTossChessState;
      const coinResult = coinEngine.tossCoin();
      const newState = coinEngine.getState();
      setCurrentPlayer(newState.currentTurn);
      forceUpdate();
    }
  }, [gameEngine, setCurrentPlayer, forceUpdate, gameType]);

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
    setCastlingPartner(null);
    setCastlingInitiator(null);
    setHasWhiteMoved(false);
    setGameKey(prev => prev + 1);
    forceUpdate();
    setShowConfirmDialog(false);
  }, [gameEngine, forceUpdate]);

  const handleSquarePress = useCallback(
    (position: Position) => {
      const state = gameEngine.getState();
      
      if (state.isCheckmate || gameOver || timeoutWinner) {
        return;
      }

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
        // Si on clique sur la même pièce, la désélectionner
        if (state.selectedPiece.row === position.row && state.selectedPiece.col === position.col) {
          gameEngine.unselectPiece();
          setCastlingPartner(null);
          setCastlingInitiator(null);
          forceUpdate();
          return;
        }

        // Si on clique sur un partenaire de roque valide
        if (castlingPartner && 
          position.row === castlingPartner.row && 
          position.col === castlingPartner.col &&
          castlingInitiator) {
          
          let kingPos: Position;
          let rookPos: Position;
          const selectedPiece = state.board[castlingInitiator.row][castlingInitiator.col].piece;
          
          // Détermine quelle pièce est le roi et quelle pièce est la tour
          if (selectedPiece?.type === PieceType.KING) {
            kingPos = castlingInitiator;
            rookPos = position; // La position cliquée est la tour
          } else {
            kingPos = position; // La position cliquée est le roi
            rookPos = castlingInitiator; // La position initiale est la tour
          }
        
          if (gameEngine instanceof DiceChessState) {
            const success = gameEngine.performCastling(kingPos, rookPos);
            
            if (success) {
              const newState = gameEngine.getState();
              if (newState.isCheckmate) {
                setGameOver(true);
                setGameEndReason('checkmate');
                setCheckmateWinner(newState.currentTurn);
              }
              setCurrentPlayer(newState.currentTurn);
            }
          }
          
          setCastlingPartner(null);
          setCastlingInitiator(null);
          forceUpdate();
          return;
        }
        // Tenter un mouvement normal
        const moveSuccessful = gameEngine.movePiece(state.selectedPiece, position);
        
        if (moveSuccessful) {
          // Si c'est le premier mouvement des blancs
          if (!hasWhiteMoved && state.currentTurn === PlayerColor.WHITE) {
            setHasWhiteMoved(true);
          }

          // Gérer la capture normale
          if (targetPiece) {
            if (state.selectedPiece) {
              // Si la pièce capturée est noire, elle va dans les captures blanches
              if (targetPiece.color === PlayerColor.BLACK) {
                setCapturedByWhite(prev => [...prev, { ...targetPiece }]);
              } else {
                // Si la pièce capturée est blanche, elle va dans les captures noires
                setCapturedByBlack(prev => [...prev, { ...targetPiece }]);
              }
            }
          }
          
          // Gérer la capture en passant
          const movingPiece = state.board[state.selectedPiece.row][state.selectedPiece.col].piece;
          if (movingPiece?.type === PieceType.PAWN && 
              state.selectedPiece && 
              Math.abs(position.col - state.selectedPiece.col) === 1 && 
              !targetPiece) {
            const capturedPawnRow = state.selectedPiece.row;
            const capturedPawn = state.board[capturedPawnRow][position.col].piece;
            
            if (capturedPawn) {
              // Même logique pour la capture en passant
              if (capturedPawn.color === PlayerColor.BLACK) {
                setCapturedByWhite(prev => [...prev, { ...capturedPawn }]);
              } else {
                setCapturedByBlack(prev => [...prev, { ...capturedPawn }]);
              }
            }
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
        
        // Si le mouvement a échoué mais qu'on clique sur une pièce de même couleur
        if (targetPiece && targetPiece.color === state.currentTurn) {
          gameEngine.selectPiece(position);
          // Vérifier les possibilités de roque pour la nouvelle pièce sélectionnée
          if (gameType === 'dice') {
            const diceEngine = gameEngine as DiceChessState;
            const castlingPartners = diceEngine.getCastlingPartners(position);
            setCastlingPartner(castlingPartners.length > 0 ? castlingPartners[0] : null);
            setCastlingInitiator(castlingPartners.length > 0 ? position : null);
          }
          forceUpdate();
          return;
        }
      } else {
        // Si aucune pièce n'est sélectionnée et qu'on clique sur une pièce valide
        if (targetPiece && targetPiece.color === state.currentTurn) {
          gameEngine.selectPiece(position);
          // Vérifier les possibilités de roque pour la pièce sélectionnée
          if (gameType === 'dice') {
            const diceEngine = gameEngine as DiceChessState;
            const castlingPartners = diceEngine.getCastlingPartners(position);
            setCastlingPartner(castlingPartners.length > 0 ? castlingPartners[0] : null);
            setCastlingInitiator(castlingPartners.length > 0 ? position : null);
          }
          forceUpdate();
        }
      }
    },
    [gameEngine, gameOver, timeoutWinner, gameType, castlingPartner, castlingInitiator, 
      setCurrentPlayer, setCapturedByWhite, setCapturedByBlack, hasWhiteMoved, forceUpdate]
  );

  const state = gameEngine.getState();

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
                <CapturedPiecesDisplay
                  capturedPieces={capturedByBlack}
                  color={PlayerColor.BLACK}
                />
                <Timer
                  key={`black-${timerKey}`}
                  color={PlayerColor.BLACK}
                  isActive={state.currentTurn === PlayerColor.BLACK && !state.isCheckmate && !timeoutWinner && !gameOver}
                  initialTime={INITIAL_TIME}
                  onTimeOut={handleTimeOut}
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
                  gameKey={gameKey}
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
  
          <View style={styles.lowerArea}>
            <View style={styles.capturedPiecesArea}>
              <CapturedPiecesDisplay
                capturedPieces={capturedByWhite}
                color={PlayerColor.WHITE}
              />
              <Timer
                key={`white-${timerKey}`}
                color={PlayerColor.WHITE}
                isActive={hasWhiteMoved && state.currentTurn === PlayerColor.WHITE && !state.isCheckmate && !timeoutWinner && !gameOver}
                initialTime={INITIAL_TIME}
                onTimeOut={handleTimeOut}
              />
            </View>
          </View>
  
          <View style={styles.turnIndicator}>
            <Text style={styles.turnIndicatorText}>
              {state.isInCheck 
                ? `${state.currentTurn === PlayerColor.WHITE ? "White" : "Black"}'s king is in check!`
                : state.currentTurn === PlayerColor.WHITE 
                  ? "White's turn" 
                  : "Black's turn"}
            </Text>
          </View>
        </View>
      </View>
  
      <GameOverModal
        isVisible={gameOver}
        winner={checkmateWinner || timeoutWinner}
        gameOverReason={gameEndReason}
        onNewGame={confirmNewGame}
        onReturnToMenu={onReturnToMenu}
      />
  
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
  );
};

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
    width: 60,
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