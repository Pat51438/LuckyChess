import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { PlayerColor } from '../types/Chess';

interface UserImgProps {
  color: PlayerColor;
  size?: number;
  flagUri?: string; // URL or resource for the country flag
}

const UserComponent: React.FC<UserImgProps> = ({ color, size = 64, flagUri }) => {
  return (
    <View style={styles.wrapper}>
      {/* User Circle */}
      <View
        style={[
          styles.circleContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color === PlayerColor.WHITE ? '#FFF' : '#000',
          },
        ]}
      />
      {/* Flag */}
      <View style={styles.flagContainer}>
        {flagUri ? (
          <Image
            source={{ uri: flagUri }}
            style={styles.flagImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderFlag} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', // Places the circle and flag side by side
    alignItems: 'center',
    gap: 10, // Adds spacing between the circle and flag
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    overflow: 'hidden',
  },
  flagContainer: {
    width: 50, // Flag width
    height: 30, // Flag height, giving it the shape of a flag
    borderRadius: 2, // Optional rounded edges for the flag
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#DDD', // Placeholder background color for the flag
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  placeholderFlag: {
    width: '100%',
    height: '100%',
    backgroundColor: '#CCC', // Placeholder gray color
  },
});

export default UserComponent;
