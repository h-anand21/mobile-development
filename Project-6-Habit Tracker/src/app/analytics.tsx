import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, BackHandler, Image } from 'react-native';
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
import Svg, { Circle, Rect, Line, Path, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../hooks/use-habits';
import { useTheme } from '../context/ThemeContext';
import SpringPressable from '../components/SpringPressable';
import { getActiveStreak, getLocalDateString } from '../lib/habits/streak';
import TabBar from '../components/TabBar';

const { width: SW } = Dimensions.get('window');

const isImageUri = (str?: string) => Boolean(str && (str.startsWith('file:') || str.startsWith('content:') || str.startsWith('http:') || str.startsWith('https:') || str.startsWith('data:')));

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

        {/* ── 1. Header Bar ── */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <SpringPressable onPress={() => router.replace('/')} style={[T.neo, styles.backBtn]}>
            <Ionicons name="arrow-back" size={20} color={T.textPrimary} />
          </SpringPressable>
          <View style={styles.headerCenter}>
            <Ionicons name="bar-chart" size={22} color={T.teal} style={{ marginRight: 6 }} />
            <View>
              <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Analytics</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: T.textMuted }}>Insights into your habits</Text>
            </View>
          </View>
          <View style={{ width: 44 }} />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── 2. Top Summary Card (Dual Widget: Ring + Top Habit Progress) ── */}
          <Animated.View entering={FadeInDown.delay(80).duration(500).springify()}
            style={[T.neo, { marginHorizontal: 16, borderRadius: 24, padding: 18, backgroundColor: T.bgCard, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            
            {/* Left Circular Ring */}
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 110, height: 110, position: 'relative' }}>
              <Svg width={110} height={110} style={{ position: 'absolute' }}>
                <Circle cx={55} cy={55} r={46} stroke="rgba(255,255,255,0.06)" strokeWidth={9} fill="transparent" />
                <Circle
                  cx={55} cy={55} r={46}
                  stroke={T.teal}
                  strokeWidth={9}
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={(2 * Math.PI * 46) * (1 - (consistency / 100))}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                />
              </Svg>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#FFFFFF', includeFontPadding: false }}>{consistency}%</Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#94A3B8', marginTop: 1 }}>Today</Text>
            </View>

            {/* Vertical Divider */}
            <View style={{ width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 14 }} />

            {/* Right Top Habit Progress (Renders ALL User Habits) */}
            <View style={{ flex: 1, justifyContent: 'center' }}>
              {habits.length > 0 ? (
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ maxHeight: 115 }}>
                  <View style={{ gap: 10 }}>
                    {habits.map((h, i) => {
                      const rate = getRate(h);
                      const color = ringColors[i % ringColors.length];
                      return (
                        <View key={h.id}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                              {isImageUri(h.emoji) ? (
                                <Image source={{ uri: h.emoji }} style={{ width: 20, height: 20, borderRadius: 6 }} />
                              ) : (
                                <Text style={{ fontSize: 15 }}>{h.emoji}</Text>
                              )}
                              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF', flex: 1 }} numberOfLines={1}>
                                {h.name}
                              </Text>
                            </View>
                            <Text style={{ fontSize: 11, fontWeight: '800', color }}>{rate}%</Text>
                          </View>
                          <ProgressBar pct={rate} color={color} />
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: T.textMuted }}>No habits created yet</Text>
                </View>
              )}
            </View>

          </Animated.View>

          {/* ── 3. Three Metric Stat Cards ── */}
          <Animated.View entering={FadeInDown.delay(160).duration(500).springify()} style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 14 }}>
            {/* Card 1: Best Streak */}
            <View style={[T.neo, { flex: 1, borderRadius: 20, padding: 12, backgroundColor: T.bgCard }]}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(249,115,22,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Ionicons name="flame" size={18} color={T.orange} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: T.orange, marginBottom: 2 }}>{bestStreak}</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 }}>Best Streak</Text>
              <Text style={{ fontSize: 9, fontWeight: '600', color: '#64748B' }}>Keep going!</Text>
            </View>

            {/* Card 2: Total Logs */}
            <View style={[T.neo, { flex: 1, borderRadius: 20, padding: 12, backgroundColor: T.bgCard }]}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Ionicons name="checkbox-outline" size={18} color={T.green} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: T.green, marginBottom: 2 }}>{totalLogs}</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 }}>Total Logs</Text>
              <Text style={{ fontSize: 9, fontWeight: '600', color: '#64748B' }}>This week</Text>
            </View>

            {/* Card 3: Habits Tracked */}
            <View style={[T.neo, { flex: 1, borderRadius: 20, padding: 12, backgroundColor: T.bgCard }]}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(168,85,247,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Ionicons name="disc-outline" size={18} color={T.purple} />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: T.purple, marginBottom: 2 }}>{total}</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 }}>Habits Tracked</Text>
              <Text style={{ fontSize: 9, fontWeight: '600', color: '#64748B' }}>Keep it up!</Text>
            </View>
          </Animated.View>

          {/* ── 4. Weekly Activity Bar Chart ── */}
          <Animated.View entering={FadeInDown.delay(220).duration(500).springify()} style={[T.neo, { marginHorizontal: 16, borderRadius: 24, padding: 18, backgroundColor: T.bgCard, marginBottom: 14 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(45,212,191,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="calendar-outline" size={18} color={T.teal} />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>Weekly Activity</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 1 }}>Past 7 days</Text>
                </View>
              </View>

              {/* Dropdown Pill */}
              <View style={[T.neoPressed, { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: T.bgPress }]}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: T.textPrimary }}>This Week</Text>
                <Ionicons name="chevron-down" size={12} color={T.textMuted} />
              </View>
            </View>

            <View style={styles.barArea}>
              <Svg width={chartW} height={130}>
                {[20, 70, 110].map(y => (
                  <Line key={y} x1="0" y1={y} x2={chartW} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                ))}
                {weekData.map((d, idx) => {
                  const x  = idx * (barW + 8) + 4;
                  const bH = Math.max(d.count > 0 ? 16 : 8, (d.count / maxBar) * 80);
                  const y  = 110 - bH;
                  const barColor = d.isToday ? T.teal : 'rgba(45,212,191,0.3)';
                  return (
                    <React.Fragment key={idx}>
                      <Rect x={x} y={20} width={barW} height={90} rx={10} fill="rgba(255,255,255,0.04)" />
                      <Rect x={x} y={y} width={barW} height={bH} rx={10} fill={barColor} />
                      <SvgText x={x + barW / 2} y={126}
                        fill={d.isToday ? T.teal : '#64748B'}
                        fontSize="10" fontWeight={d.isToday ? "900" : "700"} textAnchor="middle">
                        {d.isToday ? 'Today' : d.label}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>
          </Animated.View>

          {/* ── 5. Habit Progress Sparkline Graph ── */}
          {habits.length > 0 && (
            <Animated.View entering={FadeInDown.delay(280).duration(500).springify()} style={[T.neo, { marginHorizontal: 16, borderRadius: 24, padding: 18, backgroundColor: T.bgCard, marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(234,179,8,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="flash-outline" size={18} color="#EAB308" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>Habit Progress</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 1 }}>7-day completion rate</Text>
                  </View>
                </View>

                {/* Sparkline Graph Vector on Right */}
                <Svg width={80} height={35} viewBox="0 0 80 35">
                  <Path d="M 5 28 L 20 20 L 35 25 L 50 10 L 65 18 L 75 5" stroke={T.teal} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <Circle cx="75" cy="5" r="3" fill={T.teal} />
                </Svg>
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
                        <Text style={[styles.habitName, { color: '#FFFFFF' }]} numberOfLines={1}>{h.name}</Text>
                        <Text style={[styles.habitPct, { color }]}>{rate}%</Text>
                      </View>
                      <ProgressBar pct={rate} color={color} />
                    </View>
                  </Animated.View>
                );
              })}
            </Animated.View>
          )}

          {/* ── 6. Calendar View (Monthly Performance Overview) ── */}
          <Animated.View entering={FadeInDown.delay(320).duration(500).springify()} style={[T.neo, { marginHorizontal: 16, borderRadius: 24, padding: 18, backgroundColor: T.bgCard, marginBottom: 16 }]}>
            
            {/* Header with Switcher */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(168,85,247,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="calendar" size={18} color={T.purple} />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>Calendar View</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 1 }}>Monthly performance overview</Text>
                </View>
              </View>

              {/* Month switcher */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SpringPressable onPress={prevMonth} style={[T.neo, styles.switchBtn]}>
                  <Ionicons name="chevron-back" size={14} color={T.textPrimary} />
                </SpringPressable>
                <Text style={{ fontSize: 12, fontWeight: '800', color: T.textPrimary, paddingHorizontal: 4 }}>
                  {monthNames[currentMonth].slice(0, 3)} {currentYear}
                </Text>
                <SpringPressable onPress={nextMonth} style={[T.neo, styles.switchBtn]}>
                  <Ionicons name="chevron-forward" size={14} color={T.textPrimary} />
                </SpringPressable>
              </View>
            </View>

            {/* ── 1. Full-Width Monthly Calendar Grid ── */}
            <View style={{ marginBottom: 16 }}>
              {/* Day Header Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 4 }}>
                {['SU','MO','TU','WE','TH','FR','SA'].map(day => (
                  <Text key={day} style={{ fontSize: 11, fontWeight: '800', color: '#64748B', width: (SW - 68) / 7, textAlign: 'center' }}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-start' }}>
                {gridCells.map((cell) => {
                  const cellWidth = Math.floor((SW - 68 - 24) / 7);
                  if (!cell.dayNum || !cell.dateStr) {
                    return <View key={cell.key} style={{ width: cellWidth, height: 40 }} />;
                  }
                  const isSelected = cell.dateStr === selectedGridDateStr;
                  const status = getDayGridStatus(cell.dateStr);
                  const isTodayCell = cell.dateStr === todayStr;

                  return (
                    <Pressable
                      key={cell.key}
                      onPress={() => setSelectedGridDateStr(cell.dateStr as string)}
                      style={[
                        { width: cellWidth, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
                        { backgroundColor: status.color || 'rgba(255,255,255,0.03)' },
                        isSelected && { backgroundColor: T.teal, transform: [{ scale: 1.05 }], shadowColor: T.teal, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
                        isTodayCell && !isSelected && { borderWidth: 2, borderColor: T.teal }
                      ]}
                    >
                      <Text style={[
                        { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
                        isSelected && { fontWeight: '900', color: '#0D1525', fontSize: 14 }
                      ]}>
                        {cell.dayNum}
                      </Text>
                      {status.completedCount > 0 && !isSelected && (
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: T.teal, position: 'absolute', bottom: 4 }} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ── 2. Full-Width Selected Date Detail Card ── */}
            <View style={[T.neoPressed, { borderRadius: 20, padding: 16, backgroundColor: T.bgPress }]}>
              {selectedGridDateStr ? (() => {
                const parts = selectedGridDateStr.split('-');
                const gridDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                const dW = gridDate.getDay();
                const activeOnSelectedDay = habits.filter(h => h.frequency.kind === 'daily' || h.frequency.weekdays.includes(dW));
                
                const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                const fullDateLabel = `${daysOfWeek[gridDate.getDay()]}, ${gridDate.getDate()} ${months[gridDate.getMonth()]} ${gridDate.getFullYear()}`;

                return (
                  <View style={{ width: '100%' }}>
                    {/* Header Row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="calendar-outline" size={16} color={T.teal} />
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>
                          {fullDateLabel}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: T.teal }}>
                        {activeOnSelectedDay.filter(h => h.completedDates.includes(selectedGridDateStr)).length} / {activeOnSelectedDay.length} Completed
                      </Text>
                    </View>

                    {/* Habit Items List */}
                    {activeOnSelectedDay.length === 0 ? (
                      <View style={{ alignItems: 'center', paddingVertical: 14 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#94A3B8', fontStyle: 'italic' }}>
                          No habits scheduled for this day
                        </Text>
                      </View>
                    ) : (
                      <View style={{ gap: 10 }}>
                        {activeOnSelectedDay.map(h => {
                          const isDone = h.completedDates.includes(selectedGridDateStr);
                          const isShielded = h.shieldedDates?.includes(selectedGridDateStr);
                          return (
                            <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                              
                              {/* Left Icon & Name */}
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(45,212,191,0.12)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                  {isImageUri(h.emoji) ? (
                                    <Image source={{ uri: h.emoji }} style={{ width: 36, height: 36, borderRadius: 12 }} resizeMode="cover" />
                                  ) : (
                                    <Text style={{ fontSize: 20 }}>{h.emoji}</Text>
                                  )}
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }} numberOfLines={1}>
                                    {h.name}
                                  </Text>
                                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B', marginTop: 1 }}>
                                    {h.frequency.kind === 'daily' ? 'Daily' : 'Weekly'}
                                  </Text>
                                </View>
                              </View>

                              {/* Right Status Pill */}
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 5,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 14,
                                backgroundColor: isDone ? 'rgba(34,197,94,0.15)' : isShielded ? 'rgba(249,115,22,0.15)' : 'rgba(239,68,68,0.15)',
                                borderWidth: 1,
                                borderColor: isDone ? 'rgba(34,197,94,0.3)' : isShielded ? 'rgba(249,115,22,0.3)' : 'rgba(239,68,68,0.3)'
                              }}>
                                <Ionicons name={isDone ? "checkmark-circle" : isShielded ? "shield-checkmark" : "close-circle"} size={14} color={isDone ? T.green : isShielded ? T.orange : T.red} />
                                <Text style={{ fontSize: 11, fontWeight: '900', color: isDone ? T.green : isShielded ? T.orange : T.red }}>
                                  {isDone ? 'Completed' : isShielded ? 'Shielded' : 'Missed'}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })() : null}
            </View>

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
