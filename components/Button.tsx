import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  onNewGame: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({ 
  onNewGame, 
  variant = 'primary',
  size = 'medium'
}) => {
  return (
    <TouchableOpacity
      onPress={onNewGame}
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        size === 'medium' && styles.mediumButton
      ]}
    >
      <Text style={styles.buttonText}>
        New game
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  mediumButton: {
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default Button;