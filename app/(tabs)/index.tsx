// app/(tabs)/index.tsx
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import Board from '@/components/Board';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Board />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});