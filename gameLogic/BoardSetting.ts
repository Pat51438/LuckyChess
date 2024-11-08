import { Board, PlayerColor, PieceType, Position, Piece } from '../types/Chess';

export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map((_, row) => 
    Array(8).fill(null).map((_, col) => ({
      piece: null,
      position: { row, col }
    }))
  );

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

export const findKing = (color: PlayerColor, board: Board): Position | null => {
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
  
  export const isValidPosition = (pos: Position): boolean => {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
  };