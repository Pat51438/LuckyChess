import { 
    PlayerColor, 
    Position, 
    Piece,
    PieceType,
    Board,
    Square,
    GameState,
    ValidMoves 
  } from '../types/Chess';
  
  export class ChessGameState {
    private board: Board;
    private currentTurn: PlayerColor;
    private selectedPiece: Position | null;
    private validMoves: ValidMoves;
    private blockedMoves: ValidMoves;
    private isInCheck: PlayerColor | null;
    private isCheckmate: PlayerColor | null;
  
    constructor() {
      this.board = this.createInitialBoard();
      this.currentTurn = PlayerColor.WHITE;
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
      this.isInCheck = null;
      this.isCheckmate = null;
    }
  
    private createInitialBoard(): Board {
      const board: Board = Array(8).fill(null).map((_, row) => 
        Array(8).fill(null).map((_, col) => ({
          piece: null,
          position: { row, col }
        }))
      );
  
      // Place pawns
      for (let col = 0; col < 8; col++) {
        board[1][col].piece = { type: PieceType.PAWN, color: PlayerColor.BLACK };
        board[6][col].piece = { type: PieceType.PAWN, color: PlayerColor.WHITE };
      }
  
      // Place other pieces
      const pieces: PieceType[] = [
        PieceType.ROOK,
        PieceType.KNIGHT,
        PieceType.BISHOP,
        PieceType.QUEEN,
        PieceType.KING,
        PieceType.BISHOP,
        PieceType.KNIGHT,
        PieceType.ROOK
      ];
      
      pieces.forEach((piece, col) => {
        board[0][col].piece = { type: piece, color: PlayerColor.BLACK };
        board[7][col].piece = { type: piece, color: PlayerColor.WHITE };
      });
  
      return board;
    }
  
    public resetGame(): void {
      this.board = this.createInitialBoard();
      this.currentTurn = PlayerColor.WHITE;
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
      this.isInCheck = null;
      this.isCheckmate = null;
    }
  
    public getState(): GameState {
      return {
        board: this.board,
        currentTurn: this.currentTurn,
        selectedPiece: this.selectedPiece,
        validMoves: this.validMoves,
        blockedMoves: this.blockedMoves,
        isInCheck: this.isInCheck,
        isCheckmate: this.isCheckmate
      };
    }
  
    public selectPiece(position: Position): void {
      const piece = this.board[position.row][position.col].piece;
      
      if (!piece || piece.color !== this.currentTurn) {
        this.selectedPiece = null;
        this.validMoves = [];
        this.blockedMoves = [];
        return;
      }
  
      this.selectedPiece = position;
      const moves = this.calculateValidMovesForPiece(position);
      this.validMoves = moves.validMoves;
      this.blockedMoves = moves.blockedMoves;
    }
  
    public movePiece(from: Position, to: Position): boolean {
      // Vérifier si le mouvement est valide
      if (!this.validMoves.some(move => move.row === to.row && move.col === to.col)) {
        return false;
      }
  
      const piece = this.board[from.row][from.col].piece;
      if (!piece) return false;
  
      // Effectuer le mouvement
      this.board[to.row][to.col].piece = { ...piece };
      this.board[from.row][from.col].piece = null;
  
      // Changer le tour
      this.currentTurn = this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
  
      // Réinitialiser la sélection
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
  
      // Mettre à jour l'état du jeu
      this.checkForCheck();
      this.checkForCheckmate();
  
      return true;
    }
  
    public promotePawn(position: Position, newType: PieceType = PieceType.QUEEN): void {
      const square = this.board[position.row][position.col];
      const piece = square.piece;
  
      if (!piece || piece.type !== PieceType.PAWN) return;
  
      const isLastRank = (piece.color === PlayerColor.WHITE && position.row === 0) ||
                        (piece.color === PlayerColor.BLACK && position.row === 7);
  
      if (!isLastRank) return;
  
      this.board[position.row][position.col].piece = {
        type: newType,
        color: piece.color
      };
  
      this.updateGameState();
    }
  
    private calculateValidMovesForPiece(position: Position): { validMoves: ValidMoves, blockedMoves: ValidMoves } {
      const piece = this.board[position.row][position.col].piece;
      if (!piece) return { validMoves: [], blockedMoves: [] };
  
      const validMoves: ValidMoves = [];
      const blockedMoves: ValidMoves = [];
  
      switch (piece.type) {
        case PieceType.PAWN:
          this.calculatePawnMoves(position, validMoves, blockedMoves);
          break;
        case PieceType.ROOK:
          this.calculateRookMoves(position, validMoves, blockedMoves);
          break;
        case PieceType.KNIGHT:
          this.calculateKnightMoves(position, validMoves, blockedMoves);
          break;
        case PieceType.BISHOP:
          this.calculateBishopMoves(position, validMoves, blockedMoves);
          break;
        case PieceType.QUEEN:
          this.calculateQueenMoves(position, validMoves, blockedMoves);
          break;
        case PieceType.KING:
          this.calculateKingMoves(position, validMoves, blockedMoves);
          break;
      }
  
      return { validMoves, blockedMoves };
    }
  
    private calculatePawnMoves(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves): void {
      const piece = this.board[position.row][position.col].piece;
      if (!piece) return;
  
      const direction = piece.color === PlayerColor.WHITE ? -1 : 1;
      const startRow = piece.color === PlayerColor.WHITE ? 6 : 1;
  
      // Mouvement en avant
      if (this.isValidPosition(position.row + direction, position.col) &&
          !this.board[position.row + direction][position.col].piece) {
        validMoves.push({ row: position.row + direction, col: position.col });
  
        // Double mouvement depuis la position initiale
        if (position.row === startRow &&
            this.isValidPosition(position.row + 2 * direction, position.col) &&
            !this.board[position.row + 2 * direction][position.col].piece) {
          validMoves.push({ row: position.row + 2 * direction, col: position.col });
        }
      }
  
      // Captures en diagonale
      for (const colOffset of [-1, 1]) {
        const newRow = position.row + direction;
        const newCol = position.col + colOffset;
  
        if (this.isValidPosition(newRow, newCol)) {
          const targetPiece = this.board[newRow][newCol].piece;
          if (targetPiece && targetPiece.color !== piece.color) {
            validMoves.push({ row: newRow, col: newCol });
          } else if (targetPiece) {
            blockedMoves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
  
    private calculateRookMoves(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves): void {
      const directions = [
        { row: -1, col: 0 },  // up
        { row: 1, col: 0 },   // down
        { row: 0, col: -1 },  // left
        { row: 0, col: 1 }    // right
      ];
  
      this.calculateLineMovements(position, directions, validMoves, blockedMoves);
    }
  
    private calculateBishopMoves(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves): void {
      const directions = [
        { row: -1, col: -1 },  // up-left
        { row: -1, col: 1 },   // up-right
        { row: 1, col: -1 },   // down-left
        { row: 1, col: 1 }     // down-right
      ];
  
      this.calculateLineMovements(position, directions, validMoves, blockedMoves);
    }
  
    private calculateQueenMoves(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves): void {
      this.calculateRookMoves(position, validMoves, blockedMoves);
      this.calculateBishopMoves(position, validMoves, blockedMoves);
    }
  
    private calculateKnightMoves(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves): void {
      const moves = [
        { row: -2, col: -1 }, { row: -2, col: 1 },
        { row: -1, col: -2 }, { row: -1, col: 2 },
        { row: 1, col: -2 }, { row: 1, col: 2 },
        { row: 2, col: -1 }, { row: 2, col: 1 }
      ];
  
      const piece = this.board[position.row][position.col].piece;
      if (!piece) return;
  
      for (const move of moves) {
        const newRow = position.row + move.row;
        const newCol = position.col + move.col;
  
        if (this.isValidPosition(newRow, newCol)) {
          const targetPiece = this.board[newRow][newCol].piece;
          if (!targetPiece) {
            validMoves.push({ row: newRow, col: newCol });
          } else if (targetPiece.color !== piece.color) {
            validMoves.push({ row: newRow, col: newCol });
          } else {
            blockedMoves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
  
    private calculateKingMoves(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves): void {
      const moves = [
        { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
        { row: 0, col: -1 },                        { row: 0, col: 1 },
        { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
      ];
  
      const piece = this.board[position.row][position.col].piece;
      if (!piece) return;
  
      for (const move of moves) {
        const newRow = position.row + move.row;
        const newCol = position.col + move.col;
  
        if (this.isValidPosition(newRow, newCol)) {
          const targetPiece = this.board[newRow][newCol].piece;
          if (!targetPiece) {
            validMoves.push({ row: newRow, col: newCol });
          } else if (targetPiece.color !== piece.color) {
            validMoves.push({ row: newRow, col: newCol });
          } else {
            blockedMoves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
  
    private calculateLineMovements(
      position: Position,
      directions: Array<{ row: number, col: number }>,
      validMoves: ValidMoves,
      blockedMoves: ValidMoves
    ): void {
      const piece = this.board[position.row][position.col].piece;
      if (!piece) return;
  
      for (const direction of directions) {
        let currentRow = position.row + direction.row;
        let currentCol = position.col + direction.col;
  
        while (this.isValidPosition(currentRow, currentCol)) {
          const targetPiece = this.board[currentRow][currentCol].piece;
          if (!targetPiece) {
            validMoves.push({ row: currentRow, col: currentCol });
          } else {
            if (targetPiece.color !== piece.color) {
              validMoves.push({ row: currentRow, col: currentCol });
            } else {
              blockedMoves.push({ row: currentRow, col: currentCol });
            }
            break;
          }
  
          currentRow += direction.row;
          currentCol += direction.col;
        }
      }
    }
  
    private isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
      }
    
      private checkForCheck(): void {
        // Cette méthode devrait vérifier si un roi est en échec
        this.isInCheck = null;
      }
    
      private checkForCheckmate(): void {
        // Cette méthode devrait vérifier si le roi est en échec et mat
        this.isCheckmate = null;
      }
    
      private updateGameState(): void {
        // Calculer les mouvements valides pour la nouvelle position
        if (this.selectedPiece) {
          const moves = this.calculateValidMovesForPiece(this.selectedPiece);
          this.validMoves = moves.validMoves;
          this.blockedMoves = moves.blockedMoves;
        }
        
        // Vérifier l'état d'échec
        this.checkForCheck();
        
        // Vérifier l'état d'échec et mat
        this.checkForCheckmate();
      }
    }