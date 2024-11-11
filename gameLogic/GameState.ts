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
  
    private isValidPosition(row: number, col: number): boolean {
      return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
  
    private cloneBoard(): Board {
      return this.board.map(row =>
        row.map(square => ({
          ...square,
          piece: square.piece ? { ...square.piece } : null
        }))
      );
    }
  
    private findKingPosition(color: PlayerColor, board: Board): Position {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col].piece;
          if (piece && piece.type === PieceType.KING && piece.color === color) {
            return { row, col };
          }
        }
      }
      throw new Error(`King not found for color: ${color}`);
    }
  
    private isSquareUnderAttack(position: Position, byColor: PlayerColor, board: Board = this.board): boolean {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col].piece;
          if (piece && piece.color === byColor) {
            const moves = this.calculateRawMovesByPieceType({ row, col }, piece.type, board);
            if (moves.some(move => move.row === position.row && move.col === position.col)) {
              return true;
            }
          }
        }
      }
      return false;
    }
  
    private calculatePawnMovesRaw(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves, board: Board): void {
      const piece = board[position.row][position.col].piece;
      if (!piece) return;
  
      const direction = piece.color === PlayerColor.WHITE ? -1 : 1;
      const startRow = piece.color === PlayerColor.WHITE ? 6 : 1;
  
      // Forward move
      if (this.isValidPosition(position.row + direction, position.col) &&
          !board[position.row + direction][position.col].piece) {
        validMoves.push({ row: position.row + direction, col: position.col });
  
        // Double move from starting position
        if (position.row === startRow &&
            this.isValidPosition(position.row + 2 * direction, position.col) &&
            !board[position.row + 2 * direction][position.col].piece) {
          validMoves.push({ row: position.row + 2 * direction, col: position.col });
        }
      }
  
      // Captures
      for (const colOffset of [-1, 1]) {
        const newRow = position.row + direction;
        const newCol = position.col + colOffset;
  
        if (this.isValidPosition(newRow, newCol)) {
          const targetPiece = board[newRow][newCol].piece;
          if (targetPiece && targetPiece.color !== piece.color) {
            validMoves.push({ row: newRow, col: newCol });
          } else if (targetPiece) {
            blockedMoves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
  
    private calculateRookMovesRaw(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves, board: Board): void {
      const directions = [
        { row: -1, col: 0 },  // up
        { row: 1, col: 0 },   // down
        { row: 0, col: -1 },  // left
        { row: 0, col: 1 }    // right
      ];
  
      this.calculateLineMovementsRaw(position, directions, validMoves, blockedMoves, board);
    }
  
    private calculateBishopMovesRaw(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves, board: Board): void {
      const directions = [
        { row: -1, col: -1 },  // up-left
        { row: -1, col: 1 },   // up-right
        { row: 1, col: -1 },   // down-left
        { row: 1, col: 1 }     // down-right
      ];
  
      this.calculateLineMovementsRaw(position, directions, validMoves, blockedMoves, board);
    }
  
    private calculateQueenMovesRaw(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves, board: Board): void {
      this.calculateRookMovesRaw(position, validMoves, blockedMoves, board);
      this.calculateBishopMovesRaw(position, validMoves, blockedMoves, board);
    }
  
    private calculateKnightMovesRaw(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves, board: Board): void {
      const moves = [
        { row: -2, col: -1 }, { row: -2, col: 1 },
        { row: -1, col: -2 }, { row: -1, col: 2 },
        { row: 1, col: -2 }, { row: 1, col: 2 },
        { row: 2, col: -1 }, { row: 2, col: 1 }
      ];
  
      const piece = board[position.row][position.col].piece;
      if (!piece) return;
  
      for (const move of moves) {
        const newRow = position.row + move.row;
        const newCol = position.col + move.col;
  
        if (this.isValidPosition(newRow, newCol)) {
          const targetPiece = board[newRow][newCol].piece;
          if (!targetPiece || targetPiece.color !== piece.color) {
            validMoves.push({ row: newRow, col: newCol });
          } else {
            blockedMoves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
  
    private calculateKingMovesRaw(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves, board: Board): void {
      const moves = [
        { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
        { row: 0, col: -1 },                        { row: 0, col: 1 },
        { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
      ];
  
      const piece = board[position.row][position.col].piece;
      if (!piece) return;
  
      for (const move of moves) {
        const newRow = position.row + move.row;
        const newCol = position.col + move.col;
  
        if (this.isValidPosition(newRow, newCol)) {
          const targetPiece = board[newRow][newCol].piece;
          if (!targetPiece || targetPiece.color !== piece.color) {
            validMoves.push({ row: newRow, col: newCol });
          } else {
            blockedMoves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
  
    private calculateLineMovementsRaw(
      position: Position,
      directions: Array<{ row: number, col: number }>,
      validMoves: ValidMoves,
      blockedMoves: ValidMoves,
      board: Board
    ): void {
      const piece = board[position.row][position.col].piece;
      if (!piece) return;
  
      for (const direction of directions) {
        let currentRow = position.row + direction.row;
        let currentCol = position.col + direction.col;
  
        while (this.isValidPosition(currentRow, currentCol)) {
          const targetPiece = board[currentRow][currentCol].piece;
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
  
    private calculateRawMovesByPieceType(position: Position, pieceType: PieceType, board: Board = this.board): ValidMoves {
      const moves: ValidMoves = [];
      const blockedMoves: ValidMoves = [];
      
      switch (pieceType) {
        case PieceType.PAWN:
          this.calculatePawnMovesRaw(position, moves, blockedMoves, board);
          break;
        case PieceType.ROOK:
          this.calculateRookMovesRaw(position, moves, blockedMoves, board);
          break;
        case PieceType.KNIGHT:
          this.calculateKnightMovesRaw(position, moves, blockedMoves, board);
          break;
        case PieceType.BISHOP:
          this.calculateBishopMovesRaw(position, moves, blockedMoves, board);
          break;
        case PieceType.QUEEN:
          this.calculateQueenMovesRaw(position, moves, blockedMoves, board);
          break;
        case PieceType.KING:
          this.calculateKingMovesRaw(position, moves, blockedMoves, board);
          break;
      }
      return moves;
    }
  
    private checkForCheck(): void {
      this.isInCheck = null;
      
      const colors = [PlayerColor.WHITE, PlayerColor.BLACK];
      
      for (const color of colors) {
        try {
          const kingPosition = this.findKingPosition(color, this.board);
          const opponentColor = color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
          
          if (this.isSquareUnderAttack(kingPosition, opponentColor)) {
            this.isInCheck = color;
          }
        } catch (error) {
          console.error(`Error checking for check: ${error}`);
        }
      }
    }
  
    private checkForCheckmate(): void {
      if (!this.isInCheck) {
        this.isCheckmate = null;
        return;
      }
  
      const checkedColor = this.isInCheck;
  
      // Check all pieces of the checked color for any legal moves
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.board[row][col].piece;
          if (piece && piece.color === checkedColor) {
            const moves = this.getValidMovesForPiece({ row, col });
            if (moves.length > 0) {
              this.isCheckmate = null;
              return; // Found at least one legal move, not checkmate
            }
          }
        }
      }
  
      // If we get here, no legal moves were found
      this.isCheckmate = checkedColor;
    }
  
    private getValidMovesForPiece(position: Position): Position[] {
      const piece = this.board[position.row][position.col].piece;
      if (!piece) return [];
  
      // Get all possible moves without check validation
      const rawMoves = this.calculateRawMovesByPieceType(position, piece.type);
      
      // If the king is in check, we need to filter moves that block the check or capture the attacking piece
      if (this.isInCheck === piece.color) {
        return rawMoves.filter(move => {
          const tempBoard = this.cloneBoard();
          // Make the move on the temporary board
          tempBoard[move.row][move.col].piece = tempBoard[position.row][position.col].piece;
          tempBoard[position.row][position.col].piece = null;
          
          try {
            // Find king's position after the move
            const kingPos = piece.type === PieceType.KING ? 
              move : 
              this.findKingPosition(piece.color, tempBoard);
            
            const opponentColor = piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
            
            // Check if the king would still be in check after this move
            const wouldStillBeInCheck = this.isSquareUnderAttack(kingPos, opponentColor, tempBoard);
            
            return !wouldStillBeInCheck;
          } catch (error) {
            console.error(`Error validating move: ${error}`);
            return false;
          }
        });
      }
      
      // If not in check, filter moves that would put the king in check
      return rawMoves.filter(move => {
        const tempBoard = this.cloneBoard();
        tempBoard[move.row][move.col].piece = tempBoard[position.row][position.col].piece;
        tempBoard[position.row][position.col].piece = null;
        
        try {
          const kingPos = piece.type === PieceType.KING ? 
            move : 
            this.findKingPosition(piece.color, tempBoard);
          
          const opponentColor = piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
          
          const wouldBeInCheck = this.isSquareUnderAttack(kingPos, opponentColor, tempBoard);
        
          return !wouldBeInCheck;
        } catch (error) {
          console.error(`Error validating move: ${error}`);
          return false;
        }
      });
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
      const legalMoves = this.getValidMovesForPiece(position);
      const rawMoves = this.calculateRawMovesByPieceType(position, piece.type);
      
      this.validMoves = legalMoves;
      this.blockedMoves = rawMoves.filter(move => 
        !legalMoves.some(legal => 
          legal.row === move.row && legal.col === move.col
        )
      );
    }
  
    public movePiece(from: Position, to: Position): boolean {
      // Get valid moves that don't leave king in check
      const validMoves = this.getValidMovesForPiece(from);
      const isValidMove = validMoves.some(move => move.row === to.row && move.col === to.col);
  
      if (!isValidMove) {
        return false;
      }
  
      // Make the move
      const piece = this.board[from.row][from.col].piece;
      if (!piece) return false;
  
      this.board[to.row][to.col].piece = piece;
      this.board[from.row][from.col].piece = null;
  
      // Handle pawn promotion
      if (piece.type === PieceType.PAWN) {
        if ((piece.color === PlayerColor.WHITE && to.row === 0) ||
            (piece.color === PlayerColor.BLACK && to.row === 7)) {
          this.board[to.row][to.col].piece = {
            type: PieceType.QUEEN,
            color: piece.color
          };
        }
      }
  
      // Update game state
      this.currentTurn = this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
  
      // Check for check and checkmate after the move
      this.checkForCheck();
      if (this.isInCheck) {
        this.checkForCheckmate();
      }
  
      return true;
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
  
      // Check for check/checkmate after promotion
      this.checkForCheck();
      if (this.isInCheck) {
        this.checkForCheckmate();
      }
    }
  
    public unselectPiece(): void {
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
    }
  }