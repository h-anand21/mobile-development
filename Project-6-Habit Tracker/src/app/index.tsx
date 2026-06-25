import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useHabits } from '../hooks/use-habits';
import { usePushNotifications } from '../hooks/use-push-notifications';
import HabitCard from '../components/HabitCard';
import PermissionBanner from '../components/PermissionBanner';
import EmptyState from '../components/EmptyState';
import { getLocalDateString, getActiveStreak } from '../lib/habits/streak';

export default function HomeDashboard() {
  const router = useRouter();
  const { habits, loadHabits, toggleCompleteHabit } = useHabits();
  const { permissionStatus, checkPermissions } = usePushNotifications();

  // Reload habits and check permissions every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
      checkPermissions();
    }, [])
  );

  const todayDateString = getLocalDateString();
  const todayWeekday = new Date().getDay(); // 0 = Sun, 1 = Mon, etc.

  // Filter habits scheduled for today
  const todayHabits = habits.filter(habit => {
    if (habit.frequency.kind === 'daily') {
      return true;
    }
    return habit.frequency.weekdays.includes(todayWeekday);
  });

  // Calculate completions
  const completedToday = todayHabits.filter(h => h.lastCompletedISO === todayDateString);
  const totalTodayCount = todayHabits.length;
  const completedCount = completedToday.length;
  const progressPercent = totalTodayCount > 0 ? Math.round((completedCount / totalTodayCount) * 100) : 0;

  // Calculate Quick Stats
  const bestStreak = habits.reduce((max, h) => Math.max(max, getActiveStreak(h)), 0);
  const totalCompletedAllTime = habits.reduce((acc, h) => {
    // If completed today or has a lastCompleted date, we count history
    // Since we don't store full logs, we use a simple representative count from the current streak.
    return acc + (h.lastCompletedISO ? 1 : 0);
  }, 0);
  const successRate = habits.length > 0 ? Math.round((habits.filter(h => h.lastCompletedISO === todayDateString).length / habits.length) * 100) : 0;

  // SVG circular progress configurations
  const ringSize = 74;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Good Morning 👋</Text>
            <Text style={styles.userName}>Himanshu</Text>
          </View>
          <Link href="/notifications" asChild>
            <Pressable style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              {permissionStatus !== 'granted' && (
                <View style={styles.badgeIndicator} />
              )}
            </Pressable>
          </Link>
        </View>

        {/* Permission Banner (Visible if Denied) */}
        {permissionStatus === 'denied' && (
          <PermissionBanner onCheckPermissions={checkPermissions} />
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Today's Progress Card */}
          {totalTodayCount > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressTitle}>Today's Progress</Text>
                <Text style={styles.progressSub}>
                  {completedCount} / {totalTodayCount} Habits Completed
                </Text>
                <Text style={styles.progressPercentage}>{progressPercent}%</Text>
              </View>

              <View style={styles.ringContainer}>
                <Svg width={ringSize} height={ringSize}>
                  {/* Background Track Circle */}
                  <Circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    stroke="#1C2330"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Active Dynamic Progress Circle */}
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
              </View>
            </View>
          )}

          {/* Habits Title Row */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <Link href="/new" asChild>
              <Pressable style={styles.addButton}>
                <Ionicons name="add" size={20} color="#5EEAD4" />
                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            </Link>
          </View>

          {/* Habits List */}
          {todayHabits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState />
            </View>
          ) : (
            todayHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleComplete={toggleCompleteHabit}
              />
            ))
          )}

          {/* Quick Stats Grid */}
          {habits.length > 0 && (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                
                <View style={styles.statCard}>
                  <View style={[styles.statIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.08)' }]}>
                    <Ionicons name="flame" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.statVal}>{bestStreak} Days</Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.08)' }]}>
                    <Ionicons name="checkmark-done" size={20} color="#22C55E" />
                  </View>
                  <Text style={styles.statVal}>{totalCompletedAllTime}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconCircle, { backgroundColor: 'rgba(94, 234, 212, 0.08)' }]}>
                    <Ionicons name="trending-up" size={20} color="#5EEAD4" />
                  </View>
                  <Text style={styles.statVal}>{successRate}%</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </View>

              </View>
            </View>
          )}

          {/* Extra spacing for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Custom Navigation Bar */}
        <View style={styles.tabBar}>
          <Pressable style={styles.tabItem} onPress={() => {}}>
            <Ionicons name="home" size={22} color="#5EEAD4" />
            <Text style={[styles.tabLabel, { color: '#5EEAD4' }]}>Home</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/analytics')}>
            <Ionicons name="bar-chart-outline" size={22} color="#94A3B8" />
            <Text style={styles.tabLabel}>Analytics</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greetingText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#151A22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  badgeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  scrollContent: {
    paddingTop: 12,
  },
  progressCard: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.1)',
    borderRadius: 28,
    padding: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  progressSub: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '900',
    color: '#5EEAD4',
  },
  ringContainer: {
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 234, 212, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5EEAD4',
    marginLeft: 2,
  },
  emptyContainer: {
    marginTop: 20,
  },
  statsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#151A22',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
    borderRadius: 20,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 9,
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
