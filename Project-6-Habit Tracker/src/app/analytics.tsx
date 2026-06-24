import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useHabits } from '../hooks/use-habits';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { habits } = useHabits();

  // Calculations
  const totalHabits = habits.length;
  
  // Calculate average consistency (percentage of active habits checked in today)
  const todayStr = getLocalDateString();
  const completedToday = habits.filter(h => h.lastCompletedISO === todayStr).length;
  const consistencyScore = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Best streak
  const bestStreak = habits.reduce((max, h) => Math.max(max, getActiveStreak(h)), 0);

  // Total completed all time count (extrapolated from logged dates across all habits)
  const totalLogsCount = habits.reduce((acc, h) => acc + h.completedDates.length, 0);

  // Calculate completions per day for the last 7 days (weekly chart)
  const getWeeklyChartData = () => {
    const data = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const cursor = new Date();
    
    // Move cursor back 6 days to start from 6 days ago
    cursor.setDate(cursor.getDate() - 6);

    for (let i = 0; i < 7; i++) {
      const year = cursor.getFullYear();
      const month = String(cursor.getMonth() + 1).padStart(2, '0');
      const day = String(cursor.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Count completions on this date
      const count = habits.filter(h => h.completedDates.includes(dateStr)).length;
      
      data.push({
        label: weekdays[cursor.getDay()],
        count,
        date: dateStr,
      });

      cursor.setDate(cursor.getDate() + 1);
    }
    return data;
  };

  const weeklyData = getWeeklyChartData();
  const maxCount = Math.max(1, ...weeklyData.map(d => d.count));

  // SVG Big circular consistency ring
  const ringSize = 100;
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (consistencyScore / 100) * circumference;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Consistency Ring Chart Card */}
          <View style={styles.consistencyCard}>
            <View style={styles.ringContainer}>
              <Svg width={ringSize} height={ringSize}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke="#1C2330"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke="#5EEAD4"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                />
              </Svg>
              <Text style={styles.ringPercentText}>{consistencyScore}%</Text>
            </View>

            <View style={styles.consistencyDetails}>
              <Text style={styles.consistencyValLabel}>Consistency Score</Text>
              <Text style={styles.consistencyValDesc}>
                Average completion rate for active habits today. Keep flowing!
              </Text>
            </View>
          </View>

          {/* Weekly Completion Bar Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Weekly Activity</Text>
            <Text style={styles.cardSubtitle}>Completions over the past 7 days</Text>

            {/* Custom SVG Bar Chart */}
            <View style={styles.barChartContainer}>
              <Svg width="100%" height="150">
                {/* Horizontal Guide Lines */}
                <Line x1="0" y1="20" x2="300" y2="20" stroke="rgba(148, 163, 184, 0.06)" strokeWidth="1" />
                <Line x1="0" y1="65" x2="300" y2="65" stroke="rgba(148, 163, 184, 0.06)" strokeWidth="1" />
                <Line x1="0" y1="110" x2="300" y2="110" stroke="rgba(148, 163, 184, 0.06)" strokeWidth="1" />

                {/* Render Bars */}
                {weeklyData.map((d, idx) => {
                  const barWidth = 24;
                  const spacing = 38;
                  const x = 16 + idx * spacing;
                  const maxBarHeight = 90;
                  const barHeight = (d.count / maxCount) * maxBarHeight;
                  const y = 110 - barHeight;

                  return (
                    <React.Fragment key={d.date}>
                      {/* Bar Background Track */}
                      <Rect
                        x={x}
                        y={20}
                        width={barWidth}
                        height={maxBarHeight}
                        rx={6}
                        fill="rgba(148, 163, 184, 0.04)"
                      />
                      {/* Active Fill Bar */}
                      {d.count > 0 && (
                        <Rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx={6}
                          fill="#5EEAD4"
                        />
                      )}
                      {/* Day Label */}
                      <SvgText
                        x={x + barWidth / 2}
                        y={134}
                        fill="#94A3B8"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {d.label}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>
          </View>

          {/* Quick Metrics Cards */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Ionicons name="flame" size={24} color="#F59E0B" style={styles.metricIcon} />
              <Text style={styles.metricVal}>{bestStreak}</Text>
              <Text style={styles.metricLabel}>Best Streak</Text>
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="trophy" size={24} color="#22C55E" style={styles.metricIcon} />
              <Text style={styles.metricVal}>{totalLogsCount}</Text>
              <Text style={styles.metricLabel}>Logs Completed</Text>
            </View>

            <View style={styles.metricCard}>
              <Ionicons name="sparkles" size={24} color="#5EEAD4" style={styles.metricIcon} />
              <Text style={styles.metricVal}>{totalHabits}</Text>
              <Text style={styles.metricLabel}>Active Habits</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Custom Navigation Bar */}
        <View style={styles.tabBar}>
          <Pressable style={styles.tabItem} onPress={() => router.push('/')}>
            <Ionicons name="home-outline" size={22} color="#94A3B8" />
            <Text style={styles.tabLabel}>Home</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => {}}>
            <Ionicons name="bar-chart" size={22} color="#5EEAD4" />
            <Text style={[styles.tabLabel, { color: '#5EEAD4' }]}>Analytics</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/achievements')}>
            <Ionicons name="trophy-outline" size={22} color="#94A3B8" />
            <Text style={styles.tabLabel}>Badges</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color="#94A3B8" />
            <Text style={styles.tabLabel}>Settings</Text>
          </Pressable>
        </View>

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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.06)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  consistencyCard: {
    backgroundColor: '#151A22',
    borderColor: 'rgba(94, 234, 212, 0.1)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  ringPercentText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  consistencyDetails: {
    flex: 1,
  },
  consistencyValLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  consistencyValDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  chartCard: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  barChartContainer: {
    alignItems: 'center',
    width: '100%',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
    borderRadius: 24,
    padding: 16,
    width: '31%',
    alignItems: 'center',
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: 'rgba(21, 26, 34, 0.85)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: 60,
  },
  tabLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 4,
  },
});
