// Chess.ts
export type GameType = 'dice' | 'coinToss';

export enum PieceType {
    PAWN = 'PAWN',
    ROOK = 'ROOK',
    KNIGHT = 'KNIGHT',
    BISHOP = 'BISHOP',
    QUEEN = 'QUEEN',
    KING = 'KING'
}
  
export enum PlayerColor {
    WHITE = 'WHITE',
    BLACK = 'BLACK'
}
  
export interface Position {
    row: number;
    col: number;
}
  
export interface Piece {
    type: PieceType;
    color: PlayerColor;
    hasMoved: boolean;
}
  
export interface Square {
    piece: Piece | null;
    position: Position;
}
  
export type Board = Square[][];
export type ValidMove = Position;
export type ValidMoves = ValidMove[];

export interface LastMove {
    from: Position;
    to: Position;
    piece: Piece;
}

export interface GameState {
  board: Board;
  currentTurn: PlayerColor;
  selectedPiece: Position | null;
  validMoves: ValidMoves; 
  blockedMoves: ValidMoves;
  isInCheck: PlayerColor | null;  
  isCheckmate: PlayerColor | null;
  lastMove: LastMove | null;
  gameType: GameType;
  remainingMoves: number;
  waitingForCoinToss: boolean;
  waitingForDiceRoll: boolean;
}