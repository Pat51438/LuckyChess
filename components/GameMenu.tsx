import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import PurplePatternBackground from './Background';

interface GameMenuProps {
  onSelectGame: (gameType: "dice" | "coinToss") => void;
}

interface ButtonProps {
  gameType: "dice" | "coinToss";
  gradient: readonly [string, string];
  icon: ImageSourcePropType;
  text: string;
}

const { width } = Dimensions.get("window");
const buttonWidth = Math.min(width * 0.9, 350);
const BUTTON_HEIGHT = 80;
const BUTTON_RADIUS = 16;

const GameMenu: React.FC<GameMenuProps> = ({ onSelectGame }) => {
  const Button: React.FC<ButtonProps> = ({ gameType, gradient, icon, text }) => (
    <TouchableOpacity 
      style={styles.buttonWrapper}
      onPress={() => onSelectGame(gameType)}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <View style={styles.innerShadow} />
        <Image source={icon} style={styles.icon} />
        <Text style={styles.text}>{text}</Text>
        <LinearGradient
          colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
          locations={[0, 0.5]}
          style={styles.gloss}
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <PurplePatternBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>LUCKY CHESS GAME</Text>
          <Text style={styles.subtitle}>
            New, creative ways to blend randomness into exciting chess experiences
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <Button 
            gameType="dice"
            gradient={['#a855f7', '#7c3aed'] as const}
            icon={require("../assets/images/dice-icon.png")}
            text="Dice Chess"
          />
          <Button 
            gameType="coinToss"
            gradient={['#4ade80', '#0d9488'] as const}
            icon={require("../assets/images/coin-icon.png")}
            text="Coin Chess"
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton}>
            <Image 
              source={require("../assets/images/leaderboard-icon.png")}
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.footerButtonText}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Image 
              source={require("../assets/images/settings-icon.png")}
              style={{ width: 20, height: 20 }}
            />
            <Text style={styles.footerButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PurplePatternBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 32,
    fontFamily: "Impact",
    letterSpacing: 1.5,
    color: "white",
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    color: "#d1c4e9",
    textAlign: "center",
    marginTop: -5,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  buttonsContainer: {
    alignItems: 'center',
    gap: 20,
  },
  buttonWrapper: {
    width: buttonWidth,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: BUTTON_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BUTTON_RADIUS,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: BUTTON_RADIUS,
    borderTopRightRadius: BUTTON_RADIUS,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 16,
  },
  text: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: buttonWidth,
    alignSelf: 'center',
    marginBottom: 30,
    gap: 20,
  },
  footerButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  footerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default GameMenu;