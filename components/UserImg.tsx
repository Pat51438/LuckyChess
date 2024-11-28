import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlayerColor } from '../types/Chess';

interface UserImgProps {
  color: PlayerColor;
  size?: number;
}

const UserImg: React.FC<UserImgProps> = ({ color, size = 24 }) => {
  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor: color === PlayerColor.WHITE ? '#FFF' : '#000',
        }
      ]}
    >
      {/* Future image component will go here */}
      {/* <Image source={userImage} style={styles.image} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  // Pour plus tard quand on ajoutera l'image
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default UserImg;