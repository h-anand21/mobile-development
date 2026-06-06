import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Line, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDriveStore } from '../../src/store/driveStore';
import { useSensorStore } from '../../src/store/sensorStore';

const { width } = Dimensions.get('window');

// Main Component
export default function HomeScreen() {
  const router = useRouter();
  const startDrive = useDriveStore((state) => state.startDrive);
  const setTracking = useSensorStore((state) => state.setTracking);
  const currentSession = useDriveStore((state) => state.currentSession);

  // Dynamic calculations (fallback to mockup values if no session is active)
  const score = currentSession ? currentSession.score : 92;
  const rating = currentSession ? currentSession.rating : 'Excellent';
  
  const currentSpeedMs = currentSession && currentSession.route.length > 0 
    ? currentSession.route[currentSession.route.length - 1].speed 
    : 0;
  const displaySpeed = currentSession ? Math.round(currentSpeedMs * 3.6) : 68;
  
  const displayDistance = currentSession ? (currentSession.distance / 1000).toFixed(1) : '28.6';
  
  const elapsedSeconds = currentSession 
    ? Math.floor((Date.now() - currentSession.startTime) / 1000) 
    : 2536; // 42 minutes 16 seconds
  const formatHHMM = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  const displayDuration = formatHHMM(elapsedSeconds);
  
  const phoneUsageCount = currentSession 
    ? currentSession.events.filter(e => e.type === 'PHONE_USAGE').length 
    : 0;
  const displayPhoneUsage = currentSession ? phoneUsageCount : 0;

  // Arc stroke offset for 270 degree gauge dial
  const strokeDashoffset = 377 - (377 * score) / 100;

  const ratingColors = {
    color: score >= 90 ? '#00f5ff' : score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444',
    bg: score >= 90 ? 'rgba(0, 245, 255, 0.12)' : score >= 70 ? 'rgba(34, 197, 94, 0.12)' : score >= 50 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
    border: score >= 90 ? 'rgba(0, 245, 255, 0.25)' : score >= 70 ? 'rgba(34, 197, 94, 0.25)' : score >= 50 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)',
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuBtn}>
            <Feather name="menu" size={28} color="#00f5ff" />
          </TouchableOpacity>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingSub}>Good Evening,</Text>
            <View style={styles.nameRow}>
              <Text style={styles.greetingName}>Himanshu</Text>
              <Text style={styles.waveEmoji}>👋</Text>
            </View>
            <Text style={styles.tagline}>Drive safe. Live safe.</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellIcon}>
            <Feather name="bell" size={24} color="#F8FAFC" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <View style={styles.profilePicContainer}>
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
              <Stop offset="0%" stopColor="#00f5ff" stopOpacity="1" />
              <Stop offset="50%" stopColor="#22c55e" stopOpacity="1" />
              <Stop offset="100%" stopColor="#eab308" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          {/* Background Track */}
          <Circle cx="100" cy="100" r="80" stroke="#1e293b" strokeWidth="8" fill="none" strokeDasharray="377" strokeDashoffset="0" strokeLinecap="round" />
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
        </Svg>
        
        <View style={styles.scoreInner}>
          <View style={styles.shieldIconContainer}>
            <Feather name="shield" size={28} color="#00f5ff" />
            <Feather name="check" size={12} color="#00f5ff" style={{position: 'absolute', top: 9}} />
          </View>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreLabel}>SAFE SCORE</Text>
          <View style={[styles.excellentBadge, { backgroundColor: ratingColors.bg, borderColor: ratingColors.border }]}>
            <View style={[styles.dot, { backgroundColor: ratingColors.color }]} />
            <Text style={[styles.excellentText, { color: ratingColors.color }]}>{rating}</Text>
          </View>
        </View>

        {/* Symmetrical Gauge Ticks */}
        <Text style={[styles.tickLabel, { left: 55, bottom: 45 }]}>0</Text>
        <Text style={[styles.tickLabel, { left: 40, top: 120 }]}>20</Text>
        <Text style={[styles.tickLabel, { left: 80, top: 45 }]}>40</Text>
        <Text style={[styles.tickLabel, { right: 80, top: 45 }]}>60</Text>
        <Text style={[styles.tickLabel, { right: 40, top: 120 }]}>80</Text>
        <Text style={[styles.tickLabel, { right: 45, bottom: 45 }]}>100</Text>
      </View>

      {/* Safety Metrics Row */}
      <View style={styles.metricsRowUnified}>
        <View style={styles.metricItem}>
          <View style={[styles.metricIconWrap, { borderColor: '#00f5ff' }]}>
            <Feather name="shield" size={18} color="#00f5ff" />
          </View>
          <View>
            <Text style={[styles.metricTitle, { color: '#00f5ff' }]}>Safe</Text>
            <Text style={styles.metricSub}>Driving</Text>
          </View>
        </View>
        
        <View style={styles.metricDivider} />
        
        <View style={styles.metricItem}>
          <View style={[styles.metricIconWrap, { borderColor: '#22c55e' }]}>
            <Feather name="target" size={18} color="#22c55e" />
          </View>
          <View>
            <Text style={[styles.metricTitle, { color: '#22c55e' }]}>Focused</Text>
            <Text style={styles.metricSub}>Mind</Text>
          </View>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={[styles.metricIconWrap, { borderColor: '#00f5ff' }]}>
            <MaterialCommunityIcons name="steering" size={18} color="#00f5ff" />
          </View>
          <View>
            <Text style={[styles.metricTitle, { color: '#00f5ff' }]}>Smooth</Text>
            <Text style={styles.metricSub}>Control</Text>
          </View>
        </View>
      </View>

      {/* Car & Floating Stats */}
      <View style={styles.carSection}>
        {/* HUD Overlay Lines */}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          {/* Speed -> Left Headlight */}
          <Line x1={105} y1={30} x2={(width - 40) * 0.38} y2={120} stroke="#00f5ff" strokeWidth="1" strokeDasharray="3 3" />
          <Circle cx={(width - 40) * 0.38} cy={120} r="3.5" fill="#00f5ff" />

          {/* Duration -> Right Headlight */}
          <Line x1={width - 40 - 105} y1={30} x2={(width - 40) * 0.62} y2={120} stroke="#00f5ff" strokeWidth="1" strokeDasharray="3 3" />
          <Circle cx={(width - 40) * 0.62} cy={120} r="3.5" fill="#00f5ff" />

          {/* Distance -> Left Wheel */}
          <Line x1={105} y1={205} x2={(width - 40) * 0.32} y2={175} stroke="#84cc16" strokeWidth="1" strokeDasharray="3 3" />
          <Circle cx={(width - 40) * 0.32} cy={175} r="3.5" fill="#84cc16" />

          {/* Phone Usage -> Right Wheel */}
          <Line x1={width - 40 - 105} y1={205} x2={(width - 40) * 0.68} y2={175} stroke="#84cc16" strokeWidth="1" strokeDasharray="3 3" />
          <Circle cx={(width - 40) * 0.68} cy={175} r="3.5" fill="#84cc16" />
        </Svg>

        {/* High resolution front car image */}
        <Image 
          source={require('../../assets/images/car_dashboard.png')} 
          style={styles.carImage} 
          resizeMode="contain"
        />
        
        {/* Floating Widgets */}
        <View style={[styles.floatingWidget, styles.widgetTopLeft]}>
          <MaterialCommunityIcons name="speedometer" size={20} color="#00f5ff" />
          <View style={styles.widgetTextContainer}>
            <Text style={styles.widgetLabel}>SPEED</Text>
            <Text style={styles.widgetValue}>{displaySpeed}</Text>
            <Text style={styles.widgetUnit}>km/h</Text>
          </View>
        </View>

        <View style={[styles.floatingWidget, styles.widgetTopRight]}>
          <Feather name="clock" size={20} color="#00f5ff" />
          <View style={styles.widgetTextContainer}>
            <Text style={styles.widgetLabel}>DURATION</Text>
            <Text style={styles.widgetValue}>{displayDuration}</Text>
            <Text style={styles.widgetUnit}>hr</Text>
          </View>
        </View>

        <View style={[styles.floatingWidget, styles.widgetBottomLeft]}>
          <MaterialCommunityIcons name="road-variant" size={20} color="#84cc16" />
          <View style={styles.widgetTextContainer}>
            <Text style={styles.widgetLabel}>DISTANCE</Text>
            <Text style={styles.widgetValue}>{displayDistance}</Text>
            <Text style={styles.widgetUnit}>km</Text>
          </View>
        </View>

        <View style={[styles.floatingWidget, styles.widgetBottomRight]}>
          <Feather name="phone-call" size={20} color="#84cc16" />
          <View style={styles.widgetTextContainer}>
            <Text style={styles.widgetLabel}>PHONE USAGE</Text>
            <Text style={styles.widgetValue}>{displayPhoneUsage}</Text>
            <Text style={styles.widgetUnit}>min</Text>
          </View>
        </View>
      </View>

      {/* Start Drive Button */}
      <TouchableOpacity style={styles.startButtonContainer} onPress={handleStartDrive}>
        <LinearGradient
          colors={['#00f5ff', '#84cc16']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startButtonGradient}
        >
          <View style={styles.powerIconWrap}>
            <Feather name={currentSession ? "eye" : "power"} size={22} color="#00f5ff" />
          </View>
          <View style={styles.startButtonTextWrap}>
            <Text style={styles.startButtonTitle}>
              {currentSession ? 'VIEW ACTIVE DRIVE' : 'START DRIVE'}
            </Text>
            <Text style={styles.startButtonSub}>
              {currentSession ? 'A drive is in progress. Tap to monitor.' : 'Track your drive & improve your score'}
            </Text>
          </View>
          <View style={styles.arrowIconWrap}>
            <Feather name="chevron-right" size={22} color="#84cc16" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14', // Very dark blue/black
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
    color: '#94a3b8',
    fontSize: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  greetingName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  waveEmoji: {
    fontSize: 20,
    marginLeft: 5,
  },
  tagline: {
    color: '#22c55e',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellIcon: {
    marginRight: 15,
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
    borderColor: '#0ea5e9',
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
    color: '#ffffff',
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 80,
  },
  scoreLabel: {
    color: '#e2e8f0',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 10,
  },
  excellentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06b6d4',
    marginRight: 6,
  },
  excellentText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsRowUnified: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 22, 38, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#122540',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 25,
  },
  metricDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#122540',
  },
  tickLabel: {
    position: 'absolute',
    color: '#94a3b8',
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricSub: {
    color: '#94a3b8',
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
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  floatingWidget: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
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
    color: '#94a3b8',
    fontSize: 8,
    letterSpacing: 1,
  },
  widgetValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  widgetUnit: {
    color: '#94a3b8',
    fontSize: 10,
  },
  startButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
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
    backgroundColor: '#050B14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonTextWrap: {
    alignItems: 'center',
  },
  startButtonTitle: {
    color: '#050B14',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  startButtonSub: {
    color: '#050B14',
    fontSize: 10,
    opacity: 0.8,
  },
  arrowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#050B14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 40,
  }
});
