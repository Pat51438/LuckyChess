export type GameEndReason = 'checkmate' | 'timeout' | 'forfeit' | null;

export enum PlayerColor {
    WHITE = 'WHITE',
    BLACK = 'BLACK'
}

export enum PieceType {
    PAWN = 'PAWN',
    ROOK = 'ROOK',
    KNIGHT = 'KNIGHT',
    BISHOP = 'BISHOP',
    QUEEN = 'QUEEN',
    KING = 'KING'
}

export type Position = {
    row: number;
    col: number;
};

export type Piece = {
    type: PieceType;
    color: PlayerColor;
    hasMoved: boolean;
};

export type Square = {
    piece: Piece | null;
    position: Position;
};

export type Board = Square[][];

export type ValidMoves = Position[];

export type LastMove = {
    from: Position;
    to: Position;
    piece: Piece;
};

export type GameType = 'coinToss' | 'dice';

export interface GameState {
    board: Board;
    currentTurn: PlayerColor;
    selectedPiece: Position | null;
    validMoves: ValidMoves;
    blockedMoves: ValidMoves;
    isInCheck: PlayerColor | null;
    isCheckmate: PlayerColor | null;
    gameOver: boolean;
    winner: PlayerColor | null;
    gameOverReason: GameEndReason;
    lastMove: LastMove | null;
    gameType: GameType;
    remainingMoves: number;
    waitingForCoinToss: boolean;
    waitingForDiceRoll: boolean;
}