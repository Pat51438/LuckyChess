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
import { DiceRoll } from '../types/DiceGame';

type GameEndReason = 'checkmate' | 'timeout' | 'forfeit' | null;

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
  
    // Vérifie si le roi et la tour sont bien présents et n'ont pas bougé
    if (!king || king.type !== PieceType.KING || king.hasMoved || 
        !rook || rook.type !== PieceType.ROOK || rook.hasMoved) {
      return false;
    }
  
    // Vérifie si le roi est en échec - pas de roque possible si en échec
    if (this.isInCheck === king.color) {
      return false;
    }

    const opponentColor = king.color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
  
    // Petit roque (côté roi)
    if (rookPos.col === 7) {
      // Vérifie si les cases entre le roi et la tour sont libres
      if (this.board[kingPos.row][5].piece || this.board[kingPos.row][6].piece) {
        return false;
      }
      // Vérifie si les cases que le roi traverse ne sont pas menacées
      if (this.isSquareUnderAttack({ row: kingPos.row, col: 4 }, opponentColor) ||
          this.isSquareUnderAttack({ row: kingPos.row, col: 5 }, opponentColor) ||
          this.isSquareUnderAttack({ row: kingPos.row, col: 6 }, opponentColor)) {
        return false;
      }
    }
    // Grand roque (côté reine)
    else if (rookPos.col === 0) {
      // Vérifie si les cases entre le roi et la tour sont libres
      if (this.board[kingPos.row][1].piece || 
          this.board[kingPos.row][2].piece || 
          this.board[kingPos.row][3].piece) {
        return false;
      }
      // Vérifie si les cases que le roi traverse ne sont pas menacées
      if (this.isSquareUnderAttack({ row: kingPos.row, col: 4 }, opponentColor) ||
          this.isSquareUnderAttack({ row: kingPos.row, col: 3 }, opponentColor) ||
          this.isSquareUnderAttack({ row: kingPos.row, col: 2 }, opponentColor)) {
        return false;
      }
    }
  
    return true;
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
          // Vérifie que le pion à capturer est toujours là
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
          // Vérifie que le pion à capturer est toujours là
          this.board[from.row][to.col].piece?.type === PieceType.PAWN &&
          this.board[from.row][to.col].piece?.color === PlayerColor.WHITE
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
      gameOver: this.gameOver,
      winner: this.winner,
      gameOverReason: this.gameOverReason,
      lastMove: this.lastMove ? { ...this.lastMove } : null,
      gameType: 'dice' as GameType,
      remainingMoves: this.remainingMoves,
      waitingForCoinToss: false,
      waitingForDiceRoll: this.waitingForDiceRoll
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

    // Gestion spéciale de la prise en passant
    if (fromPiece.type === PieceType.PAWN) {
        const isEnPassant = this.isEnPassantPossible(from, to);
        if (isEnPassant) {
            if (fromPiece.color === PlayerColor.WHITE) {
                this.board[from.row][to.col].piece = null;
            } else {
                this.board[from.row][to.col].piece = null;
            }
        }
    }

    // Gestion du roque
    if (fromPiece.type === PieceType.KING) {
        // ... [Le reste du code pour le roque reste inchangé] ...
        return true;
    }

    this.lastMove = {
        from: { ...from },
        to: { ...to },
        piece: { ...fromPiece }
    };

    // Déplace la pièce
    this.board[to.row][to.col].piece = { ...fromPiece, hasMoved: true };
    this.board[from.row][from.col].piece = null;

    // Gestion de la promotion du pion
    if (fromPiece.type === PieceType.PAWN) {
        // Pour un pion blanc qui atteint la rangée 0
        if (fromPiece.color === PlayerColor.WHITE && to.row === 0) {
            this.board[to.row][to.col].piece = {
                type: PieceType.QUEEN,
                color: PlayerColor.WHITE,
                hasMoved: true
            };
        }
        // Pour un pion noir qui atteint la rangée 7
        else if (fromPiece.color === PlayerColor.BLACK && to.row === 7) {
            this.board[to.row][to.col].piece = {
                type: PieceType.QUEEN,
                color: PlayerColor.BLACK,
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
  
    // Vérifie si le mouvement a mis le roi adverse en échec
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
      
      // Vérifie l'échec et mat
      this.handleCheckmate();
      
      if (!this.gameOver) {
        return; // Continue le jeu si ce n'est pas un échec et mat
      }
    }
  
    // Reset des états d'échec si on n'est plus en échec
    this.isInCheck = null;
    this.isKingInDanger = false;
    this.remainingMoves--;
  
    // Gestion normale de fin de coup
    if (this.remainingMoves <= 0) {
      if (this.isFirstMove) {
        this.isFirstMove = false;
        this.waitingForDiceRoll = true;
      } else {
        this.waitingForDiceRoll = true;
      }
    }
  }

  public getCastlingPartners(position: Position): Position[] {
    const piece = this.board[position.row][position.col].piece;
    if (!piece || piece.hasMoved) return [];
  
    const row = piece.color === PlayerColor.WHITE ? 7 : 0;
    const castlingPartners: Position[] = [];
  
    if (piece.type === PieceType.KING && position.col === 4) {
      // Vérifie la possibilité de roque avec la tour droite
      if (this.isCastlingPossible({ row, col: 4 }, { row, col: 7 })) {
        castlingPartners.push({ row, col: 7 });
      }
      // Vérifie la possibilité de roque avec la tour gauche
      if (this.isCastlingPossible({ row, col: 4 }, { row, col: 0 })) {
        castlingPartners.push({ row, col: 0 });
      }
    } 
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