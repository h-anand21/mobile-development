import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Habit } from '../lib/habits/types';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';
import { C } from '../constants/colors';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: (id: string) => void;
}

export default function HabitCard({ habit, onToggleComplete }: HabitCardProps) {
  const today = getLocalDateString();
  const isCompletedToday = habit.lastCompletedISO === today;
  const activeStreak = getActiveStreak(habit);

  // Format time (e.g. 08:30 -> 08:30 AM)
  const formatTime = (hour: number, minute: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = String(minute).padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  // Convert weekday numbers to short names
  const formatFrequency = () => {
    if (habit.frequency.kind === 'daily') {
      return `Daily · ${formatTime(habit.frequency.hour, habit.frequency.minute)}`;
    }
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayNames = habit.frequency.weekdays.map(d => days[d]).join(' · ');
    return `${weekdayNames} · ${formatTime(habit.frequency.hour, habit.frequency.minute)}`;
  };

  const scale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => { scale.value = withSpring(0.88, { damping: 15 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15 }); };

  return (
    <Link href={`/habit/${habit.id}`} asChild>
      <Pressable>
        <View style={[styles.card, isCompletedToday && styles.cardCompleted]}>
          {/* Left accent bar */}
          <View style={[styles.accentBar, { backgroundColor: isCompletedToday ? C.green : C.teal }]} />

          {/* Emoji */}
          <View style={[styles.emojiBox, isCompletedToday && styles.emojiBoxDone]}>
            <Text style={styles.emojiText}>{habit.emoji}</Text>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <Text
              style={[styles.habitName, isCompletedToday && styles.completedName]}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
            <Text style={styles.frequencyText} numberOfLines={1}>
              {formatFrequency()}
            </Text>
            {activeStreak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {activeStreak}d streak</Text>
              </View>
            )}
          </View>

          {/* Check Button */}
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={(e) => {
              e.preventDefault();
              onToggleComplete(habit.id);
            }}
            hitSlop={12}
          >
            <Animated.View style={[styles.checkBtn, buttonStyle,
              isCompletedToday ? styles.checkBtnDone : styles.checkBtnPending
            ]}>
              {isCompletedToday ? (
                <Ionicons name="checkmark" size={18} color={C.bgDeep} />
              ) : (
                <View style={styles.emptyCheck} />
              )}
            </Animated.View>
          </Pressable>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 14,
    paddingLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardCompleted: {
    borderColor: 'rgba(94, 234, 135, 0.15)',
    backgroundColor: 'rgba(94, 234, 135, 0.04)',
  },
  accentBar: {
    width: 4,
    height: 42,
    borderRadius: 4,
    marginRight: 14,
    marginLeft: 0,
  },
  emojiBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.tealDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: C.tealBorder,
  },
  emojiBoxDone: {
    backgroundColor: 'rgba(94, 234, 135, 0.1)',
    borderColor: 'rgba(94, 234, 135, 0.25)',
  },
  emojiText: {
    fontSize: 22,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 10,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  completedName: {
    color: C.textMuted,
    textDecorationLine: 'line-through',
  },
  frequencyText: {
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  streakBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 0.5,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.2,
  },
  checkBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  checkBtnDone: {
    backgroundColor: C.green,
  },
  checkBtnPending: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: C.teal,
  },
  emptyCheck: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.teal,
    opacity: 0.4,
  },
});
