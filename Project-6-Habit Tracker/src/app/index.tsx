import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useHabits } from '../hooks/use-habits';
import { usePushNotifications } from '../hooks/use-push-notifications';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';
import { getLocalDateString, getActiveStreak } from '../lib/habits/streak';
import { C, NEO_BG, neoCard, neoBtn } from '../constants/colors';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 48) / 2;

// ─────────────────────────────
// Animated SVG Ring
// ─────────────────────────────
function AnimatedRing({
  percent, size, strokeWidth, color, bgColor,
}: { percent: number; size: number; strokeWidth: number; color: string; bgColor: string }) {
  const r  = (size - strokeWidth) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percent, { duration: 1200, easing: Easing.out(Easing.exp) });
  }, [percent]);

  // We drive offset via JS since react-native-svg doesn't animate native
  const [dashOffset, setDashOffset] = React.useState(circ);
  const animatedStyle = useAnimatedStyle(() => {
    const offset = circ - (progress.value / 100) * circ;
    return {};
  });

  // Manually sync
  React.useEffect(() => {
    const target = circ - (percent / 100) * circ;
    const timer = setTimeout(() => setDashOffset(target), 50);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={r} stroke={bgColor} strokeWidth={strokeWidth} fill="transparent" />
      <Circle
        cx={cx} cy={cy} r={r} stroke={color} strokeWidth={strokeWidth} fill="transparent"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </Svg>
  );
}

// ─────────────────────────────
// Neumorphic Icon Button
// ─────────────────────────────
function NeoIconBtn({ icon, size = 22, onPress }: { icon: string; size?: number; onPress?: () => void }) {
  const s = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Pressable
      onPressIn={() => { s.value = withSpring(0.9, { damping: 12 }); }}
      onPressOut={() => { s.value = withSpring(1, { damping: 10 }); }}
      onPress={onPress}
    >
      <Animated.View style={[styles.neoBtn, aStyle]}>
        <Text style={{ fontSize: size }}>{icon}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─────────────────────────────
// Weekly Day Cell
// ─────────────────────────────
function DayCell({ label, date, isToday, count, total }:
  { label: string; date: number; isToday: boolean; count: number; total: number }) {
  const scaleAnim = useSharedValue(0.7);
  const opacAnim  = useSharedValue(0);

  useEffect(() => {
    scaleAnim.value = withSpring(1, { damping: 14, stiffness: 180 });
    opacAnim.value  = withTiming(1, { duration: 500 });
  }, []);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacAnim.value,
  }));

  const filled = total > 0 && count >= total;
  const partial = total > 0 && count > 0 && count < total;

  return (
    <Animated.View style={[styles.dayCell, aStyle]}>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{label}</Text>
      <View style={[
        styles.dayCircle,
        isToday && styles.dayCircleToday,
        filled && !isToday && styles.dayCircleFull,
        partial && !isToday && styles.dayCirclePartial,
      ]}>
        <Text style={[styles.dayNum, isToday && styles.dayNumToday, filled && !isToday && styles.dayNumFull]}>
          {date}
        </Text>
      </View>
      <View style={[
        styles.dayDot,
        { backgroundColor: filled ? C.teal : partial ? C.yellow : 'transparent' }
      ]} />
    </Animated.View>
  );
}

