import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Line, Path, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDriveStore } from '../../src/store/driveStore';
import { useSensorStore } from '../../src/store/sensorStore';
import { useAppTheme } from '../../src/ui/theme';

const { width } = Dimensions.get('window');

// Main Component
export default function HomeScreen() {
  const router = useRouter();
  const startDrive = useDriveStore((state) => state.startDrive);
  const setTracking = useSensorStore((state) => state.setTracking);
  const currentSession = useDriveStore((state) => state.currentSession);
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors);

  // State for mock animated values (active when not driving)
  const [mockScore, setMockScore] = useState(92);
  const [mockSpeed, setMockSpeed] = useState(68);
  const [mockDistance, setMockDistance] = useState(28.6);
  const [mockDurationSeconds, setMockDurationSeconds] = useState(2536);
  const [mockPhoneUsage, setMockPhoneUsage] = useState(0);

  // Simulated direction of speed changes (accelerating or decelerating)
  const speedTrend = useRef(1); // 1 = accelerating, -1 = decelerating

  useEffect(() => {
    // If a session is active, do not run the mock animation
    if (currentSession) {
      return;
    }

    const interval = setInterval(() => {
      // 1. Animate Speed: oscillate between 45 and 85 km/h
      setMockSpeed((prevSpeed) => {
        let newSpeed = prevSpeed + speedTrend.current * Math.floor(Math.random() * 4 + 1);
        if (newSpeed >= 85) {
          newSpeed = 85;
          speedTrend.current = -1; // start decelerating
        } else if (newSpeed <= 45) {
          newSpeed = 45;
          speedTrend.current = 1; // start accelerating
        }
        return newSpeed;
      });

      // 2. Animate Distance: slowly increase by 0.01 - 0.02 km per tick
      setMockDistance((prevDistance) => {
        return parseFloat((prevDistance + 0.015).toFixed(2));
      });

      // 3. Animate Duration: increment by 1 second per tick
      setMockDurationSeconds((prevSecs) => prevSecs + 1);

      // 4. Animate Safety Score: slowly drift between 88 and 96 to show activity
      setMockScore((prevScore) => {
        const drift = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newScore = Math.max(88, Math.min(98, prevScore + drift));
        return newScore;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  // Dynamic calculations (fallback to animated mock values if no session is active)
  const score = currentSession ? currentSession.score : mockScore;
  const rating = currentSession 
    ? currentSession.rating 
    : (score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Poor');
  
  const currentSpeedMs = currentSession && currentSession.route.length > 0 
    ? currentSession.route[currentSession.route.length - 1].speed 
    : 0;
  const displaySpeed = currentSession ? Math.round(currentSpeedMs * 3.6) : mockSpeed;
  
  const displayDistance = currentSession ? (currentSession.distance / 1000).toFixed(1) : mockDistance.toFixed(1);
  
  const elapsedSeconds = currentSession 
    ? Math.floor((Date.now() - currentSession.startTime) / 1000) 
    : mockDurationSeconds;
  
  const formatHHMM = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  const displayDuration = formatHHMM(elapsedSeconds);
  
  const phoneUsageCount = currentSession 
    ? currentSession.events.filter(e => e.type === 'PHONE_USAGE').length 
    : 0;
  const displayPhoneUsage = currentSession ? phoneUsageCount : mockPhoneUsage;

  // Arc stroke offset for 270 degree gauge dial
  const strokeDashoffset = 377 - (377 * score) / 100;

  const ratingColors = {
    color: score >= 90 ? colors.accent : score >= 70 ? colors.success : score >= 50 ? '#f59e0b' : '#ef4444',
    bg: score >= 90 ? (colors.accent + '1c') : score >= 70 ? 'rgba(34, 197, 94, 0.12)' : score >= 50 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
    border: score >= 90 ? (colors.accent + '33') : score >= 70 ? 'rgba(34, 197, 94, 0.25)' : score >= 50 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)',
  };

  const handleStartDrive = () => {
    if (currentSession) {
      router.push('/drive');
    } else {
      startDrive();
      setTracking(true);
      router.push('/drive');
    }
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
        stroke={isActive ? colors.accent : colors.border}
        strokeWidth={isActive ? 1.5 : 1}
        opacity={isActive ? 0.7 : 0.4}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuBtn}>
            <Feather name="menu" size={28} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingSub, { color: colors.textMuted }]}>Good Evening,</Text>
            <View style={styles.nameRow}>
              <Text style={[styles.greetingName, { color: colors.text }]}>Himanshu</Text>
              <Text style={styles.waveEmoji}>👋</Text>
            </View>
            <Text style={[styles.tagline, { color: colors.success }]}>Drive safe. Live safe.</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellIcon}>
            <Feather name="bell" size={24} color={colors.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <View style={[styles.profilePicContainer, { borderColor: colors.accent }]}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=250&auto=format&fit=crop' }} 
              style={styles.profilePic} 
            />
          </View>
        </View>
      </View>

      {/* Score Gauge */}
      <View style={styles.gaugeContainer}>
        <Svg width={300} height={300} viewBox="0 0 200 200" style={styles.svgGauge}>
          <Defs>
            <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={colors.accent} stopOpacity="1" />
              <Stop offset="50%" stopColor={colors.success} stopOpacity="1" />
              <Stop offset="100%" stopColor="#eab308" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          {/* Background Track */}
          <Circle cx="100" cy="100" r="80" stroke={colors.border} strokeWidth="8" fill="none" strokeDasharray="377" strokeDashoffset="0" strokeLinecap="round" />
          {/* Glowing Progress */}
          <Circle 
            cx="100" cy="100" r="80" 
            stroke="url(#grad)" 
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
              source={!isDark ? require('../../assets/icon/icon-white.png') : require('../../assets/icon/image.png')} 
              style={{ width: 96, height: 96, resizeMode: 'contain' }} 
            />
          </View>
          <Text style={[styles.scoreNumber, { color: colors.text }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>SAFE SCORE</Text>
          <View style={[styles.excellentBadge, { backgroundColor: ratingColors.bg, borderColor: ratingColors.border }]}>
            <View style={[styles.dot, { backgroundColor: ratingColors.color }]} />
            <Text style={[styles.excellentText, { color: ratingColors.color }]}>{rating}</Text>
          </View>
        </View>
      </View>

      {/* Safety Metrics Row */}
      <View style={[styles.metricsRowUnified, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.metricItem}>
          <View style={[styles.metricIconWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Feather name="shield" size={18} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.metricTitle, { color: colors.text }]}>Safe</Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>Driving</Text>
          </View>
        </View>
        
        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />
        
        <View style={styles.metricItem}>
          <View style={[styles.metricIconWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <Feather name="target" size={18} color={colors.success} />
          </View>
          <View>
            <Text style={[styles.metricTitle, { color: colors.text }]}>Focused</Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>Mind</Text>
          </View>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricItem}>
          <View style={[styles.metricIconWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <MaterialCommunityIcons name="steering" size={18} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.metricTitle, { color: colors.text }]}>Smooth</Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>Control</Text>
          </View>
        </View>
      </View>

      {/* Car & Floating Stats */}
      <View style={styles.carSection}>
        {/* High resolution front car image */}
        <Image 
          source={require('../../assets/images/final_home.png')} 
          style={styles.carImage} 
          resizeMode="contain"
        />

        {/* HUD Overlay Lines - Rendered on top of the car image for visibility */}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Speed -> Left Headlight */}
          <Line x1={110} y1={48} x2={(width - 40) * 0.35} y2={120} stroke={colors.accent} strokeWidth="1.5" strokeDasharray="4 4" />
          <Circle cx={(width - 40) * 0.35} cy={120} r="7" fill={colors.accent} opacity={0.3} />
          <Circle cx={(width - 40) * 0.35} cy={120} r="3" fill={colors.accent} />

          {/* Duration -> Right Headlight */}
          <Line x1={width - 40 - 110} y1={48} x2={(width - 40) * 0.65} y2={120} stroke={colors.accent} strokeWidth="1.5" strokeDasharray="4 4" />
          <Circle cx={(width - 40) * 0.65} cy={120} r="7" fill={colors.accent} opacity={0.3} />
          <Circle cx={(width - 40) * 0.65} cy={120} r="3" fill={colors.accent} />

          {/* Distance -> Left Wheel Fender */}
          <Line x1={105} y1={180} x2={(width - 40) * 0.34} y2={160} stroke={colors.success} strokeWidth="1.5" strokeDasharray="4 4" />
          <Circle cx={(width - 40) * 0.34} cy={160} r="7" fill={colors.success} opacity={0.3} />
          <Circle cx={(width - 40) * 0.34} cy={160} r="3" fill={colors.success} />

          {/* Phone Usage -> Right Wheel Fender */}
          <Line x1={width - 40 - 105} y1={180} x2={(width - 40) * 0.66} y2={160} stroke={colors.success} strokeWidth="1.5" strokeDasharray="4 4" />
          <Circle cx={(width - 40) * 0.66} cy={160} r="7" fill={colors.success} opacity={0.3} />
          <Circle cx={(width - 40) * 0.66} cy={160} r="3" fill={colors.success} />
        </Svg>
        
        {/* Floating Widgets */}
        <View style={[styles.floatingWidget, styles.widgetTopLeft, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="speedometer" size={20} color={colors.accent} />
          <View style={styles.widgetTextContainer}>
            <Text style={[styles.widgetLabel, { color: colors.textMuted }]}>SPEED</Text>
            <Text style={[styles.widgetValue, { color: colors.text }]}>{displaySpeed}</Text>
            <Text style={[styles.widgetUnit, { color: colors.textMuted }]}>km/h</Text>
          </View>
        </View>

        <View style={[styles.floatingWidget, styles.widgetTopRight, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="clock" size={20} color={colors.accent} />
          <View style={styles.widgetTextContainer}>
            <Text style={[styles.widgetLabel, { color: colors.textMuted }]}>DURATION</Text>
            <Text style={[styles.widgetValue, { color: colors.text }]}>{displayDuration}</Text>
            <Text style={[styles.widgetUnit, { color: colors.textMuted }]}>hr</Text>
          </View>
        </View>

        <View style={[styles.floatingWidget, styles.widgetBottomLeft, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="road-variant" size={20} color={colors.success} />
          <View style={styles.widgetTextContainer}>
            <Text style={[styles.widgetLabel, { color: colors.textMuted }]}>DISTANCE</Text>
            <Text style={[styles.widgetValue, { color: colors.text }]}>{displayDistance}</Text>
            <Text style={[styles.widgetUnit, { color: colors.textMuted }]}>km</Text>
          </View>
        </View>

        <View style={[styles.floatingWidget, styles.widgetBottomRight, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="phone-call" size={20} color={colors.success} />
          <View style={styles.widgetTextContainer}>
            <Text style={[styles.widgetLabel, { color: colors.textMuted }]}>PHONE USAGE</Text>
            <Text style={[styles.widgetValue, { color: colors.text }]}>{displayPhoneUsage}</Text>
            <Text style={[styles.widgetUnit, { color: colors.textMuted }]}>min</Text>
          </View>
        </View>
      </View>

      {/* Start Drive Button */}
      <TouchableOpacity style={styles.startButtonContainer} onPress={handleStartDrive}>
        <LinearGradient
          colors={[colors.accent, colors.success]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startButtonGradient}
        >
          <View style={[styles.powerIconWrap, { backgroundColor: colors.powerBg }]}>
            <Feather name={currentSession ? "eye" : "power"} size={22} color={colors.accent} />
          </View>
          <View style={styles.startButtonTextWrap}>
            <Text style={[styles.startButtonTitle, { color: isDark ? '#050B14' : '#ffffff' }]}>
              {currentSession ? 'VIEW ACTIVE DRIVE' : 'START DRIVE'}
            </Text>
            <Text style={[styles.startButtonSub, { color: isDark ? '#050B14' : '#ffffff', opacity: 0.8 }]}>
              {currentSession ? 'A drive is in progress. Tap to monitor.' : 'Track your drive & improve your score'}
            </Text>
          </View>
          <View style={[styles.arrowIconWrap, { backgroundColor: colors.powerBg }]}>
            <Feather name="chevron-right" size={22} color={colors.success} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
          <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      marginBottom: 90, // Ends exactly above the floating tab bar
    },
    contentContainer: {
      padding: 20,
      paddingTop: 50,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    greetingContainer: {
      marginLeft: 15,
    },
    greetingSub: {
      color: colors.textMuted,
      fontSize: 12,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 2,
    },
    greetingName: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 'bold',
    },
    waveEmoji: {
      fontSize: 20,
      marginLeft: 5,
    },
    tagline: {
      color: colors.success,
      fontSize: 12,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bellIcon: {
      marginRight: 10,
    },
    notificationDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#f59e0b',
    },
    profilePicContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: colors.accent,
      padding: 2,
    },
    profilePic: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    gaugeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 280,
      marginVertical: 10,
    },
    svgGauge: {
      position: 'absolute',
    },
    scoreInner: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    shieldIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5,
    },
    scoreNumber: {
      color: colors.text,
      fontSize: 72,
      fontWeight: 'bold',
      lineHeight: 80,
    },
    scoreLabel: {
      color: colors.textMuted,
      fontSize: 14,
      letterSpacing: 2,
      marginBottom: 10,
    },
    excellentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(8, 145, 178, 0.15)',
      paddingHorizontal: 15,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(8, 145, 178, 0.3)',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
      marginRight: 6,
    },
    excellentText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '500',
    },
    metricsRowUnified: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 25,
    },
    metricDivider: {
      width: 1,
      height: '60%',
      backgroundColor: colors.border,
    },
    tickLabel: {
      position: 'absolute',
      color: colors.textSlate,
      fontSize: 10,
      fontWeight: 'bold',
    },
    menuBtn: {
      marginRight: 10,
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metricIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    metricTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    metricSub: {
      color: colors.textMuted,
      fontSize: 10,
    },
    carSection: {
      height: 250,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 30,
    },
    carImage: {
      width: width * 0.7,
      height: 180,
      opacity: 0.9,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
    },
    floatingWidget: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 110,
    },
    widgetTopLeft: { top: 10, left: 0 },
    widgetTopRight: { top: 10, right: 0 },
    widgetBottomLeft: { bottom: 20, left: 0 },
    widgetBottomRight: { bottom: 20, right: 0 },
    widgetTextContainer: {
      marginLeft: 8,
    },
    widgetLabel: {
      color: colors.textSlate,
      fontSize: 8,
      letterSpacing: 1,
    },
    widgetValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    widgetUnit: {
      color: colors.textMuted,
      fontSize: 10,
    },
    startButtonContainer: {
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: colors.success,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 5,
    },
    startButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 15,
    },
    powerIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.powerBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startButtonTextWrap: {
      alignItems: 'center',
    },
    startButtonTitle: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 1,
    },
    startButtonSub: {
      fontSize: 10,
    },
    arrowIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.powerBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomSpacer: {
      height: 40,
    }
  });
}
