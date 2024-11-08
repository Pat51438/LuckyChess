import { Board, Position, PieceType, PlayerColor } from '../types/Chess';
import { isValidPosition } from './BoardSetting';

export const getValidMovesWithoutCheckTest = (
  position: Position,
  board: Board
): Position[] => {
  const { row, col } = position;
  const piece = board[row][col].piece;
  const moves: Position[] = [];

  if (!piece) return moves;

  const addMove = (newRow: number, newCol: number): boolean => {
    if (!isValidPosition({ row: newRow, col: newCol })) return false;
    
    const targetPiece = board[newRow][newCol].piece;
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

      if (isValidPosition({ row: row + direction, col }) && 
          !board[row + direction][col].piece) {
        moves.push({ row: row + direction, col });
        
        if (row === startRow && 
            isValidPosition({ row: row + 2 * direction, col }) && 
            !board[row + 2 * direction][col].piece) {
          moves.push({ row: row + 2 * direction, col });
        }
      }

      [-1, 1].forEach(dCol => {
        const newRow = row + direction;
        const newCol = col + dCol;
        
        if (isValidPosition({ row: newRow, col: newCol })) {
          const targetPiece = board[newRow][newCol].piece;
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
          if (!addMove(newRow, newCol)) break;
          newRow += dRow;
          newCol += dCol;
        }
      }
      break;
    }

    case PieceType.KNIGHT: {
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2],
       [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dRow, dCol]) => {
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
          if (!addMove(newRow, newCol)) break;
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
          if (!addMove(newRow, newCol)) break;
          newRow += dRow;
          newCol += dCol;
        }
      }
      break;
    }

    case PieceType.KING: {
      [[-1, -1], [-1, 0], [-1, 1],
       [0, -1], [0, 1],
       [1, -1], [1, 0], [1, 1]].forEach(([dRow, dCol]) => {
        addMove(row + dRow, col + dCol);
      });
      break;
    }
  }

  return moves;
};
