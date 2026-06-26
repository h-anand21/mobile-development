import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Habit } from '../lib/habits/types';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';
import { useTheme } from '../context/ThemeContext';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (id: string, dateStr?: string) => void;
  index?: number;
  dateStr?: string;
}

export default function HabitCard({ habit, onToggleComplete, index = 0, dateStr }: HabitCardProps) {
  const { T } = useTheme();
  const targetDate = dateStr || getLocalDateString();
  const isCompleted = habit.completedDates.includes(targetDate);
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

  // Animations
  const cardScale  = useSharedValue(1);
  const emojiScale = useSharedValue(1);
  const checkScale = useSharedValue(1);

  const cardStyle  = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));
  const emojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: emojiScale.value }] }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const handleCheck = (e: any) => {
    e.preventDefault();
    checkScale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );
    emojiScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    onToggleComplete(habit.id, targetDate);
  };

  return (
    <Link href={`/habit/${habit.id}`} asChild>
      <Pressable
        onPressIn={() => { cardScale.value = withSpring(0.97, { damping: 18, stiffness: 300 }); }}
        onPressOut={() => { cardScale.value = withSpring(1, { damping: 14, stiffness: 200 }); }}
      >
        <Animated.View style={[T.neo, styles.card, cardStyle]}>
          {/* Completed glow overlay */}
          {isCompleted && (
            <View style={[styles.glowOverlay, { backgroundColor: T.greenDim }]} />
          )}

          {/* Left accent bar */}
          <View style={[styles.accentBar, { backgroundColor: isCompleted ? T.green : T.teal }]} />

          {/* Emoji */}
          <Animated.View style={[T.neo, styles.emojiBox, emojiStyle]}>
            <Text style={styles.emojiText}>{habit.emoji}</Text>
          </Animated.View>

          {/* Details */}
          <View style={styles.details}>
            <Text style={[styles.name, { color: isCompleted ? T.textMuted : T.textPrimary },
              isCompleted && styles.nameDone]} numberOfLines={1}>
              {habit.name}
            </Text>
            <Text style={[styles.freq, { color: T.textMuted }]} numberOfLines={1}>
              {formatFreq()}
            </Text>
            {activeStreak > 0 && (
              <View style={styles.streakRow}>
                <Text style={styles.fireEmoji}>🔥</Text>
                <Text style={[styles.streakText, { color: '#F59E0B' }]}>{activeStreak}d streak</Text>
              </View>
            )}
          </View>

          {/* Check button */}
          <Pressable onPress={handleCheck} hitSlop={14}>
            <Animated.View style={[
              styles.checkBtn,
              isCompleted
                ? { backgroundColor: T.teal, shadowColor: T.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }
                : [T.neo, styles.checkBtnEmpty],
              checkStyle,
            ]}>
              {isCompleted
                ? <Text style={[styles.checkMark, { color: T.bg }]}>✓</Text>
                : <View style={[styles.checkDot, { backgroundColor: T.teal }]} />
              }
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 11,
    padding: 14,
    paddingLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  accentBar: {
    width: 3, height: 44, borderRadius: 3, marginRight: 14,
  },
  emojiBox: {
    width: 50, height: 50, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  emojiText: { fontSize: 24 },
  details:   { flex: 1, marginRight: 10 },
  name:      { fontSize: 15, fontWeight: '700', marginBottom: 3, letterSpacing: 0.1 },
  nameDone:  { textDecorationLine: 'line-through' },
  freq:      { fontSize: 11, marginBottom: 5, letterSpacing: 0.2 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fireEmoji: { fontSize: 11 },
  streakText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  checkBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  checkBtnEmpty: { borderRadius: 19 },
  checkMark: { fontSize: 18, fontWeight: '900' },
  checkDot:  { width: 10, height: 10, borderRadius: 5, opacity: 0.5 },
});
