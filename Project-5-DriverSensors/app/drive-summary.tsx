import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDriveStore, DriveSession } from '../src/store/driveStore';
import { driveRepository } from '../src/database/repositories/driveRepository';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

// Mock Summary Session matching the screenshot exactly
const MOCK_SUMMARY: DriveSession = {
  id: 'demo-summary-id',
  startTime: Date.now() - 42 * 60000 - 16000, // 42m 16s ago
  endTime: Date.now(),
  duration: 2536, // 42 mins 16 secs
  score: 92,
  rating: 'EXCELLENT',
  distance: 28600, // 28.6 km
  events: [
    { id: 'e1', type: 'HARSH_BRAKE', timestamp: Date.now() - 30 * 60000, severity: 'HIGH', confidence: 90, speed: 68 },
    { id: 'e2', type: 'HARSH_BRAKE', timestamp: Date.now() - 15 * 60000, severity: 'HIGH', confidence: 90, speed: 72 },
    { id: 'e3', type: 'SHARP_TURN', timestamp: Date.now() - 25 * 60000, severity: 'MEDIUM', confidence: 85, speed: 42 },
    { id: 'e4', type: 'PHONE_USAGE', timestamp: Date.now() - 20 * 60000, severity: 'MEDIUM', confidence: 88, duration: 8 },
    { id: 'e5', type: 'AGGRESSIVE_STEERING', timestamp: Date.now() - 22 * 60000, severity: 'LOW', confidence: 80, speed: 45 },
    { id: 'e6', type: 'AGGRESSIVE_STEERING', timestamp: Date.now() - 12 * 60000, severity: 'LOW', confidence: 80, speed: 47 },
  ],
  route: [],
};

// Mock speed profile data points for chart
const MOCK_SPEED_POINTS = [20, 55, 72, 65, 68, 78, 62, 82, 70, 92, 75, 72, 68, 60, 52, 45, 20];

