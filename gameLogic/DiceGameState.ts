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
  GameType,
  GameEndReason
} from '../types/Chess';
import { DiceRoll } from '../types/DiceGame';

export class DiceChessState {
  private board: Board;
  private currentTurn: PlayerColor;
  private selectedPiece: Position | null;
  private validMoves: ValidMoves;
  private blockedMoves: ValidMoves;
  private isInCheck: PlayerColor | null;
  private isCheckmate: PlayerColor | null;
  private lastMove: LastMove | null;
  private waitingForDiceRoll: boolean;
  private remainingMoves: number;
  private lastDiceRoll: DiceRoll | null;
  private isFirstMove: boolean;
  private isKingInDanger: boolean;
  private validDefendingMoves: Array<{from: Position, to: Position}>;
  private gameOver: boolean;
  private winner: PlayerColor | null;
  private gameOverReason: GameEndReason;
  private isStalemate: boolean = false;
  private capturedByWhite: Piece[] = [];
  private capturedByBlack: Piece[] = [];
  private initialTurnsRemaining: number;
  private canRollDice: boolean; 
  

  constructor() {
    this.board = this.createInitialBoard();
    this.currentTurn = PlayerColor.WHITE;
    this.selectedPiece = null;
    this.validMoves = [];
    this.blockedMoves = [];
    this.isInCheck = null;
    this.isCheckmate = null;
    this.lastMove = null;
    this.waitingForDiceRoll = false;
    this.remainingMoves = 1;
    this.lastDiceRoll = null;
    this.isFirstMove = true;
    this.isKingInDanger = false;
    this.validDefendingMoves = [];
    this.gameOver = false;
    this.winner = null;
    this.gameOverReason = null;
    this.initialTurnsRemaining = 4;
    this.canRollDice = false;
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

  private isSquareUnderAttack(position: Position, byColor: PlayerColor, board: Board = this.board, skipKing: boolean = false): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col].piece;
        if (piece && piece.color === byColor) {
          if (skipKing && piece.type === PieceType.KING) {
            continue;
          }
          
          const moves = this.calculateRawMovesByPieceType(
            { row, col }, 
            piece.type, 
            board,
            true
          );
          
          if (moves.some(move => move.row === position.row && move.col === position.col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private handleCheck(): void {
    const currentKingPos = this.findKingPosition(this.currentTurn, this.board);
    const opponentColor = this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    
    this.isKingInDanger = this.isSquareUnderAttack(currentKingPos, opponentColor, this.board);
    
    if (this.isKingInDanger) {
      this.findDefendingMoves();
      if (this.validDefendingMoves.length === 0) {
        this.isCheckmate = this.currentTurn;
        this.gameOver = true;
      }
    }
  }

    private handleCheckmate(): void {
    // First check if the current player is in check
    const kingPos = this.findKingPosition(this.currentTurn, this.board);
    const opponentColor = this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    const isInCheck = this.isSquareUnderAttack(kingPos, opponentColor, this.board);

    if (!isInCheck) {
      this.isCheckmate = null;
      return;
    }

    // Check if any piece can move to prevent checkmate
    let canPreventCheckmate = false;
    
    // Check all pieces of the current player
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col].piece;
        if (piece && piece.color === this.currentTurn) {
          const moves = this.calculateRawMovesByPieceType({ row, col }, piece.type);
          
          // Try each possible move
          for (const move of moves) {
            // Create a temporary board to test the move
            const tempBoard = this.cloneBoard();
            tempBoard[move.row][move.col].piece = { ...piece };
            tempBoard[row][col].piece = null;

            // Find king's new position (in case we moved the king)
            const newKingPos = piece.type === PieceType.KING ? 
              move : 
              this.findKingPosition(this.currentTurn, tempBoard);

            // Check if this move gets us out of check
            if (!this.isSquareUnderAttack(newKingPos, opponentColor, tempBoard)) {
              canPreventCheckmate = true;
              break;
            }
          }
          if (canPreventCheckmate) break;
        }
      }
      if (canPreventCheckmate) break;
    }

    if (!canPreventCheckmate) {
      this.isCheckmate = this.currentTurn;
      this.gameOver = true;
      this.winner = opponentColor;
      this.gameOverReason = 'checkmate';
    }
  }


