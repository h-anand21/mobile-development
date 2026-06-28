import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useHabits } from '../../hooks/use-habits';
import { useTheme } from '../../context/ThemeContext';
import { getActiveStreak, getLocalDateString } from '../../lib/habits/streak';
import SpringPressable from '../../components/SpringPressable';

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, deleteHabit, toggleCompleteHabit } = useHabits();
  const { T } = useTheme();

  const habit = habits.find(h => h.id === id);

  if (!habit) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: T.bg }]}>
        <View style={[styles.errorContainer, { backgroundColor: T.bg }]}>
          <Text style={[styles.errorText, { color: T.textMuted }]}>Habit not found or deleted.</Text>
          <SpringPressable style={[T.neo, styles.backBtn]} onPress={() => router.replace('/')}>
            <Text style={[styles.backBtnText, { color: T.teal }]}>Go Home</Text>
          </SpringPressable>
        </View>
      </SafeAreaView>
    );
  }

  const activeStreak = getActiveStreak(habit);
  const today = getLocalDateString();
  const isCompletedToday = habit.completedDates.includes(today);
  const isShieldedToday = habit.shieldedDates?.includes(today) || false;

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
      const shielded = habit.shieldedDates?.includes(dateStr) || false;
      grid.push({
        date: dateStr,
        label: dateCursor.getDate(),
        completed,
        shielded,
      });

      dateCursor.setDate(dateCursor.getDate() + 1);
    }
    return grid;
  };

  const contributions = getContributionGrid();

  // Completion metrics
  const completedCount = habit.completedDates.length;
  const shieldedCount = habit.shieldedDates?.length || 0;
  
  const completionRate = habit.completedDates.length > 0 ? Math.round((habit.completedDates.filter(d => {
    const thirtyFiveDaysAgo = new Date();
    thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);
    return new Date(d) >= thirtyFiveDaysAgo;
  }).length / 35) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: T.bg }]}>
      <View style={[styles.container, { backgroundColor: T.bg }]}>
        
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={[styles.header, { borderBottomColor: T.border }]}>
          <SpringPressable onPress={() => router.back()} style={[T.neo, styles.backButton]}>
            <Ionicons name="chevron-back" size={20} color={T.textPrimary} />
          </SpringPressable>
          <Text style={[styles.headerTitle, { color: T.textMuted }]} numberOfLines={1}>Habit details</Text>
          <View style={styles.headerRight}>
            <Link href={`/edit?id=${habit.id}`} asChild>
              <SpringPressable style={StyleSheet.flatten([T.neo, styles.iconBtn])}>
                <Ionicons name="create-outline" size={18} color={T.textPrimary} />
              </SpringPressable>
            </Link>
            <SpringPressable onPress={handleDelete} style={[T.neo, styles.iconBtn, styles.deleteBtn, { borderLeftColor: 'rgba(234,94,94,0.2)', borderTopColor: 'rgba(234,94,94,0.2)' }]}>
              <Ionicons name="trash-outline" size={18} color={T.red} />
            </SpringPressable>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Main Visual: Emoji and Name */}
          <Animated.View entering={FadeInUp.duration(600).springify()} style={[T.neo, styles.titleCard, { padding: 20, borderRadius: 24, marginBottom: 20 }]}>
            <View style={[T.neo, styles.emojiContainer]}>
              <Text style={styles.emoji}>{habit.emoji}</Text>
            </View>
            <Text style={[styles.habitName, { color: T.textPrimary }]}>{habit.name}</Text>
            <Text style={[styles.habitFreqLabel, { color: T.textMuted }]}>
              {habit.frequency.kind === 'daily'
                ? 'Daily Habit'
                : `Weekly on: ${habit.frequency.weekdays
                    .map(w => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w])
                    .join(', ')}`}
            </Text>
          </Animated.View>

          {/* Interactive Toggle Checkin */}
          <Animated.View entering={FadeInUp.delay(100).duration(600).springify()}>
            {isShieldedToday ? (
              <View style={[T.neoPressed, styles.checkinBar, { backgroundColor: T.bgPress, borderColor: T.orange, borderWidth: 1 }]}>
                <Ionicons name="shield" size={20} color={T.orange} />
                <Text style={[styles.checkinText, { color: T.orange }]}>
                  Shielded Today
                </Text>
              </View>
            ) : (
              <SpringPressable
                style={[
                  T.neo,
                  styles.checkinBar,
                  isCompletedToday && { backgroundColor: T.tealDim, borderColor: T.tealBorder, borderWidth: 1 }
                ]}
                onPress={() => toggleCompleteHabit(habit.id)}
              >
                <Ionicons
                  name={isCompletedToday ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isCompletedToday ? T.teal : T.textMuted}
                />
                <Text style={[styles.checkinText, { color: isCompletedToday ? T.teal : T.textSub }]}>
                  {isCompletedToday ? 'Completed Today!' : 'Mark Completed Today'}
                </Text>
              </SpringPressable>
            )}
          </Animated.View>

          {/* Streak Ring Display */}
          <Animated.View entering={FadeInUp.duration(600).delay(200).springify()} style={[T.neo, styles.streakDisplay]}>
            <View style={styles.ringGraphic}>
              <Text style={{ fontSize: 32 }}>🔥</Text>
              <Text style={[styles.ringNumber, { color: T.orange }]}>{activeStreak}</Text>
              <Text style={[styles.ringLabel, { color: T.textMuted }]}>Current Streak</Text>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {[
              { val: `${completionRate}%`, label: 'Success Rate', col: T.teal },
              { val: completedCount, label: 'Total Logs', col: T.purple },
              { val: shieldedCount, label: 'Shields Used', col: T.orange }
            ].map((stat, idx) => (
              <Animated.View key={idx} entering={FadeInUp.delay(250 + idx * 50).duration(500).springify()} style={[T.neo, styles.statCard]}>
                <Text style={[styles.statVal, { color: stat.col }]}>{stat.val}</Text>
                <Text style={[styles.statLabel, { color: T.textMuted }]}>{stat.label}</Text>
              </Animated.View>
            ))}
          </View>

          {/* GitHub Contribution Grid Calendar */}
          <Animated.View entering={FadeInUp.duration(600).delay(350).springify()} style={[T.neo, styles.calendarCard]}>
            <Text style={[styles.cardTitle, { color: T.textPrimary }]}>Activity History</Text>
            <Text style={[styles.cardSubtitle, { color: T.textMuted }]}>Completions over the last 35 days</Text>

            <View style={styles.gridContainer}>
              <View style={styles.calendarGrid}>
                {contributions.map((day) => {
                  const cellBg = day.completed
                    ? T.tealDim
                    : day.shielded
                    ? T.orangeDim
                    : 'transparent';
                  const cellBorder = day.completed
                    ? T.teal
                    : day.shielded
                    ? T.orange
                    : day.date === today
                    ? T.textMuted
                    : 'transparent';
                  return (
                    <View
                      key={day.date}
                      style={[
                        T.neo,
                        styles.calendarCell,
                        { backgroundColor: cellBg, borderColor: cellBorder, borderWidth: (day.completed || day.shielded || day.date === today) ? 1.5 : 1 }
                      ]}
                    >
                      <Text
                        style={[
                          styles.cellText,
                          { color: day.completed ? T.teal : day.shielded ? T.orange : T.textSub },
                          (day.completed || day.shielded || day.date === today) && { fontWeight: '700' }
                        ]}
                      >
                        {day.label}
                      </Text>
                    </View>
                  );
                })}
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
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {},
  scrollContent: {
    padding: 20,
  },
  titleCard: {
    alignItems: 'center',
  },
  emojiContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
  },
  habitName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  habitFreqLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkinBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    marginBottom: 20,
  },
  checkinText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
  },
  streakDisplay: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  ringGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNumber: {
    fontSize: 38,
    fontWeight: '900',
    marginTop: 2,
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '31%',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  calendarCard: {
    borderRadius: 24,
    padding: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    marginBottom: 16,
  },
  gridContainer: {
    alignItems: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280, // 7 columns * 40 width/margin
    justifyContent: 'center',
  },
  calendarCell: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  cellText: {
    fontSize: 10,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  backBtnText: {
    fontWeight: '700',
  },
});
