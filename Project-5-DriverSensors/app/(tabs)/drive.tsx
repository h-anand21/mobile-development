import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Modal, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Line, Path, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useDriveStore, DriveSession } from '../../src/store/driveStore';
import { useSensorStore } from '../../src/store/sensorStore';
import { driveRepository } from '../../src/database/repositories/driveRepository';



import { generateAIFeedback } from '../../src/services/ai/aiCoach';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../src/ui/theme';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 750;


  
const ProgressDial = ({
  percent,
  value,
  label,
  sublabel,
  colors: dialColors,
  icon,
  isDark,
}: {
  percent: number;
  value: string;
  label: string;
  sublabel: string;
  colors: string[];
  icon: React.ReactNode;
  isDark: boolean;
}) => {
  const size = 100;
  const radius = 40;
  const strokeWidth = 4.5;
  const circumference = 2 * Math.PI * radius; // 251.33
  const arcLength = circumference * 0.75; // 188.50
  const progressLength = percent * arcLength;
  const gapLength = circumference - progressLength;

  return (
    <View style={{ width: '32%', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <SvgLinearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={dialColors[0]} />
            <Stop offset="100%" stopColor={dialColors[1]} />
          </SvgLinearGradient>
        </Defs>
        {/* Outer dashed accent ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 4}
          stroke={isDark ? "rgba(0, 245, 255, 0.05)" : "rgba(14, 165, 233, 0.06)"}
          strokeWidth="1"
          strokeDasharray="2 4"
          fill="none"
        />
        {/* Track Circle (always 270 degrees) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.06)"}
          strokeWidth={strokeWidth - 1}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />
        {/* Progress Circle (drawn dynamically from bottom-left clockwise) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#grad-${label.replace(/\s+/g, '')})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progressLength} ${gapLength}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
      }}>
        <View style={{ marginBottom: 2 }}>{icon}</View>
        <Text style={{
          fontSize: 7.5,
          color: isDark ? '#64748b' : '#475569',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginBottom: 1,
          textAlign: 'center',
        }}>{label}</Text>
        <Text style={{
          fontSize: 18,
          fontWeight: '800',
          color: dialColors[0],
          lineHeight: 20,
          marginBottom: 0,
        }}>{value}</Text>
        <Text style={{
          fontSize: 9,
          fontWeight: '700',
          color: dialColors[0],
          textAlign: 'center',
        }}>{sublabel}</Text>
      </View>
    </View>
  );
};

export default function DriveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors, isDark);

  // Store actions & state
  const currentSession = useDriveStore((state) => state.currentSession);
  const startDrive = useDriveStore((state) => state.startDrive);
  const endDrive = useDriveStore((state) => state.endDrive);
  const setTracking = useSensorStore((state) => state.setTracking);

  const isFocused = useIsFocused();
  const [dbDrives, setDbDrives] = useState<DriveSession[]>([]);

  useEffect(() => {
    if (isFocused) {
      setDbDrives(driveRepository.getAllDrives());
    }
  }, [isFocused, currentSession]);
  
  // Local states
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [lastSessionData, setLastSessionData] = useState<DriveSession | null>(null);

  // Track stopwatch duration
  useEffect(() => {
    if (!currentSession) {
      setElapsedTime(0);
      return;
    }
    
    // Reset timer
    setElapsedTime(Math.floor((Date.now() - currentSession.startTime) / 1000));
    
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - currentSession.startTime) / 1000);
      setElapsedTime(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  // Format seconds to HH:MM:SS
  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const handleStart = () => {
    startDrive();
    setTracking(true);
  };

  const handleEnd = () => {
    if (currentSession) {
      const sessionId = currentSession.id;
      endDrive();
      setTracking(false);
      router.replace({
        pathname: '/drive-summary',
        params: { id: sessionId }
      });
    }
  };

  // Premium animations for the car (float + rumble vibration + sway horizontal + steering tilt)
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rumbleAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;

  // Twinkling stars opacity values
  const star1Opacity = useRef(new Animated.Value(0.3)).current;
  const star2Opacity = useRef(new Animated.Value(0.5)).current;
  const star3Opacity = useRef(new Animated.Value(0.2)).current;
  const star4Opacity = useRef(new Animated.Value(0.4)).current;

  // Speed light trails
  const trail1Anim = useRef(new Animated.Value(0)).current;
  const trail2Anim = useRef(new Animated.Value(0)).current;
  const trail3Anim = useRef(new Animated.Value(0)).current;

  // Seamless road lines translation
  const roadLinesTranslateX = useRef(new Animated.Value(0)).current;

  // Combined vertical vibration + suspension float
  const carTranslateY = Animated.add(floatAnim, rumbleAnim);

  useEffect(() => {
    if (!currentSession) {
      // 1. Slow suspension float bounce (vertical)
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -2.0,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 1.5,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 2. High-speed engine vibration (rumble)
      Animated.loop(
        Animated.sequence([
          Animated.timing(rumbleAnim, {
            toValue: 0.5,
            duration: 65,
            useNativeDriver: true,
          }),
          Animated.timing(rumbleAnim, {
            toValue: -0.5,
            duration: 65,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 3. Horizontal lane sway (drifting/steering effect)
      Animated.loop(
        Animated.sequence([
          Animated.timing(swayAnim, {
            toValue: -5,
            duration: 2400,
            useNativeDriver: true,
          }),
          Animated.timing(swayAnim, {
            toValue: 5,
            duration: 2400,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 4. Steering tilt rotation
      Animated.loop(
        Animated.sequence([
          Animated.timing(tiltAnim, {
            toValue: -1.0,
            duration: 1300,
            useNativeDriver: true,
          }),
          Animated.timing(tiltAnim, {
            toValue: 1.0,
            duration: 1300,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 5. Seamless infinite road lines scrolling (constant speed)
      roadLinesTranslateX.setValue(0);
      Animated.loop(
        Animated.timing(roadLinesTranslateX, {
          toValue: -60, // sum of dash width + spacing
          duration: 150, // fast speed
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // 6. Twinkling stars loop animations
      const twinkle = (anim: Animated.Value, minVal: number, maxVal: number, duration: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: maxVal, duration, useNativeDriver: true }),
            Animated.timing(anim, { toValue: minVal, duration, useNativeDriver: true }),
          ])
        ).start();
      };
      twinkle(star1Opacity, 0.2, 0.9, 1100);
      twinkle(star2Opacity, 0.3, 1.0, 1500);
      twinkle(star3Opacity, 0.1, 0.8, 900);
      twinkle(star4Opacity, 0.4, 0.95, 1800);

      // 7. Light trails infinite scrolling loops
      const runTrail = (anim: Animated.Value, duration: number) => {
        anim.setValue(0);
        Animated.loop(
          Animated.timing(anim, {
            toValue: -(width - 50 + 150),
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      };
      runTrail(trail1Anim, 850);
      runTrail(trail2Anim, 1350);
      runTrail(trail3Anim, 1850);
    }
  }, [currentSession]);

  // Interpolated rotation values
  const tiltInterpolate = tiltAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-1deg', '1deg'],
  });

  // Calculate dynamic dashboard statistics
  const { avgScore, totalDistanceKm, totalDrivesCount } = React.useMemo(() => {
    if (dbDrives.length === 0) {
      return {
        avgScore: 92,
        totalDistanceKm: 1248,
        totalDrivesCount: 24,
      };
    }
    const totalScore = dbDrives.reduce((sum, d) => sum + d.score, 0);
    const avg = Math.round(totalScore / dbDrives.length);
    const totalDistMeters = dbDrives.reduce((sum, d) => sum + d.distance, 0);
    
    // Show precision decimal (e.g. 1.4 km) if total is under 10km, otherwise round to whole km
    const totalDistKm = totalDistMeters < 10000
      ? Number((totalDistMeters / 1000).toFixed(1))
      : Math.round(totalDistMeters / 1000);

    return {
      avgScore: avg,
      totalDistanceKm: totalDistKm,
      totalDrivesCount: dbDrives.length,
    };
  }, [dbDrives]);

  const scoreRatingText = avgScore >= 90 ? 'Excellent' : avgScore >= 70 ? 'Good' : avgScore >= 50 ? 'Fair' : 'Poor';

  const secondaryNeonColor = isDark ? '#00f5ff' : '#0284c7';

  // Dynamic color palette for Avg Score based on the score value
  const avgScoreColors = React.useMemo(() => {
    if (avgScore >= 90) return ['#22c55e', '#84cc16']; // Excellent (Green/Lime)
    if (avgScore >= 70) return isDark ? ['#00f5ff', '#0ea5e9'] : ['#0ea5e9', '#0284c7']; // Good (Cyan/Blue)
    if (avgScore >= 50) return ['#f59e0b', '#eab308']; // Fair (Orange/Yellow)
    return ['#ef4444', '#b91c1c']; // Poor (Red)
  }, [avgScore, isDark]);

  // Determine dynamic greeting message based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // If no active drive session, render start screen
  if (!currentSession) {
    return (
      <LinearGradient
        colors={isDark ? ['#081325', '#030712'] : ['#f8fafc', '#e2e8f0']}
        style={styles.inactiveContainer}
      >
        {/* Header */}
        <View style={[styles.headerInactive, { paddingTop: Math.max(insets.top, 45) }]}>
          <View style={styles.headerBrand}>
            <View style={styles.headerLogoWrap}>
              <Image 
                source={!isDark ? require('../../assets/icon/icon-white.png') : require('../../assets/icon/black -icon.png')} 
                style={{ width: 36, height: 36, resizeMode: 'contain' }} 
              />
            </View>
            <View style={styles.headerTitleCol}>
              <Text style={styles.headerLogoText}>
                Safe<Text style={styles.headerLogoTextHighlight}>Drive</Text>
              </Text>
              <Text style={styles.headerSubtitle}>Engine</Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.inactiveContent} 
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={true}
        >
          {/* Greeting and Header */}
          <Text style={styles.greetingText}>{getGreeting()}, Himanshu 👋</Text>
          <Text style={styles.welcomeTitle}>
            Ready for{"\n"}your <Text style={styles.welcomeTitleHighlight}>drive?</Text>
          </Text>
          <Text style={styles.welcomeSubtitle}>Let's make every drive a safe one.</Text>

          {/* Animated Panoramic Driving Landscape Card */}
          <View style={styles.imageContainer}>
            {/* The static background scenery */}
            <Image
              source={require('../../assets/images/backgroubnd.png')}
              style={styles.backgroundImage}
            />

            {/* Twinkling Stars */}
            <Animated.View style={[styles.star, { top: '10%', left: '22%', opacity: star1Opacity }]} />
            <Animated.View style={[styles.star, { top: '6%', left: '46%', opacity: star2Opacity }]} />
            <Animated.View style={[styles.star, { top: '14%', left: '68%', opacity: star3Opacity }]} />
            <Animated.View style={[styles.star, { top: '8%', left: '85%', opacity: star4Opacity }]} />

            {/* Seamless Horizontally Scrolling Road Lines */}
            <Animated.View
              style={[
                styles.roadLinesRow,
                { transform: [{ translateX: roadLinesTranslateX }] }
              ]}
            >
              {Array.from({ length: 20 }).map((_, idx) => (
                <View key={idx} style={styles.roadLineDash} />
              ))}
            </Animated.View>

            {/* Passing Light Trails / Streetlights */}
            <Animated.View
              style={[
                styles.lightTrail,
                {
                  top: '72%',
                  left: '100%',
                  width: 80,
                  backgroundColor: '#00f5ff',
                  transform: [{ translateX: trail1Anim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.lightTrail,
                {
                  top: '80%',
                  left: '100%',
                  width: 120,
                  backgroundColor: '#ffffff',
                  transform: [{ translateX: trail2Anim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.lightTrail,
                {
                  top: '86%',
                  left: '100%',
                  width: 60,
                  backgroundColor: '#22c55e',
                  transform: [{ translateX: trail3Anim }],
                },
              ]}
            />

            {/* The transparent car layer which floats/vibrates/sways/tilts on the road */}
            <Animated.View
              style={[
                styles.carOverlay,
                {
                  transform: [
                    { translateY: carTranslateY },
                    { translateX: swayAnim },
                    { rotate: tiltInterpolate }
                  ]
                }
              ]}
            >
              <Image
                source={require('../../assets/images/car_running.png')}
                style={styles.carImage}
              />
            </Animated.View>
          </View>

          {/* Diagnostics Card */}
          <View style={styles.diagnosticsCard}>
            <View style={styles.diagCol}>
              <View style={styles.diagIconCircle}>
                <Feather name="target" size={14} color="#22c55e" />
              </View>
              <Text style={styles.diagLabel}>Sensors</Text>
              <View style={styles.diagStatusRow}>
                <Text style={[styles.diagStatusText, { color: '#22c55e' }]}>Online</Text>
                <View style={[styles.diagStatusDot, { backgroundColor: '#22c55e' }]} />
              </View>
            </View>

            <View style={styles.diagDivider} />

            <View style={styles.diagCol}>
              <View style={styles.diagIconCircle}>
                <Feather name="map-pin" size={14} color={secondaryNeonColor} />
              </View>
              <Text style={styles.diagLabel}>GPS</Text>
              <View style={styles.diagStatusRow}>
                <Text style={[styles.diagStatusText, { color: secondaryNeonColor }]}>Active</Text>
                <View style={[styles.diagStatusDot, { backgroundColor: secondaryNeonColor }]} />
              </View>
            </View>

            <View style={styles.diagDivider} />

            <View style={styles.diagCol}>
              <View style={styles.diagIconCircle}>
                <Feather name="smartphone" size={14} color="#22c55e" />
              </View>
              <Text style={styles.diagLabel}>Phone</Text>
              <View style={styles.diagStatusRow}>
                <Text style={[styles.diagStatusText, { color: '#22c55e' }]}>Mounted</Text>
                <View style={[styles.diagStatusDot, { backgroundColor: '#22c55e' }]} />
              </View>
            </View>
          </View>

          {/* Circular Progress Rings Row */}
          <View style={styles.dialsRow}>
            {/* Avg Score Dial */}
            <ProgressDial
              percent={avgScore / 100}
              value={String(avgScore)}
              label="Avg Score"
              sublabel={scoreRatingText}
              colors={avgScoreColors}
              isDark={isDark}
              icon={
                <View style={{ backgroundColor: `${avgScoreColors[0]}1a`, padding: 4, borderRadius: 8 }}>
                  <Feather name="shield" size={12} color={avgScoreColors[0]} />
                </View>
              }
            />

            {/* Total Distance Dial */}
            <ProgressDial
              percent={Math.min(1.0, totalDistanceKm / 2000)} // scale up to 2000km
              value={String(totalDistanceKm)}
              label="Total Distance"
              sublabel="km"
              colors={isDark ? ['#00f5ff', '#0ea5e9'] : ['#0ea5e9', '#0284c7']}
              isDark={isDark}
              icon={
                <View style={{ backgroundColor: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(2, 132, 199, 0.1)', padding: 4, borderRadius: 8 }}>
                  <FontAwesome5 name="road" size={11} color={secondaryNeonColor} />
                </View>
              }
            />

            {/* Total Trips Dial */}
            <ProgressDial
              percent={Math.min(1.0, totalDrivesCount / 50)} // scale up to 50 trips
              value={String(totalDrivesCount)}
              label="Total Drives"
              sublabel="Trips"
              colors={['#a855f7', '#d946ef']}
              isDark={isDark}
              icon={
                <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: 4, borderRadius: 8 }}>
                  <Ionicons name="car-outline" size={13} color="#a855f7" />
                </View>
              }
            />
          </View>

          {/* START DRIVE CTA */}
          <TouchableOpacity style={styles.hugeStartButton} onPress={handleStart}>
            <LinearGradient
              colors={['#00f5ff', '#22c55e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.hugeStartGradient}
            >
              <MaterialCommunityIcons name="steering" size={22} color="#050B14" style={{ marginRight: 10 }} />
              <Text style={styles.hugeStartText}>START DRIVE</Text>
              <Feather name="chevron-right" size={22} color="#050B14" style={{ marginLeft: 'auto' }} />
            </LinearGradient>
          </TouchableOpacity>

          {/* LIVE SENSOR VIEW CTA */}
          <TouchableOpacity 
            style={styles.liveAnalyticsOutlineBtn} 
            onPress={() => router.push('/live-analytics')}
          >
            <MaterialCommunityIcons name="waveform" size={18} color={secondaryNeonColor} style={{ marginRight: 8 }} />
            <Text style={styles.liveAnalyticsOutlineBtnText}>LIVE SENSOR VIEW</Text>
            <Feather name="chevron-right" size={18} color={secondaryNeonColor} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          {/* Secure Footer */}
          <View style={styles.secureFooter}>
            <Feather name="lock" size={12} color="#94a3b8" />
            <Text style={styles.secureFooterText}>Your data is secure & private</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Active Drive Session Data Calculations
  const score = currentSession.score;
  const rating = currentSession.rating;
  
  // Calculate dynamic speed from last GPS point in route
  const currentSpeedMs = currentSession.route.length > 0 
    ? currentSession.route[currentSession.route.length - 1].speed 
    : 0;
  const currentSpeedKmH = Math.round(currentSpeedMs * 3.6);

  // Average speed calculation
  const averageSpeedKmH = currentSession.route.length > 0
    ? Math.round((currentSession.route.reduce((acc, p) => acc + p.speed, 0) / currentSession.route.length) * 3.6)
    : 0;

  // Event Counts
  const harshBrakeCount = currentSession.events.filter(e => e.type === 'HARSH_BRAKE').length;
  const harshAccelCount = currentSession.events.filter(e => e.type === 'HARSH_ACCELERATION').length;
  const sharpTurnCount = currentSession.events.filter(e => e.type === 'SHARP_TURN').length;
  const phoneUsageCount = currentSession.events.filter(e => e.type === 'PHONE_USAGE').length;

  // Deduct score metrics dynamically for driving insights
  const brakingHealth = Math.max(0, 100 - harshBrakeCount * 6);
  const accelerationHealth = Math.max(0, 100 - harshAccelCount * 6);
  const corneringHealth = Math.max(0, 100 - sharpTurnCount * 6);

  // Target trip progress: mock 10km (10,000m)
  const targetDistanceMeters = 10000;
  const tripProgressPercent = Math.min(100, Math.round((currentSession.distance / targetDistanceMeters) * 100));

  // Arc stroke offset for 270 degree gauge dial
  // Circumference of R=80 is 502.6. 270 deg is 377.
  const strokeDashoffset = 377 - (377 * score) / 100;

  // Score Rating style colors
  const ratingColors = {
    color: score >= 90 ? '#22c55e' : score >= 70 ? '#38bdf8' : score >= 50 ? '#f59e0b' : '#ef4444',
    bg: score >= 90 ? 'rgba(34, 197, 94, 0.15)' : score >= 70 ? 'rgba(56, 189, 248, 0.15)' : score >= 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
    border: score >= 90 ? 'rgba(34, 197, 94, 0.3)' : score >= 70 ? 'rgba(56, 189, 248, 0.3)' : score >= 50 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
  };

  // Generate radial dial ticks matching mockup dashboard
  const dialTicks = [];
  const startAngle = 135;
  const totalAngle = 270;
  const tickCount = 45;
  
  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (i * totalAngle) / tickCount;
    const rad = (angle * Math.PI) / 180;
    
    // Check if tick is active based on score percentage
    const tickPct = i / tickCount;
    const isActive = tickPct <= score / 100;
    
    // Outer and inner radius for the ticks (just inside the outer progress ring)
    const rOuter = 73;
    const rInner = 67;
    
    const x1 = 100 + rOuter * Math.cos(rad);
    const y1 = 100 + rOuter * Math.sin(rad);
    const x2 = 100 + rInner * Math.cos(rad);
    const y2 = 100 + rInner * Math.sin(rad);
    
    dialTicks.push(
      <Line
        key={`tick-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? '#06b6d4' : '#1e293b'}
        strokeWidth={isActive ? 1.5 : 1}
        opacity={isActive ? 0.7 : 0.4}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.iconCircle}>
          <Feather name="chevron-down" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.statusBarContainer}>
          <View style={styles.statusRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusTextActive}>Drive in Progress</Text>
          </View>
          <View style={styles.gpsRow}>
            <View style={styles.greenDot} />
            <Text style={styles.gpsText}>GPS</Text>
            <Ionicons name="cellular" size={14} color="#22c55e" style={{ marginLeft: 3 }} />
          </View>
        </View>

        <TouchableOpacity style={styles.iconCircle}>
          <Feather name="settings" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Score Gauge */}
        <View style={styles.gaugeContainer}>
          <Svg width={isSmallDevice ? 240 : 300} height={isSmallDevice ? 240 : 300} viewBox="0 0 200 200" style={styles.svgGauge}>
            <Defs>
              <SvgLinearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                <Stop offset="30%" stopColor="#f59e0b" stopOpacity="1" />
                <Stop offset="70%" stopColor="#84cc16" stopOpacity="1" />
                <Stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            {/* Background Track (270 degrees) */}
            <Circle 
              cx="100" cy="100" r="80" 
              stroke="#1e293b" 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray="377" 
              strokeDashoffset="0" 
              strokeLinecap="round" 
              transform="rotate(135 100 100)"
            />
            {/* Active Progress */}
            <Circle 
              cx="100" cy="100" r="80" 
              stroke="url(#activeGrad)" 
              strokeWidth="10" 
              fill="none" 
              strokeDasharray="377" 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round" 
              transform="rotate(135 100 100)"
            />
            {/* Radial Ticks inside SVG */}
            {dialTicks}
          </Svg>
          
          <View style={styles.scoreInner}>
            <View style={styles.shieldIconContainer}>
              <Image 
                source={!isDark ? require('../../assets/icon/icon-white.png') : require('../../assets/icon/black -icon.png')} 
                style={{ width: !isDark ? 54 : 38, height: !isDark ? 54 : 38, resizeMode: 'contain' }} 
              />
            </View>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreLabel}>CURRENT SCORE</Text>
            <View style={[styles.ratingBadge, { backgroundColor: ratingColors.bg, borderColor: ratingColors.border }]}>
              <View style={[styles.dot, { backgroundColor: ratingColors.color }]} />
              <Text style={[styles.ratingText, { color: ratingColors.color }]}>{rating}</Text>
            </View>
            <Text style={styles.gaugeSubtext}>Keep driving safe!</Text>
          </View>
        </View>
 
         {/* Perspective Car Grid Area */}
         <View style={styles.carGridSection}>
           <Svg width={width} height={isSmallDevice ? 90 : 120} viewBox={`0 0 ${width} 120`} style={styles.perspectiveRoadGrid}>
             <Defs>
               <SvgLinearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
              </SvgLinearGradient>
            </Defs>
            {/* Horizontal Grid lines */}
            <Line x1="0" y1="40" x2={width} y2="40" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="1" />
            <Line x1="0" y1="65" x2={width} y2="65" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" />
            <Line x1="0" y1="90" x2={width} y2="90" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" />
            <Line x1="0" y1="118" x2={width} y2="118" stroke="url(#roadGrad)" strokeWidth="2.5" />
            
            {/* Horizon meeting lines */}
            <Line x1={width / 2} y1="20" x2="-50" y2="120" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" />
            <Line x1={width / 2} y1="20" x2={width / 6} y2="120" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" />
            <Line x1={width / 2} y1="20" x2={width / 3} y2="120" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" />
            <Line x1={width / 2} y1="20" x2={(2 * width) / 3} y2="120" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" />
            <Line x1={width / 2} y1="20" x2={(5 * width) / 6} y2="120" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" />
            <Line x1={width / 2} y1="20" x2={width + 50} y2="120" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" />
          </Svg>
          
          <Image 
            source={require('../../assets/images/drive_car.png')} 
            style={styles.carImage} 
            resizeMode="contain"
          />
        </View>

        {/* Speed Stats Row */}
        <View style={styles.speedStatsRow}>
          {/* Average Speed */}
          <View style={styles.speedStatCardSide}>
            <View style={styles.speedIconOuter}>
              <MaterialCommunityIcons name="speedometer" size={22} color="#06b6d4" />
            </View>
            <Text style={styles.speedStatLabel}>Avg. Speed</Text>
            <Text style={styles.speedStatVal}>{averageSpeedKmH} km/h</Text>
          </View>

          {/* Current Speed (Large Capsule) */}
          <View style={styles.currentSpeedCapsule}>
            <Text style={styles.currentSpeedLabel}>CURRENT SPEED</Text>
            <Text style={styles.currentSpeedVal}>{currentSpeedKmH}</Text>
            <Text style={styles.currentSpeedUnit}>km/h</Text>
          </View>

          {/* Speed Limit */}
          <View style={styles.speedStatCardSide}>
            <View style={styles.speedLimitCircle}>
              <Text style={styles.speedLimitText}>80</Text>
            </View>
            <Text style={styles.speedStatLabel}>Speed Limit</Text>
            <Text style={styles.speedStatVal}>80 km/h</Text>
          </View>
        </View>

        {/* Telemetry Metrics Grid (4 Items) */}
        <View style={styles.telemetryGrid}>
          {/* Distance */}
          <View style={styles.telemetryCard}>
            <FontAwesome5 name="road" size={18} color="#84cc16" style={styles.telemetryIcon} />
            <Text style={styles.telemetryLabel}>DISTANCE</Text>
            <Text style={styles.telemetryValue}>{(currentSession.distance / 1000).toFixed(1)}</Text>
            <Text style={styles.telemetryUnit}>km</Text>
          </View>

          {/* Duration */}
          <View style={styles.telemetryCard}>
            <Feather name="clock" size={18} color="#0ea5e9" style={styles.telemetryIcon} />
            <Text style={styles.telemetryLabel}>DURATION</Text>
            <Text style={styles.telemetryValue}>{formatDuration(elapsedTime)}</Text>
            <Text style={styles.telemetryUnit}>hr</Text>
          </View>

          {/* Trip Progress */}
          <View style={styles.telemetryCard}>
            <MaterialCommunityIcons name="map-marker-distance" size={18} color="#06b6d4" style={styles.telemetryIcon} />
            <Text style={styles.telemetryLabel}>TRIP PROGRESS</Text>
            <Text style={styles.telemetryValue}>{tripProgressPercent}%</Text>
            <Text style={styles.telemetryUnit}>completed</Text>
          </View>

          {/* Phone Usage */}
          <View style={styles.telemetryCard}>
            <Feather name="phone-call" size={18} color="#f59e0b" style={styles.telemetryIcon} />
            <Text style={styles.telemetryLabel}>PHONE USAGE</Text>
            <Text style={styles.telemetryValue}>{phoneUsageCount}</Text>
            <Text style={styles.telemetryUnit}>min</Text>
          </View>
        </View>

        {/* Real-time Telemetry shortcut banner */}
        <TouchableOpacity 
          style={styles.liveTelemetryActiveBanner}
          onPress={() => router.push('/live-analytics')}
        >
          <View style={styles.liveTelemetryActiveLeft}>
            <View style={styles.waveformIconGlowCircle}>
              <MaterialCommunityIcons name="waveform" size={20} color="#06b6d4" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.liveTelemetryActiveTitle}>Real-time Sensor Waveform</Text>
              <Text style={styles.liveTelemetryActiveDesc}>Monitor live accelerometer & gyroscope forces</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.liveTelemetryPulseDot} />
            <Feather name="chevron-right" size={18} color="#06b6d4" />
          </View>
        </TouchableOpacity>

        {/* Driving Insights Progress Rows */}
        <View style={styles.insightsSection}>
          <View style={styles.insightsHeaderRowMain}>
            <Text style={styles.insightsSectionTitle}>DRIVING INSIGHTS</Text>
            <TouchableOpacity 
              onPress={() => router.push('/live-events')} 
              style={styles.liveEventsLink}
            >
              <Text style={styles.liveEventsLinkText}>Live Logs ({currentSession.events.length})</Text>
              <Feather name="chevron-right" size={14} color="#06b6d4" />
            </TouchableOpacity>
          </View>

          
          {/* Smooth Braking */}
          <View style={styles.insightItem}>
            <View style={styles.insightHeaderRow}>
              <Text style={styles.insightName}>Smooth Braking</Text>
              <Text style={[styles.insightPercent, { color: '#06b6d4' }]}>{brakingHealth}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${brakingHealth}%`, backgroundColor: '#06b6d4' }]} />
            </View>
          </View>

          {/* Smooth Acceleration */}
          <View style={styles.insightItem}>
            <View style={styles.insightHeaderRow}>
              <Text style={styles.insightName}>Smooth Acceleration</Text>
              <Text style={[styles.insightPercent, { color: '#84cc16' }]}>{accelerationHealth}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${accelerationHealth}%`, backgroundColor: '#84cc16' }]} />
            </View>
          </View>

          {/* Cornering */}
          <View style={styles.insightItem}>
            <View style={styles.insightHeaderRow}>
              <Text style={styles.insightName}>Cornering</Text>
              <Text style={[styles.insightPercent, { color: '#eab308' }]}>{corneringHealth}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${corneringHealth}%`, backgroundColor: '#eab308' }]} />
            </View>
          </View>
        </View>

        {/* End Drive CTA Panel */}
        <View style={styles.endDriveSection}>
          <Svg width={width - 40} height={100} viewBox={`0 0 ${width - 40} 100`} style={styles.endDriveSvg}>
            {/* Left pulse wave (Blue) */}
            <Path 
              d="M 10 50 Q 20 20, 35 50 T 60 50 T 85 50 T 110 50 L 130 50" 
              stroke="#06b6d4" 
              strokeWidth="2" 
              fill="none" 
              opacity="0.8"
            />
            {/* Right pulse wave (Yellow/Green) */}
            <Path 
              d="M 230 50 L 250 50 Q 265 80, 280 50 T 305 50 T 330 50 T 350 50" 
              stroke="#84cc16" 
              strokeWidth="2" 
              fill="none" 
              opacity="0.8"
            />
          </Svg>

          <TouchableOpacity style={styles.stopButtonCircle} onPress={handleEnd}>
            <LinearGradient
              colors={['#ef4444', '#b91c1c']}
              style={styles.stopButtonGradient}
            >
              <FontAwesome5 name="stop" size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.endDriveLabel}>END DRIVE</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>


    </View>
  );
}

function getStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
  // General
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    marginBottom: 90, // Ends exactly above the floating tab bar
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSpacer: {
    height: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Inactive Drive screen (Neon theme)
  inactiveContainer: {
    flex: 1,
  },
  headerInactive: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  iconCircleInactive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1.5,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1.2,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  headerLogoWrap: {
    marginRight: 8,
  },
  headerTitleCol: {
    justifyContent: 'center',
  },
  headerLogoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : colors.text,
  },
  headerLogoTextHighlight: {
    color: '#22c55e',
  },
  headerSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: -2,
  },
  gearDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    borderWidth: 1.5,
    borderColor: '#050B14',
  },
  inactiveContent: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greetingText: {
    fontSize: 13,
    color: isDark ? '#e2e8f0' : colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'left',
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : colors.text,
    textAlign: 'left',
    width: '100%',
    lineHeight: 30,
    marginBottom: 4,
  },
  welcomeTitleHighlight: {
    color: isDark ? '#00f5ff' : '#0284c7',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'left',
    width: '100%',
    lineHeight: 16,
    marginBottom: 6,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1844 / 853,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 10,
    borderWidth: 1.2,
    borderColor: isDark ? 'rgba(0, 245, 255, 0.15)' : 'rgba(14, 165, 233, 0.2)',
    backgroundColor: isDark ? '#030712' : '#f8fafc',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  roadLinesRow: {
    position: 'absolute',
    left: 0,
    bottom: '12%',
    flexDirection: 'row',
    width: '200%',
    alignItems: 'center',
  },
  roadLineDash: {
    width: 25,
    height: 3,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.3)',
    marginRight: 35,
  },
  carOverlay: {
    position: 'absolute',
    left: '12%',
    top: '32%',
    width: '76%',
    aspectRatio: 1.5,
  },
  carImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  star: {
    position: 'absolute',
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: isDark ? '#ffffff' : '#64748b',
  },
  lightTrail: {
    position: 'absolute',
    height: 1.2,
    borderRadius: 1,
    opacity: 0.6,
  },
  diagnosticsCard: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(10, 25, 47, 0.45)' : 'transparent',
    borderRadius: 16,
    borderWidth: 1.0,
    borderColor: isDark ? 'rgba(0, 245, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 0,
  },
  diagCol: {
    flex: 1,
    alignItems: 'center',
  },
  diagIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  diagLabel: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  diagStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 4,
  },
  diagStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  diagDivider: {
    width: 1,
    height: 28,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  dialsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  hugeStartButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.3 : 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  hugeStartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
  },
  hugeStartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#050B14',
    letterSpacing: 1.5,
  },
  liveAnalyticsOutlineBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: isDark ? '#00f5ff' : '#0284c7',
    backgroundColor: isDark ? 'rgba(0, 245, 255, 0.02)' : 'rgba(2, 132, 199, 0.02)',
    marginBottom: 15,
  },
  liveAnalyticsOutlineBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: isDark ? '#00f5ff' : '#0284c7',
    letterSpacing: 1,
  },
  secureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    opacity: 0.6,
  },
  secureFooterText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 6,
    fontWeight: '500',
  },

  // Active Title / GPS Row
  statusBarContainer: {
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06b6d4',
    marginRight: 6,
  },
  statusTextActive: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 4,
  },
  gpsText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Score Dial
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: isSmallDevice ? 210 : 250,
    marginVertical: isSmallDevice ? 8 : 15,
    position: 'relative',
  },
  svgGauge: {
    position: 'absolute',
  },
  scoreInner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallDevice ? 5 : 10,
  },
  shieldIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 2,
  },
  scoreNumber: {
    color: colors.text,
    fontSize: isSmallDevice ? 52 : 66,
    fontWeight: 'bold',
    lineHeight: isSmallDevice ? 58 : 74,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  gaugeSubtext: {
    color: colors.textSlate,
    fontSize: 11,
    marginTop: 6,
  },
  tickLabel: {
    position: 'absolute',
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Perspective Car Grid
  carGridSection: {
    height: isSmallDevice ? 120 : 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 5,
  },
  perspectiveRoadGrid: {
    position: 'absolute',
    bottom: 0,
  },
  carImage: {
    width: width * 0.58,
    height: isSmallDevice ? 90 : 120,
    zIndex: 2,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },

  // Speed Stats Card Row
  speedStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 12 : 20,
  },
  speedStatCardSide: {
    width: width * 0.26,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: isSmallDevice ? 8 : 12,
    alignItems: 'center',
  },
  speedIconOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  speedLimitCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: '#ef4444',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  speedLimitText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  speedStatLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 2,
  },
  speedStatVal: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentSpeedCapsule: {
    width: width * 0.36,
    backgroundColor: colors.inputBg,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: '#06b6d4',
    paddingVertical: isSmallDevice ? 10 : 15,
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  currentSpeedLabel: {
    color: '#06b6d4',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  currentSpeedVal: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 34,
  },
  currentSpeedUnit: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: '500',
  },

  // Telemetry Grid
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 15 : 25,
  },
  telemetryCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: isSmallDevice ? 8 : 12,
    marginBottom: isSmallDevice ? 8 : 12,
    position: 'relative',
  },
  telemetryIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  telemetryLabel: {
    color: colors.textSlate,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textAlign: 'right',
    marginBottom: 8,
  },
  telemetryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  telemetryUnit: {
    color: colors.textSlate,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },

  // Insights Section
  insightsSection: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: isSmallDevice ? 12 : 16,
    marginBottom: isSmallDevice ? 15 : 25,
  },
  insightsSectionTitle: {
    color: colors.textSlate,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  insightsHeaderRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveEventsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveEventsLinkText: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 2,
  },

  insightItem: {
    marginBottom: 15,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  insightName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  insightPercent: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // End Drive Button & Waves
  endDriveSection: {
    height: isSmallDevice ? 80 : 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: isSmallDevice ? 5 : 10,
  },
  endDriveSvg: {
    position: 'absolute',
  },
  stopButtonCircle: {
    width: isSmallDevice ? 50 : 60,
    height: isSmallDevice ? 50 : 60,
    borderRadius: isSmallDevice ? 25 : 30,
    backgroundColor: '#ef4444',
    borderWidth: 3,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  stopButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: isSmallDevice ? 22 : 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endDriveLabel: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 8,
    zIndex: 2,
  },

  // Modal Summary CSS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 17, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.82,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  modalGradient: {
    flex: 1,
    padding: 25,
    paddingTop: 35,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScoreCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalScoreLabel: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  modalScoreVal: {
    fontSize: 56,
    fontWeight: '900',
    marginVertical: 5,
  },
  modalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatLabelText: {
    color: colors.textSlate,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalStatValText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalStatDivider: {
    width: 1,
    backgroundColor: colors.border,
    alignSelf: 'stretch',
  },
  modalSectionTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  eventCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  eventBadgeCount: {
    width: '23%',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  eventCountNumber: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  eventCountLabel: {
    color: colors.textSlate,
    fontSize: 9,
  },
  feedbackContainer: {
    maxHeight: 110,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06b6d4',
    marginTop: 6,
    marginRight: 8,
  },
  tipText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  modalDismissBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  modalDismissGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDismissText: {
    color: colors.powerBg,
    fontSize: 16,
    fontWeight: 'bold',
  },
  liveTelemetryActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    borderRadius: 20,
    padding: 14,
    marginBottom: 15,
  },
  liveTelemetryActiveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  waveformIconGlowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveTelemetryActiveTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  liveTelemetryActiveDesc: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  liveTelemetryPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06b6d4',
    marginRight: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
}
