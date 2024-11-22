// app/(tabs)/index.tsx
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import GameMenu from '@/components/GameMenu';
import Board from '@/components/Board';
import { useState } from 'react';
import { GameType } from '@/types/Chess';

export default function HomeScreen() {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
  };

  const handleReturnToMenu = () => {
    setSelectedGame(null);
  };

  return (
    <ThemedView style={styles.container}>
      {selectedGame ? (
        <Board 
          gameType={selectedGame} 
          onReturnToMenu={handleReturnToMenu}
        />
      ) : (
        <GameMenu onSelectGame={handleGameSelect} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});