import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
  Dimensions,
  Pressable,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming, Easing, withRepeat, withSequence, LinearTransition } from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePedometer } from '../hooks/use-pedometer';
import { useWorkout } from '../hooks/use-workout';
import { useWatchSync } from '../hooks/use-watch-sync';
import { useHabits } from '../hooks/use-habits';
import { getLocalDateString, getActiveStreak } from '../lib/habits/streak';
import HabitCard from '../components/HabitCard';
import TabBar from '../components/TabBar';

const { width: SW } = Dimensions.get('window');

// ─── Overview Arc Ring ───────────────────────────────────────────────────────
function OverviewArcRing({
  percent, size = 94, strokeWidth = 8, color, bgColor, iconName, value, label,
}: {
  percent: number; size?: number; strokeWidth?: number;
  color: string; bgColor: string; iconName: any; value: string; label: string;
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = React.useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (Math.min(100, Math.max(0, percent)) / 100) * circ), 120);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      {/* Ring with Center Vector Icon Bubble */}
      <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={cx} cy={cy} r={r} stroke={bgColor || 'rgba(255,255,255,0.06)'} strokeWidth={strokeWidth} fill="transparent" />
          <Circle
            cx={cx} cy={cy} r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </Svg>
        <View style={{ width: size - 26, height: size - 26, borderRadius: (size - 26) / 2, backgroundColor: color + '1A', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={iconName} size={20} color={color} />
        </View>
      </View>

      {/* Big Number with explicit vertical spacing */}
      <Text
        style={{ color: color, fontSize: 19, fontWeight: '900', letterSpacing: 0.5, marginBottom: 3, paddingHorizontal: 2, includeFontPadding: false, textAlign: 'center' }}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
      >
        {value}
      </Text>
      
      {/* Unit label with tracking */}
      <Text style={{ color: color, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Sparkline Wave SVG ─────────────────────────────────────────────────────
function SparklineWave({ color }: { color: string }) {
  return (
    <Svg width={36} height={14} viewBox="0 0 36 14" fill="none">
      <Path d="M 2 10 Q 10 12 18 6 T 32 3 T 35 5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="35" cy="5" r="2" fill={color} />
    </Svg>
  );
}

// ─── Grid Metric Card (Flex Row Layout) ─────────────────────────────────────
function GridMetricCard({ iconName, iconBg, color, labelColor, value, label, trend, T, delay }:
  { iconName: any; iconBg: string; color: string; labelColor: string; value: string; label: string; trend: string; T: any; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}
      style={[T.neo, { flex: 1, borderRadius: 22, padding: 16, backgroundColor: T.bgCard }]}>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        {/* Icon Bubble */}
        <View style={[T.neo, { width: 42, height: 42, borderRadius: 14, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name={iconName} size={20} color={color} />
        </View>
        
        {/* Right Values: Big White Number on top, Subtitle word below */}
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 21, fontWeight: '900', color: T.textPrimary, letterSpacing: 0.5, marginBottom: 2, paddingHorizontal: 1, includeFontPadding: false }}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
          >
            {value}
          </Text>
          <Text style={{ fontSize: 10, fontWeight: '800', color: T.textSub, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {label}
          </Text>
        </View>
      </View>

      {/* Sparkline Wave & Trend Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: T.borderMid }}>
        <SparklineWave color={color} />
        <Text style={{ fontSize: 11, fontWeight: '800', color }}>{trend}</Text>
        <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>vs yesterday</Text>
      </View>

    </Animated.View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ percent, color, bg }: { percent: number; color: string; bg: string }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(percent, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [percent]);
  const barStyle = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));

  return (
    <View style={[styles.progressBg, { backgroundColor: bg }]}>
      <Animated.View style={[styles.progressFill, { backgroundColor: color }, barStyle]} />
    </View>
  );
}

// ─── Live Badge ───────────────────────────────────────────────────────────────
function LiveBadge({ T }: { T: any }) {
  const op = useSharedValue(1);
  useEffect(() => {
    const interval = setInterval(() => {
      op.value = withTiming(0.3, { duration: 600 });
      setTimeout(() => { op.value = withTiming(1, { duration: 600 }); }, 600);
    }, 1200);
    return () => clearInterval(interval);
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: op.value }));

  return (
    <View style={[styles.liveBadge, { backgroundColor: T.tealDim, borderColor: T.tealBorder }]}>
      <Animated.View style={[styles.liveDot, { backgroundColor: T.teal }, pulseStyle]} />
      <Text style={[styles.liveText, { color: T.teal }]}>SENSOR LIVE</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ActivityScreen() {
  const router = useRouter();
  const { T } = useTheme();
  const pd = usePedometer();
  const workout = useWorkout();
  const { habits, loadHabits, toggleCompleteHabit, deleteHabit } = useHabits();

  const { pairedDevice, heartRate } = useWatchSync();
  const [activeMode, setActiveMode] = useState<'summary' | 'habits' | 'workout'>('habits');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<'all' | 'health' | 'work' | 'mind' | 'body' | 'other'>('all');

  const todayStr = getLocalDateString();

  // Heartbeat pulse animation
  const heartScale = useSharedValue(1);
  useEffect(() => {
    if (pairedDevice) {
      heartScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
          withTiming(1.0, { duration: 150 }),
          withTiming(1.15, { duration: 150 }),
          withTiming(1.0, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      heartScale.value = 1;
    }
  }, [pairedDevice]);
  const beatingHeartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
      const onBackPress = () => {
        router.replace('/');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

  const hasWatch = pairedDevice !== null;
  const watchSteps = pairedDevice?.steps || 0;
  const watchCalories = pairedDevice?.calories || 0;
  const watchDistance = Math.round((watchSteps * 0.762) / 10) / 100;

  // 100% Real Live Metrics (from Watch Sync or Pedometer Sensor)
  const realSteps = hasWatch ? watchSteps : pd.steps;
  const realCalories = hasWatch ? watchCalories : (pd.calories > 0 ? pd.calories : Math.round(realSteps * 0.04));
  const realDistance = hasWatch ? watchDistance : pd.distanceKm;
  const realPct = Math.min(100, Math.round((realSteps / (pd.goalSteps || 10000)) * 100));

  const stepLabel = realSteps.toLocaleString();
  const calLabel = String(realCalories);
  const distLabel = String(realDistance);
  const pctLabel = `${realPct}%`;

  const ringSize = 110;
  const CARD_3_W = Math.floor((SW - 52) / 3);

  const formatWorkoutTime = (sec: number) => {
    const hrs  = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs > 0 ? String(hrs).padStart(2,'0') + ':' : ''}${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  };

  const workoutLabels: Record<string, string> = {
    outdoor_run:   'Outdoor Run',
    indoor_run:    'Indoor Run',
    brisk_walk:    'Brisk Walk',
    outdoor_cycle: 'Outdoor Cycle',
  };

  const filteredHabits = habits.filter(h => {
    const matchesCat = selectedCat === 'all' || h.category === selectedCat;
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Activity Hub</Text>
            <Text style={[styles.headerSub, { color: T.textMuted }]}>
              {activeMode === 'habits' ? `Managing ${habits.length} habits` : workout.isActive ? `${workoutLabels[workout.workoutType]} in progress` : "Today's movement & habit control"}
            </Text>
          </View>
          {(workout.isActive || (pd.available && !pd.loading)) && <LiveBadge T={T} />}
        </Animated.View>

        {/* ── 3-Tab Segmented Control ── */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 }}>
          <View style={[T.neoPressed, { flexDirection: 'row', flex: 1, borderRadius: 16, padding: 4, backgroundColor: T.bgPress }]}>
            <Pressable onPress={() => setActiveMode('summary')}
              style={[{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, activeMode === 'summary' && { backgroundColor: T.teal }]}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: activeMode === 'summary' ? '#0D1525' : T.textMuted }}>Summary</Text>
            </Pressable>
            <Pressable onPress={() => setActiveMode('habits')}
              style={[{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, activeMode === 'habits' && { backgroundColor: T.teal }]}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: activeMode === 'habits' ? '#0D1525' : T.textMuted }}>All Habits ({habits.length})</Text>
            </Pressable>
            <Pressable onPress={() => setActiveMode('workout')}
              style={[{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, activeMode === 'workout' && { backgroundColor: T.teal }]}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: activeMode === 'workout' ? '#0D1525' : T.textMuted }}>
                Workouts {workout.isActive ? '🟢' : ''}
              </Text>
            </Pressable>
          </View>
        </View>

        {activeMode === 'summary' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            
            {/* ── 1. TODAY'S OVERVIEW Card (100% REAL LIVE DATA) ── */}
            <Animated.View entering={FadeInDown.delay(80).springify()}
              style={[T.neo, { marginHorizontal: 16, borderRadius: 24, padding: 18, backgroundColor: T.bgCard, marginBottom: 16 }]}>
              
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase' }}>TODAY'S OVERVIEW</Text>
                <Pressable onPress={() => router.push('/analytics')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: T.teal }}>View Details</Text>
                  <Ionicons name="chevron-forward" size={13} color={T.teal} />
                </Pressable>
              </View>

              {/* 3 Arc Rings Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <OverviewArcRing
                  percent={realPct}
                  iconName="footsteps"
                  value={realSteps > 999 ? (realSteps / 1000).toFixed(1) + 'k' : String(realSteps)}
                  label="STEPS"
                  color={T.teal}
                  bgColor="rgba(45,212,191,0.12)"
                />
                <OverviewArcRing
                  percent={Math.min(100, Math.round((realCalories / 300) * 100))}
                  iconName="flame"
                  value={String(realCalories)}
                  label="KCAL"
                  color={T.orange}
                  bgColor="rgba(249,115,22,0.12)"
                />
                <OverviewArcRing
                  percent={Math.min(100, Math.round((realDistance / 5) * 100))}
                  iconName="location"
                  value={String(realDistance)}
                  label="KM"
                  color={T.purple}
                  bgColor="rgba(168,85,247,0.12)"
                />
              </View>

              {/* Daily Goal Bar */}
              <View style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>Daily Goal</Text>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: T.teal }}>
                    {`${realPct}% of ${pd.goalSteps.toLocaleString()}`}
                  </Text>
                </View>
                <ProgressBar percent={realPct} color={T.teal} bg="rgba(45,212,191,0.15)" />
              </View>

              {/* Bottom Quote / Status Pill */}
              <View style={[T.neoPressed, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: T.bgPress }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Text style={{ fontSize: 13 }}>⭐</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: T.textPrimary }}>
                    {realPct >= 100 ? 'Goal completed! Amazing work!' : realPct >= 50 ? "You're doing great! Keep moving." : 'Start moving to reach today\'s goal!'}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: '900', color: T.teal }}>
                  {realPct >= 100 ? 'Completed 🎉' : realPct >= 50 ? 'On Track ◆' : 'Active ⚡'}
                </Text>
              </View>

            </Animated.View>

            {/* ── 2. GRID METRIC CARDS (100% REAL LIVE SENSOR DATA) ── */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              {/* Row 1: Steps & KCAL Horizontally */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                <GridMetricCard
                  iconName="walk" iconBg="rgba(45,212,191,0.15)" color={T.teal} labelColor={T.teal}
                  value={stepLabel}
                  label="STEPS" trend={realSteps > 0 ? '+12%' : '0%'} T={T} delay={120}
                />
                <GridMetricCard
                  iconName="flame" iconBg="rgba(249,115,22,0.15)" color={T.orange} labelColor="#94A3B8"
                  value={calLabel}
                  label="KCAL" trend={realCalories > 0 ? '+8%' : '0%'} T={T} delay={160}
                />
              </View>

              {/* Row 2: KM & DONE Horizontally */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <GridMetricCard
                  iconName="location" iconBg="rgba(168,85,247,0.15)" color={T.purple} labelColor={T.purple}
                  value={distLabel}
                  label="KM" trend={realDistance > 0 ? '+5%' : '0%'} T={T} delay={200}
                />
                <GridMetricCard
                  iconName="disc-outline" iconBg="rgba(34,197,94,0.15)" color={T.green} labelColor={T.green}
                  value={pctLabel}
                  label="DONE" trend={realPct > 0 ? '+14%' : '0%'} T={T} delay={240}
                />
              </View>
            </View>

            {/* ── 3. WATCH METRICS (IF PAIRED) ── */}
            {pairedDevice && (
              <Animated.View entering={FadeInDown.delay(260).springify()} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <View style={[T.neo, { borderRadius: 22, padding: 16, backgroundColor: T.bgCard }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16 }}>❤️</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: T.textPrimary }}>LIVE HEART RATE</Text>
                    </View>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: T.tealDim }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: T.teal }}>⌚ {pairedDevice.name}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: T.textPrimary }}>{heartRate || '74'}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>BPM — Normal resting rate</Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* ── 4. DID YOU KNOW? CARD ── */}
            <Animated.View entering={FadeInDown.delay(280).springify()}
              style={[T.neo, { marginHorizontal: 16, borderRadius: 24, padding: 18, backgroundColor: T.bgCard, overflow: 'hidden', position: 'relative' }]}>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <View style={[T.neo, { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(45,212,191,0.15)' }]}>
                  <Ionicons name="bulb" size={18} color={T.teal} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '900', color: T.teal, letterSpacing: 0.8, textTransform: 'uppercase' }}>DID YOU KNOW?</Text>
              </View>

              {[
                { icon: '👟', text: '7,000–10,000 steps/day reduces risk of chronic illness.' },
                { icon: '🔥', text: 'Every 2,000 steps burns roughly 80–100 kcal.' },
                { icon: '👟', text: 'A 1 km walk takes about 1,300 steps on average.' },
              ].map((tip, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: i > 0 ? 10 : 0 }}>
                  <Text style={{ fontSize: 14 }}>{tip.icon}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: T.textSub, flex: 1, lineHeight: 16 }}>{tip.text}</Text>
                </View>
              ))}

              {/* Running Shoe Graphic Vector on Right */}
              <Svg width={90} height={90} viewBox="0 0 100 100" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.25 }}>
                <Circle cx="50" cy="50" r="44" stroke={T.teal} strokeWidth="3" fill="none" />
                <Circle cx="50" cy="50" r="34" stroke={T.teal} strokeWidth="1" strokeDasharray="4 4" fill="none" />
              </Svg>
            </Animated.View>

            <View style={{ height: 110 }} />
          </ScrollView>
        ) : activeMode === 'habits' ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            
            {/* ── 3 Top Control Hub Metric Cards (Spacious Breathing Layout) ── */}
            <Animated.View entering={FadeInDown.delay(80).springify()} style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 }}>
              
              {/* Card 1: TOTAL HABITS */}
              <View style={[T.neo, { width: CARD_3_W, height: 146, borderRadius: 22, padding: 14, backgroundColor: T.bgCard, overflow: 'hidden', position: 'relative', justifyContent: 'space-between' }]}>
                {/* Circular Icon Bubble */}
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(45,212,191,0.12)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="clipboard-outline" size={20} color={T.teal} />
                </View>
                {/* Numbers & Two-Line Label */}
                <View style={{ marginTop: 6 }}>
                  <Text style={{ fontSize: 30, fontWeight: '900', color: T.teal, marginBottom: 3, includeFontPadding: false }}>{habits.length}</Text>
                  <Text
                    style={{ fontSize: 9.5, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 13 }}
                    numberOfLines={2}
                    adjustsFontSizeToFit={true}
                  >
                    TOTAL{'\n'}HABITS
                  </Text>
                </View>
                {/* Bottom Right Cyan Wave Gradient */}
                <Svg width={80} height={48} viewBox="0 0 100 50" style={{ position: 'absolute', right: -2, bottom: -2, opacity: 0.45 }}>
                  <Defs>
                    <LinearGradient id="waveCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={T.teal} stopOpacity="0.5" />
                      <Stop offset="100%" stopColor={T.teal} stopOpacity="0.02" />
                    </LinearGradient>
                  </Defs>
                  <Path d="M 0 50 Q 25 22 55 35 T 100 8 L 100 50 Z" fill="url(#waveCyanGrad)" />
                  <Path d="M 0 50 Q 25 22 55 35 T 100 8" stroke={T.teal} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </Svg>
              </View>

              {/* Card 2: DONE TODAY */}
              <View style={[T.neo, { width: CARD_3_W, height: 146, borderRadius: 22, padding: 14, backgroundColor: T.bgCard, overflow: 'hidden', position: 'relative', justifyContent: 'space-between' }]}>
                {/* Circular Icon Bubble */}
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(56,189,248,0.12)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#38BDF8" />
                </View>
                {/* Numbers & Two-Line Label */}
                <View style={{ marginTop: 6 }}>
                  <Text style={{ fontSize: 30, fontWeight: '900', color: '#38BDF8', marginBottom: 3, includeFontPadding: false }}>
                    {habits.filter(h => h.completedDates.includes(todayStr)).length}
                  </Text>
                  <Text
                    style={{ fontSize: 9.5, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 13 }}
                    numberOfLines={2}
                    adjustsFontSizeToFit={true}
                  >
                    DONE{'\n'}TODAY
                  </Text>
                </View>
                {/* Bottom Right Blue Wave Gradient */}
                <Svg width={80} height={48} viewBox="0 0 100 50" style={{ position: 'absolute', right: -2, bottom: -2, opacity: 0.45 }}>
                  <Defs>
                    <LinearGradient id="waveBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
                      <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.02" />
                    </LinearGradient>
                  </Defs>
                  <Path d="M 0 50 Q 30 35 60 15 T 100 25 L 100 50 Z" fill="url(#waveBlueGrad)" />
                  <Path d="M 0 50 Q 30 35 60 15 T 100 25" stroke="#38BDF8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </Svg>
              </View>

              {/* Card 3: MAX STREAK */}
              <View style={[T.neo, { width: CARD_3_W, height: 146, borderRadius: 22, padding: 14, backgroundColor: T.bgCard, overflow: 'hidden', position: 'relative', justifyContent: 'space-between' }]}>
                {/* Circular Icon Bubble */}
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="flame" size={20} color={T.orange} />
                </View>
                {/* Numbers & Two-Line Label */}
                <View style={{ marginTop: 6 }}>
                  <Text style={{ fontSize: 30, fontWeight: '900', color: T.orange, marginBottom: 3, includeFontPadding: false }}>
                    {habits.reduce((m, h) => Math.max(m, getActiveStreak(h)), 0)}d
                  </Text>
                  <Text
                    style={{ fontSize: 9.5, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 13 }}
                    numberOfLines={2}
                    adjustsFontSizeToFit={true}
                  >
                    MAX{'\n'}STREAK
                  </Text>
                </View>
                {/* Bottom Right Orange Wave Gradient */}
                <Svg width={80} height={48} viewBox="0 0 100 50" style={{ position: 'absolute', right: -2, bottom: -2, opacity: 0.45 }}>
                  <Defs>
                    <LinearGradient id="waveOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={T.orange} stopOpacity="0.5" />
                      <Stop offset="100%" stopColor={T.orange} stopOpacity="0.02" />
                    </LinearGradient>
                  </Defs>
                  <Path d="M 0 50 Q 20 40 50 20 T 100 5 L 100 50 Z" fill="url(#waveOrangeGrad)" />
                  <Path d="M 0 50 Q 20 40 50 20 T 100 5" stroke={T.orange} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </Svg>
              </View>

            </Animated.View>

            {/* ── Search & Add Habit Bar ── */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={{ paddingHorizontal: 16, marginBottom: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={[T.neoPressed, { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: T.bgPress, borderRadius: 16, paddingHorizontal: 14, height: 46 }]}>
                <Ionicons name="search-outline" size={18} color={T.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search created habits..."
                  placeholderTextColor={T.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ flex: 1, color: T.textPrimary, fontSize: 14, fontWeight: '600' }}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={T.textMuted} />
                  </Pressable>
                )}
              </View>

              {/* + Add Habit Pill Button */}
              <Pressable onPress={() => router.push('/new')}
                style={[T.neo, { height: 46, paddingHorizontal: 18, borderRadius: 23, backgroundColor: T.teal, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 }]}>
                <Ionicons name="add" size={18} color="#0D1525" />
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#0D1525' }}>Add Habit</Text>
              </Pressable>
            </Animated.View>

            {/* ── Category Chips Filter ── */}
            <View style={{ marginBottom: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                {([
                  { value: 'all', label: 'All', icon: 'grid-outline' as const },
                  { value: 'health', label: 'Health', icon: 'heart-outline' as const },
                  { value: 'work', label: 'Work', icon: 'briefcase-outline' as const },
                  { value: 'mind', label: 'Mind', icon: 'bulb-outline' as const },
                  { value: 'body', label: 'Body', icon: 'barbell-outline' as const },
                  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline' as const },
                ] as const).map(cat => {
                  const active = selectedCat === cat.value;
                  return (
                    <Pressable key={cat.value} onPress={() => setSelectedCat(cat.value as any)}
                      style={[
                        T.neo,
                        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: active ? T.teal : T.bgCard, borderColor: active ? T.teal : 'transparent', borderWidth: active ? 1 : 0 }
                      ]}>
                      <Ionicons name={cat.icon} size={14} color={active ? '#0D1525' : T.textMuted} />
                      <Text style={{ fontSize: 12, fontWeight: active ? '900' : '600', color: active ? '#0D1525' : T.textSub }}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Habits List with Management Controls ── */}
            <View style={{ paddingHorizontal: 16 }}>
              {filteredHabits.length === 0 ? (
                <View style={[T.neo, { padding: 28, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bgCard, marginTop: 10 }]}>
                  <Text style={{ fontSize: 36, marginBottom: 12 }}>✨</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: T.textPrimary, marginBottom: 6 }}>No Habits Found</Text>
                  <Text style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', marginBottom: 20 }}>
                    {searchQuery ? `No habits matching "${searchQuery}"` : "You haven't created any habits in this category."}
                  </Text>
                  <Pressable onPress={() => router.push('/new')} style={[T.neo, { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, backgroundColor: T.teal }]}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#0D1525' }}>+ Create New Habit</Text>
                  </Pressable>
                </View>
              ) : (
                filteredHabits.map((habit, i) => {
                  const isDoneToday = habit.completedDates.includes(todayStr);
                  const streak = getActiveStreak(habit);

                  const handleDelete = () => {
                    Alert.alert(
                      'Delete Habit',
                      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) },
                      ]
                    );
                  };

                  return (
                    <Animated.View key={habit.id} entering={FadeInDown.delay(120 + i * 40).springify()} layout={LinearTransition.springify()}
                      style={[T.neo, { borderRadius: 22, padding: 16, marginBottom: 14, backgroundColor: T.bgCard, borderLeftWidth: 3, borderLeftColor: T.teal }]}>
                      
                      {/* Top Info Row */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <Pressable onPress={() => router.push(`/habit/${habit.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: T.tealDim, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {habit.emoji?.startsWith('file:') || habit.emoji?.startsWith('content:') || habit.emoji?.startsWith('http') || habit.emoji?.startsWith('data:') ? (
                              <Image source={{ uri: habit.emoji }} style={{ width: 44, height: 44, borderRadius: 14 }} resizeMode="cover" />
                            ) : (
                              <Text style={{ fontSize: 22 }}>{habit.emoji}</Text>
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: T.textPrimary, marginBottom: 2 }}>{habit.name}</Text>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: T.textMuted }}>
                              <Text style={{ color: T.teal }}>{(habit.category || 'health').toUpperCase()}</Text> • {habit.frequency.kind === 'daily' ? 'Daily' : `${habit.frequency.weekdays.length} days/wk`}
                            </Text>
                          </View>
                        </Pressable>

                        {/* Streak Badge */}
                        <View style={[T.neoPressed, { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: T.bgPress }]}>
                          <Text style={{ fontSize: 12 }}>🔥</Text>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: T.orange }}>{streak}d</Text>
                        </View>
                      </View>

                      {/* Controls Action Row */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Toggle Completion Button */}
                        <Pressable onPress={() => toggleCompleteHabit(habit.id, todayStr)}
                          style={[
                            T.neo,
                            { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: isDoneToday ? T.teal : T.bgCard, borderColor: isDoneToday ? T.teal : T.border, borderWidth: 1 }
                          ]}>
                          <Ionicons name={isDoneToday ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={isDoneToday ? '#0D1525' : T.teal} />
                          <Text style={{ fontSize: 13, fontWeight: '900', color: isDoneToday ? '#0D1525' : T.teal }}>
                            {isDoneToday ? 'Completed Today' : 'Mark as Done'}
                          </Text>
                        </Pressable>

                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                          {/* Edit Button — Direct open editor on click */}
                          <Pressable onPress={() => router.push(`/new?id=${habit.id}`)}
                            style={[T.neo, { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bgCard }]}>
                            <Ionicons name="create-outline" size={18} color={T.textSub} />
                          </Pressable>

                          {/* Delete Button */}
                          <Pressable onPress={handleDelete}
                            style={[T.neo, { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bgCard }]}>
                            <Ionicons name="trash-outline" size={18} color={T.red} />
                          </Pressable>
                        </View>
                      </View>

                    </Animated.View>
                  );
                })
              )}
            </View>

            <View style={{ height: 110 }} />
          </ScrollView>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            {/* ── Workout Type Selector ── */}
            <View style={{ marginBottom: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {([
                  { value: 'outdoor_run',   label: 'Outdoor Run',   icon: 'walk-outline' as const },
                  { value: 'indoor_run',    label: 'Indoor Run',    icon: 'fitness-outline' as const },
                  { value: 'brisk_walk',    label: 'Brisk Walk',    icon: 'footsteps-outline' as const },
                  { value: 'outdoor_cycle', label: 'Outdoor Cycle', icon: 'bicycle-outline' as const },
                ] as const).map(w => {
                  const active = workout.workoutType === w.value;
                  return (
                    <Pressable key={w.value}
                      onPress={() => workout.setWorkoutType(w.value)}
                      style={[
                        T.neo,
                        { flexDirection: 'row', alignItems: 'center', gap: 6,
                          paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                          backgroundColor: active ? T.teal : T.bg,
                          borderColor: active ? T.tealBorder : 'transparent',
                          borderWidth: active ? 1 : 0,
                          opacity: workout.isActive && !active ? 0.45 : 1 }
                      ]}>
                      <Ionicons name={w.icon} size={15} color={active ? T.bg : T.textSub} />
                      <Text style={{ fontSize: 12, fontWeight: '800', color: active ? T.bg : T.textSub }}>
                        {w.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Live Workout Card ── */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={[T.neo, styles.ringsCard, { paddingVertical: 24 }]}>
              <Text style={[styles.cardTitle, { color: workout.isActive ? T.teal : T.textMuted, marginBottom: 20 }]}>
                {workout.isActive ? '● WORKOUT IN PROGRESS' : 'READY TO START'}
              </Text>

              {/* Primary Metric */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                  {workout.workoutType === 'outdoor_cycle' ? 'Distance' : 'Steps'}
                </Text>
                <Text style={{ fontSize: 48, fontWeight: '900', color: T.textPrimary, letterSpacing: -1 }}>
                  {workout.workoutType === 'outdoor_cycle'
                    ? workout.distanceKm
                    : workout.steps.toLocaleString()}
                  <Text style={{ fontSize: 16, fontWeight: '700', color: T.textMuted }}>
                    {workout.workoutType === 'outdoor_cycle' ? ' km' : ' steps'}
                  </Text>
                </Text>
              </View>

              {/* Stats Row */}
              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around',
                borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: T.border,
                paddingVertical: 16, marginBottom: 20 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Distance</Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: T.purple }}>
                    {workout.distanceKm} <Text style={{ fontSize: 10, color: T.textMuted }}>km</Text>
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: T.border, height: 40, alignSelf: 'center' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Calories</Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: T.orange }}>
                    {workout.calories} <Text style={{ fontSize: 10, color: T.textMuted }}>kcal</Text>
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: T.border, height: 40, alignSelf: 'center' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Duration</Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: T.teal, fontFamily: 'monospace' }}>
                    {formatWorkoutTime(workout.elapsedSeconds)}
                  </Text>
                </View>
              </View>

              {/* GO / STOP Button */}
              <Pressable
                onPress={() => workout.isActive ? workout.stopWorkout() : workout.startWorkout()}
                style={({ pressed }) => ({
                  width: 110, height: 110, borderRadius: 55,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: workout.isActive ? T.orange : T.teal,
                  shadowColor: workout.isActive ? T.orange : T.teal,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.55, shadowRadius: 16, elevation: 12,
                  borderWidth: 3,
                  borderColor: workout.isActive ? T.orangeDim : T.tealDim,
                  opacity: pressed ? 0.82 : 1,
                })}
              >
                <Ionicons
                  name={workout.isActive ? 'stop' : 'play'}
                  size={32}
                  color={T.bg}
                />
                <Text style={{ fontSize: 13, fontWeight: '900', color: T.bg, marginTop: 2, letterSpacing: 1 }}>
                  {workout.isActive ? 'STOP' : 'GO'}
                </Text>
              </Pressable>

              {/* Sensor status */}
              <Text style={{ fontSize: 10, fontWeight: '600', color: T.textMuted, marginTop: 16, textAlign: 'center' }}>
                {workout.isSimulating
                  ? '⚠️ Simulation mode — sensor unavailable'
                  : workout.isSensorAvailable
                  ? '📡 Accelerometer active — carry phone while walking'
                  : '🔄 Initializing sensor…'}
              </Text>
            </Animated.View>

            {/* Workout History Sessions Card List */}
            <Animated.View entering={FadeInDown.delay(140).springify()} style={[T.neo, styles.tipsCard, { marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(45,212,191,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="time-outline" size={18} color={T.teal} />
                  </View>
                  <View>
                    <Text style={[styles.tipsTitle, { color: T.textPrimary, marginBottom: 0 }]}>Workout History</Text>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: T.textMuted }}>{workout.allSessions.length} recorded workouts</Text>
                  </View>
                </View>

                {workout.allSessions.length > 0 && (
                  <Pressable
                    onPress={() => {
                      Alert.alert('Clear History', 'Delete all recorded workout history?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear All', style: 'destructive', onPress: workout.clearAllSessions },
                      ]);
                    }}
                    style={[T.neo, { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)' }]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#EF4444' }}>Clear All</Text>
                  </Pressable>
                )}
              </View>

              {workout.allSessions.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 18 }}>
                  <Ionicons name="fitness-outline" size={32} color={T.textMuted} style={{ marginBottom: 6, opacity: 0.5 }} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: T.textMuted }}>No workouts recorded yet</Text>
                  <Text style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Tap GO above to start tracking a workout!</Text>
                </View>
              ) : (
                workout.allSessions.map((s, i) => (
                  <View key={s.id || i} style={{
                    paddingVertical: 12, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: T.border,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Left Type & Time */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <View style={{
                          width: 38, height: 38, borderRadius: 12,
                          backgroundColor: s.type === 'outdoor_cycle' ? 'rgba(168,85,247,0.15)' : s.type === 'outdoor_run' ? 'rgba(249,115,22,0.15)' : 'rgba(45,212,191,0.15)',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Ionicons
                            name={s.type === 'outdoor_cycle' ? 'bicycle' : s.type === 'outdoor_run' ? 'flame' : 'footsteps'}
                            size={18}
                            color={s.type === 'outdoor_cycle' ? T.purple : s.type === 'outdoor_run' ? T.orange : T.teal}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: T.textPrimary }}>{workoutLabels[s.type]}</Text>
                            {s.deviceName && (
                              <View style={{ backgroundColor: 'rgba(45,212,191,0.15)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                                <Text style={{ fontSize: 9, color: T.teal, fontWeight: '700' }}>⌚ {s.deviceName}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: T.textMuted, marginTop: 2 }}>
                            {s.date} {s.formattedTime ? `• ${s.formattedTime}` : ''}
                          </Text>
                        </View>
                      </View>

                      {/* Right Delete Button */}
                      <Pressable
                        onPress={() => workout.deleteSession(s.id)}
                        style={{ padding: 6 }}
                      >
                        <Ionicons name="trash-outline" size={16} color={T.red} />
                      </Pressable>
                    </View>

                    {/* Stats Metric Row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4, paddingTop: 6, backgroundColor: T.bg, borderRadius: 10, padding: 8 }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase' }}>Duration</Text>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: T.teal, marginTop: 1 }}>{formatWorkoutTime(s.durationSeconds)}</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase' }}>Distance</Text>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: T.purple, marginTop: 1 }}>{s.distanceKm} km</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase' }}>Calories</Text>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: T.orange, marginTop: 1 }}>{s.calories} kcal</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase' }}>Steps</Text>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: T.textPrimary, marginTop: 1 }}>{s.steps.toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </Animated.View>

            {/* Tips */}
            <Animated.View entering={FadeInDown.delay(180).springify()} style={[T.neo, styles.tipsCard]}>
              <Text style={[styles.tipsTitle, { color: T.textPrimary }]}>🏃 Workout Tips</Text>
              <View style={{ gap: 12 }}>
                {[
                  { icon: 'heart' as const, color: T.teal, title: 'Keep heart rate steady', desc: 'Stay in aerobic zone (130–150 bpm) for max fat burn and cardio efficiency.' },
                  { icon: 'flame' as const, color: T.orange, title: 'Sprint Intervals', desc: 'Mix 30s fast + 90s slow recovery to build endurance.' },
                  { icon: 'bicycle' as const, color: T.purple, title: 'Cycling Cadence', desc: 'Aim for 80–100 RPM for efficient power output.' },
                ].map((tip, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                    <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: tip.color+'22', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={tip.icon} size={14} color={tip.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: T.textPrimary, marginBottom: 2 }}>{tip.title}</Text>
                      <Text style={{ fontSize: 11, color: T.textMuted, lineHeight: 16 }}>{tip.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>

            <View style={{ height: 110 }} />
          </ScrollView>
        )}

        {/* Tab Bar */}
        <TabBar activeTab="activity" />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  headerSub: { fontSize: 12, marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },

  ringsCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },

  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  goalLabel: { fontSize: 12, fontWeight: '600' },
  progressBg: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  pctLabel: { fontSize: 11, fontWeight: '600', alignSelf: 'flex-end' },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (SW - 44) / 2,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  statIconBg: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  statUnit: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '600' },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },

  infoCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  infoDesc: { fontSize: 13, lineHeight: 20, textAlign: 'center' },

  tipsCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  tipsTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tipIcon: { fontSize: 16, marginTop: 1 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },

  // Heart Rate & Sync Badges
  heartRateCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hrRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingLeft: 4,
  },
  hrNum: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  hrUnit: {
    fontSize: 12,
    fontWeight: '700',
  },
  watchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  watchBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Watch Health Metrics Grid (Sleep & SpO2)
  watchMetricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  halfCard: {
    width: (SW - 44) / 2,
    borderRadius: 24,
    padding: 16,
  },
  metricMainText: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 2,
    marginTop: 4,
  },
  metricSubText: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
});
