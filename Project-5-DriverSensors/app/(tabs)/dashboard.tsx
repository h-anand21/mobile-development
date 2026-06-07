import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon, Text as SvgText, Rect } from 'react-native-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAnalyticsStore } from '../../src/store/analyticsStore';

const { width } = Dimensions.get('window');

// Data structures for Weekly, Monthly, and Yearly views
const WEEKLY_DATA = {
  dateRange: 'Jun 1 – Jun 7, 2026',
  avgScore: 87,
  totalDrives: 7,
  totalDistance: 186.4,
  totalDuration: '5:42:16',
  metrics: [
    { label: 'Avg Safe Score', val: '87', sub: 'Excellent', diff: '↑ 8 pts vs last week', icon: 'shield-check-outline', color: '#22c55e' },
    { label: 'Total Drives', val: '7', sub: 'Drives', diff: '↑ 2 vs last week', icon: 'steering', color: '#00f5ff' },
    { label: 'Total Distance', val: '186.4', sub: 'km', diff: '↑ 24.6 km vs last week', icon: 'map-marker-outline', color: '#00f5ff' },
    { label: 'Total Duration', val: '5:42:16', sub: 'hr', diff: '↑ 48 min vs last week', icon: 'clock-outline', color: '#00f5ff' },
  ],
  trend: {
    points: [72, 76, 81, 85, 89, 91, 92],
    labels: ['Jun 1', 'Jun 2', 'Jun 3', 'Jun 4', 'Jun 5', 'Jun 6', 'Jun 7'],
  },
  donut: {
    total: 7,
    segments: [
      { label: 'Excellent (80-100)', count: 4, pct: 57, color: '#22c55e' },
      { label: 'Good (60-79)', count: 2, pct: 29, color: '#00f5ff' },
      { label: 'Fair (40-59)', count: 1, pct: 14, color: '#eab308' },
      { label: 'Poor (<40)', count: 0, pct: 0, color: '#ef4444' },
    ],
  },
  breakdown: {
    braking: 88,
    acceleration: 85,
    steering: 83,
    focus: 90,
    consistency: 87,
  },
  insight: {
    title: 'Great work, Himanshu! 🎉',
    desc: 'You improved your score by 8 points compared to last week.',
    topPerformance: 'Jun 7, 2026',
    topScore: 92,
  }
};

const MONTHLY_DATA = {
  dateRange: 'June 2026',
  avgScore: 84,
  totalDistance: 742.8,
  totalDrives: 28,
  metrics: [
    { label: 'Avg Safe Score', val: '84', sub: 'Good', diff: '↑ 6 pts vs May 2026', icon: 'shield-check-outline', color: '#22c55e', miniChart: [65, 70, 78, 82, 84] },
    { label: 'Total Distance', val: '742.8', sub: 'km', diff: '↑ 128.4 km vs May 2026', icon: 'map-marker-outline', color: '#00f5ff', miniChart: [110, 140, 130, 160, 202] },
    { label: 'Total Drives', val: '28', sub: 'Drives', diff: '↑ 5 vs May 2026', icon: 'steering', color: '#00f5ff', miniChart: [4, 5, 5, 7, 7] },
  ],
  trend: {
    points: [78, 82, 85, 88, 90],
    labels: ['Wk 1\nJun 1-7', 'Wk 2\nJun 8-14', 'Wk 3\nJun 15-21', 'Wk 4\nJun 22-28', 'Wk 5\nJun 29-Jul 5'],
  }
};

const YEARLY_DATA = {
  dateRange: 'Jan 1 – Dec 31, 2026',
  avgScore: 86,
  totalDrives: 312,
  totalDistance: 8940.5,
  totalDuration: '68:15:32',
  metrics: [
    { label: 'Avg Safe Score', val: '86', sub: 'Excellent', diff: '↑ 5 pts vs 2025', icon: 'shield-check-outline', color: '#22c55e' },
    { label: 'Total Drives', val: '312', sub: 'Drives', diff: '↑ 42 vs 2025', icon: 'steering', color: '#00f5ff' },
    { label: 'Total Distance', val: '8,940.5', sub: 'km', diff: '↑ 1,240 km vs 2025', icon: 'map-marker-outline', color: '#00f5ff' },
    { label: 'Total Duration', val: '68:15', sub: 'hr', diff: '↑ 12 hr vs 2025', icon: 'clock-outline', color: '#00f5ff' },
  ],
  trend: {
    points: [74, 76, 79, 81, 84, 86, 85, 87, 89, 90, 91, 92],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  }
};

