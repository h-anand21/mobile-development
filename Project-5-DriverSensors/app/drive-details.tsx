import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon, Text as SvgText, Rect, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDriveStore, DriveSession } from '../src/store/driveStore';
import { driveRepository } from '../src/database/repositories/driveRepository';
import dayjs from 'dayjs';
import { useAppTheme } from '../src/ui/theme';

const { width } = Dimensions.get('window');

export default function DriveDetailsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors, isDark);
  const { id, activeTab } = useLocalSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'coach' | 'events' | 'route' | 'analytics'>(
    (activeTab as any) || 'overview'
  );

  // Load completed drive session
  const allDrives = driveRepository.getAllDrives();
  const historicalSession = allDrives.find(d => d.id === id);
  const currentSession = useDriveStore((state) => state.currentSession);
  
  const displaySession = historicalSession 
    ? historicalSession 
    : (currentSession && currentSession.id === id 
        ? currentSession 
        : (allDrives.length > 0 ? allDrives[0] : null));

  // Extract Session Metrics (Fallback to mockup values)
  const score = displaySession ? displaySession.score : 92;
  const rating = displaySession ? displaySession.rating : 'EXCELLENT';
  const distanceKm = displaySession ? (displaySession.distance / 1000).toFixed(1) : '28.6';
  const durationText = displaySession ? formatHHMMSS(displaySession.duration) : '00:42:16';
  
  const driveDateStr = displaySession ? dayjs(displaySession.startTime).format('MMMM DD, YYYY') : 'May 20, 2025';
  const driveTimeStr = displaySession ? dayjs(displaySession.startTime).format('hh:mm A') : '08:15 PM';

  const startLocLabel = displaySession && displaySession.route && displaySession.route.length > 0 && displaySession.route[0].latitude
    ? `Start: Lat ${displaySession.route[0].latitude.toFixed(4)}, Lon ${displaySession.route[0].longitude.toFixed(4)}`
    : 'Connaught Place, Delhi';

  const endLocLabel = displaySession && displaySession.route && displaySession.route.length > 0 && displaySession.route[displaySession.route.length - 1].latitude
    ? `End: Lat ${displaySession.route[displaySession.route.length - 1].latitude.toFixed(4)}, Lon ${displaySession.route[displaySession.route.length - 1].longitude.toFixed(4)}`
    : 'MG Road, Delhi';

  const events = displaySession?.events || [];
  const harshBrakeCount = events.length > 0 ? events.filter(e => e.type === 'HARSH_BRAKE').length : 2;
  const sharpTurnCount = events.length > 0 ? events.filter(e => e.type === 'SHARP_TURN').length : 2;
  const phoneUsageCount = events.length > 0 ? events.filter(e => e.type === 'PHONE_USAGE').length : 1;
  const steeringCount = events.length > 0 ? events.filter(e => e.type === 'AGGRESSIVE_STEERING' || e.type === 'EXCESSIVE_MOVEMENT').length : 1;
  const totalEventsCount = harshBrakeCount + sharpTurnCount + phoneUsageCount + steeringCount;

  // AI Coach specific metrics calculations
  const harshAccelCount = events.length > 0 ? events.filter(e => e.type === 'HARSH_ACCELERATION').length : 0;
  const overspeedCount = events.length > 0 ? events.filter(e => e.type === 'OVERSPEEDING').length : 0;

  const safetyScore = Math.max(0, 100 - overspeedCount * 6 - phoneUsageCount * 5);
  const brakingHealth = Math.max(0, 100 - harshBrakeCount * 6);
  const accelerationHealth = Math.max(0, 100 - harshAccelCount * 6);
  const corneringHealth = Math.max(0, 100 - sharpTurnCount * 6);
  const smoothnessScore = Math.round((brakingHealth + accelerationHealth + corneringHealth) / 3);
  const controlScore = Math.max(0, 100 - steeringCount * 5 - sharpTurnCount * 4);
  const focusScore = Math.max(0, 100 - phoneUsageCount * 7);

  // Risk levels mapping
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

  // Format Seconds to HH:MM:SS
  function formatHHMMSS(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Format Rating Capitalized
  const formatRating = (str: string) => {
    if (!str) return 'Excellent';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Math for Radar Pentagon corners
  const cx = 80;
  const cy = 80;
  const r = 52;
  const getPentagonPoints = (scale: number) => {
    const angles = [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5];
    return angles.map((angle) => {
      const x = cx + r * scale * Math.cos(angle);
      const y = cy + r * scale * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const getRadarPoints = () => {
    // Scores: Smoothness: 91%, Safety: 94%, Control: 90%, Focus: 93%, Efficiency: 88%
    const scales = [0.91, 0.94, 0.90, 0.93, 0.88];
    const angles = [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5];
    return angles.map((angle, idx) => {
      const x = cx + r * scales[idx] * Math.cos(angle);
      const y = cy + r * scales[idx] * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Drive Details</Text>
          <Text style={styles.headerSubtitle}>{driveDateStr}  •  {driveTimeStr}</Text>
        </View>

        <TouchableOpacity style={styles.iconCircle}>
          <Feather name="share" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. Top Metric Panel (Circular gauge + stats grid) */}
        <View style={styles.metricsBox}>
          {/* Safe Score Gauge (Column 1) */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <Text style={styles.metricLabel}>SAFE SCORE</Text>
            <View style={styles.scoreGaugeContainer}>
              <Svg width={54} height={54} viewBox="0 0 80 80">
                <Defs>
                  <SvgLinearGradient id="detailsDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={colors.accent} />
                    <Stop offset="100%" stopColor={colors.success} />
                  </SvgLinearGradient>
                </Defs>
                <Circle cx="40" cy="40" r="30" stroke={colors.border} strokeWidth="4" fill="none" />
                <Circle 
                  cx="40" cy="40" r="30" 
                  stroke="url(#detailsDialGrad)" strokeWidth="5" fill="none" 
                  strokeDasharray="188" 
                  strokeDashoffset={188 - (188 * score) / 100} 
                  transform="rotate(-90 40 40)"
                  strokeLinecap="round"
                />
              </Svg>
              <View style={styles.scoreGaugeInner}>
                <Text style={styles.scoreGaugeVal}>{score}</Text>
                <Text style={styles.scoreGaugeLabel}>{formatRating(rating)}</Text>
              </View>
              <View style={styles.checkBadgeOverlay}>
                <MaterialCommunityIcons name="shield-check" size={12} color={colors.success} />
              </View>
            </View>
          </View>

          {/* Distance (Column 2) */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <Text style={styles.metricLabel}>DISTANCE</Text>
            <View style={styles.iconStatCol}>
              <FontAwesome5 name="road" size={18} color={colors.accent} style={{ marginBottom: 4 }} />
              <Text style={styles.statVal}>{distanceKm}</Text>
              <Text style={styles.statUnit}>km</Text>
            </View>
          </View>

          {/* Duration (Column 3) */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <Text style={styles.metricLabel}>DURATION</Text>
            <View style={styles.iconStatCol}>
              <Feather name="clock" size={18} color={colors.accent} style={{ marginBottom: 4 }} />
              <Text style={styles.statVal}>{durationText}</Text>
              <Text style={styles.statUnit}>hr</Text>
            </View>
          </View>

          {/* Avg Speed (Column 4) */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <Text style={styles.metricLabel}>AVG SPEED</Text>
            <View style={styles.iconStatCol}>
              <MaterialCommunityIcons name="speedometer" size={20} color={colors.accent} style={{ marginBottom: 3 }} />
              <Text style={styles.statVal}>52</Text>
              <Text style={styles.statUnit}>km/h</Text>
            </View>
          </View>

          {/* Max Speed (Column 5) */}
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>MAX SPEED</Text>
            <View style={styles.iconStatCol}>
              <MaterialCommunityIcons name="speedometer" size={20} color={colors.accent} style={{ marginBottom: 3 }} />
              <Text style={styles.statVal}>87</Text>
              <Text style={styles.statUnit}>km/h</Text>
            </View>
          </View>
        </View>

        {/* 3. Location & Weather Card */}
        <View style={styles.locationWeatherCard}>
          <View style={styles.routeHeaderCol}>
            <View style={styles.routeRow}>
              <View style={[styles.locIndicatorDot, { backgroundColor: colors.accent }]} />
              <Text style={styles.routeText} numberOfLines={1}>{startLocLabel}</Text>
            </View>
            <View style={[styles.routeRow, { marginTop: 4 }]}>
              <View style={[styles.locIndicatorDot, { backgroundColor: colors.success }]} />
              <Text style={styles.routeText} numberOfLines={1}>{endLocLabel}</Text>
            </View>
          </View>
          
          <View style={styles.weatherCol}>
            <Feather name="moon" size={14} color="#eab308" style={{ marginRight: 6 }} />
            <Text style={styles.weatherText}>29°C  Clear</Text>
          </View>
        </View>

        {/* 4. Sub-Navigation Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.subTabsScroll} 
          contentContainerStyle={styles.subTabsContent}
        >
          {/* Overview Tab */}
          <TouchableOpacity 
            style={[styles.subTabItem, activeSubTab === 'overview' && styles.activeSubTabItem]} 
            onPress={() => setActiveSubTab('overview')}
          >
            <View style={styles.tabContent}>
              <Feather name="activity" size={13} color={activeSubTab === 'overview' ? colors.accent : colors.textSlate} style={{ marginRight: 6 }} />
              <Text style={[styles.subTabText, activeSubTab === 'overview' && styles.activeSubTabText]}>OVERVIEW</Text>
            </View>
            {activeSubTab === 'overview' && <View style={styles.activeIndicatorLine} />}
          </TouchableOpacity>

          {/* Events Tab */}
          <TouchableOpacity 
            style={[styles.subTabItem, activeSubTab === 'events' && styles.activeSubTabItem]} 
            onPress={() => router.push({ pathname: '/live-events', params: { id } })}
          >
            <View style={styles.tabContent}>
              <Feather name="alert-triangle" size={13} color={colors.textSlate} style={{ marginRight: 6 }} />
              <Text style={styles.subTabText}>EVENTS</Text>
            </View>
          </TouchableOpacity>

          {/* Route Tab */}
          <TouchableOpacity 
            style={[styles.subTabItem, activeSubTab === 'route' && styles.activeSubTabItem]} 
            onPress={() => router.push({ pathname: '/route-replay', params: { id } })}
          >
            <View style={styles.tabContent}>
              <Feather name="map" size={13} color={colors.textSlate} style={{ marginRight: 6 }} />
              <Text style={styles.subTabText}>ROUTE</Text>
            </View>
          </TouchableOpacity>

          {/* Analytics Tab */}
          <TouchableOpacity 
            style={[styles.subTabItem, activeSubTab === 'analytics' && styles.activeSubTabItem]} 
            onPress={() => router.push({ pathname: '/live-analytics', params: { id } })}
          >
            <View style={styles.tabContent}>
              <Feather name="bar-chart-2" size={13} color={colors.textSlate} style={{ marginRight: 6 }} />
              <Text style={styles.subTabText}>ANALYTICS</Text>
            </View>
          </TouchableOpacity>

          {/* AI Coach Tab */}
          <TouchableOpacity 
            style={[styles.subTabItem, activeSubTab === 'coach' && styles.activeSubTabItem]} 
            onPress={() => setActiveSubTab('coach')}
          >
            <View style={styles.tabContent}>
              <Feather name="shield" size={13} color={activeSubTab === 'coach' ? colors.accent : colors.textSlate} style={{ marginRight: 6 }} />
              <Text style={[styles.subTabText, activeSubTab === 'coach' && styles.activeSubTabText]}>AI COACH</Text>
            </View>
            {activeSubTab === 'coach' && <View style={styles.activeIndicatorLine} />}
          </TouchableOpacity>
        </ScrollView>

        {/* 5. Overview Tab Panels */}
        {activeSubTab === 'overview' && (
          <View>
            {/* Score Breakdown Radar & Counts Lists (Side-by-Side Cards) */}
            <View style={styles.sideBySideRow}>
              {/* Score Breakdown Radar (Left) */}
              <View style={[styles.panelCardHalf, { marginRight: 8 }]}>
                <Text style={styles.panelTitle}>Score Breakdown</Text>
                
                <View style={styles.radarWrapper}>
                  <Svg width={160} height={160} viewBox="0 0 160 160">
                    {/* Concentric grid pentagons */}
                    <Polygon points={getPentagonPoints(0.25)} stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" fill="none" />
                    <Polygon points={getPentagonPoints(0.50)} stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" fill="none" />
                    <Polygon points={getPentagonPoints(0.75)} stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" fill="none" />
                    <Polygon points={getPentagonPoints(1.00)} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'} strokeWidth="1" fill="none" />

                    {/* Polygon spoke axes */}
                    {[-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5].map((angle, idx) => {
                      const x = cx + r * Math.cos(angle);
                      const y = cy + r * Math.sin(angle);
                      return <Line key={idx} x1={cx} y1={cy} x2={x} y2={y} stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" />;
                    })}

                    {/* Active Radar Polygon fill */}
                    <Polygon 
                      points={getRadarPoints()} 
                      stroke={colors.success} 
                      strokeWidth="2" 
                      fill="rgba(34, 197, 94, 0.2)" 
                    />

                    {/* Data corner dots */}
                    {[-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5].map((angle, idx) => {
                      const scales = [0.91, 0.94, 0.90, 0.93, 0.88];
                      const x = cx + r * scales[idx] * Math.cos(angle);
                      const y = cy + r * scales[idx] * Math.sin(angle);
                      return <Circle key={idx} cx={x} cy={y} r="3.5" fill={colors.success} />;
                    })}

                    {/* Corner labels matching mockup */}
                    {/* Top: Smoothness */}
                    <SvgText x={cx} y="15" fill={colors.textSlate} fontSize="8" fontWeight="bold" textAnchor="middle">Smoothness</SvgText>
                    <SvgText x={cx} y="24" fill={colors.success} fontSize="8" textAnchor="middle">91%</SvgText>

                    {/* Right-Top: Safety */}
                    <SvgText x={cx + r + 5} y={cy - 12} fill={colors.textSlate} fontSize="8" fontWeight="bold" textAnchor="start">Safety</SvgText>
                    <SvgText x={cx + r + 5} y={cy - 3} fill={colors.success} fontSize="8" textAnchor="start">94%</SvgText>

                    {/* Right-Bottom: Control */}
                    <SvgText x={cx + r - 8} y={cy + r + 10} fill={colors.textSlate} fontSize="8" fontWeight="bold" textAnchor="start">Control</SvgText>
                    <SvgText x={cx + r - 8} y={cy + r + 19} fill={colors.success} fontSize="8" textAnchor="start">90%</SvgText>

                    {/* Left-Bottom: Focus */}
                    <SvgText x={cx - r + 8} y={cy + r + 10} fill={colors.textSlate} fontSize="8" fontWeight="bold" textAnchor="end">Focus</SvgText>
                    <SvgText x={cx - r + 8} y={cy + r + 19} fill={colors.success} fontSize="8" textAnchor="end">93%</SvgText>

                    {/* Left-Top: Efficiency */}
                    <SvgText x={cx - r - 5} y={cy - 12} fill={colors.textSlate} fontSize="8" fontWeight="bold" textAnchor="end">Efficiency</SvgText>
                    <SvgText x={cx - r - 5} y={cy - 3} fill={colors.success} fontSize="8" textAnchor="end">88%</SvgText>
                  </Svg>
                </View>
              </View>

              {/* Drive Summary violation list (Right) */}
              <View style={[styles.panelCardHalf, { marginLeft: 8 }]}>
                <Text style={styles.panelTitle}>Drive Summary</Text>

                <View style={styles.countsContainer}>
                  {/* Total Events */}
                  <TouchableOpacity style={styles.countRow} onPress={() => router.push('/live-events')}>
                    <View style={styles.countLeft}>
                      <Feather name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                      <Text style={styles.countLabel}>Total Events</Text>
                    </View>
                    <View style={styles.countRight}>
                      <Text style={styles.countValue}>{totalEventsCount}</Text>
                      <Feather name="chevron-right" size={12} color={colors.textSlate} style={{ marginLeft: 6 }} />
                    </View>
                  </TouchableOpacity>

                  {/* Harsh Brakes */}
                  <TouchableOpacity style={styles.countRow} onPress={() => router.push('/live-events')}>
                    <View style={styles.countLeft}>
                      <MaterialCommunityIcons name="disc" size={15} color="#ef4444" style={{ marginRight: 6 }} />
                      <Text style={styles.countLabel}>Harsh Brakes</Text>
                    </View>
                    <View style={styles.countRight}>
                      <Text style={styles.countValue}>{harshBrakeCount}</Text>
                      <Feather name="chevron-right" size={12} color={colors.textSlate} style={{ marginLeft: 6 }} />
                    </View>
                  </TouchableOpacity>

                  {/* Sharp Turns */}
                  <TouchableOpacity style={styles.countRow} onPress={() => router.push('/live-events')}>
                    <View style={styles.countLeft}>
                      <MaterialCommunityIcons name="arrow-u-left-top" size={16} color="#eab308" style={{ marginRight: 6 }} />
                      <Text style={styles.countLabel}>Sharp Turns</Text>
                    </View>
                    <View style={styles.countRight}>
                      <Text style={styles.countValue}>{sharpTurnCount}</Text>
                      <Feather name="chevron-right" size={12} color={colors.textSlate} style={{ marginLeft: 6 }} />
                    </View>
                  </TouchableOpacity>

                  {/* Phone Usage */}
                  <TouchableOpacity style={styles.countRow} onPress={() => router.push('/live-events')}>
                    <View style={styles.countLeft}>
                      <Feather name="phone" size={13} color={colors.accent} style={{ marginRight: 6 }} />
                      <Text style={styles.countLabel}>Phone Usage</Text>
                    </View>
                    <View style={styles.countRight}>
                      <Text style={styles.countValue}>{phoneUsageCount} <Text style={styles.phoneSecText}>(8 sec)</Text></Text>
                      <Feather name="chevron-right" size={12} color={colors.textSlate} style={{ marginLeft: 6 }} />
                    </View>
                  </TouchableOpacity>

                  {/* Aggressive Steering */}
                  <TouchableOpacity style={styles.countRow} onPress={() => router.push('/live-events')}>
                    <View style={styles.countLeft}>
                      <MaterialCommunityIcons name="steering" size={15} color="#a3e635" style={{ marginRight: 6 }} />
                      <Text style={styles.countLabel}>Aggressive Steering</Text>
                    </View>
                    <View style={styles.countRight}>
                      <Text style={styles.countValue}>{steeringCount}</Text>
                      <Feather name="chevron-right" size={12} color={colors.textSlate} style={{ marginLeft: 6 }} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Route Preview Map Panel */}
            <View style={styles.previewMapCard}>
              <View style={styles.previewMapHeader}>
                <Text style={styles.previewMapTitle}>Route Preview</Text>
                <View style={styles.distanceTag}>
                  <FontAwesome5 name="road" size={10} color={colors.textSlate} style={{ marginRight: 5 }} />
                  <Text style={styles.distanceTagText}>{distanceKm} km</Text>
                </View>
              </View>

              {/* Map SVG drawing */}
              <View style={styles.mapWrap}>
                <Svg width="100%" height={170} viewBox="40 50 320 180">
                  {/* Background roads */}
                  <Line x1="10" y1="110" x2="390" y2="110" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'} strokeWidth="1.5" />
                  <Line x1="10" y1="160" x2="390" y2="160" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'} strokeWidth="1.5" />
                  <Line x1="100" y1="10" x2="100" y2="390" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'} strokeWidth="1.5" />
                  <Line x1="260" y1="10" x2="260" y2="390" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'} strokeWidth="1.5" />

                  {/* Road labels */}
                  <SvgText x="130" y="85" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'} fontSize="8" fontWeight="bold">INDIA GATE</SvgText>
                  <SvgText x="250" y="175" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'} fontSize="8" fontWeight="bold">PRAGATI MAIDAN</SvgText>
                  <SvgText x="60" y="150" fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'} fontSize="8" fontWeight="bold">CONNAUGHT PLACE</SvgText>

                  {/* Route path */}
                  <Path 
                    d="M 100,140 Q 150,150 200,135 T 300,120 L 320,125"
                    stroke={colors.success}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Start Marker (Connaught Place) */}
                  <Circle cx="100" cy="140" r="8" fill={colors.background} stroke={colors.success} strokeWidth="2.5" />
                  <Circle cx="100" cy="140" r="3" fill={colors.success} />

                  {/* End Marker (Pragati Maidan) */}
                  <Path d="M320,115 C316,115 313,118 313,122 C313,128 320,135 320,135 C320,135 327,128 327,122 C327,118 324,115 320,115 Z" fill="#ef4444" />
                  <Circle cx="320" cy="122" r="2" fill="#ffffff" />
                </Svg>

                {/* Float Expand Button bottom right */}
                <TouchableOpacity 
                  style={styles.expandFloatBtn}
                  onPress={() => router.push('/route-replay')}
                >
                  <Feather name="maximize-2" size={14} color={colors.textSlate} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Replay Drive Button (Blue/Green Neon Gradient) */}
            <TouchableOpacity 
              style={styles.replayBtnContainer}
              onPress={() => router.push({ pathname: '/route-replay', params: { id } })}
            >
              <LinearGradient
                colors={[colors.accent, colors.success]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.replayBtn}
              >
                <View style={styles.replayPlayIconCircle}>
                  <Feather name="play" size={16} color={colors.text} style={{ marginLeft: 2 }} />
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.replayBtnText}>Replay Drive</Text>
                  <Text style={styles.replayBtnSub}>Watch your drive on the map</Text>
                </View>
                <View style={styles.replayArrowCircle}>
                  <Feather name="chevron-right" size={18} color={isDark ? '#ffffff' : colors.background} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* AI Coach Insights Shortcut Card */}
            <TouchableOpacity 
              style={styles.aiCoachShortcutCard}
              onPress={() => setActiveSubTab('coach')}
              activeOpacity={0.8}
            >
              <View style={styles.insightsLeft}>
                <View style={styles.aiCoachIconCircle}>
                  <Feather name="cpu" size={20} color={colors.accent} />
                  <Feather name="activity" size={10} color={colors.accent} style={{ position: 'absolute', top: 5 }} />
                </View>
                <View style={styles.insightsTextWrap}>
                  <Text style={styles.aiCoachShortcutTitle}>AI Driving Coach</Text>
                  <Text style={styles.aiCoachShortcutDesc}>
                    Your AI Coach has analyzed this drive. Tap here to view personalized tips and safety feedback.
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.accent} style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* 6. AI Coach Tab Panels */}
        {activeSubTab === 'coach' && (
          <View>
            {/* Overall Driving Feedback Panel */}
            <View style={styles.feedbackSection}>
              <View style={styles.sectionHeaderRow}>
                <Feather name="activity" size={16} color="#00f5ff" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>Overall Driving Feedback</Text>
              </View>

              <View style={styles.feedbackRow}>
                {/* Left circular dial */}
                <View style={styles.dialContainer}>
                  <Svg width={120} height={120} viewBox="0 0 160 160">
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
                      stroke={colors.border} strokeWidth="8" fill="none" 
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
                  <Text style={styles.feedbackGreeting}>Great job!</Text>
                  <Text style={styles.feedbackGreetingSub}>
                    You drove safely and responsibly. Keep maintaining your good habits.
                  </Text>

                  {/* 2x2 Mini metrics grid */}
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
              </View>

              <View style={styles.riskRow}>
                {/* Dynamic Segmented Risk dial gauge */}
                <View style={styles.riskGaugeWrap}>
                  <Svg width={100} height={100} viewBox="0 0 100 100">
                    {/* Green Segment */}
                    <Circle 
                      cx="50" cy="50" r="38" 
                      stroke="#22c55e" strokeWidth="8" fill="none"
                      strokeDasharray="59.7 238.7"
                      transform="rotate(135 50 50)"
                      strokeLinecap="round"
                      opacity={overallRiskText === 'Low' ? 1.0 : 0.25}
                    />
                    {/* Yellow Segment */}
                    <Circle 
                      cx="50" cy="50" r="38" 
                      stroke="#eab308" strokeWidth="8" fill="none"
                      strokeDasharray="59.7 238.7"
                      transform="rotate(225 50 50)"
                      strokeLinecap="round"
                      opacity={overallRiskText === 'Medium' ? 1.0 : 0.25}
                    />
                    {/* Red Segment */}
                    <Circle 
                      cx="50" cy="50" r="38" 
                      stroke="#ef4444" strokeWidth="8" fill="none"
                      strokeDasharray="59.7 238.7"
                      transform="rotate(-45 50 50)"
                      strokeLinecap="round"
                      opacity={overallRiskText === 'High' ? 1.0 : 0.25}
                    />
                    {/* Blue Segment */}
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

                {/* Risk bars list */}
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

            {/* Keep it up Trophy Banner */}
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
                  <Path d="M15,20 L17,23 L20,24 L17,25 L15,28 L13,25 L10,24 L13,23 Z" fill="#38bdf8" opacity="0.8" />
                  <Path d="M85,30 L86,32 L89,33 L86,34 L85,36 L84,34 L81,33 L84,32 Z" fill="#00f5ff" opacity="0.9" />
                  <Path d="M75,65 L76,67 L78,68 L76,69 L75,71 L74,69 L72,68 L74,67 Z" fill="#38bdf8" opacity="0.7" />
                  <Circle cx="50" cy="45" r="25" fill="#00f5ff" opacity="0.12" />
                  <Path d="M34,34 C24,34 24,48 34,48" stroke="url(#trophyGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <Path d="M66,34 C76,34 76,48 66,48" stroke="url(#trophyGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <Path d="M34,30 L66,30 C66,48 58,58 50,58 C42,58 34,48 34,30 Z" fill="url(#trophyGrad)" />
                  <Path d="M47,58 L53,58 L55,70 L45,70 Z" fill="url(#trophyGrad)" />
                  <Path d="M36,70 L64,70 C64,70 66,74 64,76 L36,76 C34,74 36,70 36,70 Z" fill="url(#trophyGrad)" />
                  <Ellipse cx="50" cy="76" rx="16" ry="3.5" fill="#0ea5e9" opacity="0.8" />
                </Svg>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function getStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 15,
      backgroundColor: colors.background,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleContainer: {
      flex: 1,
      marginLeft: 14,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    headerSubtitle: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    metricsBox: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 8,
      marginBottom: 15,
    },
    metricCell: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellBorder: {
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    metricLabel: {
      color: colors.textSlate,
      fontSize: 8,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      marginBottom: 8,
      textAlign: 'center',
    },
    scoreGaugeContainer: {
      width: 54,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    scoreGaugeInner: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreGaugeVal: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
      lineHeight: 16,
    },
    scoreGaugeLabel: {
      color: colors.success,
      fontSize: 6,
      fontWeight: 'bold',
    },
    checkBadgeOverlay: {
      position: 'absolute',
      bottom: -2,
      right: 0,
      backgroundColor: colors.card,
      borderRadius: 6,
      padding: 1,
    },
    iconStatCol: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    statVal: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      lineHeight: 14,
    },
    statUnit: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: '600',
      marginTop: 1,
    },
    locationWeatherCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 15,
    },
    routeHeaderCol: {
      flexDirection: 'column',
      flex: 1,
      marginRight: 10,
    },
    routeRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locIndicatorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    routeText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: 'bold',
      flexShrink: 1,
    },
    weatherCol: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    weatherText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '500',
    },
    subTabsRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 16,
    },
    subTabItem: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignItems: 'center',
      position: 'relative',
    },
    activeSubTabItem: {},
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    subTabText: {
      color: colors.textSlate,
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.8,
    },
    activeSubTabText: {
      color: colors.accent,
    },
    activeIndicatorLine: {
      position: 'absolute',
      bottom: -1,
      left: 10,
      right: 10,
      height: 2,
      backgroundColor: colors.accent,
      borderRadius: 1,
    },
    sideBySideRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    panelCardHalf: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    panelTitle: {
      color: colors.textSlate,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
      marginBottom: 10,
    },
    radarWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 155,
      marginTop: 0,
    },
    countsContainer: {
      marginTop: 2,
    },
    countRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 23,
    },
    countLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    countLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '500',
    },
    countRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    countValue: {
      color: colors.text,
      fontSize: 10,
      fontWeight: 'bold',
    },
    phoneSecText: {
      color: colors.textSlate,
      fontSize: 8,
      fontWeight: 'normal',
    },
    previewMapCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 15,
    },
    previewMapHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    previewMapTitle: {
      color: colors.textSlate,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    distanceTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 3,
      paddingHorizontal: 8,
    },
    distanceTagText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: 'bold',
    },
    mapWrap: {
      height: 170,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
    },
    expandFloatBtn: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    replayBtnContainer: {
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: colors.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 4,
      marginBottom: 15,
    },
    replayBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    replayPlayIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    replayBtnText: {
      color: '#050B14',
      fontSize: 13,
      fontWeight: 'bold',
    },
    replayBtnSub: {
      color: 'rgba(5, 11, 20, 0.65)',
      fontSize: 9,
      fontWeight: '600',
      marginTop: 1,
    },
    replayArrowCircle: {
      marginLeft: 'auto',
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(5, 11, 20, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiCoachShortcutCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.04)' : 'rgba(8, 145, 178, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(0, 245, 255, 0.15)' : 'rgba(8, 145, 178, 0.15)',
      borderRadius: 20,
      padding: 14,
      marginBottom: 20,
    },
    insightsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    aiCoachIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(0, 245, 255, 0.3)' : 'rgba(8, 145, 178, 0.3)',
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(8, 145, 178, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      position: 'relative',
    },
    insightsTextWrap: {
      flex: 1,
    },
    aiCoachShortcutTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    aiCoachShortcutDesc: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 14,
    },
    bottomSpacer: {
      height: 100,
    },

    // Horizontal Tabs Scroll Styles
    subTabsScroll: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 16,
    },
    subTabsContent: {
      flexDirection: 'row',
      paddingHorizontal: 10,
    },

    // AI Coach specific styles ported from ai-coach.tsx
    feedbackSection: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 20,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      color: colors.textSlate,
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
      width: 120,
      height: 120,
    },
    dialScoreInner: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialScoreVal: {
      color: colors.text,
      fontSize: 32,
      fontWeight: '900',
      lineHeight: 34,
    },
    dialStatement: {
      color: '#22c55e',
      fontSize: 8,
      fontWeight: 'bold',
      marginVertical: 1,
    },
    capsuleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
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
      width: '60%',
    },
    feedbackGreeting: {
      color: colors.text,
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    feedbackGreetingSub: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 14,
      marginBottom: 8,
    },
    metricsGridBox: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 4,
    },
    metricsGridRow: {
      flexDirection: 'row',
    },
    metricsGridRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    metricGridCell: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
    metricGridCellBorder: {
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    metricGridIcon: {
      marginRight: 6,
    },
    miniLabel: {
      color: colors.textSlate,
      fontSize: 8,
      fontWeight: '500',
    },
    miniValue: {
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 1,
    },
    tipsSection: {
      marginBottom: 20,
    },
    sectionHeaderRowMain: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    tipCardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    tipCardDesc: {
      color: colors.textMuted,
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
    riskSection: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
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
      fontSize: 16,
      fontWeight: 'bold',
      lineHeight: 18,
    },
    riskLabelSub: {
      color: colors.textSlate,
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
      color: colors.textMuted,
      fontSize: 9,
    },
    riskBarValText: {
      fontSize: 9,
      fontWeight: 'bold',
    },
    riskBarTrack: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    riskBarFill: {
      height: '100%',
      borderRadius: 2,
    },
    bannerTrophyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.04)' : 'rgba(8, 145, 178, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(0, 245, 255, 0.15)' : 'rgba(8, 145, 178, 0.15)',
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
    bannerTextCol: {
      flex: 1,
    },
    bannerTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    bannerDesc: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 14,
    },
    trophyIllustrationContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 70,
      height: 70,
    },
  });
}
