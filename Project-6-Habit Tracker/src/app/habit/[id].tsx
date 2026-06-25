import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useHabits } from '../../hooks/use-habits';
import { getActiveStreak, getLocalDateString } from '../../lib/habits/streak';

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, deleteHabit, toggleCompleteHabit } = useHabits();

  const habit = habits.find(h => h.id === id);

  if (!habit) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Habit not found or deleted.</Text>
          <Pressable style={styles.backBtn} onPress={() => router.replace('/')}>
            <Text style={styles.backBtnText}>Go Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const activeStreak = getActiveStreak(habit);
  const today = getLocalDateString();
  const isCompletedToday = habit.lastCompletedISO === today;

  // handleDelete
  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? All notifications and historical streaks will be cancelled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habit.id);
            router.replace('/');
          },
        },
      ]
    );
  };

  // Generate last 35 days for the contribution calendar
  const getContributionGrid = () => {
    const grid = [];
    const dateCursor = new Date();
    // Start 34 days ago so today is the 35th element
    dateCursor.setDate(dateCursor.getDate() - 34);

    for (let i = 0; i < 35; i++) {
      const year = dateCursor.getFullYear();
      const month = String(dateCursor.getMonth() + 1).padStart(2, '0');
      const day = String(dateCursor.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const completed = habit.completedDates.includes(dateStr);
      grid.push({
        date: dateStr,
        label: dateCursor.getDate(),
        completed,
      });

      dateCursor.setDate(dateCursor.getDate() + 1);
    }
    return grid;
  };

  const contributions = getContributionGrid();

  // Completion metrics
  const totalTrackedDays = 35;
  const completedCount = habit.completedDates.length;
  const completionRate = Math.round((completedCount / Math.max(1, habit.completedDates.filter(d => {
    // filter completed dates within the last 35 days
    const thirtyFiveDaysAgo = new Date();
    thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);
    return new Date(d) >= thirtyFiveDaysAgo;
  }).length || 1)) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>Habit details</Text>
          <View style={styles.headerRight}>
            <Link href={`/edit?id=${habit.id}`} asChild>
              <Pressable style={styles.iconBtn}>
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              </Pressable>
            </Link>
            <Pressable onPress={handleDelete} style={[styles.iconBtn, styles.deleteBtn]}>
              <Ionicons name="trash-outline" size={20} color="#FF4949" />
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Main Visual: Emoji and Name */}
          <Animated.View entering={FadeInUp.duration(600)} style={styles.titleCard}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{habit.emoji}</Text>
            </View>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.habitFreqLabel}>
              {habit.frequency.kind === 'daily'
                ? 'Daily Habit'
                : `Weekly on: ${habit.frequency.weekdays
                    .map(w => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w])
                    .join(', ')}`}
            </Text>
          </Animated.View>

          {/* Interactive Toggle Checkin */}
          <Pressable
            style={({ pressed }) => [
              styles.checkinBar,
              isCompletedToday ? styles.checkinBarCompleted : styles.checkinBarPending,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => toggleCompleteHabit(habit.id)}
          >
            <Ionicons
              name={isCompletedToday ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={isCompletedToday ? '#0B0F14' : '#5EEAD4'}
            />
            <Text style={[styles.checkinText, isCompletedToday && styles.checkinTextCompleted]}>
              {isCompletedToday ? 'Completed Today!' : 'Mark Completed Today'}
            </Text>
          </Pressable>

          {/* Streak Ring Display */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.streakDisplay}>
            <View style={styles.ringGraphic}>
              <Ionicons name="flame" size={36} color="#F59E0B" />
              <Text style={styles.ringNumber}>{activeStreak}</Text>
              <Text style={styles.ringLabel}>Current Streak</Text>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{completedCount}</Text>
              <Text style={styles.statLabel}>Total Logs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal} numberOfLines={1}>
                {habit.lastCompletedISO ? habit.lastCompletedISO.split('-').slice(1).join('/') : 'Never'}
              </Text>
              <Text style={styles.statLabel}>Last Logged</Text>
            </View>
          </View>

          {/* GitHub Contribution Grid Calendar */}
          <Animated.View entering={FadeIn.duration(800).delay(400)} style={styles.calendarCard}>
            <Text style={styles.cardTitle}>Activity History</Text>
            <Text style={styles.cardSubtitle}>Completions over the last 35 days</Text>

            <View style={styles.gridContainer}>
              <View style={styles.calendarGrid}>
                {contributions.map((day, idx) => (
                  <View
                    key={day.date}
                    style={[
                      styles.calendarCell,
                      day.completed && styles.calendarCellActive,
                      day.date === today && styles.calendarCellToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        day.completed && styles.cellTextActive,
                        day.date === today && styles.cellTextToday,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.06)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#151A22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#151A22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
    marginLeft: 8,
  },
  deleteBtn: {
    borderColor: 'rgba(255, 73, 73, 0.2)',
    backgroundColor: 'rgba(255, 73, 73, 0.04)',
  },
  scrollContent: {
    padding: 20,
  },
  titleCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(94, 234, 212, 0.05)',
    borderColor: 'rgba(94, 234, 212, 0.1)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
  },
  habitName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  habitFreqLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  checkinBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  checkinBarPending: {
    backgroundColor: 'rgba(94, 234, 212, 0.04)',
    borderColor: 'rgba(94, 234, 212, 0.2)',
  },
  checkinBarCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkinText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5EEAD4',
    marginLeft: 10,
  },
  checkinTextCompleted: {
    color: '#0B0F14',
  },
  streakDisplay: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  ringGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  ringLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#151A22',
    borderColor: 'rgba(148, 163, 184, 0.06)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5EEAD4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  calendarCard: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
    borderRadius: 28,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  gridContainer: {
    alignItems: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280, // 7 columns * (34px cell width + 6px spacing) = 280px
    justifyContent: 'flex-start',
  },
  calendarCell: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0B0F14',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  calendarCellActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  calendarCellToday: {
    borderColor: '#5EEAD4',
    borderWidth: 1.5,
  },
  cellText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  cellTextActive: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  cellTextToday: {
    color: '#5EEAD4',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: '#5EEAD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  backBtnText: {
    color: '#5EEAD4',
    fontWeight: '600',
  },
});