export default function DashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>('week');

  const {
    totalDrives,
    averageScore,
    bestScore,
    totalDistance,
    totalEvents,
    loadAnalytics,
  } = useAnalyticsStore();

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [])
  );

  // Math for Line Chart coordinates
  const getLineChartPath = (points: number[], chartWidth: number, chartHeight: number, padding: number) => {
    const usableWidth = chartWidth - padding * 2;
    const usableHeight = chartHeight - padding * 2;
    return points.map((val, idx) => {
      const x = padding + (idx / (points.length - 1)) * usableWidth;
      const y = chartHeight - padding - ((val - 0) / 100) * usableHeight;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const getAreaChartPath = (points: number[], chartWidth: number, chartHeight: number, padding: number) => {
    const linePath = getLineChartPath(points, chartWidth, chartHeight, padding);
    const usableWidth = chartWidth - padding * 2;
    const rightX = padding + usableWidth;
    const bottomY = chartHeight - padding;
    return `${linePath} L ${rightX.toFixed(1)} ${bottomY.toFixed(1)} L ${padding.toFixed(1)} ${bottomY.toFixed(1)} Z`;
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

  const getRadarPoints = (data: { braking: number; acceleration: number; steering: number; focus: number; consistency: number }) => {
    const scales = [data.braking / 100, data.acceleration / 100, data.steering / 100, data.focus / 100, data.consistency / 100];
    const angles = [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5];
    return angles.map((angle, idx) => {
      const x = cx + r * scales[idx] * Math.cos(angle);
      const y = cy + r * scales[idx] * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerMenuBtn}>
          <Feather name="menu" size={24} color="#00f5ff" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Drive Dashboard</Text>
          <Text style={styles.headerSubtitle}>Your driving insights at a glance</Text>
        </View>

        <View style={styles.headerRightWrap}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Feather name="bell" size={20} color="#F8FAFC" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileAvatar}>
            <Svg width={36} height={36} viewBox="0 0 100 100">
              <Defs>
                <SvgLinearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#00f5ff" />
                  <Stop offset="100%" stopColor="#0ea5e9" />
                </SvgLinearGradient>
              </Defs>
              <Circle cx="50" cy="50" r="46" stroke="url(#profileGrad)" strokeWidth="3" fill="#050B14" />
              {/* Simple stylized neon user outline */}
              <Circle cx="50" cy="38" r="15" fill="none" stroke="url(#profileGrad)" strokeWidth="4" />
              <Path d="M22,78 C22,60 35,58 50,58 C65,58 78,60 78,78" fill="none" stroke="url(#profileGrad)" strokeWidth="4" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs Selector Navigation */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'week' && styles.activeTabItem]} 
          onPress={() => setActiveTab('week')}
        >
          <Text style={[styles.tabText, activeTab === 'week' && styles.activeTabText]}>Week</Text>
          {activeTab === 'week' && <View style={styles.tabGlowUnderline} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'month' && styles.activeTabItem]} 
          onPress={() => setActiveTab('month')}
        >
          <Text style={[styles.tabText, activeTab === 'month' && styles.activeTabText]}>Month</Text>
          {activeTab === 'month' && <View style={styles.tabGlowUnderline} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'year' && styles.activeTabItem]} 
          onPress={() => setActiveTab('year')}
        >
          <Text style={[styles.tabText, activeTab === 'year' && styles.activeTabText]}>Year</Text>
          {activeTab === 'year' && <View style={styles.tabGlowUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ==================== WEEK TAB ==================== */}
        {activeTab === 'week' && (
          <View>
            {/* WEEKLY OVERVIEW SECTION */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="trending-up" size={16} color="#00f5ff" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>WEEKLY OVERVIEW</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                <Feather name="calendar" size={12} color="#64748b" style={{ marginRight: 5 }} />
                <Text style={styles.sectionHeaderTime}>{WEEKLY_DATA.dateRange}</Text>
              </View>
            </View>

            {/* Metric Grid Cards */}
            {(() => {
              const estMin = Math.round((totalDistance * 0.072) / 60);
              const estHours = Math.floor(estMin / 60);
              const estMins = estMin % 60;
              const durationString = estHours > 0 ? `${estHours}h ${estMins}m` : `${estMins}m`;

              const displayMetrics = [
                {
                  label: 'Avg Safe Score',
                  val: totalDrives > 0 ? averageScore.toString() : WEEKLY_DATA.metrics[0].val,
                  sub: totalDrives > 0
                    ? (averageScore >= 90 ? 'Excellent' : averageScore >= 80 ? 'Good' : averageScore >= 65 ? 'Fair' : 'Poor')
                    : WEEKLY_DATA.metrics[0].sub,
                  diff: totalDrives > 0 ? `${totalDrives} active drives analyzed` : WEEKLY_DATA.metrics[0].diff,
                  icon: 'shield-check-outline',
                  color: '#22c55e'
                },
                {
                  label: 'Total Drives',
                  val: totalDrives > 0 ? totalDrives.toString() : WEEKLY_DATA.metrics[1].val,
                  sub: 'Drives',
                  diff: totalDrives > 0 ? 'All-time drives recorded' : WEEKLY_DATA.metrics[1].diff,
                  icon: 'steering',
                  color: '#00f5ff'
                },
                {
                  label: 'Total Distance',
                  val: totalDrives > 0 ? (totalDistance / 1000).toFixed(1) : WEEKLY_DATA.metrics[2].val,
                  sub: 'km',
                  diff: totalDrives > 0 ? 'Accumulated distance' : WEEKLY_DATA.metrics[2].diff,
                  icon: 'map-marker-outline',
                  color: '#00f5ff'
                },
                {
                  label: 'Total Duration',
                  val: totalDrives > 0 ? durationString : WEEKLY_DATA.metrics[3].val,
                  sub: 'hr',
                  diff: totalDrives > 0 ? 'Estimated drive time' : WEEKLY_DATA.metrics[3].diff,
                  icon: 'clock-outline',
                  color: '#00f5ff'
                }
              ];

              return (
                <View style={styles.metricsGridContainer}>
                  {displayMetrics.map((metric, idx) => (
                    <View key={idx} style={styles.metricCard}>
                      <View style={styles.metricCardHeader}>
                        <MaterialCommunityIcons name={metric.icon as any} size={18} color={metric.color} />
                        <Text style={styles.metricCardLabel} numberOfLines={1}>{metric.label}</Text>
                      </View>
                      <Text style={styles.metricCardValue}>{metric.val}</Text>
                      <Text style={[styles.metricCardSub, metric.label === 'Avg Safe Score' && { color: '#22c55e', fontWeight: 'bold' }]}>
                        {metric.sub}
                      </Text>
                      <Text style={styles.metricCardDiff}>{metric.diff}</Text>
                    </View>
                  ))}
                </View>
              );
            })()}

            {/* ALL-TIME SAFETY RECORD SECTION */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="shield" size={16} color="#eab308" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>ALL-TIME SAFETY RECORD</Text>
              </View>
            </View>

            <View style={[styles.metricsGridContainer, { marginBottom: 15 }]}>
              {/* Card 1: Best Score */}
              <View style={[styles.metricCard, { borderColor: 'rgba(234, 179, 8, 0.3)', backgroundColor: 'rgba(234, 179, 8, 0.05)' }]}>
                <View style={styles.metricCardHeader}>
                  <FontAwesome5 name="trophy" size={14} color="#eab308" />
                  <Text style={[styles.metricCardLabel, { color: '#eab308', fontWeight: 'bold' }]} numberOfLines={1}>Best Safe Score</Text>
                </View>
                <Text style={[styles.metricCardValue, { color: '#ffffff' }]}>{totalDrives > 0 ? bestScore : 98}</Text>
                <Text style={[styles.metricCardSub, { color: '#eab308' }]}>Highest safety rating</Text>
                <Text style={[styles.metricCardDiff, { color: '#a3e635' }]}>All-time record 🏆</Text>
              </View>

              {/* Card 2: Total Violations */}
              <View style={[styles.metricCard, { borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
                <View style={styles.metricCardHeader}>
                  <Feather name="alert-triangle" size={16} color="#ef4444" />
                  <Text style={[styles.metricCardLabel, { color: '#ef4444', fontWeight: 'bold' }]} numberOfLines={1}>Total Violations</Text>
                </View>
                <Text style={[styles.metricCardValue, { color: '#ffffff' }]}>{totalDrives > 0 ? totalEvents : 12}</Text>
                <Text style={[styles.metricCardSub, { color: '#ef4444' }]}>Safety events logged</Text>
                <Text style={[styles.metricCardDiff, { color: '#ef4444' }]}>Safe driving alerts</Text>
              </View>
            </View>

            {/* SCORE TREND SECTION */}
            <View style={styles.panelCard}>
              <View style={styles.panelHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="activity" size={15} color="#00f5ff" style={{ marginRight: 8 }} />
                  <Text style={styles.panelTitle}>SCORE TREND</Text>
                </View>
                <Text style={styles.panelHeaderRightLabel}>Weekly Avg: {WEEKLY_DATA.avgScore}</Text>
              </View>

              {/* Vector SVG Line Chart */}
              <View style={styles.chartContainer}>
                <Svg width={width - 56} height={150} viewBox={`0 0 ${width - 56} 150`}>
                  <Defs>
                    <SvgLinearGradient id="chartLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#00f5ff" stopOpacity="0.25" />
                      <Stop offset="100%" stopColor="#00f5ff" stopOpacity="0.0" />
                    </SvgLinearGradient>
                  </Defs>
                  
                  {/* Grid Lines */}
                  <Line x1="40" y1="20" x2={width - 96} y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <Line x1="40" y1="50" x2={width - 96} y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <Line x1="40" y1="80" x2={width - 96} y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <Line x1="40" y1="110" x2={width - 96} y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  {/* Y Axis ticks */}
                  <SvgText x="25" y="24" fill="#64748b" fontSize="9" textAnchor="end">100</SvgText>
                  <SvgText x="25" y="54" fill="#64748b" fontSize="9" textAnchor="end">75</SvgText>
                  <SvgText x="25" y="84" fill="#64748b" fontSize="9" textAnchor="end">50</SvgText>
                  <SvgText x="25" y="114" fill="#64748b" fontSize="9" textAnchor="end">25</SvgText>
                  <SvgText x="25" y="140" fill="#64748b" fontSize="9" textAnchor="end">0</SvgText>

                  {/* Right hand Zone Indicators */}
                  <SvgText x={width - 90} y="24" fill="#22c55e" fontSize="9" fontWeight="bold">Excellent</SvgText>
                  <SvgText x={width - 90} y="54" fill="#00f5ff" fontSize="9" fontWeight="bold">Good</SvgText>
                  <SvgText x={width - 90} y="84" fill="#eab308" fontSize="9" fontWeight="bold">Fair</SvgText>
                  <SvgText x={width - 90} y="114" fill="#ef4444" fontSize="9" fontWeight="bold">Poor</SvgText>

                  {/* Filled Area path */}
                  <Path 
                    d={getAreaChartPath(WEEKLY_DATA.trend.points, width - 56, 150, 40)} 
                    fill="url(#chartLineGrad)"
                  />

                  {/* Stroke path */}
                  <Path 
                    d={getLineChartPath(WEEKLY_DATA.trend.points, width - 56, 150, 40)} 
                    stroke="#00f5ff" 
                    strokeWidth="2.5" 
                    fill="none" 
                  />

                  {/* Ticks and values */}
                  {WEEKLY_DATA.trend.points.map((val, idx) => {
                    const usableWidth = (width - 56) - 80;
                    const x = 40 + (idx / 6) * usableWidth;
                    const y = 150 - 20 - (val / 100) * 110;
                    return (
                      <React.Fragment key={idx}>
                        {/* Point Circle */}
                        <Circle cx={x} cy={y} r="4.5" fill="#00f5ff" stroke="#050B14" strokeWidth="1.5" />
                        
                        {/* Value text above point */}
                        {idx !== 6 && (
                          <SvgText x={x} y={y - 10} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {val}
                          </SvgText>
                        )}

                        {/* Bottom date label */}
                        <SvgText x={x} y="145" fill="#64748b" fontSize="8" textAnchor="middle">
                          {WEEKLY_DATA.trend.labels[idx].split(' ')[1]}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}

                  {/* Final highlighted value bubble */}
                  {(() => {
                    const usableWidth = (width - 56) - 80;
                    const x = 40 + 6 * usableWidth;
                    const y = 150 - 20 - (92 / 100) * 110;
                    return (
                      <React.Fragment>
                        <Rect x={x - 12} y={y - 25} width="24" height="15" rx="4" fill="#a3e635" />
                        <SvgText x={x} y={y - 14} fill="#050B14" fontSize="9" fontWeight="bold" textAnchor="middle">
                          92
                        </SvgText>
                        <Circle cx={x} cy={y} r="6" fill="#a3e635" stroke="#050B14" strokeWidth="2" />
                      </React.Fragment>
                    );
                  })()}
                </Svg>
              </View>
            </View>

            {/* SIDE-BY-SIDE CARDS: SCORE DISTRIBUTION & DRIVING BREAKDOWN */}
            <View style={styles.twoCardsRow}>
              {/* 1. Score Distribution Donut */}
              <View style={[styles.panelCardHalf, { marginRight: 8 }]}>
                <Text style={styles.panelTitleSmall}>SCORE DISTRIBUTION</Text>
                
                <View style={styles.donutRow}>
                  {/* Left Donut Graph */}
                  <View style={styles.donutContainer}>
                    <Svg width={74} height={74} viewBox="0 0 100 100">
                      {/* Base Circle */}
                      <Circle cx="50" cy="50" r="35" stroke="#121e33" strokeWidth="12" fill="none" />
                      {/* Segments: Excellent (57% -> 125.3), Good (29% -> 63.8), Fair (14% -> 30.8) */}
                      <Circle 
                        cx="50" cy="50" r="35" 
                        stroke="#22c55e" strokeWidth="12" fill="none" 
                        strokeDasharray="125.3 220" 
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                        strokeLinecap="round"
                      />
                      <Circle 
                        cx="50" cy="50" r="35" 
                        stroke="#00f5ff" strokeWidth="12" fill="none" 
                        strokeDasharray="63.8 220" 
                        strokeDashoffset="-125.3"
                        transform="rotate(-90 50 50)"
                      />
                      <Circle 
                        cx="50" cy="50" r="35" 
                        stroke="#eab308" strokeWidth="12" fill="none" 
                        strokeDasharray="30.8 220" 
                        strokeDashoffset="-189.1"
                        transform="rotate(-90 50 50)"
                        strokeLinecap="round"
                      />
                    </Svg>
                    <View style={styles.donutInner}>
                      <Text style={styles.donutScoreVal}>{WEEKLY_DATA.donut.total}</Text>
                      <Text style={styles.donutScoreLabel}>Drives</Text>
                    </View>
                  </View>

                  {/* Right Legend listing */}
                  <View style={styles.donutLegendCol}>
                    {WEEKLY_DATA.donut.segments.map((seg, idx) => (
                      <View key={idx} style={styles.donutLegendRow}>
                        <View style={[styles.donutLegendDot, { backgroundColor: seg.color }]} />
                        <View>
                          <Text style={styles.legendLabelText}>{seg.label.split(' ')[0]}</Text>
                          <Text style={styles.legendValText}>{seg.count} ({seg.pct}%)</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* 2. Driving Breakdown Radar */}
              <View style={[styles.panelCardHalf, { marginLeft: 8 }]}>
                <Text style={styles.panelTitleSmall}>DRIVING BREAKDOWN</Text>

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
                      points={getRadarPoints(WEEKLY_DATA.breakdown)} 
                      stroke="#22c55e" 
                      strokeWidth="2" 
                      fill="rgba(34, 197, 94, 0.2)" 
                    />

                    {/* Data corner dots */}
                    {[-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5].map((angle, idx) => {
                      const scales = [
                        WEEKLY_DATA.breakdown.braking / 100,
                        WEEKLY_DATA.breakdown.acceleration / 100,
                        WEEKLY_DATA.breakdown.steering / 100,
                        WEEKLY_DATA.breakdown.focus / 100,
                        WEEKLY_DATA.breakdown.consistency / 100,
                      ];
                      const x = cx + r * scales[idx] * Math.cos(angle);
                      const y = cy + r * scales[idx] * Math.sin(angle);
                      return <Circle key={idx} cx={x} cy={y} r="3.5" fill="#22c55e" />;
                    })}

                    {/* Corner Labels inside Svg */}
                    {/* Top: Braking */}
                    <SvgText x={cx} y="11" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">Braking</SvgText>
                    <SvgText x={cx} y="20" fill="#00f5ff" fontSize="8" textAnchor="middle">88%</SvgText>

                    {/* Right-Top: Acceleration */}
                    <SvgText x={cx + r + 5} y={cy - 12} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="start">Acceleration</SvgText>
                    <SvgText x={cx + r + 5} y={cy - 3} fill="#00f5ff" fontSize="8" textAnchor="start">85%</SvgText>

                    {/* Right-Bottom: Steering */}
                    <SvgText x={cx + r - 8} y={cy + r + 10} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="start">Steering</SvgText>
                    <SvgText x={cx + r - 8} y={cy + r + 19} fill="#00f5ff" fontSize="8" textAnchor="start">83%</SvgText>

                    {/* Left-Bottom: Focus */}
                    <SvgText x={cx - r + 8} y={cy + r + 10} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">Focus</SvgText>
                    <SvgText x={cx - r + 8} y={cy + r + 19} fill="#00f5ff" fontSize="8" textAnchor="end">90%</SvgText>

                    {/* Left-Top: Consistency */}
                    <SvgText x={cx - r - 5} y={cy - 12} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">Consistency</SvgText>
                    <SvgText x={cx - r - 5} y={cy - 3} fill="#00f5ff" fontSize="8" textAnchor="end">87%</SvgText>
                  </Svg>
                </View>
              </View>
            </View>

            {/* WEEKLY INSIGHTS PANEL CARD */}
            <TouchableOpacity 
              style={styles.insightsPanelCard}
              onPress={() => router.push('/ai-coach')}
            >
              <View style={styles.insightsLeft}>
                <View style={styles.trophyIconOuter}>
                  <View style={styles.trophyIconInner}>
                    <FontAwesome5 name="trophy" size={18} color="#00f5ff" />
                  </View>
                </View>
                <View style={styles.insightsTextCol}>
                  <Text style={styles.insightTitle}>WEEKLY INSIGHTS</Text>
                  <Text style={styles.insightMain}>{WEEKLY_DATA.insight.title}</Text>
                  <Text style={styles.insightDesc}>{WEEKLY_DATA.insight.desc}</Text>
                </View>
              </View>

              <View style={styles.insightsRight}>
                <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                  <Text style={styles.insPerfText}>Top Performance</Text>
                  <Text style={styles.insDateText}>{WEEKLY_DATA.insight.topPerformance}</Text>
                </View>
                <View style={styles.insightScoreCircle}>
                  <Text style={styles.insightScoreVal}>{WEEKLY_DATA.insight.topScore}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#64748b" style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ==================== MONTH TAB ==================== */}
        {activeTab === 'month' && (
          <View>
            {/* MONTHLY OVERVIEW SECTION */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="trending-up" size={16} color="#00f5ff" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>MONTHLY OVERVIEW</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                <Feather name="calendar" size={12} color="#64748b" style={{ marginRight: 5 }} />
                <Text style={styles.sectionHeaderTime}>{MONTHLY_DATA.dateRange}</Text>
              </View>
            </View>

            {/* Monthly wide-format Metric Cards */}
            {MONTHLY_DATA.metrics.map((metric, idx) => (
              <View key={idx} style={styles.metricCardWide}>
                <View style={styles.metricWideLeft}>
                  <View style={styles.metricCardHeader}>
                    <MaterialCommunityIcons name={metric.icon as any} size={18} color={metric.color} style={{ marginRight: 8 }} />
                    <Text style={styles.metricCardLabel}>{metric.label}</Text>
                  </View>
                  <Text style={styles.metricCardValue}>{metric.val}</Text>
                  <Text style={[styles.metricCardSub, metric.label === 'Avg Safe Score' && { color: '#22c55e', fontWeight: 'bold' }]}>
                    {metric.sub}
                  </Text>
                  <Text style={styles.metricCardDiff}>{metric.diff}</Text>
                </View>

                {/* Vector SVG Mini graph on the right */}
                <View style={styles.metricWideRight}>
                  <Svg width={80} height={50} viewBox="0 0 80 50">
                    {metric.miniChart.map((hVal, hIdx) => {
                      const barW = 8;
                      const gap = 4;
                      const x = 15 + hIdx * (barW + gap);
                      const maxMini = Math.max(...metric.miniChart);
                      const barH = (hVal / maxMini) * 35;
                      const y = 45 - barH;
                      return (
                        <Rect 
                          key={hIdx} 
                          x={x} y={y} 
                          width={barW} height={barH} 
                          rx="2" 
                          fill={hIdx === 4 ? '#00f5ff' : '#122540'} 
                        />
                      );
                    })}
                  </Svg>
                </View>
              </View>
            ))}

            {/* SCORE TREND (MONTHLY) SECTION */}
            <View style={styles.panelCard}>
              <View style={styles.panelHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="activity" size={15} color="#00f5ff" style={{ marginRight: 8 }} />
                  <Text style={styles.panelTitle}>SCORE TREND (MONTHLY)</Text>
                </View>
              </View>

              {/* Vector SVG Monthly Line Chart */}
              <View style={styles.chartContainer}>
                <Svg width={width - 56} height={160} viewBox={`0 0 ${width - 56} 160`}>
                  <Defs>
                    <SvgLinearGradient id="chartMonthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#00f5ff" stopOpacity="0.25" />
                      <Stop offset="100%" stopColor="#00f5ff" stopOpacity="0.0" />
                    </SvgLinearGradient>
                  </Defs>
                  
                  {/* Grid Lines */}
                  <Line x1="40" y1="20" x2={width - 96} y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <Line x1="40" y1="50" x2={width - 96} y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <Line x1="40" y1="80" x2={width - 96} y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <Line x1="40" y1="110" x2={width - 96} y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  {/* Y Ticks */}
                  <SvgText x="25" y="24" fill="#64748b" fontSize="9" textAnchor="end">100</SvgText>
                  <SvgText x="25" y="54" fill="#64748b" fontSize="9" textAnchor="end">75</SvgText>
                  <SvgText x="25" y="84" fill="#64748b" fontSize="9" textAnchor="end">50</SvgText>
                  <SvgText x="25" y="114" fill="#64748b" fontSize="9" textAnchor="end">25</SvgText>
                  <SvgText x="25" y="140" fill="#64748b" fontSize="9" textAnchor="end">0</SvgText>

                  {/* Right Zone Labels */}
                  <SvgText x={width - 90} y="24" fill="#22c55e" fontSize="9" fontWeight="bold">Excellent</SvgText>
                  <SvgText x={width - 90} y="54" fill="#00f5ff" fontSize="9" fontWeight="bold">Good</SvgText>
                  <SvgText x={width - 90} y="84" fill="#eab308" fontSize="9" fontWeight="bold">Fair</SvgText>
                  <SvgText x={width - 90} y="114" fill="#ef4444" fontSize="9" fontWeight="bold">Poor</SvgText>

                  {/* Area fill */}
                  <Path 
                    d={getAreaChartPath(MONTHLY_DATA.trend.points, width - 56, 160, 40)} 
                    fill="url(#chartMonthGrad)"
                  />

                  {/* Line stroke */}
                  <Path 
                    d={getLineChartPath(MONTHLY_DATA.trend.points, width - 56, 160, 40)} 
                    stroke="#00f5ff" 
                    strokeWidth="2.5" 
                    fill="none" 
                  />

                  {/* Points and labels */}
                  {MONTHLY_DATA.trend.points.map((val, idx) => {
                    const usableWidth = (width - 56) - 80;
                    const x = 40 + (idx / 4) * usableWidth;
                    const y = 160 - 25 - (val / 100) * 110;
                    
                    const textLabel = MONTHLY_DATA.trend.labels[idx].split('\n')[0];
                    const textSub = MONTHLY_DATA.trend.labels[idx].split('\n')[1];

                    return (
                      <React.Fragment key={idx}>
                        <Circle cx={x} cy={y} r="4.5" fill="#00f5ff" stroke="#050B14" strokeWidth="1.5" />
                        
                        {idx !== 4 && (
                          <SvgText x={x} y={y - 10} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {val}
                          </SvgText>
                        )}

                        {/* Bottom date lines */}
                        <SvgText x={x} y="145" fill="#64748b" fontSize="8" textAnchor="middle">{textLabel}</SvgText>
                        <SvgText x={x} y="155" fill="#475569" fontSize="7" textAnchor="middle">{textSub}</SvgText>
                      </React.Fragment>
                    );
                  })}

                  {/* End highlight bubble for Wk 5 */}
                  {(() => {
                    const usableWidth = (width - 56) - 80;
                    const x = 40 + 4 * usableWidth;
                    const y = 160 - 25 - (90 / 100) * 110;
                    return (
                      <React.Fragment>
                        <Rect x={x - 12} y={y - 25} width="24" height="15" rx="4" fill="#a3e635" />
                        <SvgText x={x} y={y - 14} fill="#050B14" fontSize="9" fontWeight="bold" textAnchor="middle">
                          90
                        </SvgText>
                        <Circle cx={x} cy={y} r="6" fill="#a3e635" stroke="#050B14" strokeWidth="2" />
                      </React.Fragment>
                    );
                  })()}
                </Svg>
              </View>
            </View>
          </View>
        )}

        {/* ==================== YEAR TAB ==================== */}
        {activeTab === 'year' && (
          <View>
            {/* YEARLY OVERVIEW SECTION */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="trending-up" size={16} color="#00f5ff" style={{ marginRight: 8 }} />
                <Text style={styles.sectionTitle}>YEARLY OVERVIEW</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                <Feather name="calendar" size={12} color="#64748b" style={{ marginRight: 5 }} />
                <Text style={styles.sectionHeaderTime}>{YEARLY_DATA.dateRange}</Text>
              </View>
            </View>

            {/* Metric Grid Cards */}
            <View style={styles.metricsGridContainer}>
              {YEARLY_DATA.metrics.map((metric, idx) => (
                <View key={idx} style={styles.metricCard}>
                  <View style={styles.metricCardHeader}>
                    <MaterialCommunityIcons name={metric.icon as any} size={18} color={metric.color} />
                    <Text style={styles.metricCardLabel} numberOfLines={1}>{metric.label}</Text>
                  </View>
                  <Text style={styles.metricCardValue}>{metric.val}</Text>
                  <Text style={[styles.metricCardSub, metric.label === 'Avg Safe Score' && { color: '#22c55e', fontWeight: 'bold' }]}>
                    {metric.sub}
                  </Text>
                  <Text style={styles.metricCardDiff}>{metric.diff}</Text>
                </View>
              ))}
            </View>

            {/* SCORE TREND (YEARLY) SECTION */}
            <View style={styles.panelCard}>
              <View style={styles.panelHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="activity" size={15} color="#00f5ff" style={{ marginRight: 8 }} />
                  <Text style={styles.panelTitle}>SCORE TREND (YEARLY)</Text>
                </View>
                <Text style={styles.panelHeaderRightLabel}>Year Avg: {YEARLY_DATA.avgScore}</Text>
              </View>

              {/* Vector SVG Yearly Line Chart */}
              <View style={styles.chartContainer}>
                <Svg width={width - 56} height={150} viewBox={`0 0 ${width - 56} 150`}>
                  <Defs>
                    <SvgLinearGradient id="chartYearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#00f5ff" stopOpacity="0.25" />
                      <Stop offset="100%" stopColor="#00f5ff" stopOpacity="0.0" />
                    </SvgLinearGradient>
                  </Defs>
                  
                  {/* Grid Lines */}
                  <Line x1="40" y1="20" x2={width - 96} y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <Line x1="40" y1="50" x2={width - 96} y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <Line x1="40" y1="80" x2={width - 96} y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <Line x1="40" y1="110" x2={width - 96} y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  {/* Y Axis ticks */}
                  <SvgText x="25" y="24" fill="#64748b" fontSize="9" textAnchor="end">100</SvgText>
                  <SvgText x="25" y="54" fill="#64748b" fontSize="9" textAnchor="end">75</SvgText>
                  <SvgText x="25" y="84" fill="#64748b" fontSize="9" textAnchor="end">50</SvgText>
                  <SvgText x="25" y="114" fill="#64748b" fontSize="9" textAnchor="end">25</SvgText>
                  <SvgText x="25" y="140" fill="#64748b" fontSize="9" textAnchor="end">0</SvgText>

                  {/* Right Zone Indicator Labels */}
                  <SvgText x={width - 90} y="24" fill="#22c55e" fontSize="9" fontWeight="bold">Excellent</SvgText>
                  <SvgText x={width - 90} y="54" fill="#00f5ff" fontSize="9" fontWeight="bold">Good</SvgText>
                  <SvgText x={width - 90} y="84" fill="#eab308" fontSize="9" fontWeight="bold">Fair</SvgText>
                  <SvgText x={width - 90} y="114" fill="#ef4444" fontSize="9" fontWeight="bold">Poor</SvgText>

                  {/* Area fill */}
                  <Path 
                    d={getAreaChartPath(YEARLY_DATA.trend.points, width - 56, 150, 40)} 
                    fill="url(#chartYearGrad)"
                  />

                  {/* Stroke line path */}
                  <Path 
                    d={getLineChartPath(YEARLY_DATA.trend.points, width - 56, 150, 40)} 
                    stroke="#00f5ff" 
                    strokeWidth="2.5" 
                    fill="none" 
                  />

                  {/* Points and ticks */}
                  {YEARLY_DATA.trend.points.map((val, idx) => {
                    const usableWidth = (width - 56) - 80;
                    const x = 40 + (idx / 11) * usableWidth;
                    const y = 150 - 20 - (val / 100) * 110;
                    return (
                      <React.Fragment key={idx}>
                        <Circle cx={x} cy={y} r="4" fill="#00f5ff" stroke="#050B14" strokeWidth="1.5" />
                        
                        {idx !== 11 && idx % 2 === 0 && (
                          <SvgText x={x} y={y - 10} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {val}
                          </SvgText>
                        )}

                        {/* Bottom Month labels */}
                        <SvgText x={x} y="145" fill="#64748b" fontSize="8" textAnchor="middle">
                          {YEARLY_DATA.trend.labels[idx]}
                        </SvgText>
                      </React.Fragment>
                    );
                  })}

                  {/* Highlight bubble for Dec */}
                  {(() => {
                    const usableWidth = (width - 56) - 80;
                    const x = 40 + 11 * usableWidth;
                    const y = 150 - 20 - (92 / 100) * 110;
                    return (
                      <React.Fragment>
                        <Rect x={x - 12} y={y - 25} width="24" height="15" rx="4" fill="#a3e635" />
                        <SvgText x={x} y={y - 14} fill="#050B14" fontSize="9" fontWeight="bold" textAnchor="middle">
                          92
                        </SvgText>
                        <Circle cx={x} cy={y} r="6" fill="#a3e635" stroke="#050B14" strokeWidth="2" />
                      </React.Fragment>
                    );
                  })()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  scrollView: {
    flex: 1,
    marginBottom: 90, // Ends exactly above the floating tab bar
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
  headerMenuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
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
    color: '#00f5ff',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  headerRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 13,
    right: 14,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#f59e0b',
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs selector styling
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 15, 26, 0.8)',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 14,
    marginHorizontal: 20,
    marginVertical: 14,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 10,
  },
  activeTabItem: {
    backgroundColor: '#0c1626',
  },
  tabText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#00f5ff',
  },
  tabGlowUnderline: {
    position: 'absolute',
    bottom: -4,
    width: 28,
    height: 2,
    backgroundColor: '#00f5ff',
    borderRadius: 1,
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  bottomSpacer: {
    height: 40,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderTime: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '500',
  },

  // Metrics Grid Cards
  metricsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricCardLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  metricCardValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  metricCardSub: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
    marginBottom: 6,
  },
  metricCardDiff: {
    color: '#22c55e',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Score Trend Panel Card
  panelCard: {
    backgroundColor: 'rgba(8, 15, 26, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#122540',
    padding: 16,
    marginBottom: 15,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  panelTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  panelHeaderRightLabel: {
    color: '#00f5ff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Side by Side Cards
  twoCardsRow: {
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
  panelTitleSmall: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Donut chart layout
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donutContainer: {
    position: 'relative',
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutScoreVal: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  donutScoreLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '500',
  },
  donutLegendCol: {
    flex: 1,
    marginLeft: 10,
  },
  donutLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  donutLegendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  legendLabelText: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: 'bold',
  },
  legendValText: {
    color: '#475569',
    fontSize: 7,
    fontWeight: 'bold',
    marginTop: 1,
  },

  // Radar chart layout
  radarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginTop: -8,
  },

  // Insights Panel Card
  insightsPanelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 245, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.15)',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
  },
  insightsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  trophyIconOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 245, 255, 0.3)',
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trophyIconInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0c1626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsTextCol: {
    flex: 1,
  },
  insightTitle: {
    color: '#00f5ff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  insightMain: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  insightDesc: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 14,
  },
  insightsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insPerfText: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '500',
  },
  insDateText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  insightScoreCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightScoreVal: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  // Monthly wide card style
  metricCardWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  metricWideLeft: {
    flex: 1,
  },
  metricWideRight: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
});
