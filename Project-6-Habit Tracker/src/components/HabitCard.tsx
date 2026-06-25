import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInLeft, Layout, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Habit } from '../lib/habits/types';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';

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

  // Convert weekday numbers to names
  const formatFrequency = () => {
    if (habit.frequency.kind === 'daily') {
      return `Daily at ${formatTime(habit.frequency.hour, habit.frequency.minute)}`;
    }
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayNames = habit.frequency.weekdays.map(d => days[d]).join(', ');
    return `${weekdayNames} at ${formatTime(habit.frequency.hour, habit.frequency.minute)}`;
  };

  const scale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Link href={`/habit/${habit.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.leftContainer}>
          <View style={[
            styles.emojiBox,
            isCompletedToday && styles.emojiBoxCompleted
          ]}>
            <Text style={styles.emojiText}>{habit.emoji}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={[
              styles.habitName,
              isCompletedToday && styles.completedText
            ]} numberOfLines={1}>
              {habit.name}
            </Text>
            <Text style={styles.frequencyText} numberOfLines={1}>
              {formatFrequency()}
            </Text>
            {activeStreak > 0 && (
              <View style={styles.streakContainer}>
                <Text style={styles.streakText}>🔥 {activeStreak} Day Streak</Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onToggleComplete(habit.id)}
          style={({ pressed }: { pressed: boolean }) => [
            styles.checkButton,
            isCompletedToday ? styles.checkButtonCompleted : styles.checkButtonPending,
            pressed && { opacity: 0.8 }
          ]}
        >
          <Animated.View style={[buttonStyle, styles.buttonContent]}>
            {isCompletedToday ? (
              <Ionicons name="checkmark-circle" size={28} color="#22C55E" />
            ) : (
              <Ionicons name="ellipse-outline" size={28} color="#5EEAD4" />
            )}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(94, 234, 212, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.1)',
  },
  emojiBoxCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  emojiText: {
    fontSize: 24,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  frequencyText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  streakContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonCompleted: {
    // Completed state
  },
  checkButtonPending: {
    // Pending state
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