// ─────────────────────────────
// Main Home Screen
// ─────────────────────────────
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

  const todayStr    = getLocalDateString();
  const todayWD     = new Date().getDay();
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji  = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  const todayHabits   = habits.filter(h =>
    h.frequency.kind === 'daily' || h.frequency.weekdays.includes(todayWD)
  );
  const completedCount = todayHabits.filter(h => h.lastCompletedISO === todayStr).length;
  const total          = todayHabits.length;
  const pct            = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const bestStreak  = habits.reduce((m, h) => Math.max(m, getActiveStreak(h)), 0);
  const totalLogs   = habits.reduce((a, h) => a + h.completedDates.length, 0);
  const successRate = habits.length > 0
    ? Math.round((habits.filter(h => h.lastCompletedISO === todayStr).length / habits.length) * 100) : 0;

  // Weekly strip data
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weekStrip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const cnt = habits.filter(h => h.completedDates.includes(iso)).length;
    return { label: dayNames[d.getDay()], date: d.getDate(), iso, isToday: i === 6, count: cnt, total: habits.length };
  });

  // Weekly bar data for streak card
  const weekBars = weekStrip.map(d => d.count);
  const maxBar   = Math.max(1, ...weekBars);

  // Pulse animation for avatar
  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2000 }),
        withTiming(1,    { duration: 2000 })
      ), -1, true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseAnim.value }] }));

  // Tab press animations
  const tabHomeScale  = useSharedValue(1);
  const tabChartScale = useSharedValue(1);
  const tabBadgeScale = useSharedValue(1);
  const tabSetScale   = useSharedValue(1);

  const tabHomeStyle  = useAnimatedStyle(() => ({ transform: [{ scale: tabHomeScale.value }] }));
  const tabChartStyle = useAnimatedStyle(() => ({ transform: [{ scale: tabChartScale.value }] }));
  const tabBadgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: tabBadgeScale.value }] }));
  const tabSetStyle   = useAnimatedStyle(() => ({ transform: [{ scale: tabSetScale.value }] }));

  const pressTab = (v: Animated.SharedValue<number>) => {
    v.value = withSequence(withSpring(0.8), withSpring(1, { damping: 10 }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>

        {/* ═══ HEADER ═══ */}
        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
          {/* Avatar with pulse ring */}
          <View style={styles.avatarWrap}>
            <Animated.View style={[styles.avatarRing, pulseStyle]} />
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🧘</Text>
            </View>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.greetSmall}>{greetEmoji} {greeting}</Text>
            <Text style={styles.greetName}>Himanshu</Text>
          </View>

          <NeoIconBtn icon="🔔" size={18} onPress={() => router.push('/notifications')} />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ═══ WEEKLY CALENDAR ═══ */}
          <Animated.View entering={FadeInDown.delay(80).duration(500).springify()} style={styles.calCard}>
            {weekStrip.map((day, i) => (
              <DayCell key={day.iso} {...day} />
            ))}
          </Animated.View>

          {/* ═══ STATS GRID ═══ */}
          <View style={styles.grid}>

            {/* Card 1: Habit Score (heatmap dots) */}
            <Animated.View entering={FadeInDown.delay(140).duration(500).springify()} style={[styles.statCard, styles.cardDeep]}>
              <View style={styles.cardIconRow}>
                <View style={[styles.iconPill, { backgroundColor: C.tealDim }]}>
                  <Text style={styles.iconPillEmoji}>🎯</Text>
                </View>
                <Text style={styles.cardLabel}>Habit Score</Text>
              </View>
              <Text style={styles.bigNum}>
                {completedCount}
                <Text style={styles.bigNumSub}>/{total}</Text>
              </Text>
              <Text style={styles.cardSub}>Today's completions</Text>
              <View style={styles.heatmap}>
                {Array.from({ length: 35 }, (_, i) => (
                  <View key={i} style={[
                    styles.heatDot,
                    { backgroundColor: i < totalLogs % 36 ? C.teal : 'rgba(94,234,212,0.09)' }
                  ]} />
                ))}
              </View>
            </Animated.View>

            {/* Card 2: Progress ring */}
            <Animated.View entering={FadeInDown.delay(180).duration(500).springify()} style={[styles.statCard, styles.cardPurple]}>
              <View style={styles.cardIconRow}>
                <View style={[styles.iconPill, { backgroundColor: C.purpleDim }]}>
                  <Text style={styles.iconPillEmoji}>⚡</Text>
                </View>
                <Text style={styles.cardLabel}>Progress</Text>
              </View>
              <View style={styles.ringWrap}>
                <AnimatedRing percent={pct} size={80} strokeWidth={8} color={C.purple} bgColor="rgba(196,94,234,0.1)" />
                <View style={styles.ringCenter}>
                  <Text style={[styles.ringPct, { color: C.purple }]}>{pct}%</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>Done today</Text>
            </Animated.View>

            {/* Card 3: Streak (mini bar chart) */}
            <Animated.View entering={FadeInDown.delay(220).duration(500).springify()} style={[styles.statCard, styles.cardOrange]}>
              <View style={styles.cardIconRow}>
                <View style={[styles.iconPill, { backgroundColor: C.orangeDim }]}>
                  <Text style={styles.iconPillEmoji}>🔥</Text>
                </View>
                <Text style={styles.cardLabel}>Streak</Text>
              </View>
              <Text style={[styles.bigNum, { color: C.orange }]}>{bestStreak}</Text>
              <Text style={styles.cardSub}>Best days</Text>
              {/* Mini bar chart */}
              <View style={styles.miniBar}>
                {weekBars.map((v, i) => {
                  const h = Math.max(v > 0 ? 6 : 0, (v / maxBar) * 32);
                  return (
                    <View key={i} style={styles.miniBarSlot}>
                      <View style={[styles.miniBarFill, {
                        height: h,
                        backgroundColor: i === 6 ? C.orange : 'rgba(234,135,94,0.4)',
                      }]} />
                    </View>
                  );
                })}
              </View>
            </Animated.View>

            {/* Card 4: Success rate ring */}
            <Animated.View entering={FadeInDown.delay(260).duration(500).springify()} style={[styles.statCard, styles.cardGreen]}>
              <View style={styles.cardIconRow}>
                <View style={[styles.iconPill, { backgroundColor: C.greenDim }]}>
                  <Text style={styles.iconPillEmoji}>🏆</Text>
                </View>
                <Text style={styles.cardLabel}>Success</Text>
              </View>
              <View style={styles.ringWrap}>
                <AnimatedRing percent={successRate} size={68} strokeWidth={7} color={C.green} bgColor="rgba(94,234,135,0.09)" />
                <View style={styles.ringCenter}>
                  <Text style={[styles.ringPct, { fontSize: 13, color: C.green }]}>{successRate}%</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>Rate today</Text>
            </Animated.View>

          </View>

          {/* ═══ TODAY'S HABITS ═══ */}
          <Animated.View entering={FadeInDown.delay(300).duration(500).springify()} style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionEmoji}>✨</Text>
              <Text style={styles.sectionTitle}>Today's Habits</Text>
            </View>
            <Link href="/new" asChild>
              <Pressable>
                <View style={styles.addBtn}>
                  <Text style={styles.addBtnText}>＋ Add</Text>
                </View>
              </Pressable>
            </Link>
          </Animated.View>

          {permissionStatus === 'denied' && (
            <Animated.View entering={FadeInDown.delay(320).duration(400)} style={styles.permBanner}>
              <Text style={styles.permEmoji}>🔕</Text>
              <Text style={styles.permText}>Enable notifications for habit reminders</Text>
              <Pressable onPress={() => router.push('/notifications')}>
                <Text style={styles.permAction}>Fix →</Text>
              </Pressable>
            </Animated.View>
          )}

          {todayHabits.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(340).duration(400)}>
              <EmptyState />
            </Animated.View>
          ) : (
            todayHabits.map((habit, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleComplete={toggleCompleteHabit}
                index={i}
              />
            ))
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ═══ TAB BAR ═══ */}
        <View style={styles.tabBar}>

          {/* Home — active */}
          <Pressable style={styles.tabItem}
            onPressIn={() => pressTab(tabHomeScale)}
            onPress={() => {}}
          >
            <Animated.View style={[styles.tabActivePill, tabHomeStyle]}>
              <Text style={styles.tabIconActive}>🏠</Text>
            </Animated.View>
            <Text style={[styles.tabLabel, { color: C.teal }]}>Home</Text>
          </Pressable>

          {/* Analytics */}
          <Pressable style={styles.tabItem}
            onPressIn={() => pressTab(tabChartScale)}
            onPress={() => router.push('/analytics')}
          >
            <Animated.View style={[styles.tabItem2, tabChartStyle]}>
              <Text style={styles.tabIcon}>📊</Text>
            </Animated.View>
            <Text style={styles.tabLabel}>Analytics</Text>
          </Pressable>

          {/* Badges */}
          <Pressable style={styles.tabItem}
            onPressIn={() => pressTab(tabBadgeScale)}
            onPress={() => router.push('/achievements')}
          >
            <Animated.View style={[styles.tabItem2, tabBadgeStyle]}>
              <Text style={styles.tabIcon}>🏆</Text>
            </Animated.View>
            <Text style={styles.tabLabel}>Badges</Text>
          </Pressable>

          {/* Settings */}
          <Pressable style={styles.tabItem}
            onPressIn={() => pressTab(tabSetScale)}
            onPress={() => router.push('/settings')}
          >
            <Animated.View style={[styles.tabItem2, tabSetStyle]}>
              <Text style={styles.tabIcon}>⚙️</Text>
            </Animated.View>
            <Text style={styles.tabLabel}>Settings</Text>
          </Pressable>

        </View>


      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────
