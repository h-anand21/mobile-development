import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon, Text as SvgText, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDriveStore, DriveSession } from '../src/store/driveStore';
import { driveRepository } from '../src/database/repositories/driveRepository';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

export default function DriveDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'events' | 'route' | 'analytics'>('overview');

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
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Drive Details</Text>
          <Text style={styles.headerSubtitle}>{driveDateStr}  •  {driveTimeStr}</Text>
        </View>

        <TouchableOpacity style={styles.iconCircle}>
          <Feather name="share" size={20} color="#F8FAFC" />
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
                    <Stop offset="0%" stopColor="#00f5ff" />
                    <Stop offset="100%" stopColor="#22c55e" />
                  </SvgLinearGradient>
                </Defs>
                <Circle cx="40" cy="40" r="30" stroke="#122540" strokeWidth="4" fill="none" />
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
                <Text style={styles.scoreGaugeLabel}>Excellent</Text>
              </View>
              <View style={styles.checkBadgeOverlay}>
                <MaterialCommunityIcons name="shield-check" size={12} color="#22c55e" />
              </View>
            </View>
          </View>

          {/* Distance (Column 2) */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <Text style={styles.metricLabel}>DISTANCE</Text>
            <View style={styles.iconStatCol}>
              <FontAwesome5 name="road" size={18} color="#00f5ff" style={{ marginBottom: 4 }} />
              <Text style={styles.statVal}>{distanceKm}</Text>
              <Text style={styles.statUnit}>km</Text>
            </View>
          </View>

          {/* Duration (Column 3) */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <Text style={styles.metricLabel}>DURATION</Text>
            <View style={styles.iconStatCol}>
              <Feather name="clock" size={18} color="#00f5ff" style={{ marginBottom: 4 }} />
              <Text style={styles.statVal}>{durationText}</Text>
              <Text style={styles.statUnit}>hr</Text>
            </View>
          </View>

          {/* Avg Speed (Column 4) */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <Text style={styles.metricLabel}>AVG SPEED</Text>
            <View style={styles.iconStatCol}>
              <MaterialCommunityIcons name="speedometer" size={20} color="#00f5ff" style={{ marginBottom: 3 }} />
              <Text style={styles.statVal}>52</Text>
              <Text style={styles.statUnit}>km/h</Text>
            </View>
          </View>

          {/* Max Speed (Column 5) */}
          <View style={styles.metricCell}>
            <Text style={styles.metricLabel}>MAX SPEED</Text>
            <View style={styles.iconStatCol}>
              <MaterialCommunityIcons name="speedometer" size={20} color="#00f5ff" style={{ marginBottom: 3 }} />
              <Text style={styles.statVal}>87</Text>
              <Text style={styles.statUnit}>km/h</Text>
            </View>
          </View>
        </View>

        {/* 3. Location & Weather Card */}
        <View style={styles.locationWeatherCard}>
          <View style={styles.routeHeader}>
            <View style={[styles.locIndicatorDot, { backgroundColor: '#00f5ff' }]} />
            <Text style={styles.routeText} numberOfLines={1}>{startLocLabel}</Text>
            <Feather name="arrow-right" size={12} color="#64748b" style={{ marginHorizontal: 8 }} />
            <View style={[styles.locIndicatorDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.routeText} numberOfLines={1}>{endLocLabel}</Text>
          </View>
          
          <View style={styles.weatherCol}>
            <Feather name="moon" size={14} color="#eab308" style={{ marginRight: 6 }} />
            <Text style={styles.weatherText}>29°C  Clear</Text>
          </View>
        </View>

        {/* 4. Sub-Navigation Tabs */}
        <View style={styles.subTabsRow}>
          <TouchableOpacity 
            style={[styles.subTabItem, activeSubTab === 'overview' && styles.activeSubTabItem]} 
            onPress={() => setActiveSubTab('overview')}
          >
            <View style={styles.tabContent}>
              <Feather name="activity" size={13} color={activeSubTab === 'overview' ? '#00f5ff' : '#64748b'} style={{ marginRight: 6 }} />
              <Text style={[styles.subTabText, activeSubTab === 'overview' && styles.activeSubTabText]}>OVERVIEW</Text>
            </View>
            {activeSubTab === 'overview' && <View style={styles.activeIndicatorLine} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTabItem, activeSubTab === 'events' && styles.activeSubTabItem]} 
            onPress={() => router.push('/live-events')}
          >
            <View style={styles.tabContent}>
              <Feather name="alert-triangle" size={13} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.subTabText}>EVENTS</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTabItem, activeSubTab === 'route' && styles.activeSubTabItem]} 
            onPress={() => router.push('/route-replay')}
          >
            <View style={styles.tabContent}>
              <Feather name="map" size={13} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.subTabText}>ROUTE</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTabItem, activeSubTab === 'analytics' && styles.activeSubTabItem]} 
            onPress={() => router.push('/live-analytics')}
          >
            <View style={styles.tabContent}>
              <Feather name="bar-chart-2" size={13} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.subTabText}>ANALYTICS</Text>
            </View>
          </TouchableOpacity>
        </View>

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
                    <Polygon points={getPentagonPoints(0.25)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                    <Polygon points={getPentagonPoints(0.50)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                    <Polygon points={getPentagonPoints(0.75)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                    <Polygon points={getPentagonPoints(1.00)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />

                    {/* Polygon spoke axes */}
                    {[-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5].map((angle, idx) => {
                      const x = cx + r * Math.cos(angle);
                      const y = cy + r * Math.sin(angle);
                      return <Line key={idx} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />;
                    })}

                    {/* Active Radar Polygon fill */}
                    <Polygon 
                      points={getRadarPoints()} 
                      stroke="#22c55e" 
                      strokeWidth="2" 
                      fill="rgba(34, 197, 94, 0.2)" 
                    />

                    {/* Data corner dots */}
                    {[-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5].map((angle, idx) => {
                      const scales = [0.91, 0.94, 0.90, 0.93, 0.88];
                      const x = cx + r * scales[idx] * Math.cos(angle);
                      const y = cy + r * scales[idx] * Math.sin(angle);
                      return <Circle key={idx} cx={x} cy={y} r="3.5" fill="#22c55e" />;
                    })}

                    {/* Corner labels matching mockup */}
                    {/* Top: Smoothness */}
                    <SvgText x={cx} y="11" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Smoothness</SvgText>
                    <SvgText x={cx} y="20" fill="#22c55e" fontSize="8" textAnchor="middle">91%</SvgText>

                    {/* Right-Top: Safety */}
                    <SvgText x={cx + r + 5} y={cy - 12} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="start">Safety</SvgText>
                    <SvgText x={cx + r + 5} y={cy - 3} fill="#22c55e" fontSize="8" textAnchor="start">94%</SvgText>

                    {/* Right-Bottom: Control */}
                    <SvgText x={cx + r - 8} y={cy + r + 10} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="start">Control</SvgText>
                    <SvgText x={cx + r - 8} y={cy + r + 19} fill="#22c55e" fontSize="8" textAnchor="start">90%</SvgText>

                    {/* Left-Bottom: Focus */}
                    <SvgText x={cx - r + 8} y={cy + r + 10} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">Focus</SvgText>
                    <SvgText x={cx - r + 8} y={cy + r + 19} fill="#22c55e" fontSize="8" textAnchor="end">93%</SvgText>

                    {/* Left-Top: Efficiency */}
                    <SvgText x={cx - r - 5} y={cy - 12} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">Efficiency</SvgText>
                    <SvgText x={cx - r - 5} y={cy - 3} fill="#22c55e" fontSize="8" textAnchor="end">88%</SvgText>
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
                      <Feather name="chevron-right" size={12} color="#64748b" style={{ marginLeft: 6 }} />
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
                      <Feather name="chevron-right" size={12} color="#64748b" style={{ marginLeft: 6 }} />
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
                      <Feather name="chevron-right" size={12} color="#64748b" style={{ marginLeft: 6 }} />
                    </View>
                  </TouchableOpacity>

                  {/* Phone Usage */}
                  <TouchableOpacity style={styles.countRow} onPress={() => router.push('/live-events')}>
                    <View style={styles.countLeft}>
                      <Feather name="phone" size={13} color="#00f5ff" style={{ marginRight: 6 }} />
                      <Text style={styles.countLabel}>Phone Usage</Text>
                    </View>
                    <View style={styles.countRight}>
                      <Text style={styles.countValue}>{phoneUsageCount} <Text style={styles.phoneSecText}>(8 sec)</Text></Text>
                      <Feather name="chevron-right" size={12} color="#64748b" style={{ marginLeft: 6 }} />
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
                      <Feather name="chevron-right" size={12} color="#64748b" style={{ marginLeft: 6 }} />
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
                  <FontAwesome5 name="road" size={10} color="#94a3b8" style={{ marginRight: 5 }} />
                  <Text style={styles.distanceTagText}>{distanceKm} km</Text>
                </View>
              </View>

              {/* Map SVG drawing */}
              <View style={styles.mapWrap}>
                <Svg width="100%" height={170} viewBox="40 50 320 180">
                  {/* Background roads */}
                  <Line x1="10" y1="110" x2="390" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                  <Line x1="10" y1="160" x2="390" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                  <Line x1="100" y1="10" x2="100" y2="390" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                  <Line x1="260" y1="10" x2="260" y2="390" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />

                  {/* Road labels */}
                  <SvgText x="130" y="85" fill="rgba(255,255,255,0.08)" fontSize="8" fontWeight="bold">INDIA GATE</SvgText>
                  <SvgText x="250" y="175" fill="rgba(255,255,255,0.08)" fontSize="8" fontWeight="bold">PRAGATI MAIDAN</SvgText>
                  <SvgText x="60" y="150" fill="rgba(255,255,255,0.08)" fontSize="8" fontWeight="bold">CONNAUGHT PLACE</SvgText>

                  {/* Route path */}
                  <Path 
                    d="M 100,140 Q 150,150 200,135 T 300,120 L 320,125"
                    stroke="#22c55e"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Start Marker (Connaught Place) */}
                  <Circle cx="100" cy="140" r="8" fill="#050B14" stroke="#22c55e" strokeWidth="2.5" />
                  <Circle cx="100" cy="140" r="3" fill="#22c55e" />

                  {/* End Marker (Pragati Maidan) */}
                  <Path d="M320,115 C316,115 313,118 313,122 C313,128 320,135 320,135 C320,135 327,128 327,122 C327,118 324,115 320,115 Z" fill="#ef4444" />
                  <Circle cx="320" cy="122" r="2" fill="#ffffff" />
                </Svg>

                {/* Float Expand Button bottom right */}
                <TouchableOpacity 
                  style={styles.expandFloatBtn}
                  onPress={() => router.push('/route-replay')}
                >
                  <Feather name="maximize-2" size={14} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Replay Drive Button (Blue/Green Neon Gradient) */}
            <TouchableOpacity 
              style={styles.replayBtnContainer}
              onPress={() => router.push({ pathname: '/route-replay', params: { id } })}
            >
              <LinearGradient
                colors={['#00f5ff', '#22c55e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.replayBtn}
              >
                <View style={styles.replayPlayIconCircle}>
                  <Feather name="play" size={16} color="#050B14" style={{ marginLeft: 2 }} />
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.replayBtnText}>Replay Drive</Text>
                  <Text style={styles.replayBtnSub}>Watch your drive on the map</Text>
                </View>
                <View style={styles.replayArrowCircle}>
                  <Feather name="chevron-right" size={18} color="#ffffff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Drive Insights Card */}
            <TouchableOpacity 
              style={styles.insightsCard}
              onPress={() => router.push('/ai-coach')}
            >
              <View style={styles.insightsLeft}>
                <View style={styles.shieldCheckBadge}>
                  <Feather name="shield" size={24} color="#22c55e" />
                  <Feather name="star" size={10} color="#22c55e" style={{ position: 'absolute', top: 7 }} />
                </View>
                <View style={styles.insightsTextWrap}>
                  <Text style={styles.insightsTitle}>Great job!</Text>
                  <Text style={styles.insightsDesc}>
                    You maintained excellent control and focus throughout the drive. Keep it up!
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#64748b" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>
        )}

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
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSpacer: {
    height: 60,
  },

  // Metrics Box
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 10,
    marginBottom: 15,
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cellBorder: {
    borderRightWidth: 1,
    borderRightColor: '#122540',
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  scoreGaugeContainer: {
    position: 'relative',
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreGaugeInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreGaugeVal: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 16,
  },
  scoreGaugeLabel: {
    color: '#22c55e',
    fontSize: 6,
    fontWeight: 'bold',
  },
  checkBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: 0,
    backgroundColor: '#0c1626',
    borderRadius: 6,
    padding: 1,
  },
  iconStatCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  statUnit: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },

  // Location Weather Card
  locationWeatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  locIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  routeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  weatherCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },

  // Sub Tabs Row
  subTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#122540',
    marginBottom: 16,
  },
  subTabItem: {
    flex: 1,
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
    color: '#64748b',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  activeSubTabText: {
    color: '#00f5ff',
  },
  activeIndicatorLine: {
    position: 'absolute',
    bottom: -1,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#00f5ff',
    borderRadius: 1,
  },

  // Side-by-side Layout Panels
  sideBySideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  panelCardHalf: {
    flex: 1,
    backgroundColor: 'rgba(8, 15, 26, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#122540',
    padding: 14,
  },
  panelTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  radarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginTop: -8,
  },

  // Counts Container
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
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '500',
  },
  countRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countValue: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  phoneSecText: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'normal',
  },

  // Preview Map Card
  previewMapCard: {
    backgroundColor: 'rgba(8, 15, 26, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#122540',
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
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  distanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  distanceTagText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: 'bold',
  },
  mapWrap: {
    height: 170,
    backgroundColor: '#040a12',
    borderWidth: 1,
    borderColor: '#122540',
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
    backgroundColor: 'rgba(4, 10, 18, 0.85)',
    borderWidth: 1,
    borderColor: '#122540',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Replay Button
  replayBtnContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
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
    backgroundColor: '#050B14',
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

  // Insights Card
  insightsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(34, 197, 94, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
  },
  insightsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shieldCheckBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  insightsTextWrap: {
    flex: 1,
  },
  insightsTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  insightsDesc: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 14,
  },
});
