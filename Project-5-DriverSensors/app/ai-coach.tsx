import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDriveStore, DriveSession } from '../src/store/driveStore';
import { driveRepository } from '../src/database/repositories/driveRepository';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

// Mock Session for Demo Fallback
const MOCK_COACH_SESSION: DriveSession = {
  id: 'demo-coach-id',
  startTime: Date.now() - 42 * 60000,
  endTime: Date.now(),
  duration: 2520,
  score: 92,
  rating: 'EXCELLENT',
  distance: 28600,
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

export default function AICoachScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Find historical session, or active session, or use latest drive, or demo mock
  const allDrives = driveRepository.getAllDrives();
  const historicalSession = allDrives.find(d => d.id === id);
  const currentSession = useDriveStore((state) => state.currentSession);
  
  const displaySession = historicalSession 
    ? historicalSession 
    : (currentSession && currentSession.id === id 
        ? currentSession 
        : (allDrives.length > 0 ? allDrives[0] : MOCK_COACH_SESSION));

  const score = displaySession.score;
  const rating = displaySession.rating;

  // Event counts
  const events = displaySession.events || [];
  const harshBrakeCount = events.filter(e => e.type === 'HARSH_BRAKE').length;
  const harshAccelCount = events.filter(e => e.type === 'HARSH_ACCELERATION').length;
  const sharpTurnCount = events.filter(e => e.type === 'SHARP_TURN').length;
  const phoneUsageCount = events.filter(e => e.type === 'PHONE_USAGE').length;
  const steeringCount = events.filter(e => e.type === 'AGGRESSIVE_STEERING' || e.type === 'EXCESSIVE_MOVEMENT').length;
  const overspeedCount = events.filter(e => e.type === 'OVERSPEEDING').length;

  // Compute sub-metrics
  const safetyScore = Math.max(0, 100 - overspeedCount * 6 - phoneUsageCount * 5);
  const brakingHealth = Math.max(0, 100 - harshBrakeCount * 6);
  const accelerationHealth = Math.max(0, 100 - harshAccelCount * 6);
  const corneringHealth = Math.max(0, 100 - sharpTurnCount * 6);
  const smoothnessScore = Math.round((brakingHealth + accelerationHealth + corneringHealth) / 3);
  const controlScore = Math.max(0, 100 - steeringCount * 5 - sharpTurnCount * 4);
  const focusScore = Math.max(0, 100 - phoneUsageCount * 7);

  // Risk Scores mapping (High, Medium, Low)
  const getRiskLevel = (count: number) => {
    if (count >= 2) return { text: 'High', color: '#ef4444', percent: '75%' };
    if (count === 1) return { text: 'Medium', color: '#eab308', percent: '50%' };
    return { text: 'Low', color: '#22c55e', percent: '25%' };
  };

  const risks = {
    braking: getRiskLevel(harshBrakeCount),
    speeding: getRiskLevel(overspeedCount),
    distraction: getRiskLevel(phoneUsageCount),
    steering: getRiskLevel(steeringCount),
    cornering: getRiskLevel(sharpTurnCount),
  };

  // Overall Risk Level
  // Find highest risk level
  const hasHighRisk = Object.values(risks).some(r => r.text === 'High');
  const hasMediumRisk = Object.values(risks).some(r => r.text === 'Medium');
  
  let overallRiskText = 'Low';
  let overallRiskColor = '#22c55e';
  
  if (hasHighRisk) {
    overallRiskText = 'High';
    overallRiskColor = '#ef4444';
  } else if (hasMediumRisk) {
    overallRiskText = 'Medium';
    overallRiskColor = '#eab308';
  }

  // Format rating nicely
  const formatRating = (str: string) => {
    if (!str) return 'Excellent';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AI Coach</Text>
          <Text style={styles.headerSubtitle}>Your personal driving coach</Text>
        </View>

        {/* Custom robot head avatar matching mockup */}
        <TouchableOpacity style={styles.robotHeaderIcon}>
          <Svg width={28} height={28} viewBox="0 0 100 100">
            <Defs>
              <SvgLinearGradient id="botGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#00f5ff" />
                <Stop offset="100%" stopColor="#0ea5e9" />
              </SvgLinearGradient>
            </Defs>
            {/* Antennas */}
            <Line x1="50" y1="25" x2="50" y2="15" stroke="url(#botGrad)" strokeWidth="4" />
            <Circle cx="50" cy="12" r="4" fill="url(#botGrad)" />
            {/* Ears */}
            <Rect x="20" y="42" width="6" height="16" rx="3" fill="url(#botGrad)" />
            <Rect x="74" y="42" width="6" height="16" rx="3" fill="url(#botGrad)" />
            {/* Head */}
            <Rect x="26" y="25" width="48" height="48" rx="12" fill="none" stroke="url(#botGrad)" strokeWidth="5" />
            {/* Eyes */}
            <Circle cx="40" cy="44" r="5" fill="url(#botGrad)" />
            <Circle cx="60" cy="44" r="5" fill="url(#botGrad)" />
            {/* Mouth */}
            <Path d="M42,58 Q50,64 58,58" stroke="url(#botGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Overall Driving Feedback Panel */}
        <View style={styles.feedbackSection}>
          <View style={styles.sectionHeaderRow}>
            <Feather name="activity" size={16} color="#00f5ff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Overall Driving Feedback</Text>
          </View>

          <View style={styles.feedbackRow}>
            {/* Left circular dial */}
            <View style={styles.dialContainer}>
              <Svg width={130} height={130} viewBox="0 0 160 160">
                <Defs>
                  <SvgLinearGradient id="coachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#00f5ff" />
                    <Stop offset="50%" stopColor="#22c55e" />
                    <Stop offset="100%" stopColor="#a3e635" />
                  </SvgLinearGradient>
                </Defs>
                {/* Background track */}
                <Circle 
                  cx="80" cy="80" r="62" 
                  stroke="#122540" strokeWidth="8" fill="none" 
                  strokeDasharray="292 389" 
                  transform="rotate(135 80 80)"
                  strokeLinecap="round"
                />
                {/* Active track */}
                <Circle 
                  cx="80" cy="80" r="62" 
                  stroke="url(#coachGrad)" strokeWidth="8" fill="none" 
                  strokeDasharray="292 389" 
                  strokeDashoffset={292 - (292 * score) / 100} 
                  transform="rotate(135 80 80)"
                  strokeLinecap="round"
                />
              </Svg>
              
              <View style={styles.dialScoreInner}>
                <MaterialCommunityIcons name="shield-check-outline" size={20} color="#22c55e" style={{ marginBottom: 2 }} />
                <Text style={styles.dialScoreVal}>{score}</Text>
                <Text style={styles.dialStatement}>Great Drive!</Text>
                
                <View style={[styles.capsuleBadge, { borderColor: 'rgba(34, 197, 94, 0.3)', backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <View style={[styles.badgeDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={[styles.badgeText, { color: '#22c55e' }]}>{formatRating(rating)}</Text>
                </View>
              </View>
            </View>

            {/* Right text & stats */}
            <View style={styles.feedbackTextCol}>
              <Text style={styles.feedbackGreeting}>Great job, Himanshu!</Text>
              <Text style={styles.feedbackGreetingSub}>
                You drove safely and responsibly. Keep maintaining your good habits.
              </Text>

              {/* 2x2 Mini metrics grid with borders & background matching mockup */}
              <View style={styles.metricsGridBox}>
                <View style={[styles.metricsGridRow, styles.metricsGridRowBorder]}>
                  {/* Smoothness */}
                  <View style={[styles.metricGridCell, styles.metricGridCellBorder]}>
                    <Feather name="activity" size={15} color="#00f5ff" style={styles.metricGridIcon} />
                    <View>
                      <Text style={styles.miniLabel}>Smoothness</Text>
                      <Text style={[styles.miniValue, { color: '#00f5ff' }]}>{smoothnessScore}%</Text>
                    </View>
                  </View>

                  {/* Safety */}
                  <View style={styles.metricGridCell}>
                    <MaterialCommunityIcons name="shield-check-outline" size={15} color="#22c55e" style={styles.metricGridIcon} />
                    <View>
                      <Text style={styles.miniLabel}>Safety</Text>
                      <Text style={[styles.miniValue, { color: '#22c55e' }]}>{safetyScore}%</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.metricsGridRow}>
                  {/* Control */}
                  <View style={[styles.metricGridCell, styles.metricGridCellBorder]}>
                    <MaterialCommunityIcons name="steering" size={15} color="#00f5ff" style={styles.metricGridIcon} />
                    <View>
                      <Text style={styles.miniLabel}>Control</Text>
                      <Text style={[styles.miniValue, { color: '#00f5ff' }]}>{controlScore}%</Text>
                    </View>
                  </View>

                  {/* Focus */}
                  <View style={styles.metricGridCell}>
                    <MaterialCommunityIcons name="target" size={15} color="#a3e635" style={styles.metricGridIcon} />
                    <View>
                      <Text style={styles.miniLabel}>Focus</Text>
                      <Text style={[styles.miniValue, { color: '#a3e635' }]}>{focusScore}%</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Improvement Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.sectionHeaderRowMain}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="lightbulb" size={18} color="#00f5ff" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Improvement Tips</Text>
            </View>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>View All</Text>
              <Feather name="chevron-right" size={14} color="#00f5ff" />
            </TouchableOpacity>
          </View>

          {/* Tip Card 1 (Harsh Braking) */}
          <View style={[styles.tipCardItem, { borderLeftColor: '#00f5ff' }]}>
            <View style={[styles.tipIconCircle, { backgroundColor: 'rgba(0, 245, 255, 0.05)', borderColor: 'rgba(0, 245, 255, 0.2)' }]}>
              <MaterialCommunityIcons name="disc" size={20} color="#00f5ff" />
            </View>
            <View style={styles.tipTextCol}>
              <Text style={styles.tipCardTitle}>Avoid Harsh Braking</Text>
              <Text style={styles.tipCardDesc}>
                {harshBrakeCount > 0 
                  ? `You used harsh brakes ${harshBrakeCount} times.` 
                  : 'No harsh brakes recorded.'} Try to brake smoothly and in advance.
              </Text>
            </View>
            <View style={styles.tipCardRight}>
              <View style={[styles.impactBadge, { borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={[styles.impactText, { color: '#ef4444' }]}>High Impact</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#475569" style={{ marginLeft: 8 }} />
            </View>
          </View>

          {/* Tip Card 2 (Smooth Steering) */}
          <View style={[styles.tipCardItem, { borderLeftColor: '#a3e635' }]}>
            <View style={[styles.tipIconCircle, { backgroundColor: 'rgba(163, 230, 53, 0.05)', borderColor: 'rgba(163, 230, 53, 0.2)' }]}>
              <MaterialCommunityIcons name="steering" size={20} color="#a3e635" />
            </View>
            <View style={styles.tipTextCol}>
              <Text style={styles.tipCardTitle}>Smooth Steering</Text>
              <Text style={styles.tipCardDesc}>
                Reduce aggressive steering on sharp turns for better control.
              </Text>
            </View>
            <View style={styles.tipCardRight}>
              <View style={[styles.impactBadge, { borderColor: 'rgba(234, 179, 8, 0.3)', backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                <Text style={[styles.impactText, { color: '#eab308' }]}>Medium Impact</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#475569" style={{ marginLeft: 8 }} />
            </View>
          </View>

          {/* Tip Card 3 (Avoid Phone Usage) */}
          <View style={[styles.tipCardItem, { borderLeftColor: '#00f5ff' }]}>
            <View style={[styles.tipIconCircle, { backgroundColor: 'rgba(0, 245, 255, 0.05)', borderColor: 'rgba(0, 245, 255, 0.2)' }]}>
              <Feather name="phone" size={18} color="#00f5ff" />
            </View>
            <View style={styles.tipTextCol}>
              <Text style={styles.tipCardTitle}>Avoid Phone Usage</Text>
              <Text style={styles.tipCardDesc}>
                {phoneUsageCount > 0 
                  ? `You used phone ${phoneUsageCount} time${phoneUsageCount > 1 ? 's' : ''} during the drive.` 
                  : 'No phone usage detected.'} Stay focused for a safer drive.
              </Text>
            </View>
            <View style={styles.tipCardRight}>
              <View style={[styles.impactBadge, { borderColor: 'rgba(234, 179, 8, 0.3)', backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                <Text style={[styles.impactText, { color: '#eab308' }]}>Medium Impact</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#475569" style={{ marginLeft: 8 }} />
            </View>
          </View>
        </View>

        {/* Risk Analysis Section */}
        <View style={styles.riskSection}>
          <View style={styles.sectionHeaderRowMain}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color="#22c55e" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Risk Analysis</Text>
            </View>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>View Details</Text>
              <Feather name="chevron-right" size={14} color="#00f5ff" />
            </TouchableOpacity>
          </View>

          <View style={styles.riskRow}>
            {/* Dynamic Segmented Risk dial gauge */}
            <View style={styles.riskGaugeWrap}>
              <Svg width={110} height={110} viewBox="0 0 100 100">
                {/* Green Segment (left bottom to left top) */}
                <Circle 
                  cx="50" cy="50" r="38" 
                  stroke="#22c55e" strokeWidth="8" fill="none"
                  strokeDasharray="59.7 238.7"
                  transform="rotate(135 50 50)"
                  strokeLinecap="round"
                  opacity={overallRiskText === 'Low' ? 1.0 : 0.25}
                />
                {/* Yellow/Orange Segment (top left to top right) */}
                <Circle 
                  cx="50" cy="50" r="38" 
                  stroke="#eab308" strokeWidth="8" fill="none"
                  strokeDasharray="59.7 238.7"
                  transform="rotate(225 50 50)"
                  strokeLinecap="round"
                  opacity={overallRiskText === 'Medium' ? 1.0 : 0.25}
                />
                {/* Red Segment (top right to bottom right) */}
                <Circle 
                  cx="50" cy="50" r="38" 
                  stroke="#ef4444" strokeWidth="8" fill="none"
                  strokeDasharray="59.7 238.7"
                  transform="rotate(-45 50 50)"
                  strokeLinecap="round"
                  opacity={overallRiskText === 'High' ? 1.0 : 0.25}
                />
                {/* Blue Segment (bottom right to bottom left) */}
                <Circle 
                  cx="50" cy="50" r="38" 
                  stroke="#00f5ff" strokeWidth="8" fill="none"
                  strokeDasharray="59.7 238.7"
                  transform="rotate(45 50 50)"
                  strokeLinecap="round"
                  opacity={0.25}
                />
              </Svg>
              <View style={styles.riskInnerVal}>
                <Text style={[styles.riskLabelNum, { color: overallRiskColor }]}>{overallRiskText}</Text>
                <Text style={styles.riskLabelSub}>Overall Risk</Text>
              </View>
            </View>

            {/* Risk bars list with mockup metrics & icons */}
            <View style={styles.riskBarsCol}>
              {/* Braking */}
              <View style={styles.riskBarItem}>
                <View style={styles.riskBarHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="alert-triangle" size={12} color="#ef4444" style={{ marginRight: 6 }} />
                    <Text style={styles.riskBarLabel}>Braking</Text>
                  </View>
                  <Text style={[styles.riskBarValText, { color: risks.braking.color }]}>{risks.braking.text}</Text>
                </View>
                <View style={styles.riskBarTrack}>
                  <View style={[styles.riskBarFill, { width: risks.braking.percent, backgroundColor: risks.braking.color }]} />
                </View>
              </View>

              {/* Speeding */}
              <View style={styles.riskBarItem}>
                <View style={styles.riskBarHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="speedometer" size={13} color="#eab308" style={{ marginRight: 6 }} />
                    <Text style={styles.riskBarLabel}>Speeding</Text>
                  </View>
                  <Text style={[styles.riskBarValText, { color: risks.speeding.color }]}>{risks.speeding.text}</Text>
                </View>
                <View style={styles.riskBarTrack}>
                  <View style={[styles.riskBarFill, { width: risks.speeding.percent, backgroundColor: risks.speeding.color }]} />
                </View>
              </View>

              {/* Distraction */}
              <View style={styles.riskBarItem}>
                <View style={styles.riskBarHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="phone" size={12} color="#eab308" style={{ marginRight: 6 }} />
                    <Text style={styles.riskBarLabel}>Distraction</Text>
                  </View>
                  <Text style={[styles.riskBarValText, { color: risks.distraction.color }]}>{risks.distraction.text}</Text>
                </View>
                <View style={styles.riskBarTrack}>
                  <View style={[styles.riskBarFill, { width: risks.distraction.percent, backgroundColor: risks.distraction.color }]} />
                </View>
              </View>

              {/* Steering */}
              <View style={styles.riskBarItem}>
                <View style={styles.riskBarHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="steering" size={13} color="#22c55e" style={{ marginRight: 6 }} />
                    <Text style={styles.riskBarLabel}>Steering</Text>
                  </View>
                  <Text style={[styles.riskBarValText, { color: risks.steering.color }]}>{risks.steering.text}</Text>
                </View>
                <View style={styles.riskBarTrack}>
                  <View style={[styles.riskBarFill, { width: risks.steering.percent, backgroundColor: risks.steering.color }]} />
                </View>
              </View>

              {/* Cornering */}
              <View style={styles.riskBarItem}>
                <View style={styles.riskBarHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="car-curve" size={13} color="#22c55e" style={{ marginRight: 6 }} />
                    <Text style={styles.riskBarLabel}>Cornering</Text>
                  </View>
                  <Text style={[styles.riskBarValText, { color: risks.cornering.color }]}>{risks.cornering.text}</Text>
                </View>
                <View style={styles.riskBarTrack}>
                  <View style={[styles.riskBarFill, { width: risks.cornering.percent, backgroundColor: risks.cornering.color }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Keep it up Trophy Banner with gorgeous custom SVG trophy matching mockup */}
        <View style={styles.bannerTrophyCard}>
          <View style={styles.bannerLeftWrap}>
            <View style={styles.shieldCheckBadge}>
              <Feather name="shield" size={24} color="#00f5ff" />
              <Feather name="star" size={10} color="#00f5ff" style={{ position: 'absolute', top: 7 }} />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Keep it up!</Text>
              <Text style={styles.bannerDesc}>
                You're a responsible driver. Small improvements can make you even better.
              </Text>
            </View>
          </View>

          {/* Glowing Vector Trophy SVG */}
          <View style={styles.trophyIllustrationContainer}>
            <Svg width={70} height={70} viewBox="0 0 100 100">
              <Defs>
                <SvgLinearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
                  <Stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.9" />
                  <Stop offset="100%" stopColor="#0284c7" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              {/* Sparkles / Stars */}
              <Path d="M15,20 L17,23 L20,24 L17,25 L15,28 L13,25 L10,24 L13,23 Z" fill="#38bdf8" opacity="0.8" />
              <Path d="M85,30 L86,32 L89,33 L86,34 L85,36 L84,34 L81,33 L84,32 Z" fill="#00f5ff" opacity="0.9" />
              <Path d="M75,65 L76,67 L78,68 L76,69 L75,71 L74,69 L72,68 L74,67 Z" fill="#38bdf8" opacity="0.7" />
              
              {/* Glow behind */}
              <Circle cx="50" cy="45" r="25" fill="#00f5ff" opacity="0.12" />
              
              {/* Trophy Cup Handles */}
              <Path d="M34,34 C24,34 24,48 34,48" stroke="url(#trophyGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
              <Path d="M66,34 C76,34 76,48 66,48" stroke="url(#trophyGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
              
              {/* Main Bowl */}
              <Path d="M34,30 L66,30 C66,48 58,58 50,58 C42,58 34,48 34,30 Z" fill="url(#trophyGrad)" />
              {/* Stem */}
              <Path d="M47,58 L53,58 L55,70 L45,70 Z" fill="url(#trophyGrad)" />
              {/* Base */}
              <Path d="M36,70 L64,70 C64,70 66,74 64,76 L36,76 C34,74 36,70 36,70 Z" fill="url(#trophyGrad)" />
              <Ellipse cx="50" cy="76" rx="16" ry="3.5" fill="#0ea5e9" opacity="0.8" />
            </Svg>
          </View>
        </View>

        {/* View Progress Button with Lime/Green LinearGradient */}
        <TouchableOpacity 
          style={styles.progressBtnContainer}
          onPress={() => router.push('/(tabs)/dashboard')}
        >
          <LinearGradient
            colors={['#22c55e', '#a3e635']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressBtn}
          >
            <Feather name="trending-up" size={18} color="#050B14" style={{ marginRight: 10 }} />
            <Text style={styles.progressBtnText}>View Progress Over Time</Text>
            <Feather name="chevron-right" size={18} color="#050B14" style={{ marginLeft: 'auto' }} />
          </LinearGradient>
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
    fontSize: 11,
    marginTop: 2,
  },
  robotHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#00f5ff',
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSpacer: {
    height: 60,
  },

  // Feedback Section
  feedbackSection: {
    backgroundColor: 'rgba(8, 15, 26, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#122540',
    padding: 16,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 130,
  },
  dialScoreInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialScoreVal: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 40,
  },
  dialStatement: {
    color: '#22c55e',
    fontSize: 9,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  capsuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  feedbackTextCol: {
    width: '56%',
  },
  feedbackGreeting: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  feedbackGreetingSub: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 10,
  },

  // 2x2 Metrics Grid Box
  metricsGridBox: {
    backgroundColor: '#070f1e',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  metricsGridRow: {
    flexDirection: 'row',
  },
  metricsGridRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#122540',
  },
  metricGridCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  metricGridCellBorder: {
    borderRightWidth: 1,
    borderRightColor: '#122540',
  },
  metricGridIcon: {
    marginRight: 8,
  },
  miniLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '500',
  },
  miniValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 1,
  },

  // Tips section
  tipsSection: {
    marginBottom: 20,
  },
  sectionHeaderRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#00f5ff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },
  tipCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
  },
  tipIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  tipTextCol: {
    flex: 1,
    marginRight: 6,
  },
  tipCardTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  tipCardDesc: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 14,
  },
  tipCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  impactText: {
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Risk Section
  riskSection: {
    backgroundColor: 'rgba(8, 15, 26, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#122540',
    padding: 16,
    marginBottom: 20,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskGaugeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32%',
  },
  riskInnerVal: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskLabelNum: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  riskLabelSub: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
  riskBarsCol: {
    width: '64%',
  },
  riskBarItem: {
    marginBottom: 6,
  },
  riskBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  riskBarLabel: {
    color: '#94a3b8',
    fontSize: 9,
  },
  riskBarValText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  riskBarTrack: {
    height: 4,
    backgroundColor: '#121e33',
    borderRadius: 2,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Trophy Banner
  bannerTrophyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 245, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  shieldCheckBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 245, 255, 0.3)',
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bannerDesc: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 14,
  },
  trophyIllustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
  },

  // View Progress Button
  progressBtnContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#a3e635',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  progressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  progressBtnText: {
    color: '#050B14',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
