import React, { useState, useCallback } from 'react';
import Square from './Square';
import Button from './Button';
import Timer from './Timer';
import CapturedPiecesDisplay from './CapturedPiece';
import { PlayerColor, Position, PieceType, Piece } from '../types/Chess';
import { ChessGameState } from '../gameLogic/GameState';

const INITIAL_TIME = 600; // 10 minutes in seconds


const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
    },
    mainContainer: {
      width: '100%',
      maxWidth: '800px',
    },
    headerContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: '10px',
    },
    buttonContainer: {
      width: '80%',
      minWidth: '200px',
      maxWidth: '300px',
      margin: '0 auto',
    },
    gameContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    },
    boardContainer: {
      width: '100%',
      maxWidth: '600px',
      position: 'relative',
    },
    capturedPiecesArea: {
      width: '100%',
      maxWidth: '600px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '10px',
    },
    board: {
      width: '100%',
      aspectRatio: '1',
      border: '2px solid #666',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
    },
    row: {
      display: 'flex',
      flex: 1,
      height: '12.5%',
    },
    checkIndicator: {
      width: '100%',
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: '#ff4444',
      borderRadius: '8px',
    },
    checkmateIndicator: {
      backgroundColor: '#990000',
    },
    checkText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '16px',
      textAlign: 'center',
      display: 'block',
    },
    turnIndicator: {
      marginTop: '15px',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
    },
    gameOver: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      zIndex: 1000,
    },
    // Added missing modal styles
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      width: '80%',
      maxWidth: '400px',
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333',
    },
    modalText: {
      fontSize: '16px',
      marginBottom: '20px',
      color: '#666',
    },
    modalButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
    },
    modalButton: {
      padding: '8px 16px',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white',
      cursor: 'pointer',
      border: 'none',
    },
    cancelButton: {
      backgroundColor: '#999',
    },
    confirmButton: {
      backgroundColor: '#007AFF',
    },
  } as const;
  

  const Board: React.FC = () => {
    const [gameEngine] = useState(new ChessGameState());
    const [, setUpdateTrigger] = useState(0);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]);
    const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]);
    const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
    const [blackTime, setBlackTime] = useState(INITIAL_TIME);
    const [timeoutWinner, setTimeoutWinner] = useState<PlayerColor | null>(null);
  
    const forceUpdate = useCallback(() => {
      setUpdateTrigger(prev => prev + 1);
    }, []);

    const handleTimeOut = useCallback((loserColor: PlayerColor) => {
        setTimeoutWinner(loserColor === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
      }, []);
  
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
        forceUpdate();
        setShowConfirmDialog(false);
      }, [gameEngine, forceUpdate]);
    

  
    const handleSquarePress = useCallback((position: Position) => {
        const state = gameEngine.getState();
        if (state.isCheckmate) return;
      
        const targetSquare = state.board[position.row][position.col];
        const targetPiece = targetSquare.piece;
      
        // If a piece is already selected
        if (state.selectedPiece) {
          // Case 1: Clicked on the same piece - unselect it
          if (state.selectedPiece.row === position.row && state.selectedPiece.col === position.col) {
            gameEngine.selectPiece(position); // This will effectively unselect it
            forceUpdate();
            return;
          }
      
          // Case 2: Clicked on another piece of the same color - select new piece
          if (targetPiece && targetPiece.color === state.currentTurn) {
            gameEngine.selectPiece(position);
            forceUpdate();
            return;
          }
      
          // Case 3: Try to move the selected piece
          const movingPiece = state.board[state.selectedPiece.row][state.selectedPiece.col].piece;
          const moveSuccessful = gameEngine.movePiece(state.selectedPiece, position);
          
          if (moveSuccessful && targetPiece && movingPiece && targetPiece.color !== movingPiece.color) {
            const setCapturedPieces = movingPiece.color === PlayerColor.WHITE ? setCapturedByWhite : setCapturedByBlack;
            setCapturedPieces(prev => [...prev, { ...targetPiece }]);
      
            const piece = state.board[position.row][position.col].piece;
            if (piece?.type === PieceType.PAWN) {
              if ((piece.color === PlayerColor.WHITE && position.row === 0) ||
                  (piece.color === PlayerColor.BLACK && position.row === 7)) {
                state.board[position.row][position.col].piece = {
                  type: PieceType.QUEEN,
                  color: piece.color
                };
              }
            }
          }
        } else {
          // No piece is selected - try to select a piece
          if (targetPiece && targetPiece.color === state.currentTurn) {
            gameEngine.selectPiece(position);
          }
        }
        
        forceUpdate();
      }, [gameEngine, forceUpdate]);
  

  const state = gameEngine.getState();

  return (
    <div style={styles.container}>
      <div style={styles.mainContainer}>
        <div style={styles.headerContainer}>
          <div style={styles.buttonContainer}>
            <Button onNewGame={handleNewGame} variant="primary" size="medium" />
          </div>
        </div>
  
        <div style={styles.gameContainer}>
          <div style={styles.capturedPiecesArea}>
            <CapturedPiecesDisplay 
              capturedPieces={capturedByBlack}
              color={PlayerColor.BLACK}
            />
            {/* Black's timer */}
            <Timer
              color={PlayerColor.BLACK}
              isActive={state.currentTurn === PlayerColor.BLACK && !state.isCheckmate && !timeoutWinner}
              initialTime={blackTime}
              onTimeOut={handleTimeOut}
            />
          </div>
  
          <div style={styles.boardContainer}>
            {state.isInCheck && (
              <div style={{ ...styles.checkIndicator, ...(state.isCheckmate ? styles.checkmateIndicator : {}) }}>
                <span style={styles.checkText}>
                  {state.isCheckmate 
                    ? `Checkmate! ${state.isInCheck === PlayerColor.WHITE ? "Black" : "White"} wins!`
                    : `${state.isInCheck === PlayerColor.WHITE ? "White" : "Black"} is in check!`}
                </span>
              </div>
            )}
  
            <div style={styles.board}>
              {state.board.map((row, rowIndex) => (
                <div key={rowIndex} style={styles.row}>
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
                </div>
              ))}
            </div>
          </div>
  
          <div style={styles.capturedPiecesArea}>
            {/* White's timer */}
            <Timer
              color={PlayerColor.WHITE}
              isActive={state.currentTurn === PlayerColor.WHITE && !state.isCheckmate && !timeoutWinner}
              initialTime={whiteTime}
              onTimeOut={handleTimeOut}
            />
            <CapturedPiecesDisplay 
              capturedPieces={capturedByWhite}
              color={PlayerColor.WHITE}
            />
          </div>
        </div>
  
        <div style={styles.turnIndicator}>
          {`${state.currentTurn === PlayerColor.WHITE ? "White" : "Black"}'s turn`}
        </div>
      </div>
  
      {showConfirmDialog && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>New Game</h2>
            <p style={styles.modalText}>Do you really want to start a new game?</p>
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButton, ...styles.cancelButton }}
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.confirmButton }}
                onClick={confirmNewGame}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );}

export default Board;