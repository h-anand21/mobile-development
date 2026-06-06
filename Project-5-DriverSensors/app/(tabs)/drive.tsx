import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Line, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDriveStore, DriveSession } from '../../src/store/driveStore';
import { useSensorStore } from '../../src/store/sensorStore';
import { generateAIFeedback } from '../../src/services/ai/aiCoach';

const { width, height } = Dimensions.get('window');

export default function DriveScreen() {
  const router = useRouter();
  
  // Store actions & state
  const currentSession = useDriveStore((state) => state.currentSession);
  const startDrive = useDriveStore((state) => state.startDrive);
  const endDrive = useDriveStore((state) => state.endDrive);
  const setTracking = useSensorStore((state) => state.setTracking);
  
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


  // If no active drive session, render start screen
  if (!currentSession) {
    return (
      <View style={styles.inactiveContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.iconCircle}>
            <Feather name="chevron-down" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitleInactive}>SafeDrive Engine</Text>
          <TouchableOpacity style={styles.iconCircle}>
            <Feather name="settings" size={24} color="#F8FAFC" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.inactiveContent}>
          {/* Neon Steering Wheel Emblem */}
          <View style={styles.inactiveEmblemContainer}>
            <LinearGradient
              colors={['rgba(6, 182, 212, 0.1)', 'rgba(6, 182, 212, 0)']}
              style={styles.emblemGlowCircle}
            >
              <MaterialCommunityIcons name="steering" size={120} color="#06b6d4" style={styles.glowingEmblem} />
            </LinearGradient>
          </View>

          <Text style={styles.inactiveTitle}>Ready for your drive?</Text>
          <Text style={styles.inactiveDescription}>
            Start SafeDrive tracking to log your route, speed limits, and analyze your driving behavior. Get real-time AI safety coaching and maintain your safe score!
          </Text>

          {/* Feature highlights */}
          <View style={styles.featureGrid}>
            <View style={styles.featureItemCard}>
              <Feather name="activity" size={22} color="#0ea5e9" />
              <Text style={styles.featureTitleText}>Telemetry Tracking</Text>
              <Text style={styles.featureSubText}>Accelerometer & Gyro sensors monitor road conditions</Text>
            </View>
            <View style={styles.featureItemCard}>
              <Feather name="navigation" size={22} color="#84cc16" />
              <Text style={styles.featureTitleText}>GPS Analytics</Text>
              <Text style={styles.featureSubText}>Track speed limits, distance, and trip mapping</Text>
            </View>
          </View>

          {/* Start Drive CTA */}
          <TouchableOpacity style={styles.hugeStartButton} onPress={handleStart}>
            <LinearGradient
              colors={['#06b6d4', '#0ea5e9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.hugeStartGradient}
            >
              <Feather name="play" size={24} color="#050B14" style={{ marginRight: 10 }} />
              <Text style={styles.hugeStartText}>START NEW TRIP</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
  const tripProgressPercent = Math.min(100, Math.round((currentSession.distance / targetDistanceMeters) * 100)) || 62;

  // Arc stroke offset for 270 degree gauge dial
  // Circumference of R=80 is 502.6. 270 deg is 377.
  const strokeDashoffset = 377 - (377 * score) / 100;

  // Score Rating style colors
  const ratingColors = {
    color: score >= 90 ? '#22c55e' : score >= 70 ? '#38bdf8' : score >= 50 ? '#f59e0b' : '#ef4444',
    bg: score >= 90 ? 'rgba(34, 197, 94, 0.15)' : score >= 70 ? 'rgba(56, 189, 248, 0.15)' : score >= 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
    border: score >= 90 ? 'rgba(34, 197, 94, 0.3)' : score >= 70 ? 'rgba(56, 189, 248, 0.3)' : score >= 50 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.iconCircle}>
          <Feather name="chevron-down" size={24} color="#F8FAFC" />
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
          <Feather name="settings" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Score Gauge */}
        <View style={styles.gaugeContainer}>
          <Svg width={300} height={300} viewBox="0 0 200 200" style={styles.svgGauge}>
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
          </Svg>
          
          <View style={styles.scoreInner}>
            <View style={styles.shieldIconContainer}>
              <Feather name="shield" size={28} color="#06b6d4" />
              <Feather name="check" size={12} color="#06b6d4" style={{ position: 'absolute', top: 9 }} />
            </View>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreLabel}>CURRENT SCORE</Text>
            <View style={[styles.ratingBadge, { backgroundColor: ratingColors.bg, borderColor: ratingColors.border }]}>
              <View style={[styles.dot, { backgroundColor: ratingColors.color }]} />
              <Text style={[styles.ratingText, { color: ratingColors.color }]}>{rating}</Text>
            </View>
            <Text style={styles.gaugeSubtext}>Keep driving safe!</Text>
          </View>

          {/* Gauge Tick Markers */}
          <Text style={[styles.tickLabel, { left: 55, bottom: 45 }]}>0</Text>
          <Text style={[styles.tickLabel, { left: 40, top: 120 }]}>20</Text>
          <Text style={[styles.tickLabel, { left: 80, top: 45 }]}>40</Text>
          <Text style={[styles.tickLabel, { right: 80, top: 45 }]}>60</Text>
          <Text style={[styles.tickLabel, { right: 40, top: 120 }]}>80</Text>
          <Text style={[styles.tickLabel, { right: 45, bottom: 45 }]}>100</Text>
        </View>

        {/* Perspective Car Grid Area */}
        <View style={styles.carGridSection}>
          <Svg width={width} height={120} viewBox={`0 0 ${width} 120`} style={styles.perspectiveRoadGrid}>
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
            source={{ uri: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=600&auto=format&fit=crop' }} 
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
            <Text style={styles.speedStatVal}>{averageSpeedKmH || 52} km/h</Text>
          </View>

          {/* Current Speed (Large Capsule) */}
          <View style={styles.currentSpeedCapsule}>
            <Text style={styles.currentSpeedLabel}>CURRENT SPEED</Text>
            <Text style={styles.currentSpeedVal}>{currentSpeedKmH || 68}</Text>
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

const styles = StyleSheet.create({
  // General
  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSpacer: {
    height: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#050B14',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Inactive Drive screen
  inactiveContainer: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  headerTitleInactive: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inactiveContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  inactiveEmblemContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  emblemGlowCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  glowingEmblem: {
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  inactiveTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  inactiveDescription: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 30,
  },
  featureGrid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  featureItemCard: {
    width: '48%',
    backgroundColor: '#0c1626',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  featureTitleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  featureSubText: {
    color: '#64748b',
    fontSize: 10,
    lineHeight: 14,
  },
  hugeStartButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  hugeStartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  hugeStartText: {
    color: '#050B14',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
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
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Score Dial
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    marginVertical: 15,
    position: 'relative',
  },
  svgGauge: {
    position: 'absolute',
  },
  scoreInner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  shieldIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  scoreNumber: {
    color: '#ffffff',
    fontSize: 66,
    fontWeight: 'bold',
    lineHeight: 74,
  },
  scoreLabel: {
    color: '#94a3b8',
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
    color: '#64748b',
    fontSize: 11,
    marginTop: 6,
  },
  tickLabel: {
    position: 'absolute',
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Perspective Car Grid
  carGridSection: {
    height: 160,
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
    height: 120,
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
    marginBottom: 20,
  },
  speedStatCardSide: {
    width: width * 0.26,
    backgroundColor: '#0c1626',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 12,
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
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 2,
  },
  speedStatVal: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentSpeedCapsule: {
    width: width * 0.36,
    backgroundColor: '#0f172a',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: '#06b6d4',
    paddingVertical: 15,
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
    color: '#ffffff',
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
    marginBottom: 25,
  },
  telemetryCard: {
    width: '48%',
    backgroundColor: '#080f1a',
    borderWidth: 1,
    borderColor: '#121e33',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  telemetryIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  telemetryLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textAlign: 'right',
    marginBottom: 8,
  },
  telemetryValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  telemetryUnit: {
    color: '#64748b',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },

  // Insights Section
  insightsSection: {
    backgroundColor: 'rgba(12, 22, 38, 0.4)',
    borderWidth: 1,
    borderColor: '#121e33',
    borderRadius: 20,
    padding: 16,
    marginBottom: 25,
  },
  insightsSectionTitle: {
    color: '#64748b',
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
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  insightPercent: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // End Drive Button & Waves
  endDriveSection: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  endDriveSvg: {
    position: 'absolute',
  },
  stopButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    borderRadius: 27,
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
    borderColor: '#1e293b',
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
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScoreCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalScoreLabel: {
    color: '#94a3b8',
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
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#1e293b',
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
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalStatValText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalStatDivider: {
    width: 1,
    backgroundColor: '#1e293b',
    alignSelf: 'stretch',
  },
  modalSectionTitle: {
    color: '#94a3b8',
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
    backgroundColor: '#080f1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#121e33',
    paddingVertical: 10,
    alignItems: 'center',
  },
  eventCountNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  eventCountLabel: {
    color: '#64748b',
    fontSize: 9,
  },
  feedbackContainer: {
    maxHeight: 110,
    backgroundColor: 'rgba(8, 15, 26, 0.6)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#121e33',
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
    color: '#cbd5e1',
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
    color: '#050B14',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
