import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useHabits } from '../hooks/use-habits';
import { usePushNotifications } from '../hooks/use-push-notifications';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';
import { getLocalDateString, getActiveStreak } from '../lib/habits/streak';
import { C } from '../constants/colors';

const { width: SCREEN_W } = Dimensions.get('window');

// Build last 7 days for the weekly strip
function getWeekStrip() {
  const strip = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    strip.push({
      label: dayNames[d.getDay()],
      date: d.getDate(),
      iso: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
      isToday: i === 0,
    });
  }
  return strip;
}

// Mini bar chart for streak visualization
function MiniBarChart({ values, color }: { values: number[], color: string }) {
  const max = Math.max(...values, 1);
  const barW = 6;
  const gap = 4;
  const h = 36;
  const totalW = values.length * (barW + gap) - gap;
  return (
    <Svg width={totalW} height={h}>
      {values.map((v, i) => {
        const barH = Math.max(4, (v / max) * h);
        return (
          <Rect
            key={i}
            x={i * (barW + gap)}
            y={h - barH}
            width={barW}
            height={barH}
            rx={3}
            fill={v > 0 ? color : 'rgba(148,163,184,0.12)'}
          />
        );
      })}
    </Svg>
  );
}

// Donut ring component
function DonutRing({
  percent, size, strokeWidth, color, bg,
}: { percent: number, size: number, strokeWidth: number, color: string, bg: string }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;
  const cx = size / 2, cy = size / 2;
  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={r} stroke={bg} strokeWidth={strokeWidth} fill="transparent" />
      <Circle
        cx={cx} cy={cy} r={r} stroke={color} strokeWidth={strokeWidth} fill="transparent"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </Svg>
  );
}

