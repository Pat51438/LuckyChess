import { Board, Position, PlayerColor } from '../types/Chess';
import { isValidPosition, findKing } from './BoardSetting';
import { getValidMovesWithoutCheckTest } from './PieceMovement';

export const isSquareAttacked = (
  position: Position,
  attackingColor: PlayerColor,
  board: Board
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

export const getValidMoves = (
  position: Position,
  board: Board,
): Position[] => {
  const { row, col } = position;
  const piece = board[row][col].piece;
  if (!piece) return [];

  const possibleMoves = getValidMovesWithoutCheckTest(position, board);
  
  return possibleMoves.filter(move => {
    const newBoard = board.map(row => row.map(square => ({
      ...square,
      piece: square.piece ? { ...square.piece } : null
    })));
    
    newBoard[move.row][move.col].piece = piece;
    newBoard[row][col].piece = null;
    
    const kingPosition = findKing(piece.color, newBoard);
    if (!kingPosition) return false;
    
    return !isSquareAttacked(
      kingPosition,
      piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE,
      newBoard
    );
  });
};