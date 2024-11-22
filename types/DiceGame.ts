// DiceGame.ts
import { GameState, PlayerColor } from './Chess';

export interface DiceRoll {
    value: number;         // La valeur du dé (1-6)
    moves: number;         // Nombre de mouvements accordés
    player: PlayerColor;   // Le joueur qui peut jouer
}

export interface DiceGameState extends GameState {
    remainingMoves: number;
    lastRoll: DiceRoll | null;
    waitingForRoll: boolean;
}