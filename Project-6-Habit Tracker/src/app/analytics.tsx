import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import Svg, { Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useHabits } from '../hooks/use-habits';
import { useTheme } from '../context/ThemeContext';
import SpringPressable from '../components/SpringPressable';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';
import TabBar from '../components/TabBar';

const { width: SW } = Dimensions.get('window');

// ─── Multi-Ring Donut ───
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
              stroke="rgba(148,163,184,0.07)" strokeWidth={ring.strokeW} fill="transparent" />
            <Circle cx={cx} cy={cy} r={ring.radius}
              stroke={ring.color} strokeWidth={ring.strokeW} fill="transparent"
              strokeDasharray={circ} strokeDashoffset={offsets[i] ?? circ}
              strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

// ─── Animated Progress Bar ───
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const [w, setW] = React.useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 400);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <View style={pbS.bg}>
      <View style={[pbS.fill, { width: `${w}%`, backgroundColor: color }]} />
    </View>
  );
}
const pbS = StyleSheet.create({
  bg:   { height: 7, backgroundColor: 'rgba(148,163,184,0.1)', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});

export default function AnalyticsScreen() {
  const router   = useRouter();
  const { T }    = useTheme();
  const { habits } = useHabits();

  const todayStr = getLocalDateString();
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth()); // 0-11
  const [selectedGridDateStr, setSelectedGridDateStr] = React.useState(todayStr);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getStartDayOfMonth(currentYear, currentMonth);
  
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const gridCells = [];
  for (let i = 0; i < startDay; i++) {
    gridCells.push({ key: `empty-${i}`, dayNum: null, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    gridCells.push({ key: `day-${d}`, dayNum: d, dateStr });
  }

  const getDayGridStatus = (dateStr: string) => {
    const d = new Date(dateStr);
    const wd = d.getDay();
    const active = habits.filter(h => h.frequency.kind === 'daily' || h.frequency.weekdays.includes(wd));
    if (active.length === 0) return { activeCount: 0, completedCount: 0, pct: 0, color: 'transparent' };

    const completed = active.filter(h => h.completedDates.includes(dateStr)).length;
    const shielded = active.filter(h => h.shieldedDates?.includes(dateStr)).length;
    const totalDone = completed + shielded;
    const pct = Math.round((totalDone / active.length) * 100);

    let color = T.isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    if (totalDone > 0) {
      const r = T.isDark ? 94 : 46;
      const g = T.isDark ? 234 : 196;
      const b = T.isDark ? 212 : 168;

      if (pct === 100) color = T.teal;
      else if (pct >= 80) color = `rgba(${r}, ${g}, ${b}, 0.70)`;
      else if (pct >= 50) color = `rgba(${r}, ${g}, ${b}, 0.45)`;
      else if (pct >= 25) color = `rgba(${r}, ${g}, ${b}, 0.25)`;
      else color = `rgba(${r}, ${g}, ${b}, 0.12)`;
    } else if (shielded > 0) {
      color = T.orangeDim;
    }

    return { activeCount: active.length, completedCount: completed, shieldedCount: shielded, pct, color };
  };

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

  const total       = habits.length;
  const doneToday   = habits.filter(h => h.lastCompletedISO === todayStr).length;
  const consistency = total > 0 ? Math.round((doneToday / total) * 100) : 0;
  const bestStreak  = habits.reduce((m, h) => Math.max(m, getActiveStreak(h)), 0);
  const totalLogs   = habits.reduce((a, h) => a + h.completedDates.length, 0);

  const dayNames = ['S','M','T','W','T','F','S'];
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { label: dayNames[d.getDay()], count: habits.filter(h => h.completedDates.includes(iso)).length, isToday: i === 6 };
  });
  const maxBar = Math.max(1, ...weekData.map(d => d.count));

  const getRate = (habit: any) => {
    let cnt = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (habit.completedDates.includes(iso)) cnt++;
    }
    return Math.round((cnt / 7) * 100);
  };

  const ringColors = [T.teal, T.yellow, T.purple];
  const rings = habits.slice(0, 3).map((h, i) => ({
    percent: getRate(h), color: ringColors[i % 3], strokeW: 9 - i, radius: 54 - i * 18,
  }));
  const displayRings = rings.length > 0 ? rings : [
    { percent: 0, color: T.teal, strokeW: 9, radius: 54 },
    { percent: 0, color: T.yellow, strokeW: 8, radius: 36 },
    { percent: 0, color: T.purple, strokeW: 7, radius: 18 },
  ];

  const barW   = Math.floor((SW - 64 - 48) / 7);
  const chartW = SW - 64;

  // Tab animations
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
          <SpringPressable onPress={() => router.replace('/')} style={[T.neo, styles.backBtn]}>
            <Text style={[styles.backArrow, { color: T.textPrimary }]}>←</Text>
          </SpringPressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEmoji}>📊</Text>
            <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Analytics</Text>
          </View>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Multi-ring card ── */}
          <Animated.View entering={FadeInDown.delay(80).duration(500).springify()} style={[T.neo, styles.topCard]}>
            <View style={styles.ringArea}>
              <NeoDonut rings={displayRings} size={140} />
              <View style={styles.ringCenterBox}>
                <Text style={[styles.ringBig, { color: T.textPrimary }]}>{consistency}%</Text>
                <Text style={[styles.ringSmall, { color: T.textMuted }]}>Today</Text>
              </View>
            </View>
            <View style={styles.legend}>
              {habits.slice(0, 3).map((h, i) => (
                <Animated.View key={h.id} entering={FadeInRight.delay(200 + i * 80).duration(400)} style={styles.legendRow}>
                  <Text style={styles.legendEmoji}>{h.emoji}</Text>
                  <View style={styles.legendMid}>
                    <Text style={[styles.legendName, { color: T.textSub }]} numberOfLines={1}>{h.name}</Text>
                    <ProgressBar pct={getRate(h)} color={ringColors[i % 3]} />
                  </View>
                  <Text style={[styles.legendPct, { color: ringColors[i % 3] }]}>{getRate(h)}%</Text>
                </Animated.View>
              ))}
              {habits.length === 0 && <Text style={[styles.emptyHint, { color: T.textMuted }]}>💡 Add habits to see analytics</Text>}
            </View>
          </Animated.View>

          {/* ── Metric Pills ── */}
          <Animated.View entering={FadeInDown.delay(160).duration(500).springify()} style={styles.metricRow}>
            {[
              { emoji: '🔥', val: bestStreak, label: 'Best Streak', color: T.orange },
              { emoji: '✅', val: totalLogs,  label: 'Total Logs',  color: T.green },
              { emoji: '🎯', val: total,       label: 'Habits',      color: T.purple },
            ].map((m, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(200 + i * 50).springify()} style={[T.neo, styles.metricCard]}>
                <View style={[T.neo, styles.metricBubble, { backgroundColor: T.bg }]}>
                  <Text style={styles.metricEmoji}>{m.emoji}</Text>
                </View>
                <Text style={[styles.metricVal, { color: m.color }]}>{m.val}</Text>
                <Text style={[styles.metricLabel, { color: T.textMuted }]}>{m.label}</Text>
              </Animated.View>
            ))}
          </Animated.View>

          {/* ── Weekly Bar Chart ── */}
          <Animated.View entering={FadeInDown.delay(220).duration(500).springify()} style={[T.neo, styles.chartCard]}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartEmoji}>📅</Text>
              <View>
                <Text style={[styles.chartTitle, { color: T.textPrimary }]}>Weekly Activity</Text>
                <Text style={[styles.chartSub, { color: T.textMuted }]}>Past 7 days</Text>
              </View>
            </View>
            <View style={styles.barArea}>
              <Svg width={chartW} height={130}>
                {[20, 70, 110].map(y => (
                  <Line key={y} x1="0" y1={y} x2={chartW} y2={y}
                    stroke={T.isDark ? 'rgba(148,163,184,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" />
                ))}
                {weekData.map((d, idx) => {
                  const x  = idx * (barW + 7) + 2;
                  const bH = Math.max(d.count > 0 ? 10 : 0, (d.count / maxBar) * 80);
                  const y  = 110 - bH;
                  const barColor = d.isToday ? T.teal : T.tealDim;
                  return (
                    <React.Fragment key={idx}>
                      <Rect x={x} y={20} width={barW} height={90} rx={8}
                        fill={T.isDark ? 'rgba(148,163,184,0.04)' : 'rgba(0,0,0,0.04)'} />
                      {d.count > 0 && <Rect x={x} y={y} width={barW} height={bH} rx={8} fill={barColor} />}
                      <SvgText x={x + barW / 2} y={126}
                        fill={d.isToday ? T.teal : T.textMuted}
                        fontSize="10" fontWeight="700" textAnchor="middle">
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
            <Animated.View entering={FadeInDown.delay(280).duration(500).springify()} style={[T.neo, styles.chartCard]}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartEmoji}>⚡</Text>
                <View>
                  <Text style={[styles.chartTitle, { color: T.textPrimary }]}>Habit Progress</Text>
                  <Text style={[styles.chartSub, { color: T.textMuted }]}>7-day completion rate</Text>
                </View>
              </View>
              {habits.map((h, i) => {
                const rate  = getRate(h);
                const color = ringColors[i % ringColors.length];
                return (
                  <Animated.View key={h.id} entering={FadeInDown.delay(300 + i * 55).duration(400)} style={styles.habitRow}>
                    <View style={[T.neo, styles.habitEmojiBubble, { backgroundColor: T.bg }]}>
                      <Text style={styles.habitEmojiText}>{h.emoji}</Text>
                    </View>
                    <View style={styles.habitRight}>
                      <View style={styles.habitLabelRow}>
                        <Text style={[styles.habitName, { color: T.textSub }]} numberOfLines={1}>{h.name}</Text>
                        <Text style={[styles.habitPct, { color }]}>{rate}%</Text>
                      </View>
                      <ProgressBar pct={rate} color={color} />
                    </View>
                  </Animated.View>
                );
              })}
            </Animated.View>
          )}

          {/* ═══ MONTHLY PROGRESS CALENDAR GRID ═══ */}
          <Animated.View entering={FadeInDown.delay(320).duration(500).springify()} style={[T.neo, styles.chartCard, { marginBottom: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartEmoji}>📅</Text>
                <View>
                  <Text style={[styles.chartTitle, { color: T.textPrimary }]}>Calendar View</Text>
                  <Text style={[styles.chartSub, { color: T.textMuted }]}>Monthly performance overview</Text>
                </View>
              </View>
              {/* Month switcher */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SpringPressable onPress={prevMonth} style={[T.neo, styles.switchBtn]}>
                  <Text style={{ fontSize: 11, color: T.textPrimary }}>←</Text>
                </SpringPressable>
                <Text style={[styles.monthLabel, { color: T.textPrimary }]}>
                  {monthNames[currentMonth].slice(0, 3)} {String(currentYear).slice(2)}
                </Text>
                <SpringPressable onPress={nextMonth} style={[T.neo, styles.switchBtn]}>
                  <Text style={{ fontSize: 11, color: T.textPrimary }}>→</Text>
                </SpringPressable>
              </View>
            </View>

            {/* Week Headers */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 }}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(day => (
                <Text key={day} style={[styles.weekLabel, { color: T.textMuted }]}>{day}</Text>
              ))}
            </View>

            {/* Grid cells */}
            <View style={styles.gridContainer}>
              {gridCells.map((cell, idx) => {
                if (!cell.dayNum || !cell.dateStr) {
                  return <View key={cell.key} style={styles.gridEmptyCell} />;
                }
                const isSelected = cell.dateStr === selectedGridDateStr;
                const status = getDayGridStatus(cell.dateStr);

                return (
                  <Pressable
                    key={cell.key}
                    onPress={() => setSelectedGridDateStr(cell.dateStr as string)}
                    style={[
                      styles.gridDayCell,
                      { backgroundColor: status.color },
                      isSelected && { borderColor: T.teal, borderWidth: 2 }
                    ]}
                  >
                    <Text style={[
                      styles.gridDayText,
                      { color: status.pct >= 80 ? (T.isDark ? T.bg : '#ffffff') : (status.pct === 0 ? T.textMuted : T.textPrimary) },
                      isSelected && { fontWeight: '800' }
                    ]}>
                      {cell.dayNum}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Selected Date Summary Details */}
            {selectedGridDateStr && (() => {
              const parts = selectedGridDateStr.split('-');
              const gridDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              const dW = gridDate.getDay();
              const activeOnSelectedDay = habits.filter(h => h.frequency.kind === 'daily' || h.frequency.weekdays.includes(dW));
              
              const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              const dateLabel = `${gridDate.getDate()} ${months[gridDate.getMonth()]} ${gridDate.getFullYear()}`;

              return (
                <View style={[T.neoPressed, styles.detailBox, { backgroundColor: T.bgPress, marginTop: 14 }]}>
                  <Text style={[styles.detailDate, { color: T.textPrimary }]}>{dateLabel}</Text>
                  
                  {activeOnSelectedDay.length === 0 ? (
                    <Text style={[styles.detailStatus, { color: T.textMuted }]}>No habits scheduled on this day.</Text>
                  ) : (
                    <View style={{ gap: 8, marginTop: 6 }}>
                      {activeOnSelectedDay.map(h => {
                        const completed = h.completedDates.includes(selectedGridDateStr);
                        const shielded = h.shieldedDates?.includes(selectedGridDateStr);
                        return (
                          <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 13, color: T.textPrimary }}>
                              {h.emoji} {h.name}
                            </Text>
                            <Text style={[
                              styles.statusTag,
                              { color: completed ? T.teal : shielded ? T.orange : T.red }
                            ]}>
                              {completed ? '✅ Completed' : shielded ? '🛡️ Shielded' : '❌ Missed'}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })()}
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Tab Bar */}
        <TabBar activeTab="analytics" />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: '700' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEmoji:  { fontSize: 20 },
  headerTitle:  { fontSize: 18, fontWeight: '800' },
  scroll: { paddingBottom: 20 },
  topCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, marginHorizontal: 16, marginBottom: 14, padding: 18 },
  ringArea: { alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  ringCenterBox: { position: 'absolute', alignItems: 'center' },
  ringBig:  { fontSize: 20, fontWeight: '900' },
  ringSmall: { fontSize: 10, fontWeight: '600' },
  legend: { flex: 1 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  legendEmoji: { fontSize: 18, marginRight: 10, width: 26, textAlign: 'center' },
  legendMid: { flex: 1, marginRight: 6 },
  legendName: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  legendPct:  { fontSize: 12, fontWeight: '800' },
  emptyHint:  { fontSize: 12, lineHeight: 20 },
  metricRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 14 },
  metricCard: { flex: 1, borderRadius: 20, padding: 14, alignItems: 'center' },
  metricBubble: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  metricEmoji: { fontSize: 18 },
  metricVal:   { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  metricLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' },
  chartCard: { borderRadius: 22, marginHorizontal: 16, marginBottom: 14, padding: 16 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  chartEmoji: { fontSize: 20 },
  chartTitle: { fontSize: 14, fontWeight: '800' },
  chartSub:   { fontSize: 10, marginTop: 1 },
  barArea:    { alignItems: 'flex-start' },
  habitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  habitEmojiBubble: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  habitEmojiText: { fontSize: 20 },
  habitRight: { flex: 1 },
  habitLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  habitName: { fontSize: 13, fontWeight: '600', flex: 1 },
  habitPct:  { fontSize: 13, fontWeight: '800', marginLeft: 8 },

  // Calendar Switcher & Grid styles
  switchBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: 11, fontWeight: '700', width: 72, textAlign: 'center' },
  weekLabel: { width: 34, textAlign: 'center', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'space-around' },
  gridDayCell: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  gridEmptyCell: { width: 34, height: 34, marginVertical: 2 },
  gridDayText: { fontSize: 11, fontWeight: '700' },
  detailBox: { padding: 12, borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(148,163,184,0.1)' },
  detailDate: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  detailStatus: { fontSize: 11, fontStyle: 'italic' },
  statusTag: { fontSize: 11, fontWeight: '700' },
});
