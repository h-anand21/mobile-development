import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming, withSpring, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { usePedometer } from '../hooks/use-pedometer';
import TabBar from '../components/TabBar';

const { width: SW } = Dimensions.get('window');

// ─── Animated Arc Ring ───────────────────────────────────────────────────────
function ArcRing({
  percent, size, strokeWidth, color, bgColor, label, value, unit,
}: {
  percent: number; size: number; strokeWidth: number;
  color: string; bgColor: string; label: string; value: string; unit: string;
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = React.useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (percent / 100) * circ), 120);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={cx} cy={cy} r={r} stroke={bgColor} strokeWidth={strokeWidth} fill="transparent" />
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
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color, fontSize: 18, fontWeight: '900' }}>{value}</Text>
          <Text style={{ color, fontSize: 9, fontWeight: '700', opacity: 0.7 }}>{unit}</Text>
        </View>
      </View>
      <Text style={{ color, fontSize: 10, fontWeight: '700', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, unit, color, T, delay,
}: {
  icon: string; label: string; value: string; unit: string; color: string; T: any; delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={[T.neo, styles.statCard]}>
      <View style={[styles.statIconBg, { backgroundColor: color + '22' }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color: T.textPrimary }]}>{value}</Text>
      <Text style={[styles.statUnit, { color }]}>{unit}</Text>
      <Text style={[styles.statLabel, { color: T.textMuted }]}>{label}</Text>
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

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace('/');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

  const stepLabel = pd.loading
    ? '—'
    : !pd.available
    ? '—'
    : pd.steps.toLocaleString();

  const calLabel = pd.loading || !pd.available ? '—' : String(pd.calories);
  const distLabel = pd.loading || !pd.available ? '—' : String(pd.distanceKm);
  const pct = pd.available ? pd.progressPercent : 0;

  const ringSize = 110;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Activity</Text>
            <Text style={[styles.headerSub, { color: T.textMuted }]}>Today's movement</Text>
          </View>
          {pd.available && !pd.loading && <LiveBadge T={T} />}
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Main Rings Card ── */}
          <Animated.View entering={FadeInDown.delay(80).springify()} style={[T.neo, styles.ringsCard]}>
            <Text style={[styles.cardTitle, { color: T.textMuted }]}>TODAY'S RINGS</Text>
            <View style={styles.ringsRow}>
              <ArcRing
                percent={pct}
                size={ringSize}
                strokeWidth={10}
                color={T.teal}
                bgColor={T.tealDim}
                label="Steps"
                value={pd.available ? (pd.steps > 999 ? (pd.steps / 1000).toFixed(1) + 'k' : String(pd.steps)) : '—'}
                unit="steps"
              />
              <ArcRing
                percent={pd.available ? Math.min(100, (pd.calories / 300) * 100) : 0}
                size={ringSize}
                strokeWidth={10}
                color={T.orange}
                bgColor={T.orange + '22'}
                label="Calories"
                value={calLabel}
                unit="kcal"
              />
              <ArcRing
                percent={pd.available ? Math.min(100, (pd.distanceKm / 5) * 100) : 0}
                size={ringSize}
                strokeWidth={10}
                color={T.purple}
                bgColor={T.purple + '22'}
                label="Distance"
                value={distLabel}
                unit="km"
              />
            </View>

            {/* Step Goal Progress */}
            <View style={styles.goalRow}>
              <Text style={[styles.goalLabel, { color: T.textMuted }]}>Daily Goal</Text>
              <Text style={[styles.goalLabel, { color: T.teal, fontWeight: '800' }]}>
                {pd.available ? `${pd.steps.toLocaleString()} / ${pd.goalSteps.toLocaleString()}` : 'Sensor unavailable'}
              </Text>
            </View>
            <ProgressBar percent={pct} color={T.teal} bg={T.tealDim} />
            <Text style={[styles.pctLabel, { color: T.textMuted }]}>{pct}% complete</Text>
          </Animated.View>

          {/* ── Stat Cards Row ── */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="🚶" label="Steps" value={stepLabel} unit="today"
              color={T.teal} T={T} delay={160}
            />
            <StatCard
              icon="🔥" label="Calories" value={calLabel} unit="kcal"
              color={T.orange} T={T} delay={220}
            />
            <StatCard
              icon="📏" label="Distance" value={distLabel} unit="km"
              color={T.purple} T={T} delay={280}
            />
            <StatCard
              icon="🎯" label="Goal" value={`${pct}%`} unit="done"
              color={T.yellow} T={T} delay={340}
            />
          </View>

          {/* ── Info / Fallback Card ── */}
          {!pd.loading && !pd.available && (
            <Animated.View entering={FadeInDown.delay(400).springify()} style={[T.neo, styles.infoCard]}>
              <Text style={{ fontSize: 32, marginBottom: 10 }}>📱</Text>
              <Text style={[styles.infoTitle, { color: T.textPrimary }]}>Sensor Not Available</Text>
              <Text style={[styles.infoDesc, { color: T.textMuted }]}>
                The step counter sensor is not supported on this device or Expo Go environment.
                {'\n\n'}On a physical device, the pedometer will activate automatically.
              </Text>
            </Animated.View>
          )}

          {/* ── Tips Card ── */}
          <Animated.View entering={FadeInDown.delay(460).springify()} style={[T.neo, styles.tipsCard]}>
            <Text style={[styles.tipsTitle, { color: T.textPrimary }]}>💡 Did You Know?</Text>
            {[
              { icon: '🚶', text: '7,000–10,000 steps/day reduces risk of chronic illness.' },
              { icon: '🔥', text: 'Every 2,000 steps burns roughly 80–100 kcal.' },
              { icon: '📏', text: 'A 1 km walk takes about 1,300 steps on average.' },
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <Text style={[styles.tipText, { color: T.textSub }]}>{tip.text}</Text>
              </View>
            ))}
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>

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
});
