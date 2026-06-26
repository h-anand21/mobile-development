import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useHabits } from '../hooks/use-habits';
import { useTheme } from '../context/ThemeContext';
import { getActiveStreak } from '../lib/habits/streak';

export default function AchievementsScreen() {
  const router = useRouter();
  const { T } = useTheme();
  const { habits } = useHabits();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace('/');
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const bestStreak  = habits.reduce((max, h) => Math.max(max, getActiveStreak(h)), 0);
  const totalLogs   = habits.reduce((a, h) => a + h.completedDates.length, 0);

  const BADGES = [
    { id: 'start',   emoji: '🌱', title: 'First Step',        subtitle: 'Complete your first habit',  target: 1,   color: T.teal   },
    { id: 'week',    emoji: '⚡', title: 'Consistency Spark',  subtitle: '7-day streak achieved',       target: 7,   color: T.yellow },
    { id: 'month',   emoji: '🔥', title: 'Habit Master',       subtitle: '30-day streak achieved',      target: 30,  color: T.orange },
    { id: 'hundred', emoji: '🏆', title: 'Legendary Status',   subtitle: '100-day streak achieved',     target: 100, color: T.purple },
    { id: 'logs50',  emoji: '📖', title: 'Log Champion',       subtitle: '50 total completions',        target: 50,  totalLogs: true },
    { id: 'logs200', emoji: '💎', title: 'Diamond Habit',      subtitle: '200 total completions',       target: 200, totalLogs: true },
  ];

  // Tab anims
  const s0 = useSharedValue(1), s1 = useSharedValue(1), s2 = useSharedValue(1), s3 = useSharedValue(1), s4 = useSharedValue(1);
  const a0 = useAnimatedStyle(() => ({ transform: [{ scale: s0.value }] }));
  const a1 = useAnimatedStyle(() => ({ transform: [{ scale: s1.value }] }));
  const a2 = useAnimatedStyle(() => ({ transform: [{ scale: s2.value }] }));
  const a3 = useAnimatedStyle(() => ({ transform: [{ scale: s3.value }] }));
  const a4 = useAnimatedStyle(() => ({ transform: [{ scale: s4.value }] }));
  const pt = (v: any) => { v.value = withSequence(withSpring(0.8), withSpring(1, { damping: 10 })); };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <Text style={styles.headerEmoji}>🏆</Text>
          <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Achievements</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Streak Banner */}
          <Animated.View entering={FadeInDown.delay(80).springify()} style={[T.neo, styles.banner]}>
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerEmoji}>🔥</Text>
              <View>
                <Text style={[styles.bannerLabel, { color: T.textMuted }]}>Best Streak</Text>
                <Text style={[styles.bannerValue, { color: T.orange }]}>{bestStreak} days</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: T.border }]} />
            <View style={styles.bannerRight}>
              <Text style={styles.bannerEmoji}>✅</Text>
              <View>
                <Text style={[styles.bannerLabel, { color: T.textMuted }]}>Total Logs</Text>
                <Text style={[styles.bannerValue, { color: T.teal }]}>{totalLogs}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Badges */}
          <Text style={[styles.sectionTitle, { color: T.textMuted }]}>🎯 Milestone Badges</Text>

          {BADGES.map((badge, i) => {
            const score     = (badge as any).totalLogs ? totalLogs : bestStreak;
            const isUnlocked = score >= badge.target;
            const progress   = Math.min(100, Math.round((score / badge.target) * 100));

            return (
              <Animated.View key={badge.id}
                entering={FadeInDown.delay(120 + i * 60).springify()}
                style={[T.neo, styles.badgeCard,
                  isUnlocked && { borderTopColor: badge.color + '30', borderLeftColor: badge.color + '30' }
                ]}>

                {/* Emoji icon */}
                <View style={[T.neo, styles.badgeIcon, { backgroundColor: T.bg }]}>
                  <Text style={{ fontSize: 24, opacity: isUnlocked ? 1 : 0.35 }}>{badge.emoji}</Text>
                </View>

                <View style={styles.badgeInfo}>
                  <Text style={[styles.badgeTitle, { color: isUnlocked ? T.textPrimary : T.textMuted }]}>
                    {badge.title}
                  </Text>
                  <Text style={[styles.badgeSub, { color: T.textMuted }]}>{badge.subtitle}</Text>

                  {/* Progress bar */}
                  <View style={styles.progressRow}>
                    <View style={[styles.progressBg, { backgroundColor: T.border }]}>
                      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: badge.color }]} />
                    </View>
                    <Text style={[styles.progressText, { color: badge.color }]}>
                      {Math.min((badge as any).totalLogs ? totalLogs : bestStreak, badge.target)}/{badge.target}
                    </Text>
                  </View>
                </View>

                {/* Status */}
                <Text style={{ fontSize: 20 }}>
                  {isUnlocked ? '✅' : '🔒'}
                </Text>
              </Animated.View>
            );
          })}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Tab Bar */}
        <View style={[T.neo, styles.tabBar, { backgroundColor: T.tabBg }]}>
          <Pressable style={styles.tabItem} onPressIn={() => pt(s0)} onPress={() => router.replace('/')}>
            <Animated.View style={a0}><Text style={styles.tabIcon}>🏠</Text></Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Home</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPressIn={() => pt(s1)} onPress={() => router.replace('/analytics')}>
            <Animated.View style={a1}><Text style={styles.tabIcon}>📊</Text></Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Analytics</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPressIn={() => pt(s4)} onPress={() => router.push('/new')}>
            <Animated.View style={[T.neo, styles.tabAddBtn, a4]}>
              <Text style={[styles.tabIcon, { color: T.teal, fontWeight: 'bold' }]}>＋</Text>
            </Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Add</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPressIn={() => pt(s2)} onPress={() => {}}>
            <Animated.View style={[styles.tabActive, { backgroundColor: T.tealDim, borderColor: T.tealBorder }, a2]}>
              <Text style={styles.tabIcon}>🏆</Text>
            </Animated.View>
            <Text style={[styles.tabLabel, { color: T.teal }]}>Badges</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPressIn={() => pt(s3)} onPress={() => router.replace('/settings')}>
            <Animated.View style={a3}><Text style={styles.tabIcon}>⚙️</Text></Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Settings</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  headerEmoji: { fontSize: 22 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },

  banner: { flexDirection: 'row', borderRadius: 22, padding: 18, marginBottom: 18, alignItems: 'center' },
  bannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerEmoji: { fontSize: 26 },
  bannerLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerValue: { fontSize: 22, fontWeight: '900' },
  divider: { width: 1, height: 40, marginHorizontal: 16 },

  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 2 },

  badgeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 14, marginBottom: 10 },
  badgeIcon:  { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  badgeInfo:  { flex: 1, marginRight: 10 },
  badgeTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  badgeSub:   { fontSize: 11, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBg:   { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '700', minWidth: 40 },

  tabBar: { position: 'absolute', bottom: 18, left: 14, right: 14, height: 68, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabActive: { borderRadius: 14, width: 44, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  tabAddBtn: {
    borderRadius: 14, width: 44, height: 32,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.1)',
  },
  tabIcon:   { fontSize: 18 },
  tabLabel:  { fontSize: 9, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
});
