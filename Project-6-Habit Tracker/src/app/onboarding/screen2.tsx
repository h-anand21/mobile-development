import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen2() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>HabitFlow</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          {/* Animated Float Notification Cards */}
          <Animated.View 
            entering={FadeInUp.duration(500).delay(200)} 
            style={[styles.floatingCard, styles.floatCard1]}
          >
            <Text style={styles.floatEmoji}>💧</Text>
            <View style={styles.floatTextContainer}>
              <Text style={styles.floatTitle}>Drink Water</Text>
              <Text style={styles.floatSubtitle}>Reminder: Log 250ml now.</Text>
            </View>
            <Text style={styles.floatTime}>08:00 AM</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(500).delay(400)} 
            style={[styles.floatingCard, styles.floatCard2]}
          >
            <Text style={styles.floatEmoji}>📖</Text>
            <View style={styles.floatTextContainer}>
              <Text style={styles.floatTitle}>Read Book</Text>
              <Text style={styles.floatSubtitle}>Time to finish chapter 4.</Text>
            </View>
            <Text style={styles.floatTime}>09:00 PM</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.duration(500).delay(600)} 
            style={[styles.floatingCard, styles.floatCard3]}
          >
            <Text style={styles.floatEmoji}>💪</Text>
            <View style={styles.floatTextContainer}>
              <Text style={styles.floatTitle}>Workout</Text>
              <Text style={styles.floatSubtitle}>Don't miss today's stretch!</Text>
            </View>
            <Text style={styles.floatTime}>06:00 PM</Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.textContainer}>
          <Text style={styles.title}>⏰ Never Miss{"\n"}A Habit</Text>
          <Text style={styles.subtitle}>
            Smart reminders help you stay consistent and build routines that stick.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
          onPress={() => router.push('/onboarding/screen3')}
        >
          <Text style={styles.buttonText}>Continue →</Text>
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
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  floatingCard: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.1)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    position: 'absolute',
  },
  floatCard1: {
    top: 10,
    transform: [{ rotate: '-2deg' }],
  },
  floatCard2: {
    top: 75,
    transform: [{ scale: 1.03 }, { rotate: '1deg' }],
    borderColor: 'rgba(94, 234, 212, 0.2)',
    backgroundColor: '#19202a',
    zIndex: 2,
  },
  floatCard3: {
    top: 140,
    transform: [{ rotate: '-1deg' }],
  },
  floatEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  floatTextContainer: {
    flex: 1,
  },
  floatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  floatSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  floatTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5EEAD4',
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
