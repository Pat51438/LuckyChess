import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import Square from './Square';
import Button from './Button';
import { 
  Board as BoardType,
  PlayerColor,
  PieceType,
  Position,
  Piece
} from '../types/Chess';

const createInitialBoard = (): BoardType => {
  const board: BoardType = Array(8).fill(null).map((_, row) => 
    Array(8).fill(null).map((_, col) => ({
      piece: null,
      position: { row, col }
    }))
  );

  // Fonction d'aide pour placer les pièces
  const placePiece = (row: number, col: number, type: PieceType, color: PlayerColor) => {
    board[row][col].piece = { type, color };
  };

  // Placer les pièces noires
  placePiece(0, 0, PieceType.ROOK, PlayerColor.BLACK);
  placePiece(0, 1, PieceType.KNIGHT, PlayerColor.BLACK);
  placePiece(0, 2, PieceType.BISHOP, PlayerColor.BLACK);
  placePiece(0, 3, PieceType.QUEEN, PlayerColor.BLACK);
  placePiece(0, 4, PieceType.KING, PlayerColor.BLACK);
  placePiece(0, 5, PieceType.BISHOP, PlayerColor.BLACK);
  placePiece(0, 6, PieceType.KNIGHT, PlayerColor.BLACK);
  placePiece(0, 7, PieceType.ROOK, PlayerColor.BLACK);

  // Placer les pions noirs
  for (let col = 0; col < 8; col++) {
    placePiece(1, col, PieceType.PAWN, PlayerColor.BLACK);
  }

  // Placer les pions blancs
  for (let col = 0; col < 8; col++) {
    placePiece(6, col, PieceType.PAWN, PlayerColor.WHITE);
  }

  // Placer les pièces blanches
  placePiece(7, 0, PieceType.ROOK, PlayerColor.WHITE);
  placePiece(7, 1, PieceType.KNIGHT, PlayerColor.WHITE);
  placePiece(7, 2, PieceType.BISHOP, PlayerColor.WHITE);
  placePiece(7, 3, PieceType.QUEEN, PlayerColor.WHITE);
  placePiece(7, 4, PieceType.KING, PlayerColor.WHITE);
  placePiece(7, 5, PieceType.BISHOP, PlayerColor.WHITE);
  placePiece(7, 6, PieceType.KNIGHT, PlayerColor.WHITE);
  placePiece(7, 7, PieceType.ROOK, PlayerColor.WHITE);

  return board;
};

