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
  private capturedByWhite: Piece[];
  private capturedByBlack: Piece[];
  private validDefendingMoves: Array<{from: Position, to: Position}>;
  private gameOver: boolean;
  private winner: PlayerColor | null;
  private gameOverReason: GameEndReason;
  private isStalemate: boolean;
  private initialTurnsRemaining: number = 4;
  private canTossCoin: boolean = false;
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
    this.capturedByWhite = [];
    this.capturedByBlack = [];
    this.validDefendingMoves = [];
    this.gameOver = false;
    this.winner = null;
    this.gameOverReason = null;
    this.isStalemate = false;
    this.initialTurnsRemaining = 4;
    this.canTossCoin = false;
  }

  private createInitialBoard(): Board {
    const board: Board = Array(8).fill(null).map((_, row) => 
      Array(8).fill(null).map((_, col) => ({
        piece: null,
        position: { row, col }
      }))
    );

    for (let col = 0; col < 8; col++) {
      board[1][col].piece = { type: PieceType.PAWN, color: PlayerColor.BLACK, hasMoved: false };
      board[6][col].piece = { type: PieceType.PAWN, color: PlayerColor.WHITE, hasMoved: false };
    }

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

  public getCastlingPartners(position: Position): Position[] {
    const piece = this.board[position.row][position.col].piece;
    if (!piece || piece.hasMoved) return [];

    const row = piece.color === PlayerColor.WHITE ? 7 : 0;
    const castlingPartners: Position[] = [];

    // Handle king selection
    if (piece.type === PieceType.KING && position.col === 4) {
      // Check kingside rook
      if (this.isCastlingPossible({row, col: 4}, {row, col: 7})) {
        castlingPartners.push({row, col: 7});
      }
      // Check queenside rook
      if (this.isCastlingPossible({row, col: 4}, {row, col: 0})) {
        castlingPartners.push({row, col: 0});
      }
    }
    // Handle rook selection
    else if (piece.type === PieceType.ROOK && (position.col === 0 || position.col === 7)) {
      const king = this.board[row][4].piece;
      if (king?.type === PieceType.KING && !king.hasMoved) {
        if (this.isCastlingPossible({row, col: 4}, position)) {
          castlingPartners.push({row, col: 4});
        }
      }
    }

    return castlingPartners;
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

  public selectPiece(position: Position): void {
    const piece = this.board[position.row][position.col].piece;
    
    if (!piece || piece.color !== this.currentTurn || this.waitingForCoinToss) {
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
      return;
    }

    // Reset previous selection
    this.selectedPiece = position;

    // Handle piece in check
    if (this.isInCheck) {
      const validDefendingMoves = this.validDefendingMoves.filter(
        move => move.from.row === position.row && move.from.col === position.col
      );
      if (validDefendingMoves.length === 0) {
        this.validMoves = [];
        return;
      }
      this.validMoves = validDefendingMoves.map(move => move.to);
      return;
    }

    // Just get normal moves - don't add castling partners
    this.validMoves = this.getValidMovesForPiece(position);
  }

  public movePiece(from: Position, to: Position): boolean {
    const fromPiece = this.board[from.row][from.col].piece;
    if (!fromPiece || fromPiece.color !== this.currentTurn || this.waitingForCoinToss) {
        return false;
    }

    // Check for castling
    const castlingPartners = this.getCastlingPartners(from);
    const isCastlingMove = castlingPartners.some(
        partner => partner.row === to.row && partner.col === to.col
    );

    if (isCastlingMove) {
        return this.performCastling(
            fromPiece.type === PieceType.KING ? from : to,
            fromPiece.type === PieceType.KING ? to : from
        );
    }

    const validMoves = this.getValidMovesForPiece(from);
    const isValidMove = validMoves.some(move => move.row === to.row && move.col === to.col);
    
    if (!isValidMove) return false;

    const targetPiece = this.board[to.row][to.col].piece;
    let capturedPiece = targetPiece;

    if (fromPiece.type === PieceType.PAWN && this.isEnPassantPossible(from, to)) {
        capturedPiece = this.board[from.row][to.col].piece;
        this.board[from.row][to.col].piece = null;
    }

    if (capturedPiece) {
        if (fromPiece.color === PlayerColor.WHITE) {
            this.capturedByWhite.push({ ...capturedPiece });
        } else {
            this.capturedByBlack.push({ ...capturedPiece });
        }
    }

    this.lastMove = {
        from: { ...from },
        to: { ...to },
        piece: { ...fromPiece }
    };

    // Déplacer la pièce sur la nouvelle position
    this.board[to.row][to.col].piece = { ...fromPiece, hasMoved: true };
    this.board[from.row][from.col].piece = null;

    // Vérifier si un pion doit être promu en reine
    if (fromPiece.type === PieceType.PAWN) {
        const isLastRank = (fromPiece.color === PlayerColor.WHITE && to.row === 0) ||
                          (fromPiece.color === PlayerColor.BLACK && to.row === 7);
        
        if (isLastRank) {
            // Promouvoir automatiquement en reine
            this.board[to.row][to.col].piece = {
                type: PieceType.QUEEN,
                color: fromPiece.color,
                hasMoved: true
            };
        }
    }

    this.handlePostMove();
    return true;
}

private handlePostMove(): void {
  this.selectedPiece = null;
  this.validMoves = [];
  this.blockedMoves = [];

  const opponentColor = this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;

  // Logic for checkmate, stalemate, or transitioning turns
  if (this.isSquareUnderAttack(this.findKingPosition(opponentColor, this.board), this.currentTurn, this.board)) {
    this.isInCheck = opponentColor;
    this.findDefendingMoves();

    if (this.validDefendingMoves.length === 0) {
      this.isCheckmate = opponentColor;
      this.gameOver = true;
      this.winner = this.currentTurn;
      this.gameOverReason = 'checkmate';
      return;
    }

    this.currentTurn = opponentColor;
    this.waitingForCoinToss = false;
    this.canTossCoin = false;
  } else {
    this.isInCheck = null;

    if (this.initialTurnsRemaining > 0) {
      this.initialTurnsRemaining--;
      this.currentTurn = opponentColor;
      this.waitingForCoinToss = false;
      this.canTossCoin = false;

      if (this.initialTurnsRemaining === 0) {
        this.currentTurn = PlayerColor.BLACK;
        this.waitingForCoinToss = true;
        this.canTossCoin = true;
      }
    } else {
      const playerWhoPlayed = this.currentTurn;
      this.resetCoinTossForPlayer(playerWhoPlayed);

      this.waitingForCoinToss = true;
      this.canTossCoin = true;
    }
  }
}


public resetCoinTossForPlayer(player: PlayerColor): void {
  if (player === PlayerColor.WHITE || player === PlayerColor.BLACK) {
    this.waitingForCoinToss = false;
    this.canTossCoin = false;
  }
}



private isStaleCheckForPlayer(color: PlayerColor): boolean {
  // Si le roi est en échec, ce n'est pas un pat
  const kingPos = this.findKingPosition(color, this.board);
  const opponentColor = color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
  
  if (this.isSquareUnderAttack(kingPos, opponentColor, this.board)) {
    return false;
  }

  // Vérifie si le joueur a des mouvements légaux disponibles
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = this.board[row][col].piece;
      if (piece && piece.color === color) {
        const moves = this.getValidMovesForPiece({ row, col });
        if (moves.length > 0) {
          return false;  // Le joueur a au moins un mouvement légal
        }
      }
    }
  }

  // Si aucun mouvement légal n'est trouvé, c'est un pat
  return true;
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
            board
          );
          
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

  private getValidMovesForPiece(position: Position): ValidMoves {
    const piece = this.board[position.row][position.col].piece;
    if (!piece) return [];

    const rawMoves = this.calculateRawMovesByPieceType(position, piece.type);
    
    if (this.isInCheck && piece.color === this.currentTurn) {
      return rawMoves.filter(move => {
        const tempBoard = this.cloneBoard();
        tempBoard[move.row][move.col].piece = tempBoard[position.row][position.col].piece;
        tempBoard[position.row][position.col].piece = null;
        
        const kingPos = piece.type === PieceType.KING ? 
          move : 
          this.findKingPosition(piece.color, tempBoard);
        
        const opponentColor = piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
        const wouldStillBeInCheck = this.isSquareUnderAttack(kingPos, opponentColor, tempBoard);
        
        return !wouldStillBeInCheck;
      });
    }
    
    return rawMoves.filter(move => {
      const tempBoard = this.cloneBoard();
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
              
            const opponentColor = this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
            const stillInCheck = this.isSquareUnderAttack(kingPos, opponentColor, tempBoard);
    
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
          gameType: 'coinToss' as GameType,
          remainingMoves: 1,
          waitingForCoinToss: this.waitingForCoinToss,
          waitingForDiceRoll: false,
          capturedByWhite: [...this.capturedByWhite],
          capturedByBlack: [...this.capturedByBlack],
          castlingPartners: this.selectedPiece ? this.getCastlingPartners(this.selectedPiece) : [],
          initialTurnsRemaining: this.initialTurnsRemaining,
          canTossCoin: this.canTossCoin,
          canRollDice: false,
        };
      }

        
    public tossCoin(result: PlayerColor): CoinToss {
      if (!this.waitingForCoinToss || !this.canTossCoin) {
          return { result: this.currentTurn };
      }
  
      // Assign the result of the coin toss
      this.currentTurn = result;
  
      // Enable the player to make their move
      this.waitingForCoinToss = false;
      this.canTossCoin = false;
  
      // Reset the opponent's coin toss state
      const opponent = this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      this.resetCoinTossForPlayer(opponent);
  
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
            this.capturedByWhite = [];
            this.capturedByBlack = [];
            this.validDefendingMoves = [];
            this.gameOver = false;
            this.winner = null;
            this.gameOverReason = null;
            this.isStalemate = false;
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
          }
        }