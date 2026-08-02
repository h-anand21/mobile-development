import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Animated as RNAnimated, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  LinearTransition,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { useHabits } from '../hooks/use-habits';
import { usePushNotifications } from '../hooks/use-push-notifications';
import { useTheme } from '../context/ThemeContext';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';
import SpringPressable from '../components/SpringPressable';
import TabBar from '../components/TabBar';
import { usePedometer } from '../hooks/use-pedometer';
import { getLocalDateString, getActiveStreak, getYesterdayDateString } from '../lib/habits/streak';

const { width: SW } = Dimensions.get('window');

const MOTIVATIONAL_QUOTES = [
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "It is easier to prevent bad habits than to break them.", author: "Benjamin Franklin" },
  { text: "First we make our habits, then our habits make us.", author: "John Dryden" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
];

function ConfettiParticle({ index }: { index: number }) {
  const animY = React.useRef(new RNAnimated.Value(-30)).current;
  const animX = React.useRef(new RNAnimated.Value(Math.random() * SW)).current;
  const rotation = React.useRef(new RNAnimated.Value(0)).current;

  React.useEffect(() => {
    RNAnimated.loop(
      RNAnimated.parallel([
        RNAnimated.timing(animY, {
          toValue: Dimensions.get('window').height,
          duration: 2000 + Math.random() * 1500,
          useNativeDriver: true,
        }),
        RNAnimated.timing(rotation, {
          toValue: 1,
          duration: 1500 + Math.random() * 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const color = ['#5EEAD4', '#EAD45E', '#C45EEA', '#EA875E', '#5EEA87', '#EA5E5E'][index % 6];
  const size = 6 + Math.random() * 8;
  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <RNAnimated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: index % 2 === 0 ? 0 : size / 2,
        transform: [
          { translateY: animY },
          { translateX: animX },
          { rotate: rotate }
        ],
        opacity: 0.8,
      }}
    />
  );
}

function ConfettiRain({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array.from({ length: 40 }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </View>
  );
}

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
      <Circle cx={cx} cy={cy} r={r} stroke={bgColor || 'rgba(255,255,255,0.06)'} strokeWidth={strokeWidth} fill="transparent" />
      {percent > 0 && (
        <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
      )}
    </Svg>
  );
}

// ─── Day Cell ───
function DayCell({ label, date, isToday, isSelected, count, total, onPress, T }:
  { label: string; date: number; isToday: boolean; isSelected: boolean; count: number; total: number; onPress: () => void; T: any }) {
  const s = useSharedValue(0.7);
  const o = useSharedValue(0);
  useEffect(() => {
    s.value = withSpring(1, { damping: 14, stiffness: 180 });
    o.value = withTiming(1, { duration: 400 });
  }, []);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }], opacity: o.value }));

  // Calculate percentage of habits completed
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  // Determine green shade color based on completion percentage
  const getGreenShade = () => {
    if (pct === 0) {
      return T.isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    }
    const r = T.isDark ? 94 : 46;
    const g = T.isDark ? 234 : 196;
    const b = T.isDark ? 212 : 168;

    if (pct === 100) return T.teal; // Full deep green
    if (pct >= 80) return `rgba(${r}, ${g}, ${b}, 0.70)`; // 80% green
    if (pct >= 50) return `rgba(${r}, ${g}, ${b}, 0.45)`; // 50% green
    if (pct >= 25) return `rgba(${r}, ${g}, ${b}, 0.25)`; // 25% green
    return `rgba(${r}, ${g}, ${b}, 0.12)`; // >0% green
  };

  // Determine text color based on background intensity
  const getTextColor = () => {
    if (pct === 0) return T.textMuted;
    if (pct >= 80) return T.isDark ? T.bg : '#ffffff'; // light text on dark background
    return T.textPrimary;
  };

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.dayCell, aStyle]}>
        <Text style={[
          styles.dayLabel,
          { color: isSelected ? T.teal : isToday ? T.teal : T.textMuted },
          isSelected && { fontWeight: 'bold' }
        ]}>
          {label}
        </Text>
        <View style={[
          styles.dayCircle,
          { backgroundColor: getGreenShade() },
          isSelected && { borderWidth: 2, borderColor: T.teal },
          isToday && !isSelected && { borderWidth: 2, borderColor: T.tealBorder },
        ]}>
          <Text style={[
            styles.dayNum,
            { color: getTextColor() },
            (isToday || isSelected) && { fontWeight: '900' },
          ]}>
            {date}
          </Text>
        </View>
        <View style={[styles.dayDot, {
          backgroundColor: pct > 0 ? T.teal : 'transparent'
        }]} />
      </Animated.View>
    </Pressable>
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