const findKing = (color: PlayerColor, board: BoardType): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece;
      if (piece?.type === PieceType.KING && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

const getValidMovesWithoutCheckTest = (
  position: Position,
  boardState: BoardType
): Position[] => {
  const { row, col } = position;
  const piece = boardState[row][col].piece;
  let moves: Position[] = [];

  if (!piece) return moves;

  const isValidPosition = (pos: Position): boolean => {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
  };

  const addMove = (newRow: number, newCol: number): boolean => {
    if (!isValidPosition({ row: newRow, col: newCol })) return false;
    
    const targetPiece = boardState[newRow][newCol].piece;
    if (!targetPiece) {
      moves.push({ row: newRow, col: newCol });
      return true;
    } else if (targetPiece.color !== piece.color) {
      moves.push({ row: newRow, col: newCol });
    }
    return false;
  };

  switch (piece.type) {
    case PieceType.PAWN: {
      const direction = piece.color === PlayerColor.WHITE ? -1 : 1;
      const startRow = piece.color === PlayerColor.WHITE ? 6 : 1;

      // Movement avant
      if (isValidPosition({ row: row + direction, col }) && 
          !boardState[row + direction][col].piece) {
        moves.push({ row: row + direction, col });
        
        // Double mouvement initial
        if (row === startRow && 
            isValidPosition({ row: row + 2 * direction, col }) && 
            !boardState[row + 2 * direction][col].piece) {
          moves.push({ row: row + 2 * direction, col });
        }
      }

      // Captures
      const captureDirections = [-1, 1];
      captureDirections.forEach(dCol => {
        const newRow = row + direction;
        const newCol = col + dCol;
        
        if (isValidPosition({ row: newRow, col: newCol })) {
          const targetPiece = boardState[newRow][newCol].piece;
          if (targetPiece && targetPiece.color !== piece.color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      });
      break;
    }

    case PieceType.ROOK: {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dRow, dCol] of directions) {
        let newRow = row + dRow;
        let newCol = col + dCol;
        while (isValidPosition({ row: newRow, col: newCol })) {
          const targetPiece = boardState[newRow][newCol].piece;
          if (!targetPiece) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (targetPiece.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
          newRow += dRow;
          newCol += dCol;
        }
      }
      break;
    }

    case PieceType.KNIGHT: {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightMoves.forEach(([dRow, dCol]) => {
        addMove(row + dRow, col + dCol);
      });
      break;
    }

    case PieceType.BISHOP: {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dRow, dCol] of directions) {
        let newRow = row + dRow;
        let newCol = col + dCol;
        while (isValidPosition({ row: newRow, col: newCol })) {
          const targetPiece = boardState[newRow][newCol].piece;
          if (!targetPiece) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (targetPiece.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
          newRow += dRow;
          newCol += dCol;
        }
      }
      break;
    }

    case PieceType.QUEEN: {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];
      for (const [dRow, dCol] of directions) {
        let newRow = row + dRow;
        let newCol = col + dCol;
        while (isValidPosition({ row: newRow, col: newCol })) {
          const targetPiece = boardState[newRow][newCol].piece;
          if (!targetPiece) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (targetPiece.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
          newRow += dRow;
          newCol += dCol;
        }
      }
      break;
    }

    case PieceType.KING: {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];
      directions.forEach(([dRow, dCol]) => {
        addMove(row + dRow, col + dCol);
      });
      break;
    }
  }

  return moves;
};

const isSquareAttacked = (
  position: Position,
  attackingColor: PlayerColor,
  board: BoardType
): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col].piece;
      if (piece && piece.color === attackingColor) {
        const moves = getValidMovesWithoutCheckTest({ row, col }, board);
        if (moves.some(move => move.row === position.row && move.col === position.col)) {
          return true;
        }
      }
    }
  }
  return false;
};

