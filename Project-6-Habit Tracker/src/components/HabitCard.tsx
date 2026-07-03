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
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../lib/habits/types';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../hooks/use-habits';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (id: string, dateStr?: string) => void;
  index?: number;
  dateStr?: string;
}

export default function HabitCard({ habit, onToggleComplete, index = 0, dateStr }: HabitCardProps) {
  const { T } = useTheme();
  const { useStreakShield } = useHabits();
  const targetDate = dateStr || getLocalDateString();
  const isCompleted = habit.completedDates.includes(targetDate);
  const isShielded = habit.shieldedDates?.includes(targetDate) || false;
  const shieldsLeft = habit.streakShields ?? 0;
  const activeStreak = getActiveStreak(habit);

  const catEmojis = { health: '🌿', work: '💼', mind: '🧠', body: '🏃', other: '🌟' };
  const catLabels = { health: 'Health', work: 'Work', mind: 'Mind', body: 'Body', other: 'Other' };
  const cat = habit.category || 'other';

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
          {isShielded && (
            <View style={[styles.glowOverlay, { backgroundColor: T.orangeDim }]} />
          )}

          {/* Left accent bar */}
          <View style={[styles.accentBar, { backgroundColor: isCompleted ? T.green : isShielded ? T.orange : T.teal }]} />

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
            
            <View style={styles.badgeRow}>
              <Text style={[styles.freq, { color: T.textMuted }]} numberOfLines={1}>
                {formatFreq()}
              </Text>
              <View style={[styles.catBadge, { backgroundColor: T.border }]}>
                <Text style={[styles.catBadgeText, { color: T.textSub }]}>
                  {catEmojis[cat]} {catLabels[cat]}
                </Text>
              </View>
            </View>

            {activeStreak > 0 && (
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={12} color="#F59E0B" />
                <Text style={[styles.streakText, { color: '#F59E0B' }]}>{activeStreak}d streak</Text>
              </View>
            )}
          </View>

          {/* Check button / Shield */}
          {isShielded ? (
            <View style={{ marginRight: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="shield-checkmark" size={14} color={T.orange} />
              <Text style={[styles.shieldText, { color: T.orange }]}>Shielded</Text>
            </View>
          ) : isCompleted ? (
            <Pressable onPress={handleCheck} hitSlop={14}>
              <Animated.View style={[
                styles.checkBtn,
                { backgroundColor: T.teal, shadowColor: T.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
                checkStyle,
              ]}>
                <Ionicons name="checkmark" size={20} color={T.bg} style={{ fontWeight: 'bold' }} />
              </Animated.View>
            </Pressable>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {shieldsLeft > 0 && targetDate !== getLocalDateString() && (
                <Pressable onPress={() => useStreakShield(habit.id, targetDate)} style={[T.neo, styles.shieldBtn]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="shield-outline" size={10} color={T.orange} />
                    <Text style={[styles.shieldBtnText, { color: T.orange }]}>Shield</Text>
                  </View>
                </Pressable>
              )}
              <Pressable onPress={handleCheck} hitSlop={14}>
                <Animated.View style={[
                  styles.checkBtn,
                  [T.neo, styles.checkBtnEmpty],
                  checkStyle,
                ]}>
                  <View style={[styles.checkDot, { backgroundColor: T.teal }]} />
                </Animated.View>
              </Pressable>
            </View>
          )}
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
  freq:      { fontSize: 11, letterSpacing: 0.2 },
  badgeRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  catBadge:  { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, justifyContent: 'center' },
  catBadgeText: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase' },
  shieldBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  shieldBtnText: { fontSize: 9, fontWeight: '800' },
  shieldText: { fontSize: 10, fontWeight: '800', fontStyle: 'italic' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fireEmoji: { fontSize: 11 },
  streakText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  checkBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  checkBtnEmpty: { borderRadius: 19 },
  checkMark: { fontSize: 18, fontWeight: '900' },
  checkDot:  { width: 10, height: 10, borderRadius: 5, opacity: 0.5 },
});