// ─── Activity Mini Widget ───
function ActivityWidget({ T, router }: { T: any; router: any }) {
  const pd = usePedometer();
  if (pd.loading) return null;

  const steps = pd.available ? pd.steps.toLocaleString() : '0';
  const cal   = pd.available ? String(pd.calories) : '0';
  const dist  = pd.available ? String(pd.distanceKm) : '0';
  const pct   = pd.progressPercent;

  const CARD_WIDTH = 138;

  return (
    <Animated.View entering={FadeInDown.delay(290).duration(400).springify()}
      style={{ marginBottom: 14 }}>
      {/* Title Header with Link */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="fitness-outline" size={18} color={T.teal} />
          <Text style={{ fontSize: 15, fontWeight: '800', color: T.textPrimary }}>Activity Today</Text>
        </View>
        <Pressable onPress={() => router.replace('/activity')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: T.teal }}>View Details</Text>
          <Ionicons name="chevron-forward" size={12} color={T.teal} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingVertical: 4 }}>
        
        {/* Card 1: Steps */}
        <Pressable onPress={() => router.replace('/activity')}>
          <View style={[T.neo, { width: CARD_WIDTH, borderRadius: 20, padding: 14, backgroundColor: T.bgCard }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: T.teal + '22', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="walk-outline" size={16} color={T.teal} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '800', color: T.teal }}>{pct}%</Text>
            </View>
            <Text
              style={{ fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5, marginBottom: 3, paddingHorizontal: 2, includeFontPadding: false }}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              {steps}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Steps</Text>
            <View style={{ height: 4, backgroundColor: T.tealDim, borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
              <View style={{ height: '100%', width: `${Math.min(100, pct)}%`, backgroundColor: T.teal, borderRadius: 2 }} />
            </View>
          </View>
        </Pressable>

        {/* Card 2: Calories */}
        <Pressable onPress={() => router.replace('/activity')}>
          <View style={[T.neo, { width: CARD_WIDTH, borderRadius: 20, padding: 14, backgroundColor: T.bgCard }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: T.orange + '22', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="flame-outline" size={16} color={T.orange} />
              </View>
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#94A3B8' }}>KCAL</Text>
            </View>
            <Text
              style={{ fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5, marginBottom: 3, paddingHorizontal: 2, includeFontPadding: false }}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              {cal}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Calories</Text>
            <View style={{ height: 4, backgroundColor: T.orange + '22', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
              <View style={{ height: '100%', width: `${Math.min(100, (Number(cal) / 300) * 100)}%`, backgroundColor: T.orange, borderRadius: 2 }} />
            </View>
          </View>
        </Pressable>

        {/* Card 3: Distance */}
        <Pressable onPress={() => router.replace('/activity')}>
          <View style={[T.neo, { width: CARD_WIDTH, borderRadius: 20, padding: 14, backgroundColor: T.bgCard }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: T.purple + '22', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="navigate-outline" size={16} color={T.purple} />
              </View>
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#94A3B8' }}>KM</Text>
            </View>
            <Text
              style={{ fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5, marginBottom: 3, paddingHorizontal: 2, includeFontPadding: false }}
              adjustsFontSizeToFit={true}
              numberOfLines={1}
            >
              {dist}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Distance</Text>
            <View style={{ height: 4, backgroundColor: T.purple + '22', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
              <View style={{ height: '100%', width: `${Math.min(100, (Number(dist) / 5) * 100)}%`, backgroundColor: T.purple, borderRadius: 2 }} />
            </View>
          </View>
        </Pressable>

      </ScrollView>
    </Animated.View>
  );
}

export default function HomeDashboard() {
  const router = useRouter();
  const { T, isDark, toggleTheme } = useTheme();
  const { habits, loadHabits, toggleCompleteHabit } = useHabits();
  const { permissionStatus, checkPermissions } = usePushNotifications();

  const [profileUri, setProfileUri] = React.useState<string | null>(null);
  const [profileEmoji, setProfileEmoji] = React.useState('🧘');
  const [profileName, setProfileName] = React.useState('Himanshu');

  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
      checkPermissions();

      AsyncStorage.multiGet(['PROFILE_URI', 'PROFILE_EMOJI', 'PROFILE_NAME']).then(pairs => {
        setProfileUri(pairs[0][1] || null);
        setProfileEmoji(pairs[1][1] || '🧘');
        setProfileName(pairs[2][1] || 'Himanshu');
      }).catch(() => {});
    }, [])
  );

  const todayStr   = getLocalDateString();
  const [selectedDateStr, setSelectedDateStr] = React.useState(todayStr);
  const [selectedCategory, setSelectedCategory] = React.useState<'all' | 'health' | 'work' | 'mind' | 'body' | 'other'>('all');
  const [quoteIndex, setQuoteIndex] = React.useState(0);
  const [showConfetti, setShowConfetti] = React.useState(false);

  const selectedDate = new Date(selectedDateStr);
  const selectedWD   = selectedDate.getDay();
  const hour         = new Date().getHours();
  const greeting     = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji   = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  const activeHabits   = habits.filter(h => h.frequency.kind === 'daily' || h.frequency.weekdays.includes(selectedWD));
  const categoryFilteredHabits = activeHabits.filter(h => selectedCategory === 'all' || h.category === selectedCategory);
  
  const completedCount = activeHabits.filter(h => h.completedDates.includes(selectedDateStr)).length;
  const total          = activeHabits.length;
  const pct            = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const bestStreak     = habits.reduce((m, h) => Math.max(m, getActiveStreak(h)), 0);
  const totalLogs      = habits.reduce((a, h) => a + h.completedDates.length, 0);
  const successRate    = habits.length > 0
    ? Math.round((habits.filter(h => h.completedDates.includes(selectedDateStr)).length / habits.length) * 100) : 0;

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  useEffect(() => {
    setQuoteIndex(new Date().getDate() % MOTIVATIONAL_QUOTES.length);
  }, []);

  const prevPct = React.useRef(pct);
  useEffect(() => {
    if (pct === 100 && prevPct.current < 100 && total > 0 && selectedDateStr === todayStr) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
    prevPct.current = pct;
  }, [pct, total, selectedDateStr]);

  const getTomorrowDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getLocalDateString(d);
  };

  // Scrollable calendar strip (7 days, Today in the center)
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i); // 3 days ago up to 3 days later
    const iso = getLocalDateString(d);
    let displayLabel = dayNames[d.getDay()];
    if (iso === todayStr) displayLabel = 'Today';
    else if (iso === getYesterdayDateString()) displayLabel = 'Yest';
    else if (iso === getTomorrowDateString()) displayLabel = 'Tomw';

    // Get active habits for this day to compute progress correctly
    const activeForDay = habits.filter(h => h.frequency.kind === 'daily' || h.frequency.weekdays.includes(d.getDay()));
    const completedForDay = activeForDay.filter(h => h.completedDates.includes(iso) || h.shieldedDates?.includes(iso)).length;

    return {
      label: displayLabel,
      date: d.getDate(),
      iso,
      isToday: iso === todayStr,
      count: completedForDay,
      total: activeForDay.length,
    };
  });

  // Weekly strip for mini bar chart
  const weekStrip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const iso = getLocalDateString(d);
    return { label: dayNames[d.getDay()], date: d.getDate(), iso, isToday: i === 6,
      count: habits.filter(h => h.completedDates.includes(iso)).length, total: habits.length };
  });

  const weekBars = weekStrip.map(d => d.count);
  const maxBar   = Math.max(1, ...weekBars);

  // Generate completion percentages for the past 35 days chronologically (oldest to today)
  const miniHeatmapData = React.useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 34 + i); // 34 days ago up to today
      const iso = getLocalDateString(d);
      
      const activeForDay = habits.filter(h => h.frequency.kind === 'daily' || h.frequency.weekdays.includes(d.getDay()));
      if (activeForDay.length === 0) {
        return { pct: 0, shielded: false };
      }
      
      const completed = activeForDay.filter(h => h.completedDates.includes(iso)).length;
      const shielded = activeForDay.filter(h => h.shieldedDates?.includes(iso)).length;
      const totalDone = completed + shielded;
      const pct = Math.round((totalDone / activeForDay.length) * 100);

      return { pct, shielded: shielded > 0 && completed === 0 };
    });
  }, [habits]);

  const getSectionTitle = () => {
    if (selectedDateStr === todayStr) return "Today's Habits";
    if (selectedDateStr === getYesterdayDateString()) return "Yesterday's Habits";
    if (selectedDateStr === getTomorrowDateString()) return "Tomorrow's Preview";

    try {
      const parts = selectedDateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `Habits on ${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return `Habits on ${selectedDateStr}`;
    }
  };

  // Pulse anim for avatar
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 1800 }), withTiming(1, { duration: 1800 })),
      -1, true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));


  const CARD_W = (SW - 48) / 2;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* ═══ HEADER ═══ */}
        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
          <Pressable onPress={() => router.push('/settings')} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}>
            <View style={styles.avatarWrap}>
              <Animated.View style={[styles.avatarRing, { borderColor: T.teal }, pulseStyle]} />
              <View style={[T.neo, styles.avatar, { overflow: 'hidden' }]}>
                {profileUri ? (
                  <Image source={{ uri: profileUri }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                ) : (
                  <Text style={styles.avatarEmoji}>{profileEmoji}</Text>
                )}
              </View>
            </View>

            <View style={styles.headerText}>
              <Text style={[styles.greetSmall, { color: T.textMuted }]}>{greetEmoji} {greeting}</Text>
              <Text style={[styles.greetName, { color: T.textPrimary }]}>{profileName}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: T.textSub, marginTop: 1 }}>Keep going, you're doing great! ✨</Text>
            </View>
          </Pressable>

          {/* Theme toggle */}
          <SpringPressable onPress={toggleTheme}>
            <Animated.View style={[T.neo, styles.neoBtnCircle]}>
              <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
            </Animated.View>
          </SpringPressable>

          {/* Notification bell with dot indicator */}
          <Pressable onPress={() => router.push('/notifications')} style={{ position: 'relative' }}>
            <Animated.View style={[T.neo, styles.neoBtnCircle]}>
              <Ionicons name="notifications-outline" size={18} color={T.textPrimary} />
            </Animated.View>
            <View style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: 4, backgroundColor: T.teal, borderWidth: 1.5, borderColor: T.bgCard }} />
          </Pressable>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ═══ CHRONOLOGICAL CENTURED CALENDAR ═══ */}
          <Animated.View entering={FadeInDown.delay(80).duration(500).springify()}
            style={[T.neo, styles.calCard, { paddingVertical: 12, paddingHorizontal: 4 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 4 }}>
              {calendarDays.map((day) => (
                <DayCell
                  key={day.iso}
                  {...day}
                  isSelected={day.iso === selectedDateStr}
                  onPress={() => setSelectedDateStr(day.iso)}
                  T={T}
                />
              ))}
            </View>
          </Animated.View>

          {/* ═══ MAIN HERO TODAY'S PROGRESS CARD ═══ */}
          <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}
            style={[T.neo, { marginHorizontal: 16, borderRadius: 28, padding: 22, marginBottom: 16, backgroundColor: T.bgCard }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Left Column: Stats & Progress Bar & Streak Button */}
              <View style={{ flex: 1, paddingRight: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <Ionicons name="trending-up" size={16} color={T.teal} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: T.textSub }}>Today's Progress</Text>
                </View>

                {/* Big Counter cleanly spaced with high contrast */}
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
                  <Text style={{ fontSize: 46, fontWeight: '900', color: T.teal, letterSpacing: 0 }}>{completedCount}</Text>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: '#94A3B8', marginLeft: 8 }}>/ {total}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: T.textSub, marginBottom: 14 }}>Habits Completed</Text>

                {/* Progress bar line */}
                <View style={{ height: 6, backgroundColor: 'rgba(45,212,191,0.12)', borderRadius: 3, overflow: 'hidden', marginBottom: 16, width: '100%' }}>
                  <View style={{ height: '100%', width: `${Math.max(0, pct)}%`, backgroundColor: T.teal, borderRadius: 3 }} />
                </View>

                {/* Streak Pill Button (Neumorphic Inset) */}
                <Pressable onPress={() => router.push('/analytics')}
                  style={[T.neoPressed, { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', backgroundColor: T.bgPress }]}>
                  <Text style={{ fontSize: 13 }}>🔥</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: T.textPrimary }}>{bestStreak} Day Streak</Text>
                  <Ionicons name="chevron-forward" size={12} color={T.textMuted} />
                </Pressable>
              </View>

              {/* Right Column: Large Circular Progress Ring */}
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <AnimatedRing percent={pct} size={124} strokeWidth={11} color={T.teal} bgColor="rgba(45,212,191,0.12)" />
                <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: pct >= 100 ? 26 : 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: pct >= 100 ? 1.5 : -1, includeFontPadding: false }}>{pct}</Text>
                    <Text style={{ fontSize: pct >= 100 ? 13 : 18, fontWeight: '800', color: T.teal, marginLeft: 3, includeFontPadding: false }}>%</Text>
                  </View>
                  <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>COMPLETED</Text>
                </View>
              </View>
            </View>
          </Animated.View>



          {/* ═══ ACTIVITY WIDGET ═══ */}
          <ActivityWidget T={T} router={router} />

          {/* ═══ TODAY'S HABITS ═══ */}
          <Animated.View entering={FadeInDown.delay(280).duration(500).springify()} style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <Ionicons name="list-outline" size={18} color={T.teal} />
              <Text style={[styles.sectionTitle, { color: T.textPrimary }]}>{getSectionTitle()}</Text>
            </View>
            <Link href="/new" asChild>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: T.teal }}>+ Add Habit</Text>
                <Ionicons name="chevron-forward" size={12} color={T.teal} />
              </Pressable>
            </Link>
          </Animated.View>

          {permissionStatus === 'denied' && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}
              style={[T.neo, styles.permBanner, { borderTopColor: T.orangeDim, borderLeftColor: T.orangeDim }]}>
              <Ionicons name="notifications-off-outline" size={16} color={T.orange} />
              <Text style={[styles.permText, { color: T.textSub }]}>Enable notifications for reminders</Text>
              <Pressable onPress={() => router.push('/notifications')}>
                <Text style={[styles.permAction, { color: T.orange }]}>Fix →</Text>
              </Pressable>
            </Animated.View>
          )}

          {categoryFilteredHabits.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(320).duration(400)}>
              <EmptyState title="No active habits" description="Try selecting another category or add a new habit." />
            </Animated.View>
          ) : (
            categoryFilteredHabits.map((habit, i) => (
              <Animated.View
                key={habit.id}
                layout={LinearTransition.springify().damping(15)}
              >
                <HabitCard habit={habit} onToggleComplete={toggleCompleteHabit} index={i} dateStr={selectedDateStr} />
              </Animated.View>
            ))
          )}

          {/* ═══ CATEGORY FILTER STRIP ═══ */}
          <Animated.View entering={FadeInDown.delay(340).duration(500).springify()}
            style={{ marginBottom: 18, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, marginBottom: 8 }}>
              <Ionicons name="pricetag-outline" size={14} color={T.textSub} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: T.textSub, letterSpacing: 0.3 }}>Category</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 4, paddingHorizontal: 16 }}>
              {([
                { value: 'all',    label: 'All',    icon: 'grid-outline' as const },
                { value: 'health', label: 'Health', icon: 'heart-outline' as const },
                { value: 'work',   label: 'Work',   icon: 'briefcase-outline' as const },
                { value: 'mind',   label: 'Mind',   icon: 'bulb-outline' as const },
                { value: 'body',   label: 'Body',   icon: 'barbell-outline' as const },
                { value: 'other',  label: 'Other',  icon: 'ellipsis-horizontal-circle-outline' as const },
              ] as const).map(cat => {
                const active = selectedCategory === cat.value;
                return (
                  <Pressable key={cat.value} onPress={() => setSelectedCategory(cat.value as any)}
                    style={[
                      T.neo,
                      styles.catFilterBtn,
                      active && { backgroundColor: T.teal, borderColor: T.teal, borderWidth: 1 }
                    ]}>
                    <Ionicons name={cat.icon} size={14} color={active ? '#0D1525' : T.textMuted} />
                    <Text style={[styles.catFilterText, { color: active ? '#0D1525' : T.textSub }, active && { fontWeight: '900' }]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Confetti celebration Overlay */}
        <ConfettiRain active={showConfetti} />

        {/* ═══ TAB BAR ═══ */}
        <TabBar activeTab="home" />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1 },
  root:  { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
  },
  avatarWrap: { alignItems: 'center', justifyContent: 'center' },
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

  // Activity widget
  actWidget: { borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center' },
  actWidgetLeft: { flex: 1 },
  actWidgetTitle: { fontSize: 12, fontWeight: '800', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  actWidgetStats: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  actStat: { alignItems: 'center', paddingHorizontal: 10 },
  actStatVal: { fontSize: 18, fontWeight: '900' },
  actStatLbl: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase' },
  actDivider: { width: 1, height: 28 },
  actWidgetRight: { alignItems: 'center', paddingLeft: 12 },
  actPct: { fontSize: 20, fontWeight: '900' },
  actPctLbl: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  actChevron: { fontSize: 22, lineHeight: 24 },

  // Quotes
  quoteCard: { marginHorizontal: 16, borderRadius: 22, padding: 14, marginBottom: 16 },
  quoteIconBg: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quoteText: { fontSize: 11, fontStyle: 'italic', fontWeight: '500', lineHeight: 16, marginBottom: 4 },
  quoteAuthor: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  quoteRefresh: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  // Category filter — matches new.tsx categoryOption exactly
  catFilterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 38, paddingHorizontal: 12, borderRadius: 10, gap: 4 },
  catFilterText: { fontSize: 12, fontWeight: '600' },
});
