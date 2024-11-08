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
  }
  
  export interface Square {
    piece: Piece | null;
    position: Position;
  }
  
  export type Board = Square[][];
  export type ValidMove = Position;
  export type ValidMoves = ValidMove[];
  
  export interface GameState {
    board: Board;
    currentTurn: PlayerColor;
    selectedPiece: Position | null;
    validMoves: ValidMoves; 
    blockedMoves: ValidMoves;
    isInCheck: PlayerColor | null;  
    isCheckmate: PlayerColor | null;
  }

  export interface ChessPiece {
    type: PieceType;
    color: PlayerColor;
    hasMoved: boolean;
  }