// Styles
// ─────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NEO_BG },
  root: { flex: 1, backgroundColor: NEO_BG },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: C.teal,
    opacity: 0.35,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NEO_BG,
    alignItems: 'center',
    justifyContent: 'center',
    // Neo extruded
    shadowColor: '#070F1C',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.09)',
    borderLeftColor: 'rgba(255,255,255,0.09)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.55)',
    borderRightColor: 'rgba(0,0,0,0.55)',
  },
  avatarEmoji: { fontSize: 22 },
  headerText: { flex: 1 },
  greetSmall: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  greetName:  { fontSize: 18, fontWeight: '800', color: C.textPrimary, marginTop: 1 },
  neoBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: NEO_BG,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#070F1C',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderLeftColor: 'rgba(255,255,255,0.07)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.5)',
    borderRightColor: 'rgba(0,0,0,0.5)',
  },

  scroll: { paddingBottom: 20 },

  // Calendar strip
  calCard: {
    ...neoCard,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  dayCell: { alignItems: 'center', width: 36 },
  dayLabel: { fontSize: 9, color: C.textMuted, fontWeight: '700', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 },
  dayLabelToday: { color: C.teal },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayCircleToday: { backgroundColor: C.teal, shadowColor: C.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 8 },
  dayCircleFull:  { backgroundColor: 'rgba(94,234,212,0.14)', borderWidth: 1, borderColor: C.tealBorder },
  dayCirclePartial: { backgroundColor: 'rgba(234,212,94,0.1)', borderWidth: 1, borderColor: 'rgba(234,212,94,0.2)' },
  dayNum: { fontSize: 12, fontWeight: '700', color: C.textSub },
  dayNumToday: { color: '#0A1628', fontWeight: '900' },
  dayNumFull:  { color: C.teal },
  dayDot: { width: 5, height: 5, borderRadius: 3, marginTop: 5 },

  // Stats grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    ...neoCard,
    width: CARD_W,
    borderRadius: 22,
    padding: 15,
  },
  cardDeep:   { },
  cardPurple: { borderTopColor: 'rgba(196,94,234,0.08)', borderLeftColor: 'rgba(196,94,234,0.08)' },
  cardOrange: { borderTopColor: 'rgba(234,135,94,0.08)', borderLeftColor: 'rgba(234,135,94,0.08)' },
  cardGreen:  { borderTopColor: 'rgba(94,234,135,0.08)', borderLeftColor: 'rgba(94,234,135,0.08)' },

  cardIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconPill: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    // neo inset
    shadowColor: '#070F1C',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 3,
    elevation: 3,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    borderLeftColor: 'rgba(255,255,255,0.05)',
    borderBottomColor: 'rgba(0,0,0,0.3)',
    borderRightColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  iconPillEmoji: { fontSize: 14 },
  cardLabel: { fontSize: 10, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bigNum: { fontSize: 30, fontWeight: '900', color: C.teal, letterSpacing: -1, lineHeight: 34 },
  bigNumSub: { fontSize: 16, fontWeight: '600', color: C.textMuted },
  cardSub: { fontSize: 10, color: C.textMuted, marginTop: 4, fontWeight: '500' },

  // Heatmap
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 4 },
  heatDot:  { width: 8, height: 8, borderRadius: 2 },

  // Ring
  ringWrap:   { alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringPct:    { fontSize: 15, fontWeight: '900' },

  // Mini bar chart
  miniBar: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, gap: 4, height: 36 },
  miniBarSlot: { flex: 1, height: 36, justifyContent: 'flex-end' },
  miniBarFill: { borderRadius: 3, width: '100%' },

  // Section row
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionEmoji: { fontSize: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.textPrimary },
  addBtn: {
    ...neoCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtnText: { fontSize: 12, fontWeight: '700', color: C.teal },

  // Permission banner
  permBanner: {
    ...neoCard,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderTopColor: 'rgba(234,135,94,0.15)',
    borderLeftColor: 'rgba(234,135,94,0.15)',
  },
  permEmoji: { fontSize: 16 },
  permText:  { flex: 1, fontSize: 12, color: C.textSub, fontWeight: '500' },
  permAction: { fontSize: 12, fontWeight: '700', color: C.orange },

  // Tab Bar — neumorphic floating pill
  tabBar: {
    position: 'absolute',
    bottom: 18,
    left: 14,
    right: 14,
    height: 68,
    ...neoCard,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', width: 68 },
  tabItem2: { alignItems: 'center', justifyContent: 'center' },
  tabActivePill: {
    backgroundColor: C.tealDim,
    borderRadius: 14,
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.tealBorder,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabIconActive: { fontSize: 18 },
  tabIcon:       { fontSize: 18 },
  tabLabel: {
    fontSize: 9,
    color: C.textMuted,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