export default function HomeDashboard() {
  const router = useRouter();
  const { habits, loadHabits, toggleCompleteHabit } = useHabits();
  const { permissionStatus, checkPermissions } = usePushNotifications();

  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
      checkPermissions();
    }, [])
  );

  const todayDateString = getLocalDateString();
  const todayWeekday = new Date().getDay();
  const weekStrip = getWeekStrip();

  // Today's habits
  const todayHabits = habits.filter(habit => {
    if (habit.frequency.kind === 'daily') return true;
    return habit.frequency.weekdays.includes(todayWeekday);
  });

  const completedCount = todayHabits.filter(h => h.lastCompletedISO === todayDateString).length;
  const totalTodayCount = todayHabits.length;
  const progressPercent = totalTodayCount > 0 ? Math.round((completedCount / totalTodayCount) * 100) : 0;

  // Stats
  const bestStreak = habits.reduce((max, h) => Math.max(max, getActiveStreak(h)), 0);
  const totalLogs = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const successRate = habits.length > 0
    ? Math.round((habits.filter(h => h.lastCompletedISO === todayDateString).length / habits.length) * 100)
    : 0;

  // Weekly completion data (last 7 days)
  const weeklyCompletions = weekStrip.map(day =>
    habits.filter(h => h.completedDates.includes(day.iso)).length
  );

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>H</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.greetingSmall}>{greeting},</Text>
            <Text style={styles.greetingName}>Himanshu 👋</Text>
          </View>
          <Link href="/notifications" asChild>
            <Pressable style={styles.bellBtn}>
              <Ionicons name="notifications-outline" size={20} color={C.textPrimary} />
              {permissionStatus !== 'granted' && <View style={styles.bellDot} />}
            </Pressable>
          </Link>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Weekly Calendar Strip ── */}
          <View style={styles.calendarCard}>
            {weekStrip.map((day, i) => {
              const count = weeklyCompletions[i];
              const hasHabits = habits.length > 0;
              const isDone = hasHabits && count >= Math.max(1, Math.round(habits.length * 0.5));
              return (
                <View key={day.iso} style={styles.dayCol}>
                  <Text style={[styles.dayLabel, day.isToday && styles.dayLabelActive]}>
                    {day.label}
                  </Text>
                  <View style={[
                    styles.dayCircle,
                    day.isToday && styles.dayCircleToday,
                    isDone && !day.isToday && styles.dayCircleDone,
                  ]}>
                    <Text style={[
                      styles.dayNum,
                      day.isToday && styles.dayNumToday,
                    ]}>
                      {day.date}
                    </Text>
                  </View>
                  {/* Completion dot */}
                  <View style={[
                    styles.dayDot,
                    { backgroundColor: count > 0 ? C.teal : 'transparent' }
                  ]} />
                </View>
              );
            })}
          </View>

          {/* ── Stats Cards 2×2 Grid ── */}
          <View style={styles.statsGrid}>

            {/* Card 1 — Habit Score */}
            <View style={[styles.statCard, styles.statCardTall, { backgroundColor: '#0E2240' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconDot, { backgroundColor: C.tealDim }]}>
                  <Ionicons name="leaf" size={14} color={C.teal} />
                </View>
                <Text style={styles.cardTitle}>Habit Score</Text>
              </View>
              <Text style={styles.bigNumber}>
                {completedCount}<Text style={styles.bigNumberSub}>/{totalTodayCount}</Text>
              </Text>
              <Text style={styles.cardSub}>Today's completions</Text>
              {/* Dot heatmap (last 5×7 = 35 days) */}
              <View style={styles.heatmap}>
                {Array.from({ length: 5 }).map((_, row) =>
                  Array.from({ length: 7 }).map((__, col) => {
                    const idx = row * 7 + col;
                    const filled = idx < totalLogs % 36;
                    return (
                      <View
                        key={`${row}-${col}`}
                        style={[styles.heatDot, { backgroundColor: filled ? C.teal : 'rgba(94,234,212,0.1)' }]}
                      />
                    );
                  })
                )}
              </View>
            </View>

            {/* Card 2 — Today's Progress Ring */}
            <View style={[styles.statCard, styles.statCardTall, { backgroundColor: '#1A1040' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconDot, { backgroundColor: C.purpleDim }]}>
                  <Ionicons name="pie-chart" size={14} color={C.purple} />
                </View>
                <Text style={styles.cardTitle}>Progress</Text>
              </View>
              <View style={styles.ringWrapper}>
                <DonutRing
                  percent={progressPercent}
                  size={80}
                  strokeWidth={9}
                  color={C.purple}
                  bg="rgba(196,94,234,0.1)"
                />
                <View style={styles.ringCenter}>
                  <Text style={[styles.ringPct, { color: C.purple }]}>{progressPercent}%</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>Completed today</Text>
            </View>

            {/* Card 3 — Best Streak */}
            <View style={[styles.statCard, { backgroundColor: '#201008' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconDot, { backgroundColor: C.orangeDim }]}>
                  <Ionicons name="flame" size={14} color={C.orange} />
                </View>
                <Text style={styles.cardTitle}>Streak</Text>
              </View>
              <Text style={[styles.bigNumber, { color: C.orange }]}>{bestStreak}</Text>
              <Text style={styles.cardSub}>Best days</Text>
              <View style={{ marginTop: 8 }}>
                <MiniBarChart values={weeklyCompletions} color={C.orange} />
              </View>
            </View>

            {/* Card 4 — Success Rate */}
            <View style={[styles.statCard, { backgroundColor: '#081E10' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconDot, { backgroundColor: C.greenDim }]}>
                  <Ionicons name="trending-up" size={14} color={C.green} />
                </View>
                <Text style={styles.cardTitle}>Success</Text>
              </View>
              <View style={styles.ringWrapper}>
                <DonutRing
                  percent={successRate}
                  size={70}
                  strokeWidth={8}
                  color={C.green}
                  bg="rgba(94,234,135,0.1)"
                />
                <View style={styles.ringCenter}>
                  <Text style={[styles.ringPct, { color: C.green, fontSize: 14 }]}>{successRate}%</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>Rate today</Text>
            </View>

          </View>

          {/* ── Today's Habits ── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <Link href="/new" asChild>
              <Pressable style={styles.addBtn}>
                <Ionicons name="add" size={16} color={C.teal} />
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </Link>
          </View>

          {permissionStatus === 'denied' && (
            <Pressable
              style={styles.permissionBanner}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-off-outline" size={16} color={C.orange} />
              <Text style={styles.permissionText}>Enable notifications for reminders</Text>
              <Ionicons name="chevron-forward" size={14} color={C.textMuted} />
            </Pressable>
          )}

          {todayHabits.length === 0 ? (
            <EmptyState />
          ) : (
            todayHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleComplete={toggleCompleteHabit}
              />
            ))
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ── Tab Bar ── */}
        <View style={styles.tabBar}>
          <Pressable style={styles.tabItem} onPress={() => {}}>
            <View style={styles.tabActive}>
              <Ionicons name="home" size={20} color={C.teal} />
            </View>
            <Text style={[styles.tabLabel, { color: C.teal }]}>Home</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/analytics')}>
            <Ionicons name="bar-chart-outline" size={20} color={C.textMuted} />
            <Text style={styles.tabLabel}>Analytics</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/achievements')}>
            <Ionicons name="trophy-outline" size={20} color={C.textMuted} />
            <Text style={styles.tabLabel}>Badges</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={20} color={C.textMuted} />
            <Text style={styles.tabLabel}>Settings</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

const CARD_W = (SCREEN_W - 48) / 2;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },
  container: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.tealDim,
    borderWidth: 2,
    borderColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: C.teal,
  },
  headerCenter: {
    flex: 1,
  },
  greetingSmall: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 17,
    fontWeight: '800',
    color: C.textPrimary,
    marginTop: 1,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  bellDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.orange,
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 1.5,
    borderColor: C.bgDeep,
  },

  scroll: {
    paddingBottom: 20,
  },

  // Calendar Strip
  calendarCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    backgroundColor: C.bgCard,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dayCol: {
    alignItems: 'center',
    width: 36,
  },
  dayLabel: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dayLabelActive: {
    color: C.teal,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayCircleToday: {
    backgroundColor: C.teal,
  },
  dayCircleDone: {
    backgroundColor: 'rgba(94,234,212,0.12)',
    borderWidth: 1,
    borderColor: C.tealBorder,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSub,
  },
  dayNumToday: {
    color: C.bgDeep,
    fontWeight: '900',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 5,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: CARD_W,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statCardTall: {
    // same width, taller due to content
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bigNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: C.teal,
    letterSpacing: -1,
    lineHeight: 36,
  },
  bigNumberSub: {
    fontSize: 18,
    fontWeight: '600',
    color: C.textMuted,
  },
  cardSub: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  heatmap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 4,
  },
  heatDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    fontSize: 16,
    fontWeight: '900',
  },

  // Section header
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.tealDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.tealBorder,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.teal,
    marginLeft: 2,
  },

  // Permission banner
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 135, 94, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(234, 135, 94, 0.2)',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  permissionText: {
    flex: 1,
    fontSize: 12,
    color: C.orange,
    fontWeight: '600',
  },

  // Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 66,
    backgroundColor: C.tabBg,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: C.borderMid,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: 64,
  },
  tabActive: {
    backgroundColor: C.tealDim,
    borderRadius: 12,
    width: 38,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.tealBorder,
  },
  tabLabel: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
});
