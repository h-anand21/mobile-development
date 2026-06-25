import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import Animated, {
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Habit } from '../lib/habits/types';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';
import { C, NEO_BG, neoCard, neoCardPressed, neoBtn } from '../constants/colors';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (id: string) => void;
  index?: number;
}

export default function HabitCard({ habit, onToggleComplete, index = 0 }: HabitCardProps) {
  const today = getLocalDateString();
  const isCompletedToday = habit.lastCompletedISO === today;
  const activeStreak = getActiveStreak(habit);

  const formatTime = (hour: number, minute: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    const m = String(minute).padStart(2, '0');
    return `${h}:${m} ${ampm}`;
  };

  const formatFreq = () => {
    if (habit.frequency.kind === 'daily') {
      return `Daily  ·  ${formatTime(habit.frequency.hour, habit.frequency.minute)}`;
    }
    const d = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return `${habit.frequency.weekdays.map(w => d[w]).join(' · ')}  ·  ${formatTime(habit.frequency.hour, habit.frequency.minute)}`;
  };

  // -- Animations --
  const cardScale    = useSharedValue(1);
  const emojiScale   = useSharedValue(1);
  const checkScale   = useSharedValue(1);
  const glowOpacity  = useSharedValue(isCompletedToday ? 1 : 0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    cardScale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 200 });
  };

  const handleCheck = (e: any) => {
    e.preventDefault();
    // Bounce animation
    checkScale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );
    emojiScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    glowOpacity.value = withTiming(isCompletedToday ? 0 : 1, { duration: 300 });
    onToggleComplete(habit.id);
  };

  return (
    <Link href={`/habit/${habit.id}`} asChild>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          entering={FadeInLeft.delay(index * 70).duration(400).springify().damping(16)}
          style={[styles.card, cardStyle]}
        >
          {/* Completed glow overlay */}
          <Animated.View style={[styles.glowOverlay, glowStyle]} />

          {/* Left color accent strip */}
          <View style={[styles.accentStrip, {
            backgroundColor: isCompletedToday ? C.green : C.teal,
          }]} />

          {/* Emoji Container — neumorphic pill */}
          <Animated.View style={[styles.emojiContainer, emojiStyle]}>
            <View style={styles.emojiNeo}>
              <Text style={styles.emojiText}>{habit.emoji}</Text>
            </View>
          </Animated.View>

          {/* Details */}
          <View style={styles.details}>
            <Text
              style={[styles.name, isCompletedToday && styles.nameDone]}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
            <Text style={styles.freq} numberOfLines={1}>{formatFreq()}</Text>
            {activeStreak > 0 && (
              <View style={styles.streakRow}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{activeStreak} day streak</Text>
              </View>
            )}
          </View>

          {/* Check Button — neumorphic circle */}
          <Pressable
            onPress={handleCheck}
            hitSlop={14}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <Animated.View style={[
              styles.checkBtn,
              isCompletedToday ? styles.checkBtnDone : styles.checkBtnPending,
              checkStyle,
            ]}>
              {isCompletedToday ? (
                <Text style={styles.checkMark}>✓</Text>
              ) : (
                <View style={styles.checkInner} />
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    ...neoCard,
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    paddingLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(94, 234, 135, 0.04)',
    borderRadius: 22,
  },
  accentStrip: {
    width: 3,
    height: 44,
    borderRadius: 3,
    marginRight: 14,
  },

  // Emoji — neumorphic round container
  emojiContainer: {
    marginRight: 14,
  },
  emojiNeo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: NEO_BG,
    alignItems: 'center',
    justifyContent: 'center',
    // Neumorphic extruded
    shadowColor: '#070F1C',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderLeftColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.5)',
    borderRightColor: 'rgba(0,0,0,0.5)',
  },
  emojiText: {
    fontSize: 26,
  },

  details: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  nameDone: {
    textDecorationLine: 'line-through',
    color: C.textMuted,
  },
  freq: {
    fontSize: 11,
    color: C.textSub,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.2,
  },

  // Check button — neumorphic circle
  checkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  checkBtnPending: {
    ...neoBtn,
    borderRadius: 20,
  },
  checkBtnDone: {
    backgroundColor: C.teal,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0,
  },
  checkMark: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A1628',
  },
  checkInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.teal,
    opacity: 0.3,
  },
});
