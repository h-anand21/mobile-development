import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../hooks/use-habits';
import { getActiveStreak } from '../lib/habits/streak';

export default function AchievementsScreen() {
  const router = useRouter();
  const { habits } = useHabits();

  // Get user's best streak
  const bestStreak = habits.reduce((max, h) => Math.max(max, getActiveStreak(h)), 0);

  // Badge list definition
  const BADGES = [
    {
      id: 'beginner',
      title: 'Consistency Beginner',
      subtitle: 'Build a streak of 7 days or more.',
      target: 7,
      icon: 'sparkles',
      color: '#5EEAD4',
    },
    {
      id: 'master',
      title: 'Habit Master',
      subtitle: 'Build a streak of 30 days or more.',
      target: 30,
      icon: 'medal',
      color: '#F59E0B',
    },
    {
      id: 'legend',
      title: 'Legendary Status',
      subtitle: 'Build a streak of 100 days or more.',
      target: 100,
      icon: 'trophy',
      color: '#22C55E',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Achievements</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Best Streak Banner */}
          <View style={styles.streakBanner}>
            <Ionicons name="flame" size={32} color="#F59E0B" />
            <View style={styles.streakBannerDetails}>
              <Text style={styles.streakBannerTitle}>Current Best Streak</Text>
              <Text style={styles.streakBannerValue}>{bestStreak} Days Consistent</Text>
            </View>
          </View>

          {/* Badges List */}
          <Text style={styles.sectionTitle}>Milestone Badges</Text>

          {BADGES.map(badge => {
            const isUnlocked = bestStreak >= badge.target;
            
            return (
              <View 
                key={badge.id} 
                style={[
                  styles.badgeCard,
                  isUnlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked
                ]}
              >
                <View style={[
                  styles.iconBox,
                  { backgroundColor: isUnlocked ? `${badge.color}15` : 'rgba(148, 163, 184, 0.04)' }
                ]}>
                  <Ionicons 
                    name={badge.icon as any} 
                    size={28} 
                    color={isUnlocked ? badge.color : '#475569'} 
                  />
                </View>

                <View style={styles.badgeInfo}>
                  <Text style={[
                    styles.badgeTitle,
                    !isUnlocked && styles.lockedText
                  ]}>
                    {badge.title}
                  </Text>
                  <Text style={styles.badgeSubtitle}>{badge.subtitle}</Text>
                  
                  {/* Progress Indicator */}
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill,
                          { 
                            width: `${Math.min(100, (bestStreak / badge.target) * 100)}%`,
                            backgroundColor: badge.color 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.min(badge.target, bestStreak)}/{badge.target}d
                    </Text>
                  </View>
                </View>

                <View style={styles.lockStatus}>
                  {isUnlocked ? (
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  ) : (
                    <Ionicons name="lock-closed" size={20} color="#475569" />
                  )}
                </View>
              </View>
            );
          })}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Tab Bar */}
        <View style={styles.tabBar}>
          <Pressable style={styles.tabItem} onPress={() => router.push('/')}>
            <Ionicons name="home-outline" size={20} color="#4A6080" />
            <Text style={styles.tabLabel}>Home</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/analytics')}>
            <Ionicons name="bar-chart-outline" size={20} color="#4A6080" />
            <Text style={styles.tabLabel}>Analytics</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => {}}>
            <View style={styles.tabActive}>
              <Ionicons name="trophy" size={20} color="#5EEAD4" />
            </View>
            <Text style={[styles.tabLabel, { color: '#5EEAD4' }]}>Badges</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={20} color="#4A6080" />
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
    backgroundColor: '#0A1628',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
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
  streakBanner: {
    backgroundColor: '#0F1E35',
    borderColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  streakBannerDetails: {
    marginLeft: 16,
  },
  streakBannerTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streakBannerValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  badgeCard: {
    backgroundColor: '#0F1E35',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeCardUnlocked: {
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  badgeCardLocked: {
    borderColor: 'rgba(148, 163, 184, 0.03)',
    opacity: 0.8,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.05)',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  lockedText: {
    color: '#64748B',
  },
  badgeSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A1628',
    marginRight: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  lockStatus: {
    marginLeft: 8,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 66,
    backgroundColor: 'rgba(15, 30, 53, 0.92)',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: 64,
  },
  tabActive: {
    backgroundColor: 'rgba(94, 234, 212, 0.12)',
    borderRadius: 12,
    width: 38,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.2)',
  },
  tabLabel: {
    fontSize: 10,
    color: '#4A6080',
    fontWeight: '600',
    marginTop: 4,
  },
});
