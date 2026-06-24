import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermissions } from '../../lib/notifications/setup';
import { useEffect } from 'react';

export default function OnboardingScreen3() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1, // infinite loops
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleFinishOnboarding = async () => {
    try {
      // 1. Request notification permissions
      await requestNotificationPermissions();
      // 2. Mark onboarding as completed
      await AsyncStorage.setItem('ONBOARDING_COMPLETED', 'true');
      // 3. Navigate to Home
      router.replace('/');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>HabitFlow</Text>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.streakCard, animatedStyle]} entering={FadeInUp.duration(600).delay(200)}>
          <View style={styles.fireCircle}>
            <Ionicons name="flame" size={60} color="#F59E0B" />
          </View>
          <Text style={styles.streakNumber}>32</Text>
          <Text style={styles.streakLabel}>Days Consistent</Text>
          
          <View style={styles.miniStatsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatVal}>92%</Text>
              <Text style={styles.miniStatLabel}>Success</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatVal}>🏆 5</Text>
              <Text style={styles.miniStatLabel}>Badges</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.textContainer}>
          <Text style={styles.title}>🔥 Track Your{"\n"}Streaks</Text>
          <Text style={styles.subtitle}>
            Stay motivated with visual streaks, completion history and consistent analytics.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
          onPress={handleFinishOnboarding}
        >
          <Text style={styles.buttonText}>Let's Flow →</Text>
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
  streakCard: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 28,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  fireCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.08)',
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5EEAD4',
    marginBottom: 2,
  },
  miniStatLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
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
