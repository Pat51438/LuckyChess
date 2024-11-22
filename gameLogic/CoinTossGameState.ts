import { 
    PlayerColor, 
    Position, 
    Piece,
    PieceType,
    Board,
    Square,
    GameState,
    ValidMoves,
    LastMove,
    GameType
  } from '../types/Chess';
  import { CoinToss } from '../types/CoinTossGame';
  
  export class CoinTossChessState {
    private board: Board;
    private currentTurn: PlayerColor;
    private selectedPiece: Position | null;
    private validMoves: ValidMoves;
    private blockedMoves: ValidMoves;
    private isInCheck: PlayerColor | null;
    private isCheckmate: PlayerColor | null;
    private lastMove: LastMove | null;
    private waitingForCoinToss: boolean;
    private isFirstMove: boolean;
  
    constructor() {
      this.board = this.createInitialBoard();
      this.currentTurn = PlayerColor.WHITE;
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
      this.isInCheck = null;
      this.isCheckmate = null;
      this.lastMove = null;
      this.waitingForCoinToss = false;
      this.isFirstMove = true;
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
        board[1][col].piece = { type: PieceType.PAWN, color: PlayerColor.BLACK, hasMoved: false };
        board[6][col].piece = { type: PieceType.PAWN, color: PlayerColor.WHITE, hasMoved: false };
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
        board[0][col].piece = { type: piece, color: PlayerColor.BLACK, hasMoved: false };
        board[7][col].piece = { type: piece, color: PlayerColor.WHITE, hasMoved: false };
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
  
    private isCastlingPossible(kingPos: Position, rookPos: Position): boolean {
      const king = this.board[kingPos.row][kingPos.col].piece;
      const rook = this.board[rookPos.row][rookPos.col].piece;
    
      if (!king || king.type !== PieceType.KING || king.hasMoved || 
          !rook || rook.type !== PieceType.ROOK || rook.hasMoved) {
        return false;
      }
    
      if (this.isInCheck === king.color) {
        return false;
      }
    
      const startCol = Math.min(kingPos.col, rookPos.col);
      const endCol = Math.max(kingPos.col, rookPos.col);
    
      for (let col = startCol + 1; col < endCol; col++) {
        if (this.board[kingPos.row][col].piece) {
          return false;
        }
      }
    
      const opponentColor = king.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      
      if (rookPos.col === 7) {
        for (let col = 4; col <= 6; col++) {
          if (this.isSquareUnderAttack({ row: kingPos.row, col }, opponentColor)) {
            return false;
          }
        }
      }
      else if (rookPos.col === 0) {
        for (let col = 2; col <= 4; col++) {
          if (this.isSquareUnderAttack({ row: kingPos.row, col }, opponentColor)) {
            return false;
          }
        }
      }
    
      return true;
    }
  
    private isEnPassantPossible(from: Position, to: Position): boolean {
      const piece = this.board[from.row][from.col].piece;
      if (!piece || piece.type !== PieceType.PAWN) return false;
      
      if (Math.abs(to.col - from.col) !== 1) return false;
      
      if (!this.lastMove) return false;
  
      const lastPiece = this.lastMove.piece;
      
      if (piece.color === PlayerColor.WHITE) {
          return (
              lastPiece.type === PieceType.PAWN &&
              lastPiece.color === PlayerColor.BLACK &&
              this.lastMove.from.row === 1 &&
              this.lastMove.to.row === 3 &&
              this.lastMove.to.col === to.col && 
              from.row === 3 &&
              to.row === 2
          );
      } else {
          return (
              lastPiece.type === PieceType.PAWN &&
              lastPiece.color === PlayerColor.WHITE &&
              this.lastMove.from.row === 6 &&
              this.lastMove.to.row === 4 &&
              this.lastMove.to.col === to.col &&
              from.row === 4 &&
              to.row === 5
          );
      }
    }
  
    private calculatePawnMovesRaw(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves, board: Board): void {
      const piece = board[position.row][position.col].piece;
      if (!piece) return;
  
      const direction = piece.color === PlayerColor.WHITE ? -1 : 1;
      const startRow = piece.color === PlayerColor.WHITE ? 6 : 1;
  
      if (this.isValidPosition(position.row + direction, position.col) &&
          !board[position.row + direction][position.col].piece) {
        validMoves.push({ row: position.row + direction, col: position.col });
  
        if (position.row === startRow &&
            this.isValidPosition(position.row + 2 * direction, position.col) &&
            !board[position.row + 2 * direction][position.col].piece) {
          validMoves.push({ row: position.row + 2 * direction, col: position.col });
        }
      }
  
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
          else if (this.isEnPassantPossible(position, { row: newRow, col: newCol })) {
            validMoves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
  
    private calculateRookMovesRaw(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves, board: Board): void {
      const directions = [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 }
      ];
  
      this.calculateLineMovementsRaw(position, directions, validMoves, blockedMoves, board);
    }
  
    private calculateBishopMovesRaw(position: Position, validMoves: ValidMoves, blockedMoves: ValidMoves, board: Board): void {
      const directions = [
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 }
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
      const piece = board[position.row][position.col].piece;
      if (!piece) return;
    
      const normalMoves = [
        { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
        { row: 0, col: -1 },                        { row: 0, col: 1 },
        { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
      ];
    
      for (const move of normalMoves) {
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
    
      if (!piece.hasMoved && position.col === 4) {
        const row = piece.color === PlayerColor.WHITE ? 7 : 0;
        
        if (this.isCastlingPossible({ row, col: 4 }, { row, col: 7 })) {
          validMoves.push({ row, col: 6 });
        }
        
        if (this.isCastlingPossible({ row, col: 4 }, { row, col: 0 })) {
          validMoves.push({ row, col: 2 });
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

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col].piece;
        if (piece && piece.color === checkedColor) {
          const moves = this.getValidMovesForPiece({ row, col });
          if (moves.length > 0) {
            this.isCheckmate = null;
            return;
          }
        }
      }
    }

    this.isCheckmate = checkedColor;
  }

  private getValidMovesForPiece(position: Position): ValidMoves {
    const piece = this.board[position.row][position.col].piece;
    if (!piece) return [];

    const rawMoves = this.calculateRawMovesByPieceType(position, piece.type);
    
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
      board: [...this.board],
      currentTurn: this.currentTurn,
      selectedPiece: this.selectedPiece ? { ...this.selectedPiece } : null,
      validMoves: [...this.validMoves],
      blockedMoves: [...this.blockedMoves],
      isInCheck: this.isInCheck,
      isCheckmate: this.isCheckmate,
      lastMove: this.lastMove ? { ...this.lastMove } : null,
      gameType: 'coinToss',
      remainingMoves: 1,
      waitingForCoinToss: this.waitingForCoinToss,
      waitingForDiceRoll: false
    };
  }

  public selectPiece(position: Position): void {
    const piece = this.board[position.row][position.col].piece;
    
    if (!piece || piece.color !== this.currentTurn || this.waitingForCoinToss) {
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
      return;
    }

    this.selectedPiece = {
      row: position.row,
      col: position.col
    };
    
    this.validMoves = this.getValidMovesForPiece(position);
    
    const rawMoves = this.calculateRawMovesByPieceType(position, piece.type);
    this.blockedMoves = rawMoves.filter(move => 
      !this.validMoves.some(validMove => 
        validMove.row === move.row && validMove.col === move.col
      )
    );
  }

  public movePiece(from: Position, to: Position): boolean {
    const fromPiece = this.board[from.row][from.col].piece;
    if (!fromPiece || fromPiece.color !== this.currentTurn || this.waitingForCoinToss) {
      return false;
    }

    const validMoves = this.getValidMovesForPiece(from);
    const isValidMove = validMoves.some(move => move.row === to.row && move.col === to.col);
    
    if (!isValidMove) return false;

    if (fromPiece.type === PieceType.KING) {
      const row = fromPiece.color === PlayerColor.WHITE ? 7 : 0;
      
      if (from.col === 4 && to.col === 6) {
        if (!this.isCastlingPossible({row, col: 4}, {row, col: 7})) return false;
        this.board[row][6].piece = { ...fromPiece, hasMoved: true };
        this.board[row][5].piece = { 
          type: PieceType.ROOK, 
          color: fromPiece.color, 
          hasMoved: true 
        };
        this.board[row][4].piece = null;
        this.board[row][7].piece = null;
        
        this.handlePostMove();
        return true;
      }
      
      if (from.col === 4 && to.col === 2) {
        if (!this.isCastlingPossible({row, col: 4}, {row, col: 0})) return false;
        this.board[row][2].piece = { ...fromPiece, hasMoved: true };
        this.board[row][3].piece = {
          type: PieceType.ROOK,
          color: fromPiece.color,
          hasMoved: true
        };
        this.board[row][4].piece = null;
        this.board[row][0].piece = null;
        
        this.handlePostMove();
        return true;
      }
    }

    if (fromPiece.type === PieceType.PAWN && this.isEnPassantPossible(from, to)) {
      this.board[from.row][to.col].piece = null;
    }

    this.lastMove = {
      from: { ...from },
      to: { ...to },
      piece: { ...fromPiece }
    };

    this.board[to.row][to.col].piece = { ...fromPiece, hasMoved: true };
    this.board[from.row][from.col].piece = null;

    this.handlePostMove();
    return true;
  }

  private handlePostMove(): void {
    this.selectedPiece = null;
    this.validMoves = [];
    this.blockedMoves = [];

    this.checkForCheck();
    
    if (this.isInCheck) {
      this.checkForCheckmate();
    }

    if (this.isFirstMove) {
      this.isFirstMove = false;
      this.waitingForCoinToss = true;
    } else {
      this.waitingForCoinToss = true;
    }
  }

  public tossCoin(): CoinToss {
    if (!this.waitingForCoinToss) {
      return { result: this.currentTurn };
    }

    const result = Math.random() < 0.5 ? PlayerColor.WHITE : PlayerColor.BLACK;
    this.currentTurn = result;
    this.waitingForCoinToss = false;
    
    return { result };
  }

  public resetGame(): void {
    this.board = this.createInitialBoard();
    this.currentTurn = PlayerColor.WHITE;
    this.selectedPiece = null;
    this.validMoves = [];
    this.blockedMoves = [];
    this.isInCheck = null;
    this.isCheckmate = null;
    this.lastMove = null;
    this.waitingForCoinToss = false;
    this.isFirstMove = true;
  }

  public unselectPiece(): void {
    this.selectedPiece = null;
    this.validMoves = [];
    this.blockedMoves = [];
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
      color: piece.color,
      hasMoved: true
    };

    this.checkForCheck();
    if (this.isInCheck) {
      this.checkForCheckmate();
    }
  }
}