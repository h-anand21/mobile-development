import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useHabits } from '../hooks/use-habits';
import { usePushNotifications } from '../hooks/use-push-notifications';
import { useTheme } from '../context/ThemeContext';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';
import { getLocalDateString, getActiveStreak } from '../lib/habits/streak';

const { width: SW } = Dimensions.get('window');

// ─── Animated SVG Ring ───
function AnimatedRing({ percent, size, strokeWidth, color, bgColor }:
  { percent: number; size: number; strokeWidth: number; color: string; bgColor: string }) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = React.useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (percent / 100) * circ), 100);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={r} stroke={bgColor} strokeWidth={strokeWidth} fill="transparent" />
      <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={strokeWidth} fill="transparent"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
    </Svg>
  );
}

// ─── Day Cell ───
function DayCell({ label, date, isToday, count, total, T }:
  { label: string; date: number; isToday: boolean; count: number; total: number; T: any }) {
  const s = useSharedValue(0.7);
  const o = useSharedValue(0);
  useEffect(() => {
    s.value = withSpring(1, { damping: 14, stiffness: 180 });
    o.value = withTiming(1, { duration: 400 });
  }, []);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: o.value }));

  const filled  = total > 0 && count >= total;
  const partial = total > 0 && count > 0 && count < total;

  return (
    <Animated.View style={[styles.dayCell, aStyle]}>
      <Text style={[styles.dayLabel, { color: isToday ? T.teal : T.textMuted }]}>{label}</Text>
      <View style={[
        styles.dayCircle,
        isToday      && { backgroundColor: T.teal },
        filled && !isToday && { backgroundColor: T.tealDim, borderWidth: 1, borderColor: T.tealBorder },
        partial && !isToday && { backgroundColor: T.yellowDim, borderWidth: 1, borderColor: 'rgba(234,212,94,0.25)' },
      ]}>
        <Text style={[
          styles.dayNum,
          { color: isToday ? T.bg : filled ? T.teal : T.textSub },
          isToday && { fontWeight: '900' },
        ]}>
          {date}
        </Text>
      </View>
      <View style={[styles.dayDot, {
        backgroundColor: count > 0 ? (filled ? T.teal : T.yellow) : 'transparent'
      }]} />
    </Animated.View>
  );
}

