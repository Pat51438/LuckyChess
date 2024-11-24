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
  GameEndReason  // Importez le type depuis Chess.ts
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
  private gameOverReason: GameEndReason;  // Utilisez le type importé
  private isStalemate: boolean = false;
  private capturedByWhite: Piece[] = [];
  private capturedByBlack: Piece[] = []; 
  

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
    // Vérifie si le roi du joueur courant est en échec
    const currentKingPos = this.findKingPosition(this.currentTurn, this.board);
    const opponentColor = this.currentTurn === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    
    this.isKingInDanger = this.isSquareUnderAttack(currentKingPos, opponentColor, this.board);
    
    if (this.isKingInDanger) {
      // Trouve toutes les pièces qui peuvent défendre le roi
      this.findDefendingMoves();
      
      // Vérifie l'échec et mat
      if (this.validDefendingMoves.length === 0) {
        this.isCheckmate = this.currentTurn;
        this.gameOver = true;
      }
    }
  }

  private handleCheckmate(): void {
    if (this.isInCheck) {
      const checkedColor = this.isInCheck;
      let hasValidMove = false;

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.board[row][col].piece;
          if (piece && piece.color === checkedColor) {
            const moves = this.getValidMovesForPiece({ row, col });
            if (moves.length > 0) {
              hasValidMove = true;
              break;
            }
          }
        }
        if (hasValidMove) break;
      }

      if (!hasValidMove) {
        this.isCheckmate = checkedColor;
        this.gameOver = true;
        this.winner = checkedColor === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
        this.gameOverReason = 'checkmate';
      }
    }
  }

  private isStaleCheckForPlayer(color: PlayerColor): boolean {
    // Vérifie si le joueur n'est pas en échec
    const kingPos = this.findKingPosition(color, this.board);
    const opponentColor = color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    
    if (this.isSquareUnderAttack(kingPos, opponentColor, this.board)) {
      return false;  // Si le roi est en échec, ce n'est pas un pat
    }
  
    // Vérifie si le joueur a des mouvements légaux disponibles
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col].piece;
        if (piece && piece.color === color) {
          const moves = this.getValidMovesForPiece({ row, col });
          if (moves.length > 0) {
            return false;  // Si un mouvement est possible, ce n'est pas un pat
          }
        }
      }
    }
  
    // Si aucun mouvement n'est possible et le roi n'est pas en échec, c'est un pat
    return true;
  }

  private findDefendingMoves(): void {
    this.validDefendingMoves = [];
    
    // Parcourt toutes les pièces du joueur courant
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col].piece;
        if (piece && piece.color === this.currentTurn) {
          // Calcule tous les mouvements possibles pour cette pièce
          const moves = this.calculateRawMovesByPieceType({ row, col }, piece.type);
          
          // Vérifie chaque mouvement pour voir s'il protège le roi
          for (const move of moves) {
            const tempBoard = this.cloneBoard();
            // Simule le mouvement
            tempBoard[move.row][move.col].piece = { ...piece };
            tempBoard[row][col].piece = null;
            
            // Vérifie si le roi est toujours en échec après ce mouvement
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
    
    // Vérifie si c'est un mouvement diagonal
    if (Math.abs(to.col - from.col) !== 1) return false;
    
    // Doit avoir un dernier mouvement
    if (!this.lastMove) return false;
  
    const lastPiece = this.lastMove.piece;
    
    // Pour les blancs (qui montent)
    if (piece.color === PlayerColor.WHITE) {
      return (
        from.row === 3 && // Le pion blanc doit être sur la 5e rangée
        to.row === 2 && // Doit monter d'une rangée
        lastPiece.type === PieceType.PAWN &&
        lastPiece.color === PlayerColor.BLACK &&
        this.lastMove.from.row === 1 &&
        this.lastMove.to.row === 3 &&
        this.lastMove.to.col === to.col &&
        this.board[from.row][to.col].piece?.type === PieceType.PAWN &&
        this.board[from.row][to.col].piece?.color === PlayerColor.BLACK
      );
    } 
    // Pour les noirs (qui descendent)
    else {
      return (
        from.row === 4 && // Le pion noir doit être sur la 4e rangée
        to.row === 5 && // Doit descendre d'une rangée
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

  // Mouvement normal vers l'avant
  if (this.isValidPosition(position.row + direction, position.col) &&
      !board[position.row + direction][position.col].piece) {
    validMoves.push({ row: position.row + direction, col: position.col });

    // Double mouvement initial
    if (position.row === startRow &&
        this.isValidPosition(position.row + 2 * direction, position.col) &&
        !board[position.row + 2 * direction][position.col].piece) {
      validMoves.push({ row: position.row + 2 * direction, col: position.col });
    }
  }

  // Captures diagonales (incluant la prise en passant)
  for (const colOffset of [-1, 1]) {
    const newRow = position.row + direction;
    const newCol = position.col + colOffset;

    if (this.isValidPosition(newRow, newCol)) {
      const targetPiece = board[newRow][newCol].piece;
      
      // Capture normale
      if (targetPiece && targetPiece.color !== piece.color) {
        validMoves.push({ row: newRow, col: newCol });
      } 
      // Prise en passant
      else if (!targetPiece && 
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
    
    // Si le roi est en échec, filtre uniquement les mouvements qui peuvent le protéger
    if (this.isKingInDanger && piece.color === this.currentTurn) {
        return rawMoves.filter(move => {
            const tempBoard = this.cloneBoard();
            const targetPiece = tempBoard[move.row][move.col].piece;
            
            // Simule le mouvement
            tempBoard[move.row][move.col].piece = tempBoard[position.row][position.col].piece;
            tempBoard[position.row][position.col].piece = null;
            
            const kingPos = piece.type === PieceType.KING ? 
                move : 
                this.findKingPosition(piece.color, tempBoard);
            
            const opponentColor = piece.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
            
            // Vérifie si le roi n'est plus en échec après ce mouvement
            const wouldStillBeInCheck = this.isSquareUnderAttack(kingPos, opponentColor, tempBoard);
            
            // Annule la simulation
            tempBoard[position.row][position.col].piece = piece;
            tempBoard[move.row][move.col].piece = targetPiece;
            
            return !wouldStillBeInCheck;
        });
    }
    
    // Pour les mouvements normaux, vérifie juste qu'ils ne mettent pas le roi en échec
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
  const capturedPieces = this.getCapturedPieces();
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
    capturedByWhite: capturedPieces.white,
    capturedByBlack: capturedPieces.black
  };
}



  public selectPiece(position: Position): void {
    const piece = this.board[position.row][position.col].piece;
    
    // Si ce n'est pas le tour du joueur ou s'il n'y a pas de pièce
    if (!piece || piece.color !== this.currentTurn) {
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
      return;
    }

    // Si le roi est en échec, ne permet que les mouvements qui peuvent le défendre
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

    // Si on n'est pas en échec et qu'on attend un lancer de dé
    if (this.waitingForDiceRoll || this.remainingMoves <= 0) {
      this.selectedPiece = null;
      this.validMoves = [];
      this.blockedMoves = [];
      return;
    }

    // Sélection normale de pièce
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
  
    // Vérifier si c'est une prise en passant
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
  
    // Gérer la capture
    if (capturedPiece) {
      if (fromPiece.color === PlayerColor.WHITE) {
        this.capturedByWhite.push({ ...capturedPiece });
      } else {
        this.capturedByBlack.push({ ...capturedPiece });
      }
    }
  
    // Effectue le mouvement
    this.board[to.row][to.col].piece = { ...fromPiece, hasMoved: true };
    this.board[from.row][from.col].piece = null;
  
    // Gestion de la promotion du pion
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
      this.findDefendingMoves();
      
      if (this.validDefendingMoves.length === 0) {
        this.isCheckmate = opponentColor;
        this.gameOver = true;
        this.winner = this.currentTurn;
        this.gameOverReason = 'checkmate';
      }
    } else {
      this.isInCheck = null;
      this.isKingInDanger = false;
      
      // Vérifier le pat
      if (this.isStaleCheckForPlayer(opponentColor)) {
        this.isStalemate = true;
        this.gameOver = true;
        this.winner = null;
        this.gameOverReason = 'stalemate';
        return;
      }
      
      // Gestion normale de fin de coup
      this.remainingMoves--;
      if (this.remainingMoves <= 0) {
        this.waitingForDiceRoll = true;
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

  // Si on sélectionne le roi
  if (piece.type === PieceType.KING && position.col === 4) {
    // Vérifie la tour droite
    if (this.isCastlingPossible({ row, col: 4 }, { row, col: 7 })) {
      castlingPartners.push({ row, col: 7 });
    }
    // Vérifie la tour gauche
    if (this.isCastlingPossible({ row, col: 4 }, { row, col: 0 })) {
      castlingPartners.push({ row, col: 0 });
    }
  }
  // Si on sélectionne une tour
  else if (piece.type === PieceType.ROOK && (position.col === 0 || position.col === 7)) {
    const king = this.board[row][4].piece;
    if (king?.type === PieceType.KING && !king.hasMoved) {
      if (this.isCastlingPossible({ row, col: 4 }, position)) {
        castlingPartners.push({ row, col: 4 });
      }
    }
  }

  return castlingPartners;
}



  

  public rollDice(value: number): DiceRoll {
    // Ne permet pas de lancer le dé si le roi est en échec
    if (this.isKingInDanger) {
      return {
        value: 0,
        moves: this.remainingMoves,
        player: this.currentTurn
      };
    }

    if (!this.waitingForDiceRoll) {
      return {
        value: 0,
        moves: this.remainingMoves,
        player: this.currentTurn
      };
    }

    let result: DiceRoll;
    switch (value) {
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

  // Nouvelle méthode pour obtenir les infos sur l'échec
  public getCheckInfo() {
    return {
      isInCheck: this.isKingInDanger,
      validDefendingMoves: this.validDefendingMoves,
      checkmate: this.isCheckmate
    };
  }
}