const Board: React.FC = () => {
  const [board, setBoard] = useState<BoardType>(createInitialBoard());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [currentTurn, setCurrentTurn] = useState<PlayerColor>(PlayerColor.WHITE);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [isInCheck, setIsInCheck] = useState<PlayerColor | null>(null);
  const [isCheckmate, setIsCheckmate] = useState<PlayerColor | null>(null);

  const handleRematch = () => {
    Alert.alert(
      "Nouvelle partie",
      "Voulez-vous vraiment recommencer une nouvelle partie ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Oui",
          onPress: () => {
            setBoard(createInitialBoard());
            setSelectedPosition(null);
            setCurrentTurn(PlayerColor.WHITE);
            setValidMoves([]);
            setIsInCheck(null);
            setIsCheckmate(null);
          }
        }
      ]
    );
  };

  const getValidMoves = useCallback((
    position: Position,
    boardState: BoardType,
  ): Position[] => {
    const { row, col } = position;
    const piece = boardState[row][col].piece;
    if (!piece) return [];

    const possibleMoves = getValidMovesWithoutCheckTest(position, boardState);
    
    // Filtrer les mouvements qui laisseraient ou mettraient le roi en échec
    return possibleMoves.filter(move => {
      // Simuler le mouvement
      const newBoard = boardState.map(row => row.map(square => ({
        ...square,
        piece: square.piece ? { ...square.piece } : null
      })));
      
      // Effectuer le mouvement simulé
      newBoard[move.row][move.col].piece = piece;
      newBoard[row][col].piece = null;
      
      // Trouver la position du roi de la couleur active
      const kingPosition = findKing(piece.color, newBoard);
      if (!kingPosition) return false;
      
      // Vérifier si le roi est en échec après le mouvement
      return !isSquareAttacked(
        kingPosition,
        piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE,
        newBoard
      );
    });
  }, []);

  const handleSquarePress = useCallback((position: Position) => {
    if (isCheckmate) return;

    const clickedSquare = board[position.row][position.col];
    const clickedPiece = clickedSquare.piece;

    // Si une pièce est déjà sélectionnée
    if (selectedPosition) {
      // Vérifier si le mouvement est valide
      const isValidMove = validMoves.some(
        move => move.row === position.row && move.col === position.col
      );

      if (isValidMove) {
        // Effectuer le mouvement
        const newBoard = board.map(row => [...row]);
        const selectedPiece = newBoard[selectedPosition.row][selectedPosition.col].piece;
        newBoard[position.row][position.col].piece = selectedPiece;
        newBoard[selectedPosition.row][selectedPosition.col].piece = null;

        // Mettre à jour le plateau et changer de tour
        setBoard(newBoard);
        setSelectedPosition(null);
        setValidMoves([]);
        setCurrentTurn(currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE);
      } else {
        // Si on clique sur une autre pièce de la même couleur, la sélectionner
        if (clickedPiece && clickedPiece.color === currentTurn) {
          setSelectedPosition(position);
          setValidMoves(getValidMoves(position, board));
        } else {
          // Sinon, déselectionner la pièce
          setSelectedPosition(null);
          setValidMoves([]);
        }
      }
    } else {
      // Si aucune pièce n'est sélectionnée et qu'on clique sur une pièce de la bonne couleur
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedPosition(position);
        setValidMoves(getValidMoves(position, board));
      }
    }
  }, [board, currentTurn, selectedPosition, validMoves, isCheckmate, getValidMoves]);

  // Vérifier l'état du jeu après chaque coup
  useEffect(() => {
    const checkGameState = () => {
      // Vérifier si le roi actuel est en échec
      const kingPosition = findKing(currentTurn, board);
      if (!kingPosition) return;
      
      const isCurrentKingInCheck = isSquareAttacked(
        kingPosition,
        currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE,
        board
      );
      
      if (isCurrentKingInCheck) {
        setIsInCheck(currentTurn);
        
        // Vérifier s'il y a échec et mat
        let hasAnyLegalMove = false;
        for (let row = 0; row < 8; row++) {
          

          for (let col = 0; col < 8; col++) {
            const piece = board[row][col].piece;
            if (piece && piece.color === currentTurn) {
              const moves = getValidMoves({ row, col }, board);
              if (moves.length > 0) {
                hasAnyLegalMove = true;
                break;
              }
            }
          }
          if (hasAnyLegalMove) break;
        }
        
        if (!hasAnyLegalMove) {
          setIsCheckmate(currentTurn);
        }
      } else {
        setIsInCheck(null);
        setIsCheckmate(null);
      }
    };

    checkGameState();
  }, [board, currentTurn, getValidMoves]);

  return (
    <View style={styles.container}>
      {/* Bouton Rematch en haut */}
      <View style={styles.headerContainer}>
        <Button
          title="Nouvelle Partie"
          onPress={handleRematch}
          variant="primary"
          size="medium"
          style={styles.rematchButton}
        />
      </View>

      {/* Indicateur d'échec */}
      {isInCheck && (
        <View style={[styles.checkIndicator, isCheckmate && styles.checkmateIndicator]}>
          <Text style={styles.checkText}>
            {isCheckmate 
              ? `Échec et mat ! Les ${isInCheck === PlayerColor.WHITE ? "Noirs" : "Blancs"} ont gagné !`
              : `${isInCheck === PlayerColor.WHITE ? "Blancs" : "Noirs"} en échec !`}
          </Text>
        </View>
      )}

      {/* Plateau de jeu */}
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((square, colIndex) => (
              <Square
                key={colIndex}
                dark={(rowIndex + colIndex) % 2 === 1}
                piece={square.piece}
                position={square.position}
                onPress={handleSquarePress}
                selected={selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex}
                isValidMove={validMoves.some(move => 
                  move.row === rowIndex && move.col === colIndex
                )}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Indicateur de tour */}
      <Text style={styles.turnIndicator}>
        {`Tour des ${currentTurn === PlayerColor.WHITE ? "Blancs" : "Noirs"}`}
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
  rematchButton: {
    width: '80%',
  },
});

export default Board;