import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ onGetStarted }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={styles.container}>
      {/* Decorative Circles for Orange/Yellow Mix */}
      <View style={styles.topCircle} />
      <View style={styles.bottomCircle} />

      <View style={styles.content}>
        <Text style={styles.brand}>Wordsy</Text>
        
        <View style={styles.illustrationContainer}>
          <View style={styles.innerCircle} />
          <Ionicons name="journal" size={isTablet ? 180 : 140} color="#FFFFFF" />
          <View style={styles.penIcon}>
            <Ionicons name="pencil" size={isTablet ? 60 : 45} color="#FF8C00" />
          </View>
        </View>

        <View style={styles.textGroup}>
          <Text style={styles.title}>All your ideas</Text>
          <View style={styles.highlightPill}>
            <Text style={styles.highlightText}>in one place</Text>
          </View>
          
          <Text style={styles.subtitle}>
            Organize your thoughts, capture inspiration, and keep your notes clean and simple.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onGetStarted}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]}
      >
        <Text style={styles.buttonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={18} color="#FF8C00" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF8C00', // Vibrant Orange
    padding: 24,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  topCircle: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFD700', // Yellow
    opacity: 0.4,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#FFD700', // Yellow
    opacity: 0.3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  brand: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 50,
  },
  illustrationContainer: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  innerCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 215, 0, 0.4)', // Translucent Yellow
  },
  penIcon: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    transform: [{ rotate: '-15deg' }],
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  textGroup: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  highlightPill: {
    backgroundColor: '#FFD700', // Yellow Pill
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  highlightText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  button: {
    backgroundColor: '#FFFFFF', // White Button
    height: 64,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
    zIndex: 2,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FF8C00', // Orange Text
    fontSize: 18,
    fontWeight: '700',
  },
});