export default function DriveSummaryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Find drive in history or active store
  const allDrives = driveRepository.getAllDrives();
  const historicalSession = allDrives.find(d => d.id === id);
  const currentSession = useDriveStore((state) => state.currentSession);
  
  // Choose session to display: URL ID, then Active Session, then last history, then mockup demo
  const displaySession = historicalSession 
    ? historicalSession 
    : (currentSession && currentSession.id === id 
        ? currentSession 
        : (allDrives.length > 0 ? allDrives[0] : MOCK_SUMMARY));

  const score = displaySession.score;
  const rating = displaySession.rating;
  const durationSec = displaySession.duration;
  
  // Format Duration
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

  // Event Counts
  const events = displaySession.events || [];
  const harshBrakeCount = events.filter(e => e.type === 'HARSH_BRAKE').length;
  const harshAccelCount = events.filter(e => e.type === 'HARSH_ACCELERATION').length;
  const sharpTurnCount = events.filter(e => e.type === 'SHARP_TURN').length;
  const phoneUsageCount = events.filter(e => e.type === 'PHONE_USAGE').length;
  const steeringCount = events.filter(e => e.type === 'AGGRESSIVE_STEERING' || e.type === 'EXCESSIVE_MOVEMENT').length;
  const overspeedCount = events.filter(e => e.type === 'OVERSPEEDING').length;

  // Derive scores
  const safeDrivingScore = Math.max(0, 100 - overspeedCount * 6 - phoneUsageCount * 5);
  const brakingHealth = Math.max(0, 100 - harshBrakeCount * 6);
  const accelerationHealth = Math.max(0, 100 - harshAccelCount * 6);
  const corneringHealth = Math.max(0, 100 - sharpTurnCount * 6);
  const smoothnessScore = Math.round((brakingHealth + accelerationHealth + corneringHealth) / 3);
  const focusScore = Math.max(0, 100 - phoneUsageCount * 9);
  const efficiencyScore = Math.max(0, 100 - harshAccelCount * 6 - overspeedCount * 5);

  // Calories estimation (simple formula)
  const caloriesBurned = Math.round(durationSec * 0.1) || 256;

  // Average speed
  let avgSpeed = 52;
  if (displaySession.route && displaySession.route.length > 0) {
    avgSpeed = Math.round((displaySession.route.reduce((acc, p) => acc + p.speed, 0) / displaySession.route.length) * 3.6);
  }

  // Formatting date/time
  const driveDateStr = dayjs(displaySession.startTime).format('MMMM DD, YYYY');
  const driveTimeStr = dayjs(displaySession.startTime).format('hh:mm A');

  // SVG Gauge calculations
  const strokeDashoffset = 353 - (353 * score) / 100;

  // Chart plotting
  const speedHistory = displaySession.route && displaySession.route.length > 5
    ? displaySession.route.map(p => Math.round(p.speed * 3.6))
    : MOCK_SPEED_POINTS;

  const getChartPath = (points: number[], width: number, height: number) => {
    if (points.length === 0) return '';
    const maxVal = 120;
    const padding = 10;
    const chartHeight = height - padding * 2;
    
    return points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - padding - (val / maxVal) * chartHeight;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  // Timeline Markers for chart
  const startMarkTime = dayjs(displaySession.startTime).format('hh:mm A');
  const midMarkTime = dayjs(displaySession.startTime + durationSec * 500).format('hh:mm A');
  const endMarkTime = dayjs(displaySession.startTime + durationSec * 1000).format('hh:mm A');

  const ratingColors = {
    color: score >= 90 ? '#22c55e' : score >= 70 ? '#38bdf8' : score >= 50 ? '#f59e0b' : '#ef4444',
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/history')} style={styles.iconCircle}>
          <Feather name="arrow-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Drive Summary</Text>
          <Text style={styles.headerSubtitle}>
            {driveDateStr}  <Text style={styles.timeDot}>•</Text>  <Text style={styles.timeText}>{driveTimeStr}</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.iconCircle}>
          <Feather name="share-2" size={20} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Score Dial & Sub-metrics Row */}
        <View style={styles.scoreOverviewCard}>
          {/* Main Dial (Left) */}
          <View style={styles.mainDialWrap}>
            <Text style={styles.dialLabel}>FINAL SCORE</Text>
            <View style={styles.dialContainer}>
              <Svg width={150} height={150} viewBox="0 0 160 160">
                <Defs>
                  <SvgLinearGradient id="summaryDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#06b6d4" />
                    <Stop offset="50%" stopColor="#22c55e" />
                    <Stop offset="100%" stopColor="#84cc16" />
                  </SvgLinearGradient>
                </Defs>
                <Circle 
                  cx="80" cy="80" r="60" 
                  stroke="#121e33" strokeWidth="6" fill="none" 
                  strokeDasharray="282" strokeDashoffset="0" 
                  transform="rotate(135 80 80)"
                  strokeLinecap="round"
                />
                <Circle 
                  cx="80" cy="80" r="60" 
                  stroke="url(#summaryDialGrad)" strokeWidth="8" fill="none" 
                  strokeDasharray="282" 
                  strokeDashoffset={282 - (282 * score) / 100} 
                  transform="rotate(135 80 80)"
                  strokeLinecap="round"
                />
              </Svg>
              <View style={styles.dialScoreInner}>
                <Feather name="shield" size={20} color="#06b6d4" style={{ marginBottom: 2 }} />
                <Text style={styles.dialScoreVal}>{score}</Text>
                <Text style={[styles.dialRatingText, { color: ratingColors.color }]}>{rating}</Text>
              </View>
            </View>
            <Text style={styles.overviewStatement}>
              {score >= 90 
                ? 'Great drive! You stayed safe and in control.' 
                : score >= 70 
                  ? 'Good drive. Maintain a steady pace to improve.' 
                  : 'Be careful. Avoid sudden actions while driving.'}
            </Text>
          </View>

          {/* Right Col: Category Scores */}
          <View style={styles.categoryScoresWrap}>
            {/* Safe Driving */}
            <View style={styles.categoryScoreItem}>
              <Feather name="shield" size={18} color="#06b6d4" />
              <View style={styles.catTextContainer}>
                <Text style={styles.catLabel}>Safe Driving</Text>
                <Text style={styles.catValue}>{safeDrivingScore}<Text style={styles.catUnit}>/100</Text></Text>
              </View>
            </View>
            
            {/* Smoothness */}
            <View style={styles.categoryScoreItem}>
              <MaterialCommunityIcons name="wave" size={18} color="#22c55e" />
              <View style={styles.catTextContainer}>
                <Text style={styles.catLabel}>Smoothness</Text>
                <Text style={styles.catValue}>{smoothnessScore}<Text style={styles.catUnit}>/100</Text></Text>
              </View>
            </View>

            {/* Focus */}
            <View style={styles.categoryScoreItem}>
              <MaterialCommunityIcons name="target" size={18} color="#06b6d4" />
              <View style={styles.catTextContainer}>
                <Text style={styles.catLabel}>Focus</Text>
                <Text style={styles.catValue}>{focusScore}<Text style={styles.catUnit}>/100</Text></Text>
              </View>
            </View>

            {/* Efficiency */}
            <View style={styles.categoryScoreItem}>
              <Feather name="compass" size={18} color="#eab308" />
              <View style={styles.catTextContainer}>
                <Text style={styles.catLabel}>Efficiency</Text>
                <Text style={styles.catValue}>{efficiencyScore}<Text style={styles.catUnit}>/100</Text></Text>
              </View>
            </View>
          </View>
        </View>

        {/* Core Stats Bar */}
        <View style={styles.coreStatsRow}>
          {/* Distance */}
          <View style={styles.statBox}>
            <FontAwesome5 name="road" size={16} color="#06b6d4" style={styles.statIcon} />
            <Text style={styles.statLabelText}>DISTANCE</Text>
            <Text style={styles.statValText}>{(displaySession.distance / 1000).toFixed(1)}</Text>
            <Text style={styles.statUnitText}>km</Text>
          </View>
          
          {/* Duration */}
          <View style={styles.statBox}>
            <Feather name="clock" size={16} color="#22c55e" style={styles.statIcon} />
            <Text style={styles.statLabelText}>DURATION</Text>
            <Text style={styles.statValText}>{formatDuration(durationSec)}</Text>
            <Text style={styles.statUnitText}>hr</Text>
          </View>

          {/* Avg. Speed */}
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="speedometer" size={18} color="#06b6d4" style={styles.statIcon} />
            <Text style={styles.statLabelText}>AVERAGE SPEED</Text>
            <Text style={styles.statValText}>{avgSpeed}</Text>
            <Text style={styles.statUnitText}>km/h</Text>
          </View>

          {/* Calories */}
          <View style={styles.statBox}>
            <Feather name="zap" size={16} color="#eab308" style={styles.statIcon} />
            <Text style={styles.statLabelText}>CALORIES</Text>
            <Text style={styles.statValText}>{caloriesBurned}</Text>
            <Text style={styles.statUnitText}>kcal</Text>
          </View>
        </View>

        {/* Charts & Dial Row (2 Panels) */}
        <View style={styles.chartsPanelRow}>
          {/* Left panel: Speed Over Time Chart */}
          <View style={styles.chartPanel}>
            <Text style={styles.panelTitle}>SPEED OVER TIME</Text>
            <Text style={styles.panelUnitLabel}>km/h</Text>
            
            <View style={styles.speedLineChartContainer}>
              <Svg width={width * 0.44} height={90} viewBox={`0 0 ${width * 0.44} 90`}>
                {/* Horizontal Guide lines */}
                <Line x1="0" y1="20" x2={width * 0.44} y2="20" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                <Line x1="0" y1="50" x2={width * 0.44} y2="50" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                <Line x1="0" y1="80" x2={width * 0.44} y2="80" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                
                {/* Chart Axes */}
                <Text style={styles.yTick} x="5" y="23">120</Text>
                <Text style={styles.yTick} x="5" y="53">80</Text>
                <Text style={styles.yTick} x="5" y="83">0</Text>
                
                {/* Draw speed curve path */}
                <Path 
                  d={getChartPath(speedHistory, width * 0.44, 90)} 
                  stroke="#00e5ff" 
                  strokeWidth="2" 
                  fill="none" 
                />
              </Svg>
            </View>

            {/* Time labels below chart */}
            <View style={styles.chartTimeLabels}>
              <Text style={styles.xTick}>{startMarkTime}</Text>
              <Text style={styles.xTick}>{endMarkTime}</Text>
            </View>
          </View>

          {/* Right panel: Smoothness Radial Dial */}
          <View style={styles.chartPanel}>
            <Text style={styles.panelTitle}>DRIVE SMOOTHNESS</Text>
            
            <View style={styles.smoothnessGaugeWrap}>
              <Svg width={80} height={80} viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="38" stroke="#121e33" strokeWidth="6" fill="none" />
                <Circle 
                  cx="50" cy="50" r="38" 
                  stroke="#22c55e" 
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray="239"
                  strokeDashoffset={239 - (239 * smoothnessScore) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </Svg>
              <View style={styles.smoothnessInnerVal}>
                <Text style={styles.smoothnessPercentage}>{smoothnessScore}%</Text>
                <Text style={styles.smoothnessTextLabel}>Smooth</Text>
              </View>
            </View>
            <Text style={styles.smoothSubtext}>Smooth acceleration and braking</Text>
          </View>
        </View>

        {/* Highlights & Events Columns */}
        <View style={styles.lowerInfoRow}>
          {/* Highlights Column (Left) */}
          <View style={styles.columnPanel}>
            <Text style={styles.panelHeaderTitle}>DRIVE HIGHLIGHTS</Text>
            
            {/* Highlight Item 1 */}
            <View style={styles.highlightItem}>
              <View style={styles.highlightCheckOuter}>
                <Feather name={harshBrakeCount === 0 ? "check" : "alert-circle"} size={14} color={harshBrakeCount === 0 ? "#22c55e" : "#eab308"} />
              </View>
              <View style={styles.highlightTextCol}>
                <Text style={styles.highlightText}>
                  {harshBrakeCount === 0 ? 'No harsh braking' : `${harshBrakeCount} sudden stop(s)`}
                </Text>
                <Text style={styles.highlightSub}>
                  {harshBrakeCount === 0 ? 'Great job!' : 'Try to brake gradually.'}
                </Text>
              </View>
              <Feather name="chevron-right" size={14} color="#334155" />
            </View>

            {/* Highlight Item 2 */}
            <View style={styles.highlightItem}>
              <View style={styles.highlightCheckOuter}>
                <Feather name={overspeedCount === 0 ? "check" : "alert-circle"} size={14} color={overspeedCount === 0 ? "#22c55e" : "#eab308"} />
              </View>
              <View style={styles.highlightTextCol}>
                <Text style={styles.highlightText}>
                  {overspeedCount === 0 ? 'Maintained steady speed' : 'Overspeeding logged'}
                </Text>
                <Text style={styles.highlightSub}>
                  {overspeedCount === 0 ? 'Well done!' : 'Keep within safe speed limit.'}
                </Text>
              </View>
              <Feather name="chevron-right" size={14} color="#334155" />
            </View>

            {/* Highlight Item 3 */}
            <View style={styles.highlightItem}>
              <View style={styles.highlightCheckOuter}>
                <Feather name={sharpTurnCount === 0 ? "check" : "alert-circle"} size={14} color={sharpTurnCount === 0 ? "#22c55e" : "#eab308"} />
              </View>
              <View style={styles.highlightTextCol}>
                <Text style={styles.highlightText}>
                  {sharpTurnCount === 0 ? 'Smooth cornering' : `${sharpTurnCount} sharp turn(s)`}
                </Text>
                <Text style={styles.highlightSub}>
                  {sharpTurnCount === 0 ? 'Excellent steering control.' : 'Take turns more smoothly.'}
                </Text>
              </View>
              <Feather name="chevron-right" size={14} color="#334155" />
            </View>
          </View>

          {/* Events Summary Column (Right) */}
          <View style={styles.columnPanel}>
            <Text style={styles.panelHeaderTitle}>EVENTS SUMMARY</Text>
            
            {/* Brakes */}
            <View style={styles.eventRowItem}>
              <View style={styles.eventLabelOuter}>
                <Feather name="alert-triangle" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={styles.eventLabelText}>Harsh Brakes</Text>
              </View>
              <Text style={styles.eventCountVal}>{harshBrakeCount}</Text>
            </View>

            {/* Turns */}
            <View style={styles.eventRowItem}>
              <View style={styles.eventLabelOuter}>
                <MaterialCommunityIcons name="arrow-u-left-top" size={16} color="#eab308" style={{ marginRight: 6 }} />
                <Text style={styles.eventLabelText}>Sharp Turns</Text>
              </View>
              <Text style={styles.eventCountVal}>{sharpTurnCount}</Text>
            </View>

            {/* Phone */}
            <View style={styles.eventRowItem}>
              <View style={styles.eventLabelOuter}>
                <Feather name="phone" size={13} color="#06b6d4" style={{ marginRight: 6 }} />
                <Text style={styles.eventLabelText}>Phone Usage</Text>
              </View>
              <Text style={styles.eventCountVal}>{phoneUsageCount}</Text>
            </View>

            {/* Steering */}
            <View style={styles.eventRowItem}>
              <View style={styles.eventLabelOuter}>
                <MaterialCommunityIcons name="steering" size={16} color="#22c55e" style={{ marginRight: 6 }} />
                <Text style={styles.eventLabelText}>Aggressive Steering</Text>
              </View>
              <Text style={styles.eventCountVal}>{steeringCount}</Text>
            </View>
          </View>
        </View>

        {/* Tip Box (Navigates to AI Coach details) */}
        <TouchableOpacity 
          style={styles.tipCard}
          onPress={() => router.push({
            pathname: '/ai-coach',
            params: { id: displaySession.id }
          })}
        >
          <View style={styles.tipIconWrap}>
            <Feather name="shield" size={24} color="#06b6d4" />
            <Feather name="check" size={10} color="#06b6d4" style={{ position: 'absolute', top: 7 }} />
          </View>
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipTitle}>Keep it up!</Text>
            <Text style={styles.tipDesc}>Consistency is the key to safer roads. Tap to view AI Coach suggestions.</Text>
          </View>
        </TouchableOpacity>


        {/* VIEW ROUTE REPLAY */}
        <TouchableOpacity 
          style={styles.routeReplayBtn} 
          onPress={() => router.push({
            pathname: '/route-replay',
            params: { id: displaySession.id }
          })}
        >
          <Text style={styles.routeReplayBtnText}>VIEW ROUTE REPLAY</Text>
          <View style={styles.routeReplayBtnArrow}>
            <Feather name="chevron-right" size={18} color="#050B14" />
          </View>
        </TouchableOpacity>

        {/* VIEW DETAILED ANALYSIS */}
        <TouchableOpacity 
          style={styles.detailedAnalysisBtn} 
          onPress={() => router.push({
            pathname: '/drive-details',
            params: { id: displaySession.id }
          })}
        >
          <Text style={styles.analysisBtnText}>VIEW DETAILED ANALYSIS</Text>
          <View style={styles.analysisBtnArrow}>
            <Feather name="chevron-right" size={18} color="#050B14" />
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  timeDot: {
    color: '#06b6d4',
  },
  timeText: {
    color: '#94a3b8',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSpacer: {
    height: 60,
  },

  // Score Overview Card
  scoreOverviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8, 15, 26, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#121e33',
    padding: 20,
    marginBottom: 20,
  },
  mainDialWrap: {
    width: '52%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  dialContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialScoreInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 30,
  },
  dialScoreVal: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
  },
  dialRatingText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  overviewStatement: {
    color: '#94a3b8',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 13,
  },
  categoryScoresWrap: {
    width: '44%',
    justifyContent: 'center',
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#121e33',
  },
  categoryScoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  catTextContainer: {
    marginLeft: 8,
  },
  catLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '600',
  },
  catValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  catUnit: {
    color: '#64748b',
    fontSize: 9,
  },

  // Core Stats Bar
  coreStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '23.5%',
    backgroundColor: '#080f1a',
    borderWidth: 1,
    borderColor: '#121e33',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabelText: {
    color: '#64748b',
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statUnitText: {
    color: '#64748b',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },

  // Charts Row
  chartsPanelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartPanel: {
    width: '48.5%',
    backgroundColor: '#080f1a',
    borderWidth: 1,
    borderColor: '#121e33',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
  },
  panelTitle: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  panelUnitLabel: {
    color: '#334155',
    fontSize: 7,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  speedLineChartContainer: {
    height: 90,
    justifyContent: 'center',
  },
  yTick: {
    fill: '#334155',
    fontSize: 8,
    fontWeight: '500',
  },
  chartTimeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  xTick: {
    color: '#64748b',
    fontSize: 8,
  },
  smoothnessGaugeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  smoothnessInnerVal: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smoothnessPercentage: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smoothnessTextLabel: {
    color: '#22c55e',
    fontSize: 8,
    fontWeight: 'bold',
  },
  smoothSubtext: {
    color: '#64748b',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 10,
  },

  // Lower Columns
  lowerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  columnPanel: {
    width: '48.5%',
    backgroundColor: '#080f1a',
    borderWidth: 1,
    borderColor: '#121e33',
    borderRadius: 20,
    padding: 12,
  },
  panelHeaderTitle: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 0.8,
    borderBottomColor: '#121e33',
    paddingBottom: 8,
  },
  highlightCheckOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  highlightTextCol: {
    flex: 1,
  },
  highlightText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  highlightSub: {
    color: '#64748b',
    fontSize: 8,
  },
  eventRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 0.8,
    borderBottomColor: '#121e33',
    paddingBottom: 8,
  },
  eventLabelOuter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLabelText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  eventCountVal: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Tip box
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tipDesc: {
    color: '#94a3b8',
    fontSize: 10,
  },

  // Detailed Analysis Button
  detailedAnalysisBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#a3e635',
    backgroundColor: '#050B14',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#a3e635',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  analysisBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  analysisBtnArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a3e635',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Route Replay Button
  routeReplayBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#00f5ff',
    backgroundColor: '#050B14',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  routeReplayBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  routeReplayBtnArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00f5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
