import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen1() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>HabitFlow</Text>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="leaf-outline" size={72} color="#5EEAD4" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.textContainer}>
          <Text style={styles.title}>🌱 Build Better{"\n"}Habits</Text>
          <Text style={styles.subtitle}>
            Small actions every single day create massive results over time.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
          onPress={() => router.push('/onboarding/screen2')}
        >
          <Text style={styles.buttonText}>Get Started →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5EEAD4',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(94, 234, 212, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.1)',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  footer: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#151A22',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#5EEAD4',
    borderColor: '#5EEAD4',
  },
  button: {
    backgroundColor: '#151A22',
    borderColor: 'rgba(94, 234, 212, 0.3)',
    borderWidth: 1,
    width: '100%',
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#5EEAD4',
    fontSize: 16,
    fontWeight: '700',
  },
});
