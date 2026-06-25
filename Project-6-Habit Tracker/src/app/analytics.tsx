import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useHabits } from '../hooks/use-habits';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';
import { C, NEO_BG, neoCard, neoBtn } from '../constants/colors';

const { width: SW } = Dimensions.get('window');

// ─────────────────────────────
// Multi-Ring Donut with animation
// ─────────────────────────────
function NeoDonut({ rings, size }: {
  rings: { percent: number; color: string; strokeW: number; radius: number }[];
  size: number;
}) {
  const cx = size / 2, cy = size / 2;
  const [offsets, setOffsets] = React.useState(rings.map(r => 2 * Math.PI * r.radius));

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffsets(rings.map(r => {
        const circ = 2 * Math.PI * r.radius;
        return circ - (r.percent / 100) * circ;
      }));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Svg width={size} height={size}>
      {rings.map((ring, i) => {
        const circ = 2 * Math.PI * ring.radius;
        return (
          <React.Fragment key={i}>
            <Circle cx={cx} cy={cy} r={ring.radius}
              stroke="rgba(148,163,184,0.06)" strokeWidth={ring.strokeW} fill="transparent" />
            <Circle cx={cx} cy={cy} r={ring.radius}
              stroke={ring.color} strokeWidth={ring.strokeW} fill="transparent"
              strokeDasharray={circ} strokeDashoffset={offsets[i] ?? circ}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`} />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ─────────────────────────────
// Animated Progress Bar
// ─────────────────────────────
function NeoProgressBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = React.useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 400);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <View style={pbStyles.bg}>
      <View style={[pbStyles.fill, { width: `${width}%`, backgroundColor: color }]} />
    </View>
  );
}
const pbStyles = StyleSheet.create({
  bg: { height: 8, backgroundColor: 'rgba(148,163,184,0.08)', borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});

export default function AnalyticsScreen() {
  const router  = useRouter();
  const { habits } = useHabits();

  const todayStr      = getLocalDateString();
  const total         = habits.length;
  const doneToday     = habits.filter(h => h.lastCompletedISO === todayStr).length;
  const consistency   = total > 0 ? Math.round((doneToday / total) * 100) : 0;
  const bestStreak    = habits.reduce((m, h) => Math.max(m, getActiveStreak(h)), 0);
  const totalLogs     = habits.reduce((a, h) => a + h.completedDates.length, 0);

  // Weekly data
  const dayNames = ['S','M','T','W','T','F','S'];
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const cnt = habits.filter(h => h.completedDates.includes(iso)).length;
    return { label: dayNames[d.getDay()], count: cnt, isToday: i === 6 };
  });
  const maxBar = Math.max(1, ...weekData.map(d => d.count));

  // Per-habit 7-day rate
  const getRate = (habit: any) => {
    let cnt = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (habit.completedDates.includes(iso)) cnt++;
    }
    return Math.round((cnt / 7) * 100);
  };

  // Rings
  const ringColors = [C.teal, C.yellow, C.purple];
  const rings = habits.slice(0, 3).map((h, i) => ({
    percent: getRate(h),
    color: ringColors[i % 3],
    strokeW: 9 - i,
    radius: 54 - i * 18,
  }));
  const displayRings = rings.length > 0 ? rings : [
    { percent: 0, color: C.teal,   strokeW: 9, radius: 54 },
    { percent: 0, color: C.yellow, strokeW: 8, radius: 36 },
    { percent: 0, color: C.purple, strokeW: 7, radius: 18 },
  ];

  const barW   = Math.floor((SW - 64 - 48) / 7);
  const chartW = SW - 64;

  // Tab press animations
  const tabHomeScale  = useSharedValue(1);
  const tabChartScale = useSharedValue(1);
  const tabBadgeScale = useSharedValue(1);
  const tabSetScale   = useSharedValue(1);

  const tabHomeStyle  = useAnimatedStyle(() => ({ transform: [{ scale: tabHomeScale.value }] }));
  const tabChartStyle = useAnimatedStyle(() => ({ transform: [{ scale: tabChartScale.value }] }));
  const tabBadgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: tabBadgeScale.value }] }));
  const tabSetStyle   = useAnimatedStyle(() => ({ transform: [{ scale: tabSetScale.value }] }));

  const pressTab = (v: any) => {
    v.value = withSequence(withSpring(0.8), withSpring(1, { damping: 10 }));
  };


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEmoji}>📊</Text>
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Multi-ring + legend card ── */}
          <Animated.View entering={FadeInDown.delay(80).duration(500).springify()} style={styles.topCard}>
            <View style={styles.ringArea}>
              <NeoDonut rings={displayRings} size={140} />
              <View style={styles.ringCenterBox}>
                <Text style={styles.ringBig}>{consistency}%</Text>
                <Text style={styles.ringSmall}>Today</Text>
              </View>
            </View>

            <View style={styles.legend}>
              {habits.slice(0, 3).map((h, i) => (
                <Animated.View
                  key={h.id}
                  entering={FadeInRight.delay(200 + i * 80).duration(400)}
                  style={styles.legendRow}
                >
                  <Text style={styles.legendEmoji}>{h.emoji}</Text>
                  <View style={styles.legendText}>
                    <Text style={styles.legendName} numberOfLines={1}>{h.name}</Text>
                    <View style={styles.legendBarWrap}>
                      <View style={[styles.legendBarBg]}>
                        <View style={[styles.legendBarFill, {
                          width: `${getRate(h)}%`,
                          backgroundColor: ringColors[i % 3]
                        }]} />
                      </View>
                    </View>
                  </View>
                  <Text style={[styles.legendPct, { color: ringColors[i % 3] }]}>{getRate(h)}%</Text>
                </Animated.View>
              ))}
              {habits.length === 0 && (
                <Text style={styles.emptyHint}>💡 Add habits to see analytics</Text>
              )}
            </View>
          </Animated.View>

          {/* ── Metric Pills ── */}
          <Animated.View entering={FadeInDown.delay(160).duration(500).springify()} style={styles.metricRow}>
            {[
              { emoji: '🔥', val: bestStreak, label: 'Best Streak', color: C.orange },
              { emoji: '✅', val: totalLogs,  label: 'Total Logs',  color: C.green },
              { emoji: '🎯', val: total,       label: 'Habits',      color: C.purple },
            ].map((m, i) => (
              <View key={i} style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <Text style={styles.metricEmoji}>{m.emoji}</Text>
                </View>
                <Text style={[styles.metricVal, { color: m.color }]}>{m.val}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* ── Weekly Bar Chart ── */}
          <Animated.View entering={FadeInDown.delay(220).duration(500).springify()} style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartEmoji}>📅</Text>
              <View>
                <Text style={styles.chartTitle}>Weekly Activity</Text>
                <Text style={styles.chartSub}>Past 7 days</Text>
              </View>
            </View>
            <View style={styles.barArea}>
              <Svg width={chartW} height={130}>
                {[20, 70, 110].map(y => (
                  <Line key={y} x1="0" y1={y} x2={chartW} y2={y}
                    stroke="rgba(148,163,184,0.05)" strokeWidth="1" />
                ))}
                {weekData.map((d, idx) => {
                  const x  = idx * (barW + 7) + 2;
                  const bH = Math.max(d.count > 0 ? 10 : 0, (d.count / maxBar) * 80);
                  const y  = 110 - bH;
                  const col = d.isToday ? C.teal : `rgba(94,234,212,0.35)`;
                  return (
                    <React.Fragment key={idx}>
                      <Rect x={x} y={20} width={barW} height={90} rx={8}
                        fill="rgba(148,163,184,0.04)" />
                      {d.count > 0 && (
                        <Rect x={x} y={y} width={barW} height={bH} rx={8} fill={col} />
                      )}
                      <SvgText x={x + barW / 2} y={126}
                        fill={d.isToday ? C.teal : C.textMuted}
                        fontSize="10" fontWeight="700" textAnchor="middle"
                      >
                        {d.label}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>
          </Animated.View>

          {/* ── Habit Progress Bars ── */}
          {habits.length > 0 && (
            <Animated.View entering={FadeInDown.delay(280).duration(500).springify()} style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartEmoji}>⚡</Text>
                <View>
                  <Text style={styles.chartTitle}>Habit Progress</Text>
                  <Text style={styles.chartSub}>7-day completion rate</Text>
                </View>
              </View>
              {habits.map((h, i) => {
                const rate  = getRate(h);
                const color = ringColors[i % ringColors.length];
                return (
                  <Animated.View
                    key={h.id}
                    entering={FadeInDown.delay(300 + i * 60).duration(400)}
                    style={styles.habitRow}
                  >
                    {/* Neo emoji bubble */}
                    <View style={styles.habitEmojiBubble}>
                      <Text style={styles.habitEmojiText}>{h.emoji}</Text>
                    </View>
                    <View style={styles.habitRight}>
                      <View style={styles.habitLabelRow}>
                        <Text style={styles.habitName} numberOfLines={1}>{h.name}</Text>
                        <Text style={[styles.habitPct, { color }]}>{rate}%</Text>
                      </View>
                      <NeoProgressBar pct={rate} color={color} />
                    </View>
                  </Animated.View>
                );
              })}
            </Animated.View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <Pressable style={styles.tabItem} onPressIn={() => pressTab(tabHomeScale)} onPress={() => router.push('/')}>
            <Animated.View style={tabHomeStyle}><Text style={styles.tabIcon}>🏠</Text></Animated.View>
            <Text style={styles.tabLabel}>Home</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPressIn={() => pressTab(tabChartScale)} onPress={() => {}}>
            <Animated.View style={[styles.tabActivePill, tabChartStyle]}>
              <Text style={styles.tabIcon}>📊</Text>
            </Animated.View>
            <Text style={[styles.tabLabel, { color: C.teal }]}>Analytics</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPressIn={() => pressTab(tabBadgeScale)} onPress={() => router.push('/achievements')}>
            <Animated.View style={tabBadgeStyle}><Text style={styles.tabIcon}>🏆</Text></Animated.View>
            <Text style={styles.tabLabel}>Badges</Text>
          </Pressable>

          <Pressable style={styles.tabItem} onPressIn={() => pressTab(tabSetScale)} onPress={() => router.push('/settings')}>
            <Animated.View style={tabSetStyle}><Text style={styles.tabIcon}>⚙️</Text></Animated.View>
            <Text style={styles.tabLabel}>Settings</Text>
          </Pressable>
        </View>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NEO_BG },
  root: { flex: 1, backgroundColor: NEO_BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    ...neoBtn,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: C.textPrimary, fontWeight: '700' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEmoji:  { fontSize: 20 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: C.textPrimary },

  scroll: { paddingBottom: 20 },

  // Top ring card
  topCard: {
    ...neoCard,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
  },
  ringArea: { alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  ringCenterBox: { position: 'absolute', alignItems: 'center' },
  ringBig:  { fontSize: 20, fontWeight: '900', color: C.textPrimary },
  ringSmall:{ fontSize: 10, color: C.textMuted, fontWeight: '600' },
  legend: { flex: 1 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  legendEmoji: { fontSize: 18, marginRight: 10, width: 26, textAlign: 'center' },
  legendText: { flex: 1, marginRight: 6 },
  legendName: { fontSize: 12, color: C.textSub, fontWeight: '600', marginBottom: 4 },
  legendBarWrap: {},
  legendBarBg: { height: 5, backgroundColor: 'rgba(148,163,184,0.1)', borderRadius: 3, overflow: 'hidden' },
  legendBarFill: { height: '100%', borderRadius: 3 },
  legendPct:  { fontSize: 12, fontWeight: '800' },
  emptyHint: { fontSize: 12, color: C.textMuted, lineHeight: 20 },

  // Metrics
  metricRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    ...neoCard,
    flex: 1,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NEO_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#070F1C',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderLeftColor: 'rgba(255,255,255,0.07)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.45)',
    borderRightColor: 'rgba(0,0,0,0.45)',
  },
  metricEmoji: { fontSize: 18 },
  metricVal:   { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  metricLabel: { fontSize: 9, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' },

  // Chart card
  chartCard: {
    ...neoCard,
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  chartEmoji:  { fontSize: 20 },
  chartTitle:  { fontSize: 14, fontWeight: '800', color: C.textPrimary },
  chartSub:    { fontSize: 10, color: C.textMuted, marginTop: 1 },
  barArea:     { alignItems: 'flex-start' },

  // Habit rows
  habitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  habitEmojiBubble: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: NEO_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#070F1C',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderLeftColor: 'rgba(255,255,255,0.07)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.4)',
    borderRightColor: 'rgba(0,0,0,0.4)',
  },
  habitEmojiText: { fontSize: 20 },
  habitRight: { flex: 1 },
  habitLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  habitName:  { fontSize: 13, fontWeight: '600', color: C.textSub, flex: 1 },
  habitPct:   { fontSize: 13, fontWeight: '800', marginLeft: 8 },

  // Tab bar
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
  tabIcon:  { fontSize: 18 },
  tabLabel: { fontSize: 9, color: C.textMuted, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
});
