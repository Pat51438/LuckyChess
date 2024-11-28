// Background.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PurplePatternBackgroundProps {
  children: ReactNode;
}

const PurplePatternBackground: React.FC<PurplePatternBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgb(74, 20, 140)', 'rgb(106, 27, 154)']}
        style={styles.gradient}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'transparent']}
          style={styles.topOverlay}
        />
        <View style={styles.content}>{children}</View>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)']}
          style={styles.bottomOverlay}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 128,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 128,
  },
  content: {
    flex: 1,
  },
});

export default PurplePatternBackground;