// ─── Neumorphic Icon Button ───
function NeoBtn({ icon, size = 18, onPress, T }: { icon: string; size?: number; onPress?: () => void; T: any }) {
  const sc = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  return (
    <Pressable
      onPressIn={() => { sc.value = withSpring(0.88, { damping: 12 }); }}
      onPressOut={() => { sc.value = withSpring(1, { damping: 10 }); }}
      onPress={onPress}
    >
      <Animated.View style={[T.neo, styles.neoBtnCircle, aStyle]}>
        <Text style={{ fontSize: size }}>{icon}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function HomeDashboard() {
  const router = useRouter();
  const { T, isDark, toggleTheme } = useTheme();
  const { habits, loadHabits, toggleCompleteHabit } = useHabits();
  const { permissionStatus, checkPermissions } = usePushNotifications();

  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
      checkPermissions();
    }, [])
  );

  const todayStr   = getLocalDateString();
  const todayWD    = new Date().getDay();
  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  const todayHabits    = habits.filter(h => h.frequency.kind === 'daily' || h.frequency.weekdays.includes(todayWD));
  const completedCount = todayHabits.filter(h => h.lastCompletedISO === todayStr).length;
  const total          = todayHabits.length;
  const pct            = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const bestStreak     = habits.reduce((m, h) => Math.max(m, getActiveStreak(h)), 0);
  const totalLogs      = habits.reduce((a, h) => a + h.completedDates.length, 0);
  const successRate    = habits.length > 0
    ? Math.round((habits.filter(h => h.lastCompletedISO === todayStr).length / habits.length) * 100) : 0;

  // Weekly strip
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weekStrip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { label: dayNames[d.getDay()], date: d.getDate(), iso, isToday: i === 6,
      count: habits.filter(h => h.completedDates.includes(iso)).length, total: habits.length };
  });

  const weekBars = weekStrip.map(d => d.count);
  const maxBar   = Math.max(1, ...weekBars);

  // Pulse anim for avatar
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 1800 }), withTiming(1, { duration: 1800 })),
      -1, true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  // Tab anims
  const tabScales = [useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1)];
  const tabStyles = tabScales.map(v => useAnimatedStyle(() => ({ transform: [{ scale: v.value }] })));
  const pressTab = (i: number) => {
    tabScales[i].value = withSequence(withSpring(0.8), withSpring(1, { damping: 10 }));
  };

  const CARD_W = (SW - 48) / 2;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* ═══ HEADER ═══ */}
        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
          <View style={styles.avatarWrap}>
            <Animated.View style={[styles.avatarRing, { borderColor: T.teal }, pulseStyle]} />
            <View style={[T.neo, styles.avatar]}>
              <Text style={styles.avatarEmoji}>🧘</Text>
            </View>
          </View>

          <View style={styles.headerText}>
            <Text style={[styles.greetSmall, { color: T.textMuted }]}>{greetEmoji} {greeting}</Text>
            <Text style={[styles.greetName, { color: T.textPrimary }]}>Himanshu</Text>
          </View>

          {/* Theme toggle */}
          <Pressable onPress={toggleTheme} style={{ marginRight: 8 }}>
            <Animated.View style={[T.neo, styles.neoBtnCircle]}>
              <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
            </Animated.View>
          </Pressable>

          <NeoBtn icon="🔔" size={17} onPress={() => router.push('/notifications')} T={T} />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ═══ WEEKLY CALENDAR ═══ */}
          <Animated.View entering={FadeInDown.delay(80).duration(500).springify()}
            style={[T.neo, styles.calCard]}>
            {weekStrip.map((day) => (
              <DayCell key={day.iso} {...day} T={T} />
            ))}
          </Animated.View>

          {/* ═══ STATS GRID ═══ */}
          <View style={[styles.grid, { width: SW }]}>

            {/* Card 1: Habit Score */}
            <Animated.View entering={FadeInDown.delay(140).duration(500).springify()}
              style={[T.neo, { width: CARD_W, borderRadius: 22, padding: 15 }]}>
              <View style={styles.cardIconRow}>
                <View style={[T.neo, styles.iconBubble, { backgroundColor: T.bg }]}>
                  <Text style={styles.bubbleEmoji}>🎯</Text>
                </View>
                <Text style={[styles.cardLabel, { color: T.textMuted }]}>Habit Score</Text>
              </View>
              <Text style={[styles.bigNum, { color: T.teal }]}>
                {completedCount}<Text style={[styles.bigNumSub, { color: T.textMuted }]}>/{total}</Text>
              </Text>
              <Text style={[styles.cardSub, { color: T.textMuted }]}>Today's completions</Text>
              <View style={styles.heatmap}>
                {Array.from({ length: 35 }, (_, i) => (
                  <View key={i} style={[styles.heatDot, {
                    backgroundColor: i < totalLogs % 36 ? T.teal : T.tealDim
                  }]} />
                ))}
              </View>
            </Animated.View>

            {/* Card 2: Progress */}
            <Animated.View entering={FadeInDown.delay(180).duration(500).springify()}
              style={[T.neo, { width: CARD_W, borderRadius: 22, padding: 15 }]}>
              <View style={styles.cardIconRow}>
                <View style={[T.neo, styles.iconBubble, { backgroundColor: T.bg }]}>
                  <Text style={styles.bubbleEmoji}>⚡</Text>
                </View>
                <Text style={[styles.cardLabel, { color: T.textMuted }]}>Progress</Text>
              </View>
              <View style={styles.ringWrap}>
                <AnimatedRing percent={pct} size={80} strokeWidth={8}
                  color={T.purple} bgColor={T.purpleDim} />
                <View style={styles.ringCenter}>
                  <Text style={[styles.ringPct, { color: T.purple }]}>{pct}%</Text>
                </View>
              </View>
              <Text style={[styles.cardSub, { color: T.textMuted }]}>Done today</Text>
            </Animated.View>

            {/* Card 3: Streak */}
            <Animated.View entering={FadeInDown.delay(220).duration(500).springify()}
              style={[T.neo, { width: CARD_W, borderRadius: 22, padding: 15 }]}>
              <View style={styles.cardIconRow}>
                <View style={[T.neo, styles.iconBubble, { backgroundColor: T.bg }]}>
                  <Text style={styles.bubbleEmoji}>🔥</Text>
                </View>
                <Text style={[styles.cardLabel, { color: T.textMuted }]}>Streak</Text>
              </View>
              <Text style={[styles.bigNum, { color: T.orange }]}>{bestStreak}</Text>
              <Text style={[styles.cardSub, { color: T.textMuted }]}>Best days</Text>
              <View style={[styles.miniBar]}>
                {weekBars.map((v, i) => {
                  const h = Math.max(v > 0 ? 6 : 0, (v / maxBar) * 32);
                  return (
                    <View key={i} style={styles.miniBarSlot}>
                      <View style={[styles.miniBarFill, {
                        height: h,
                        backgroundColor: i === 6 ? T.orange : T.orangeDim,
                      }]} />
                    </View>
                  );
                })}
              </View>
            </Animated.View>

            {/* Card 4: Success Rate */}
            <Animated.View entering={FadeInDown.delay(260).duration(500).springify()}
              style={[T.neo, { width: CARD_W, borderRadius: 22, padding: 15 }]}>
              <View style={styles.cardIconRow}>
                <View style={[T.neo, styles.iconBubble, { backgroundColor: T.bg }]}>
                  <Text style={styles.bubbleEmoji}>🏆</Text>
                </View>
                <Text style={[styles.cardLabel, { color: T.textMuted }]}>Success</Text>
              </View>
              <View style={styles.ringWrap}>
                <AnimatedRing percent={successRate} size={68} strokeWidth={7}
                  color={T.green} bgColor={T.greenDim} />
                <View style={styles.ringCenter}>
                  <Text style={[styles.ringPct, { fontSize: 13, color: T.green }]}>{successRate}%</Text>
                </View>
              </View>
              <Text style={[styles.cardSub, { color: T.textMuted }]}>Rate today</Text>
            </Animated.View>

          </View>

          {/* ═══ TODAY'S HABITS ═══ */}
          <Animated.View entering={FadeInDown.delay(300).duration(500).springify()} style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionEmoji}>✨</Text>
              <Text style={[styles.sectionTitle, { color: T.textPrimary }]}>Today's Habits</Text>
            </View>
            <Link href="/new" asChild>
              <Pressable>
                <View style={[T.neo, styles.addBtn]}>
                  <Text style={[styles.addBtnText, { color: T.teal }]}>＋ Add</Text>
                </View>
              </Pressable>
            </Link>
          </Animated.View>

          {permissionStatus === 'denied' && (
            <Animated.View entering={FadeInDown.delay(320).duration(400)}
              style={[T.neo, styles.permBanner, { borderTopColor: T.orangeDim, borderLeftColor: T.orangeDim }]}>
              <Text style={styles.permEmoji}>🔕</Text>
              <Text style={[styles.permText, { color: T.textSub }]}>Enable notifications for reminders</Text>
              <Pressable onPress={() => router.push('/notifications')}>
                <Text style={[styles.permAction, { color: T.orange }]}>Fix →</Text>
              </Pressable>
            </Animated.View>
          )}

          {todayHabits.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(340).duration(400)}>
              <EmptyState />
            </Animated.View>
          ) : (
            todayHabits.map((habit, i) => (
              <HabitCard key={habit.id} habit={habit} onToggleComplete={toggleCompleteHabit} index={i} />
            ))
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ═══ TAB BAR ═══ */}
        <View style={[T.neo, styles.tabBar, { backgroundColor: T.tabBg }]}>

          <Pressable style={styles.tabItem} onPressIn={() => pressTab(0)} onPress={() => {}}>
            <Animated.View style={[styles.tabActivePill, { backgroundColor: T.tealDim, borderColor: T.tealBorder }, tabStyles[0]]}>
              <Text style={styles.tabIcon}>🏠</Text>
            </Animated.View>
            <Text style={[styles.tabLabel, { color: T.teal }]}>Home</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPressIn={() => pressTab(1)} onPress={() => router.push('/analytics')}>
            <Animated.View style={tabStyles[1]}><Text style={styles.tabIcon}>📊</Text></Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Analytics</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPressIn={() => pressTab(4)} onPress={() => router.push('/new')}>
            <Animated.View style={[T.neo, styles.tabAddBtn, tabStyles[4]]}>
              <Text style={[styles.tabIcon, { color: T.teal, fontWeight: 'bold' }]}>＋</Text>
            </Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Add</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPressIn={() => pressTab(2)} onPress={() => router.push('/achievements')}>
            <Animated.View style={tabStyles[2]}><Text style={styles.tabIcon}>🏆</Text></Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Badges</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPressIn={() => pressTab(3)} onPress={() => router.push('/settings')}>
            <Animated.View style={tabStyles[3]}><Text style={styles.tabIcon}>⚙️</Text></Animated.View>
            <Text style={[styles.tabLabel, { color: T.textMuted }]}>Settings</Text>
          </Pressable>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1 },
  root:  { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
  },
  avatarWrap: { alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarRing: {
    position: 'absolute', width: 50, height: 50, borderRadius: 25,
    borderWidth: 2, opacity: 0.35,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 22 },
  headerText: { flex: 1 },
  greetSmall: { fontSize: 12, fontWeight: '500' },
  greetName:  { fontSize: 18, fontWeight: '800', marginTop: 1 },
  neoBtnCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 20 },

  calCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: 16, borderRadius: 24,
    paddingVertical: 16, paddingHorizontal: 12, marginBottom: 16,
  },
  dayCell:   { alignItems: 'center', width: 36 },
  dayLabel:  { fontSize: 9, fontWeight: '700', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayNum:    { fontSize: 12, fontWeight: '700' },
  dayDot:    { width: 5, height: 5, borderRadius: 3, marginTop: 5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 14, marginBottom: 20 },

  cardIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBubble:  { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  bubbleEmoji: { fontSize: 14 },
  cardLabel:   { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bigNum:      { fontSize: 30, fontWeight: '900', letterSpacing: -1, lineHeight: 34 },
  bigNumSub:   { fontSize: 16, fontWeight: '600' },
  cardSub:     { fontSize: 10, marginTop: 4, fontWeight: '500' },
  heatmap:     { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 4 },
  heatDot:     { width: 8, height: 8, borderRadius: 2 },
  ringWrap:    { alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  ringCenter:  { position: 'absolute', alignItems: 'center' },
  ringPct:     { fontSize: 15, fontWeight: '900' },
  miniBar:     { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, gap: 4, height: 36 },
  miniBarSlot: { flex: 1, height: 36, justifyContent: 'flex-end' },
  miniBarFill: { borderRadius: 3, width: '100%' },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  sectionLeft:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionEmoji: { fontSize: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  addBtn:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  addBtnText:   { fontSize: 12, fontWeight: '700' },

  permBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  permEmoji:  { fontSize: 16 },
  permText:   { flex: 1, fontSize: 12, fontWeight: '500' },
  permAction: { fontSize: 12, fontWeight: '700' },

  tabBar: {
    position: 'absolute', bottom: 18, left: 14, right: 14, height: 68,
    borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabActivePill: {
    borderRadius: 14, width: 44, height: 32,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  tabAddBtn: {
    borderRadius: 14, width: 44, height: 32,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.1)',
  },
  tabIcon:  { fontSize: 18 },
  tabLabel: { fontSize: 9, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
});
