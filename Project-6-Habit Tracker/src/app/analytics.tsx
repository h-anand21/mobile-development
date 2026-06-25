import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useHabits } from '../hooks/use-habits';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';
import { C } from '../constants/colors';

const { width: SCREEN_W } = Dimensions.get('window');

// Multi-ring donut data structure
function MultiRingChart({ rings, size }: {
  rings: { percent: number, color: string, strokeWidth: number, radius: number }[],
  size: number
}) {
  const cx = size / 2, cy = size / 2;
  return (
    <Svg width={size} height={size}>
      {rings.map((ring, i) => {
        const circ = 2 * Math.PI * ring.radius;
        const offset = circ - (Math.min(ring.percent, 100) / 100) * circ;
        return (
          <React.Fragment key={i}>
            <Circle cx={cx} cy={cy} r={ring.radius} stroke="rgba(148,163,184,0.07)"
              strokeWidth={ring.strokeWidth} fill="transparent" />
            <Circle cx={cx} cy={cy} r={ring.radius} stroke={ring.color}
              strokeWidth={ring.strokeWidth} fill="transparent"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`} />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const { habits } = useHabits();

  const todayStr = getLocalDateString();
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.lastCompletedISO === todayStr).length;
  const consistencyScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, getActiveStreak(h)), 0);
  const totalLogsCount = habits.reduce((acc, h) => acc + h.completedDates.length, 0);

  // Weekly data (last 7 days)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getWeeklyData = () => {
    const data = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;
      const count = habits.filter(h => h.completedDates.includes(iso)).length;
      data.push({ label: weekdays[cursor.getDay()], count, isToday: i === 6 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return data;
  };
  const weeklyData = getWeeklyData();
  const maxCount = Math.max(1, ...weeklyData.map(d => d.count));

  // Per-habit progress this week (last 7 days)
  const getHabitWeeklyRate = (habit: any) => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (habit.completedDates.includes(iso)) count++;
    }
    return Math.round((count / 7) * 100);
  };

  // Multi-ring: up to 3 rings based on habit categories
  const ringColors = [C.teal, C.yellow, C.purple];
  const rings = habits.slice(0, 3).map((h, i) => ({
    percent: getHabitWeeklyRate(h),
    color: ringColors[i % 3],
    strokeWidth: 10,
    radius: 52 - i * 18,
  }));
  // Fallback rings if no habits
  const displayRings = rings.length > 0 ? rings : [
    { percent: 0, color: C.teal, strokeWidth: 10, radius: 52 },
    { percent: 0, color: C.yellow, strokeWidth: 10, radius: 34 },
    { percent: 0, color: C.purple, strokeWidth: 10, radius: 16 },
  ];

  const chartSize = 140;
  const barChartW = SCREEN_W - 64;
  const barW = Math.floor(barChartW / 7) - 6;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={C.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Top Card: Multi-ring + quick stats ── */}
          <View style={styles.topCard}>
            <View style={styles.ringArea}>
              <MultiRingChart rings={displayRings} size={chartSize} />
              <View style={styles.ringCenterText}>
                <Text style={styles.ringBigNum}>{consistencyScore}%</Text>
                <Text style={styles.ringBigLabel}>Today</Text>
              </View>
            </View>

            <View style={styles.ringLegend}>
              {habits.slice(0, 3).map((h, i) => (
                <View key={h.id} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: ringColors[i % 3] }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{h.name}</Text>
                  <Text style={[styles.legendPct, { color: ringColors[i % 3] }]}>
                    {getHabitWeeklyRate(h)}%
                  </Text>
                </View>
              ))}
              {habits.length === 0 && (
                <Text style={styles.emptyHint}>Add habits to see analytics</Text>
              )}
            </View>
          </View>

          {/* ── Quick Metrics Row ── */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: '#0E2240' }]}>
              <Ionicons name="flame" size={20} color={C.orange} />
              <Text style={[styles.metricVal, { color: C.orange }]}>{bestStreak}</Text>
              <Text style={styles.metricLabel}>Best Streak</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: '#081E10' }]}>
              <Ionicons name="checkmark-done" size={20} color={C.green} />
              <Text style={[styles.metricVal, { color: C.green }]}>{totalLogsCount}</Text>
              <Text style={styles.metricLabel}>Total Logs</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: '#1A1040' }]}>
              <Ionicons name="sparkles" size={20} color={C.purple} />
              <Text style={[styles.metricVal, { color: C.purple }]}>{totalHabits}</Text>
              <Text style={styles.metricLabel}>Active</Text>
            </View>
          </View>

          {/* ── Weekly Activity Bar Chart ── */}
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Weekly Activity</Text>
            <Text style={styles.cardSubtitle}>Completions over the past 7 days</Text>
            <View style={styles.barChart}>
              <Svg width={barChartW} height={130}>
                {/* Guide lines */}
                {[20, 65, 110].map((y) => (
                  <Line key={y} x1="0" y1={y} x2={barChartW} y2={y}
                    stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
                ))}
                {weeklyData.map((d, idx) => {
                  const x = idx * (barW + 6) + 2;
                  const maxBarH = 80;
                  const barH = Math.max(d.count > 0 ? 8 : 0, (d.count / maxCount) * maxBarH);
                  const y = 110 - barH;
                  return (
                    <React.Fragment key={d.label + idx}>
                      <Rect x={x} y={20} width={barW} height={90}
                        rx={6} fill="rgba(148,163,184,0.04)" />
                      {d.count > 0 && (
                        <Rect x={x} y={y} width={barW} height={barH}
                          rx={6} fill={d.isToday ? C.teal : 'rgba(94,234,212,0.5)'} />
                      )}
                      <SvgText x={x + barW / 2} y={126} fill={d.isToday ? C.teal : C.textMuted}
                        fontSize="10" fontWeight="700" textAnchor="middle">
                        {d.label}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>
          </View>

          {/* ── Habit-by-Habit Progress ── */}
          {habits.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.cardTitle}>Habit Progress</Text>
              <Text style={styles.cardSubtitle}>7-day completion rate per habit</Text>
              {habits.map((habit, i) => {
                const rate = getHabitWeeklyRate(habit);
                const barColor = ringColors[i % ringColors.length];
                return (
                  <View key={habit.id} style={styles.habitProgressRow}>
                    <Text style={styles.habitProgressEmoji}>{habit.emoji}</Text>
                    <View style={styles.habitProgressRight}>
                      <View style={styles.habitProgressLabelRow}>
                        <Text style={styles.habitProgressName} numberOfLines={1}>
                          {habit.name}
                        </Text>
                        <Text style={[styles.habitProgressPct, { color: barColor }]}>{rate}%</Text>
                      </View>
                      <View style={styles.habitProgressBg}>
                        <View style={[styles.habitProgressFill, {
                          width: `${rate}%`,
                          backgroundColor: barColor,
                        }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ── Tab Bar ── */}
        <View style={styles.tabBar}>
          <Pressable style={styles.tabItem} onPress={() => router.push('/')}>
            <Ionicons name="home-outline" size={20} color={C.textMuted} />
            <Text style={styles.tabLabel}>Home</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => {}}>
            <View style={styles.tabActive}>
              <Ionicons name="bar-chart" size={20} color={C.teal} />
            </View>
            <Text style={[styles.tabLabel, { color: C.teal }]}>Analytics</Text>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bgDeep },
  container: { flex: 1, backgroundColor: C.bgDeep },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textPrimary,
  },

  scroll: { paddingBottom: 20 },

  // Top multi-ring card
  topCard: {
    backgroundColor: C.bgCard,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  ringArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  ringCenterText: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringBigNum: {
    fontSize: 22,
    fontWeight: '900',
    color: C.textPrimary,
  },
  ringBigLabel: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: '600',
  },
  ringLegend: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },
  legendName: {
    flex: 1,
    fontSize: 12,
    color: C.textSub,
    fontWeight: '600',
  },
  legendPct: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  emptyHint: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 18,
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Chart card
  chartCard: {
    backgroundColor: C.bgCard,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 16,
    fontWeight: '500',
  },
  barChart: {
    alignItems: 'flex-start',
  },

  // Habit progress rows
  habitProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  habitProgressEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
    textAlign: 'center',
  },
  habitProgressRight: {
    flex: 1,
  },
  habitProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  habitProgressName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSub,
    flex: 1,
  },
  habitProgressPct: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
  },
  habitProgressBg: {
    height: 7,
    backgroundColor: 'rgba(148,163,184,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  habitProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Tab bar
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