  private isStaleCheckForPlayer(color: PlayerColor): boolean {
    const kingPos = this.findKingPosition(color, this.board);
    const opponentColor = color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    
    if (this.isSquareUnderAttack(kingPos, opponentColor, this.board)) {
      return false; 
    }
  
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col].piece;
        if (piece && piece.color === color) {
          const moves = this.getValidMovesForPiece({ row, col });
          if (moves.length > 0) {
            return false;
          }
        }
      }
    }
  
    return true;
  }

  private findDefendingMoves(): void {
    this.validDefendingMoves = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col].piece;
        if (piece && piece.color === this.currentTurn) {
          const moves = this.calculateRawMovesByPieceType({ row, col }, piece.type);
          for (const move of moves) {
            const tempBoard = this.cloneBoard();
            tempBoard[move.row][move.col].piece = { ...piece };
            tempBoard[row][col].piece = null;
            
            const kingPos = piece.type === PieceType.KING ? 
              { row: move.row, col: move.col } : 
              this.findKingPosition(this.currentTurn, tempBoard);
              
            const stillInCheck = this.isSquareUnderAttack(
              kingPos,
              this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE,
              tempBoard
            );
            
            if (!stillInCheck) {
              this.validDefendingMoves.push({
                from: { row, col },
                to: move
              });
            }
          }
        }
      }
    }
  }

  private isCastlingPossible(kingPos: Position, rookPos: Position): boolean {
    const king = this.board[kingPos.row][kingPos.col].piece;
    const rook = this.board[rookPos.row][rookPos.col].piece;
  
    if (!king || king.type !== PieceType.KING || king.hasMoved || 
        !rook || rook.type !== PieceType.ROOK || rook.hasMoved) {
      return false;
    }
  
    const opponentColor = king.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    
    if (this.isSquareUnderAttack(kingPos, opponentColor, this.board, true)) {
      return false;
    }
  
    const isSideEmpty = rookPos.col === 7 
      ? !this.board[kingPos.row][5].piece && !this.board[kingPos.row][6].piece
      : !this.board[kingPos.row][1].piece && !this.board[kingPos.row][2].piece && !this.board[kingPos.row][3].piece;
  
    if (!isSideEmpty) return false;
  
    const colsToCheck = rookPos.col === 7 
      ? [5, 6]
      : [2, 3];
  
    return !colsToCheck.some(col => 
      this.isSquareUnderAttack(
        { row: kingPos.row, col }, 
        opponentColor, 
        this.board,
        true
      )
    );
  }

  private isEnPassantPossible(from: Position, to: Position): boolean {
    const piece = this.board[from.row][from.col].piece;
    if (!piece || piece.type !== PieceType.PAWN) return false;
    
    if (Math.abs(to.col - from.col) !== 1) return false;
    if (!this.lastMove) return false;
  
    const lastPiece = this.lastMove.piece;
    
    if (piece.color === PlayerColor.WHITE) {
      return (
        from.row === 3 &&
        to.row === 2 &&
        lastPiece.type === PieceType.PAWN &&
        lastPiece.color === PlayerColor.BLACK &&
        this.lastMove.from.row === 1 &&
        this.lastMove.to.row === 3 &&
        this.lastMove.to.col === to.col &&
        this.board[from.row][to.col].piece?.type === PieceType.PAWN &&
        this.board[from.row][to.col].piece?.color === PlayerColor.BLACK
      );
    } else {
      return (
        from.row === 4 &&
        to.row === 5 &&
        lastPiece.type === PieceType.PAWN &&
        lastPiece.color === PlayerColor.WHITE &&
        this.lastMove.from.row === 6 &&
        this.lastMove.to.row === 4 &&
        this.lastMove.to.col === to.col &&
        this.board[from.row][to.col].piece?.type === PieceType.PAWN &&
        this.board[from.row][to.col].piece?.color === PlayerColor.WHITE
      );
    }
  }

  public performCastling(kingPosition: Position, rookPosition: Position): boolean {
    const king = this.board[kingPosition.row][kingPosition.col].piece;
    const rook = this.board[rookPosition.row][rookPosition.col].piece;

    if (!king || !rook || king.hasMoved || rook.hasMoved) {
      return false;
    }

    const isKingSide = rookPosition.col === 7;
    
    const newKingCol = isKingSide ? 6 : 2;
    const newRookCol = isKingSide ? 5 : 3;

    this.board[kingPosition.row][newKingCol].piece = {
      ...king,
      hasMoved: true
    };
    this.board[kingPosition.row][newRookCol].piece = {
      ...rook,
      hasMoved: true
    };

    this.board[kingPosition.row][kingPosition.col].piece = null;
    this.board[rookPosition.row][rookPosition.col].piece = null;

    this.lastMove = {
      from: kingPosition,
      to: { row: kingPosition.row, col: newKingCol },
      piece: king,
      isCastling: true
    };

    this.handlePostMove();
    return true;
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
        } else if (!targetPiece && 
                   this.isEnPassantPossible(position, { row: newRow, col: newCol })) {
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
      { row: 1, col: -2 },  { row: 1, col: 2 },
      { row: 2, col: -1 },  { row: 2, col: 1 }
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

  private calculateKingMovesRaw(
    position: Position, 
    validMoves: ValidMoves, 
    blockedMoves: ValidMoves, 
    board: Board,
    isAttackCheck: boolean = false
  ): void {
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
  
    if (!isAttackCheck && !piece.hasMoved && position.col === 4) {
      const row = piece.color === PlayerColor.WHITE ? 7 : 0;
      
      const kingRook = board[row][7].piece;
      if (kingRook && !kingRook.hasMoved && 
          !board[row][5].piece && !board[row][6].piece &&
          !this.isSquareUnderAttack({ row, col: 4 }, piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, board, true) &&
          !this.isSquareUnderAttack({ row, col: 5 }, piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, board, true) &&
          !this.isSquareUnderAttack({ row, col: 6 }, piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, board, true)) {
        validMoves.push({ row, col: 6 });
      }
      
      const queenRook = board[row][0].piece;
      if (queenRook && !queenRook.hasMoved &&
          !board[row][1].piece && !board[row][2].piece && !board[row][3].piece &&
          !this.isSquareUnderAttack({ row, col: 4 }, piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, board, true) &&
          !this.isSquareUnderAttack({ row, col: 3 }, piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, board, true) &&
          !this.isSquareUnderAttack({ row, col: 2 }, piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, board, true)) {
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

  private calculateRawMovesByPieceType(
    position: Position, 
    pieceType: PieceType, 
    board: Board = this.board,
    isAttackCheck: boolean = false
  ): ValidMoves {
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
        this.calculateKingMovesRaw(position, moves, blockedMoves, board, isAttackCheck);
        break;
    }
    return moves;
  }

  private getValidMovesForPiece(position: Position): ValidMoves {
    const piece = this.board[position.row][position.col].piece;
    if (!piece) return [];

    const rawMoves = this.calculateRawMovesByPieceType(position, piece.type);
    
    if (this.isKingInDanger && piece.color === this.currentTurn) {
        return rawMoves.filter(move => {
            const tempBoard = this.cloneBoard();
            const targetPiece = tempBoard[move.row][move.col].piece;
            
            tempBoard[move.row][move.col].piece = tempBoard[position.row][position.col].piece;
            tempBoard[position.row][position.col].piece = null;
            
            const kingPos = piece.type === PieceType.KING ? 
                move : 
                this.findKingPosition(piece.color, tempBoard);
            
            const opponentColor = piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
            const wouldStillBeInCheck = this.isSquareUnderAttack(kingPos, opponentColor, tempBoard);
            
            tempBoard[position.row][position.col].piece = piece;
            tempBoard[move.row][move.col].piece = targetPiece;
            
            return !wouldStillBeInCheck;
        });
    }
    
    return rawMoves.filter(move => {
        const tempBoard = this.cloneBoard();
        const targetPiece = tempBoard[move.row][move.col].piece;
        
        tempBoard[move.row][move.col].piece = tempBoard[position.row][position.col].piece;
        tempBoard[position.row][position.col].piece = null;
        
        const kingPos = piece.type === PieceType.KING ? 
            move : 
            this.findKingPosition(piece.color, tempBoard);
        
        const opponentColor = piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
        
        const wouldBeInCheck = this.isSquareUnderAttack(kingPos, opponentColor, tempBoard);
        
        return !wouldBeInCheck;
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
      isStalemate: this.isStalemate,
      gameOver: this.gameOver,
      winner: this.winner,
      gameOverReason: this.gameOverReason,
      lastMove: this.lastMove ? { ...this.lastMove } : null,
      gameType: 'dice' as GameType,
      remainingMoves: this.remainingMoves,
      waitingForCoinToss: false,
      waitingForDiceRoll: this.waitingForDiceRoll,
      capturedByWhite: [...this.capturedByWhite],
      capturedByBlack: [...this.capturedByBlack],
      castlingPartners: this.selectedPiece ? this.getCastlingPartners(this.selectedPiece) : [],
      initialTurnsRemaining: this.initialTurnsRemaining,
      canRollDice: this.canRollDice
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

    if (this.isKingInDanger) {
      const validDefendingMovesForPiece = this.validDefendingMoves.filter(
        move => move.from.row === position.row && move.from.col === position.col
      );

      if (validDefendingMovesForPiece.length === 0) {
        this.selectedPiece = null;
        this.validMoves = [];
        this.blockedMoves = [];
        return;
      }

      this.selectedPiece = position;
      this.validMoves = validDefendingMovesForPiece.map(move => move.to);
      this.blockedMoves = [];
      return;
    }

    if (this.waitingForDiceRoll || this.remainingMoves <= 0) {
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
      return;
    }

    this.selectedPiece = position;
    this.validMoves = this.getValidMovesForPiece(position);
  }

  public movePiece(from: Position, to: Position): boolean {
    const fromPiece = this.board[from.row][from.col].piece;
    if (!fromPiece || fromPiece.color !== this.currentTurn || 
        this.waitingForDiceRoll || this.remainingMoves <= 0) {
        return false;
    }
  
    const validMoves = this.getValidMovesForPiece(from);
    const isValidMove = validMoves.some(move => move.row === to.row && move.col === to.col);
    
    if (!isValidMove) return false;
  
    const targetPiece = this.board[to.row][to.col].piece;
  
    let isEnPassant = false;
    let capturedPiece = targetPiece;
  
    if (fromPiece.type === PieceType.PAWN && 
        Math.abs(from.col - to.col) === 1 && 
        !targetPiece) {
      isEnPassant = this.isEnPassantPossible(from, to);
      if (isEnPassant) {
        capturedPiece = this.board[from.row][to.col].piece;
        this.board[from.row][to.col].piece = null;
      }
    }
  
    if (capturedPiece) {
      if (fromPiece.color === PlayerColor.WHITE) {
        this.capturedByWhite.push({ ...capturedPiece });
      } else {
        this.capturedByBlack.push({ ...capturedPiece });
      }
    }
  
    this.board[to.row][to.col].piece = { ...fromPiece, hasMoved: true };
    this.board[from.row][from.col].piece = null;
  
    if (fromPiece.type === PieceType.PAWN) {
      const isLastRank = (fromPiece.color === PlayerColor.WHITE && to.row === 0) ||
                        (fromPiece.color === PlayerColor.BLACK && to.row === 7);
      
      if (isLastRank) {
        this.board[to.row][to.col].piece = {
          type: PieceType.QUEEN,
          color: fromPiece.color,
          hasMoved: true
        };
      }
    }
  
    this.lastMove = {
      from: { ...from },
      to: { ...to },
      piece: { ...fromPiece },
      isEnPassant: isEnPassant,
      capturedPiece: capturedPiece || null
    };
  
    this.handlePostMove();
    return true;
  }

  private handlePostMove(): void {
    this.selectedPiece = null;
    this.validMoves = [];
    this.blockedMoves = [];
  
    const opponentColor = this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    const opponentKingPos = this.findKingPosition(opponentColor, this.board);
    const isOpponentInCheck = this.isSquareUnderAttack(opponentKingPos, this.currentTurn, this.board);
  
    if (isOpponentInCheck) {
      this.isInCheck = opponentColor;
      this.currentTurn = opponentColor;
      this.isKingInDanger = true;
      this.waitingForDiceRoll = false;
      this.remainingMoves = 1;
      
      // Call handleCheckmate to check if it's checkmate
      this.handleCheckmate();
      
      if (!this.isCheckmate) {
        // Only find defending moves if it's not checkmate
        this.findDefendingMoves();
      }
    } else {
      this.isInCheck = null;
      this.isKingInDanger = false;
      
      if (this.isStaleCheckForPlayer(opponentColor)) {
        this.isStalemate = true;
        this.gameOver = true;
        this.winner = null;
        this.gameOverReason = 'stalemate';
        return;
      }

      // Handle initial turns sequence
      if (this.initialTurnsRemaining > 0) {
        this.remainingMoves = 0;
        this.initialTurnsRemaining--;
        
        this.currentTurn = opponentColor;
        
        if (this.initialTurnsRemaining === 0) {
          this.currentTurn = PlayerColor.BLACK;
          this.waitingForDiceRoll = true;
          this.canRollDice = true;
        } else {
          this.remainingMoves = 1;
        }
      } else {
        this.remainingMoves--;
        if (this.remainingMoves <= 0) {
          this.waitingForDiceRoll = true;
        }
      }
    }
  }


  public getCapturedPieces(): { white: Piece[], black: Piece[] } {
    return {
      white: [...this.capturedByWhite],
      black: [...this.capturedByBlack]
    };
  }

  public getCastlingPartners(position: Position): Position[] {
    const piece = this.board[position.row][position.col].piece;
    if (!piece || piece.hasMoved) return [];

    const row = piece.color === PlayerColor.WHITE ? 7 : 0;
    const castlingPartners: Position[] = [];

    if (piece.type === PieceType.KING && position.col === 4) {
      if (this.isCastlingPossible({ row, col: 4 }, { row, col: 7 })) {
        castlingPartners.push({ row, col: 7 });
      }
      if (this.isCastlingPossible({ row, col: 4 }, { row, col: 0 })) {
        castlingPartners.push({ row, col: 0 });
      }
    } else if (piece.type === PieceType.ROOK && (position.col === 0 || position.col === 7)) {
      const king = this.board[row][4].piece;
      if (king?.type === PieceType.KING && !king.hasMoved) {
        if (this.isCastlingPossible({ row, col: 4 }, position)) {
          castlingPartners.push({ row, col: 4 });
        }
      }
    }

    return castlingPartners;
  }

  public rollDice(inputValue: number): DiceRoll {
    if (this.isKingInDanger || !this.waitingForDiceRoll || !this.canRollDice) {
      return {
        value: 0,
        moves: this.remainingMoves,
        player: this.currentTurn
      };
    }
  
    let result: DiceRoll;
    switch (inputValue) { 
      case 1:
        result = { value: 1, moves: 1, player: PlayerColor.WHITE };
        break;
      case 2:
        result = { value: 2, moves: 2, player: PlayerColor.WHITE };
        break;
      case 3:
        result = { value: 3, moves: 3, player: PlayerColor.WHITE };
        break;
      case 4:
        result = { value: 4, moves: 1, player: PlayerColor.BLACK };
        break;
      case 5:
        result = { value: 5, moves: 2, player: PlayerColor.BLACK };
        break;
      case 6:
        result = { value: 6, moves: 3, player: PlayerColor.BLACK };
        break;
      default:
        result = { value: 1, moves: 1, player: PlayerColor.WHITE };
    }
    
    this.lastDiceRoll = result;
    this.currentTurn = result.player;
    this.remainingMoves = result.moves;
    this.waitingForDiceRoll = false;
  
    return result;
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
    this.waitingForDiceRoll = false;
    this.remainingMoves = 1;
    this.lastDiceRoll = null;
    this.isFirstMove = true;
    this.isKingInDanger = false;
    this.validDefendingMoves = [];
    this.gameOver = false;
    this.winner = null;
    this.gameOverReason = null;
    this.capturedByWhite = [];
    this.capturedByBlack = [];
    this.isStalemate = false;
    this.initialTurnsRemaining = 4;
    this.canRollDice = false;
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

    this.handleCheck();
  }

  public getCheckInfo() {
    return {
      isInCheck: this.isKingInDanger,
      validDefendingMoves: this.validDefendingMoves,
      checkmate: this.isCheckmate
    };
  }
}
