// CoinTossGame.ts
import { GameState, PlayerColor } from './Chess';

export interface CoinToss {
    result: PlayerColor;   // Le joueur qui peut jouer
}

export interface CoinTossGameState extends GameState {
    waitingForToss: boolean;
    lastTossResult: CoinToss | null;
}