import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon, Text as SvgText, Rect } from 'react-native-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAnalyticsStore } from '../../src/store/analyticsStore';
import { driveRepository } from '../../src/database/repositories/driveRepository';
import dayjs from 'dayjs';
import { useAppTheme } from '../../src/ui/theme';

const { width } = Dimensions.get('window');

// Dynamic data ranges will be generated inside the component using dayjs and drive store/repository.

export default function DashboardScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors);
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>('week');
  const [selectedDate, setSelectedDate] = useState(() => dayjs());

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

  const drives = useMemo(() => driveRepository.getAllDrives(), [totalDrives]);
  const today = selectedDate;

  const isNextDisabled = useMemo(() => {
    const now = dayjs();
    if (activeTab === 'week') {
      return selectedDate.isSame(now, 'day') || selectedDate.isAfter(now, 'day');
    }
    if (activeTab === 'month') {
      return selectedDate.isSame(now, 'month') || selectedDate.isAfter(now, 'month');
    }
    if (activeTab === 'year') {
      return selectedDate.isSame(now, 'year') || selectedDate.isAfter(now, 'year');
    }
    return false;
  }, [selectedDate, activeTab]);

  const handlePrevDate = useCallback(() => {
    if (activeTab === 'week') {
      setSelectedDate(prev => prev.subtract(7, 'day'));
    } else if (activeTab === 'month') {
      setSelectedDate(prev => prev.subtract(1, 'month'));
    } else if (activeTab === 'year') {
      setSelectedDate(prev => prev.subtract(1, 'year'));
    }
  }, [activeTab]);

  const handleNextDate = useCallback(() => {
    if (isNextDisabled) return;
    if (activeTab === 'week') {
      setSelectedDate(prev => prev.add(7, 'day'));
    } else if (activeTab === 'month') {
      setSelectedDate(prev => prev.add(1, 'month'));
    } else if (activeTab === 'year') {
      setSelectedDate(prev => prev.add(1, 'year'));
    }
  }, [activeTab, isNextDisabled]);

  // Reset selectedDate when activeTab changes to avoid confusion
  React.useEffect(() => {
    setSelectedDate(dayjs());
  }, [activeTab]);

  // Dynamic Weekly Data
  const WEEKLY_DATA = useMemo(() => {
    const startOfWeek = today.subtract(6, 'day').startOf('day');
    const endOfWeek = today.endOf('day');
    const weeklyDrives = drives.filter(d => {
      const driveTime = dayjs(d.startTime);
      return (driveTime.isAfter(startOfWeek) || driveTime.isSame(startOfWeek)) &&
             (driveTime.isBefore(endOfWeek) || driveTime.isSame(endOfWeek));
    });
    const totalWkDrives = weeklyDrives.length;

    // Averages
    const avgScore = totalWkDrives > 0
      ? Math.round(weeklyDrives.reduce((sum, d) => sum + d.score, 0) / totalWkDrives)
      : 0;
    const totalDistanceKm = weeklyDrives.reduce((sum, d) => sum + (d.distance || 0), 0) / 1000;
    const totalDurationSec = weeklyDrives.reduce((sum, d) => sum + (d.duration || 0), 0);
    
    // Formatting duration
    const hrs = Math.floor(totalDurationSec / 3600);
    const mins = Math.floor((totalDurationSec % 3600) / 60);
    const secs = totalDurationSec % 60;
    const durationString = [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');

    // Violations & Breakdown
    let brakes = 0;
    let accels = 0;
    let steering = 0;
    let focus = 0;

    weeklyDrives.forEach(d => {
      if (d.events) {
        d.events.forEach(e => {
          if (e.type === 'HARSH_BRAKE') brakes++;
          else if (e.type === 'HARSH_ACCELERATION') accels++;
          else if (e.type === 'SHARP_TURN' || e.type === 'AGGRESSIVE_STEERING') steering++;
          else if (e.type === 'PHONE_USAGE') focus++;
        });
      }
    });

    const brakingBreakdown = totalWkDrives > 0 ? Math.max(0, 100 - brakes * 10) : 0;
    const accelerationBreakdown = totalWkDrives > 0 ? Math.max(0, 100 - accels * 10) : 0;
    const steeringBreakdown = totalWkDrives > 0 ? Math.max(0, 100 - steering * 10) : 0;
    const focusBreakdown = totalWkDrives > 0 ? Math.max(0, 100 - focus * 15) : 0;
    const consistencyBreakdown = totalWkDrives > 0 
      ? Math.round((brakingBreakdown + accelerationBreakdown + steeringBreakdown + focusBreakdown) / 4)
      : 0;

    // Trend points (past 7 days)
    const trendLabels = Array.from({ length: 7 }).map((_, i) => today.subtract(6 - i, 'day').format('MMM DD'));
    const trendPoints = Array.from({ length: 7 }).map((_, i) => {
      const day = today.subtract(6 - i, 'day');
      const dayDrives = weeklyDrives.filter(d => dayjs(d.startTime).isSame(day, 'day'));
      return dayDrives.length > 0
        ? Math.round(dayDrives.reduce((sum, d) => sum + d.score, 0) / dayDrives.length)
        : 0; // Black / empty
    });

    // Donut Segments
    const excelCount = weeklyDrives.filter(d => d.score >= 80).length;
    const goodCount = weeklyDrives.filter(d => d.score >= 60 && d.score < 80).length;
    const fairCount = weeklyDrives.filter(d => d.score >= 40 && d.score < 60).length;
    const poorCount = weeklyDrives.filter(d => d.score < 40).length;

    const donutSegments = [
      { label: `Excellent (80-100)`, count: excelCount, pct: totalWkDrives > 0 ? Math.round((excelCount / totalWkDrives) * 100) : 0, color: '#22c55e' },
      { label: `Good (60-79)`, count: goodCount, pct: totalWkDrives > 0 ? Math.round((goodCount / totalWkDrives) * 100) : 0, color: '#00f5ff' },
      { label: `Fair (40-59)`, count: fairCount, pct: totalWkDrives > 0 ? Math.round((fairCount / totalWkDrives) * 100) : 0, color: '#eab308' },
      { label: `Poor (<40)`, count: poorCount, pct: totalWkDrives > 0 ? Math.round((poorCount / totalWkDrives) * 100) : 0, color: '#ef4444' },
    ];

    // Insight
    const topWkScore = weeklyDrives.length > 0 ? Math.max(...weeklyDrives.map(d => d.score)) : 0;
    const topWkDrive = weeklyDrives.find(d => d.score === topWkScore);
    const topWkDate = topWkDrive ? dayjs(topWkDrive.startTime).format('MMM DD, YYYY') : '--';

    return {
      dateRange: today.subtract(6, 'day').format('MMM DD') + ' – ' + today.format('MMM DD, YYYY'),
      avgScore,
      totalDrives: totalWkDrives,
      totalDistance: totalDistanceKm.toFixed(1),
      totalDuration: durationString,
      metrics: [
        { label: 'Avg Safe Score', val: totalWkDrives > 0 ? avgScore.toString() : '--', sub: totalWkDrives > 0 ? (avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Fair') : 'No Data', diff: totalWkDrives > 0 ? `${totalWkDrives} drives analyzed` : 'No drives recorded', icon: 'shield-check-outline', color: '#22c55e' },
        { label: 'Total Drives', val: totalWkDrives.toString(), sub: 'Drives', diff: 'In the past 7 days', icon: 'steering', color: '#00f5ff' },
        { label: 'Total Distance', val: totalDistanceKm.toFixed(1), sub: 'km', diff: 'Accumulated distance', icon: 'map-marker-outline', color: '#00f5ff' },
        { label: 'Total Duration', val: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`, sub: 'hr', diff: 'Time behind the wheel', icon: 'clock-outline', color: '#00f5ff' },
      ],
      trend: {
        points: trendPoints,
        labels: trendLabels,
      },
      donut: {
        total: totalWkDrives,
        segments: donutSegments,
      },
      breakdown: {
        braking: brakingBreakdown,
        acceleration: accelerationBreakdown,
        steering: steeringBreakdown,
        focus: focusBreakdown,
        consistency: consistencyBreakdown,
      },
      insight: {
        title: totalWkDrives > 0 ? 'Great work, Himanshu! 🎉' : 'No Drives Recorded 🚗',
        desc: totalWkDrives > 0 ? 'Your driving profile is generated based on recent trips.' : 'Start driving with SafeDrive tracking to see weekly safety breakdown and insights.',
        topPerformance: topWkDate,
        topScore: topWkScore > 0 ? topWkScore : '--',
      }
    };
  }, [drives, selectedDate]);

  // Dynamic Monthly Data
  const MONTHLY_DATA = useMemo(() => {
    const monthlyDrives = drives.filter(d => dayjs(d.startTime).isSame(today, 'month'));
    const totalMoDrives = monthlyDrives.length;

    const avgScore = totalMoDrives > 0
      ? Math.round(monthlyDrives.reduce((sum, d) => sum + d.score, 0) / totalMoDrives)
      : 0;
    const totalDistanceKm = monthlyDrives.reduce((sum, d) => sum + (d.distance || 0), 0) / 1000;
    
    // Split into 5 weeks
    const trendPoints = [1, 2, 3, 4, 5].map(wkNum => {
      const wkDrives = monthlyDrives.filter(d => {
        const date = dayjs(d.startTime).date();
        if (wkNum === 1) return date >= 1 && date <= 7;
        if (wkNum === 2) return date >= 8 && date <= 14;
        if (wkNum === 3) return date >= 15 && date <= 21;
        if (wkNum === 4) return date >= 22 && date <= 28;
        return date >= 29;
      });
      return wkDrives.length > 0
        ? Math.round(wkDrives.reduce((sum, d) => sum + d.score, 0) / wkDrives.length)
        : 0; // Black / empty
    });

    const monthName = today.format('MMM');
    const daysInMonth = today.daysInMonth();
    const trendLabels = [
      `Wk 1\n${monthName} 1-7`,
      `Wk 2\n${monthName} 8-14`,
      `Wk 3\n${monthName} 15-21`,
      `Wk 4\n${monthName} 22-28`,
      `Wk 5\n${monthName} 29-${daysInMonth}`
    ];

    // Mini charts values
    const prevMonthName = today.subtract(1, 'month').format('MMM YYYY');
    const scoreHistory = [0, 0, 0, 0, avgScore];
    const distHistory = [0, 0, 0, 0, Math.round(totalDistanceKm)];
    const countHistory = [0, 0, 0, 0, totalMoDrives];

    return {
      dateRange: today.format('MMMM YYYY'),
      avgScore,
      totalDistance: totalDistanceKm.toFixed(1),
      totalDrives: totalMoDrives,
      metrics: [
        { label: 'Avg Safe Score', val: totalMoDrives > 0 ? avgScore.toString() : '--', sub: totalMoDrives > 0 ? (avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Fair') : 'No Data', diff: `Monthly safety rating vs ${prevMonthName}`, icon: 'shield-check-outline', color: '#22c55e', miniChart: scoreHistory },
        { label: 'Total Distance', val: totalDistanceKm.toFixed(1), sub: 'km', diff: `Distance logged vs ${prevMonthName}`, icon: 'map-marker-outline', color: '#00f5ff', miniChart: distHistory },
        { label: 'Total Drives', val: totalMoDrives.toString(), sub: 'Drives', diff: `Drives recorded vs ${prevMonthName}`, icon: 'steering', color: '#00f5ff', miniChart: countHistory },
      ],
      trend: {
        points: trendPoints,
        labels: trendLabels,
      }
    };
  }, [drives, selectedDate]);

  // Dynamic Yearly Data
  const YEARLY_DATA = useMemo(() => {
    const yearlyDrives = drives.filter(d => dayjs(d.startTime).isSame(today, 'year'));
    const totalYrDrives = yearlyDrives.length;

    const avgScore = totalYrDrives > 0
      ? Math.round(yearlyDrives.reduce((sum, d) => sum + d.score, 0) / totalYrDrives)
      : 0;
    const totalDistanceKm = yearlyDrives.reduce((sum, d) => sum + (d.distance || 0), 0) / 1000;
    const totalDurationSec = yearlyDrives.reduce((sum, d) => sum + (d.duration || 0), 0);
    const hrs = Math.floor(totalDurationSec / 3600);
    const mins = Math.floor((totalDurationSec % 3600) / 60);

    const trendPoints = Array.from({ length: 12 }).map((_, idx) => {
      const mDrives = yearlyDrives.filter(d => dayjs(d.startTime).month() === idx);
      return mDrives.length > 0
        ? Math.round(mDrives.reduce((sum, d) => sum + d.score, 0) / mDrives.length)
        : 0; // Black / empty
    });

    const prevYear = today.year() - 1;

    return {
      dateRange: 'Jan 1 – Dec 31, ' + today.format('YYYY'),
      avgScore,
      totalDrives: totalYrDrives,
      totalDistance: totalDistanceKm.toFixed(1),
      totalDuration: `${hrs}h ${mins}m`,
      metrics: [
        { label: 'Avg Safe Score', val: totalYrDrives > 0 ? avgScore.toString() : '--', sub: totalYrDrives > 0 ? (avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Fair') : 'No Data', diff: `Yearly rating vs ${prevYear}`, icon: 'shield-check-outline', color: '#22c55e' },
        { label: 'Total Drives', val: totalYrDrives.toString(), sub: 'Drives', diff: `Drives vs ${prevYear}`, icon: 'steering', color: '#00f5ff' },
        { label: 'Total Distance', val: totalDistanceKm.toFixed(1), sub: 'km', diff: `Distance vs ${prevYear}`, icon: 'map-marker-outline', color: '#00f5ff' },
        { label: 'Total Duration', val: `${hrs}h ${mins}m`, sub: 'hr', diff: `Time behind wheel vs ${prevYear}`, icon: 'clock-outline', color: '#00f5ff' },
      ],
      trend: {
        points: trendPoints,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      }
    };
  }, [drives, selectedDate]);

  const currentDateRangeString = useMemo(() => {
    if (activeTab === 'week') return WEEKLY_DATA.dateRange;
    if (activeTab === 'month') return MONTHLY_DATA.dateRange;
    return YEARLY_DATA.dateRange;
  }, [activeTab, WEEKLY_DATA.dateRange, MONTHLY_DATA.dateRange, YEARLY_DATA.dateRange]);

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
  const cx = 110;
  const cy = 80;
  const r = 46;
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Drive Dashboard</Text>
          <Text style={styles.headerSubtitle}>Your driving insights at a glance</Text>
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

      {/* Premium Date Navigation Bar */}
      <View style={styles.dateNavigationContainer}>
        <TouchableOpacity onPress={handlePrevDate} style={styles.dateNavBtn}>
          <Feather name="chevron-left" size={18} color="#00f5ff" />
        </TouchableOpacity>
        <View style={styles.dateLabelContainer}>
          <Feather name="calendar" size={14} color="#64748b" style={{ marginRight: 6 }} />
          <Text style={styles.dateRangeText}>{currentDateRangeString}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleNextDate} 
          style={styles.dateNavBtn} 
          disabled={isNextDisabled}
        >
          <Feather name="chevron-right" size={18} color={isNextDisabled ? "#1e293b" : "#00f5ff"} />
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
            <View style={styles.metricsGridContainer}>
              {WEEKLY_DATA.metrics.map((metric, idx) => (
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
                <Text style={[styles.metricCardValue, { color: '#ffffff' }]}>{totalDrives > 0 ? bestScore : '--'}</Text>
                <Text style={[styles.metricCardSub, { color: '#eab308' }]}>Highest safety rating</Text>
                <Text style={[styles.metricCardDiff, { color: '#a3e635' }]}>All-time record 🏆</Text>
              </View>

              {/* Card 2: Total Violations */}
              <View style={[styles.metricCard, { borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
                <View style={styles.metricCardHeader}>
                  <Feather name="alert-triangle" size={16} color="#ef4444" />
                  <Text style={[styles.metricCardLabel, { color: '#ef4444', fontWeight: 'bold' }]} numberOfLines={1}>Total Violations</Text>
                </View>
                <Text style={[styles.metricCardValue, { color: '#ffffff' }]}>{totalDrives > 0 ? totalEvents : 0}</Text>
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
                        <Circle cx={x} cy={y} r="4.5" fill="#00f5ff" stroke={colors.card} strokeWidth="1.5" />
                        
                        {/* Value text above point */}
                        {idx !== 6 && (
                          <SvgText x={x} y={y - 10} fill={colors.text} fontSize="9" fontWeight="bold" textAnchor="middle">
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
                  {WEEKLY_DATA.totalDrives > 0 && (() => {
                    const lastVal = WEEKLY_DATA.trend.points[WEEKLY_DATA.trend.points.length - 1];
                    const usableWidth = (width - 56) - 80;
                    const x = 40 + 6 * usableWidth;
                    const y = 150 - 20 - (lastVal / 100) * 110;
                    return (
                      <React.Fragment>
                        <Rect x={x - 12} y={y - 25} width="24" height="15" rx="4" fill="#a3e635" />
                        <SvgText x={x} y={y - 14} fill="#050B14" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {lastVal}
                        </SvgText>
                        <Circle cx={x} cy={y} r="6" fill="#a3e635" stroke={colors.card} strokeWidth="2" />
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
                  <Svg width="100%" height={140} viewBox="0 0 220 160">
                    {/* Concentric grid pentagons */}
                    <Polygon points={getPentagonPoints(0.25)} stroke="rgba(0, 245, 255, 0.06)" strokeWidth="1" fill="none" />
                    <Polygon points={getPentagonPoints(0.50)} stroke="rgba(0, 245, 255, 0.06)" strokeWidth="1" fill="none" />
                    <Polygon points={getPentagonPoints(0.75)} stroke="rgba(0, 245, 255, 0.06)" strokeWidth="1" fill="none" />
                    <Polygon points={getPentagonPoints(1.00)} stroke="rgba(0, 245, 255, 0.12)" strokeWidth="1" fill="none" />

                    {/* Polygon spoke axes */}
                    {[-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5].map((angle, idx) => {
                      const x = cx + r * Math.cos(angle);
                      const y = cy + r * Math.sin(angle);
                      return <Line key={idx} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0, 245, 255, 0.08)" strokeWidth="1" />;
                    })}

                    {/* Active Radar Polygon fill (Double stroke layer for premium neon glow) */}
                    <Polygon 
                      points={getRadarPoints(WEEKLY_DATA.breakdown)} 
                      stroke="#22c55e" 
                      strokeWidth="4" 
                      strokeOpacity="0.3"
                      fill="none" 
                    />
                    <Polygon 
                      points={getRadarPoints(WEEKLY_DATA.breakdown)} 
                      stroke="#22c55e" 
                      strokeWidth="1.8" 
                      fill="rgba(34, 197, 94, 0.15)" 
                    />

                    {/* Data corner dots (Glowing green halo with white inner core) */}
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
                      return (
                        <React.Fragment key={idx}>
                          <Circle cx={x} cy={y} r="5" fill="#22c55e" opacity="0.35" />
                          <Circle cx={x} cy={y} r="2.2" fill="#ffffff" />
                        </React.Fragment>
                      );
                    })}

                    {/* Corner Labels inside Svg */}
                    {/* Top: Braking */}
                    <SvgText x={cx} y="13" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Braking</SvgText>
                    <SvgText x={cx} y="23" fill="#00f5ff" fontSize="9" textAnchor="middle">{WEEKLY_DATA.breakdown.braking}%</SvgText>

                    {/* Right-Top: Acceleration */}
                    <SvgText x={cx + r + 5} y={cy - 12} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="start">Acceleration</SvgText>
                    <SvgText x={cx + r + 5} y={cy - 2} fill="#00f5ff" fontSize="9" textAnchor="start">{WEEKLY_DATA.breakdown.acceleration}%</SvgText>

                    {/* Right-Bottom: Steering */}
                    <SvgText x={cx + r - 8} y={cy + r + 6} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="start">Steering</SvgText>
                    <SvgText x={cx + r - 8} y={cy + r + 16} fill="#00f5ff" fontSize="9" textAnchor="start">{WEEKLY_DATA.breakdown.steering}%</SvgText>

                    {/* Left-Bottom: Focus */}
                    <SvgText x={cx - r + 8} y={cy + r + 6} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="end">Focus</SvgText>
                    <SvgText x={cx - r + 8} y={cy + r + 16} fill="#00f5ff" fontSize="9" textAnchor="end">{WEEKLY_DATA.breakdown.focus}%</SvgText>

                    {/* Left-Top: Consistency */}
                    <SvgText x={cx - r - 5} y={cy - 12} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="end">Consistency</SvgText>
                    <SvgText x={cx - r - 5} y={cy - 2} fill="#00f5ff" fontSize="9" textAnchor="end">{WEEKLY_DATA.breakdown.consistency}%</SvgText>
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
                          fill={hIdx === 4 ? colors.accent : colors.border} 
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
                        <Circle cx={x} cy={y} r="4.5" fill="#00f5ff" stroke={colors.card} strokeWidth="1.5" />
                        
                        {idx !== 4 && (
                          <SvgText x={x} y={y - 10} fill={colors.text} fontSize="9" fontWeight="bold" textAnchor="middle">
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
                  {MONTHLY_DATA.totalDrives > 0 && (() => {
                    const lastVal = MONTHLY_DATA.trend.points[MONTHLY_DATA.trend.points.length - 1];
                    const usableWidth = (width - 56) - 80;
                    const x = 40 + 4 * usableWidth;
                    const y = 160 - 25 - (lastVal / 100) * 110;
                    return (
                      <React.Fragment>
                        <Rect x={x - 12} y={y - 25} width="24" height="15" rx="4" fill="#a3e635" />
                        <SvgText x={x} y={y - 14} fill="#050B14" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {lastVal}
                        </SvgText>
                        <Circle cx={x} cy={y} r="6" fill="#a3e635" stroke={colors.card} strokeWidth="2" />
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
                        <Circle cx={x} cy={y} r="4" fill="#00f5ff" stroke={colors.card} strokeWidth="1.5" />
                        
                        {idx !== 11 && idx % 2 === 0 && (
                          <SvgText x={x} y={y - 10} fill={colors.text} fontSize="9" fontWeight="bold" textAnchor="middle">
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
                  {YEARLY_DATA.totalDrives > 0 && (() => {
                    const lastVal = YEARLY_DATA.trend.points[YEARLY_DATA.trend.points.length - 1];
                    const usableWidth = (width - 56) - 80;
                    const x = 40 + 11 * usableWidth;
                    const y = 150 - 20 - (lastVal / 100) * 110;
                    return (
                      <React.Fragment>
                        <Rect x={x - 12} y={y - 25} width="24" height="15" rx="4" fill="#a3e635" />
                        <SvgText x={x} y={y - 14} fill="#050B14" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {lastVal}
                        </SvgText>
                        <Circle cx={x} cy={y} r="6" fill="#a3e635" stroke={colors.card} strokeWidth="2" />
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

function getStyles(colors: any) {
  const isDark = colors.background === '#050B14';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      marginBottom: 90, // Ends exactly above the floating tab bar
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 10,
      backgroundColor: colors.background,
    },
    headerMenuBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    headerSubtitle: {
      color: colors.accent,
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 4,
      marginHorizontal: 20,
      marginVertical: 15,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
      position: 'relative',
    },
    activeTabItem: {
      backgroundColor: colors.background,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabText: {
      color: colors.textSlate,
      fontSize: 12,
      fontWeight: 'bold',
    },
    activeTabText: {
      color: colors.accent,
    },
    tabGlowUnderline: {
      position: 'absolute',
      bottom: 2,
      width: 16,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.accent,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
    },
    scrollContent: {
      paddingBottom: 110,
    },
    metricsGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    metricCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 14,
      position: 'relative',
    },
    metricCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricCardLabel: {
      color: colors.textSlate,
      fontSize: 9.5,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      marginLeft: 6,
      flex: 1,
    },
    metricCardValue: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 5,
      marginBottom: 15,
    },
    sectionTitle: {
      color: colors.textSlate,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1.5,
    },
    sectionHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionHeaderTime: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '500',
    },

    // All-time highlights grid
    allTimeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 15,
    },
    highlightCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 14,
      position: 'relative',
    },
    hlIconOuter: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    hlVal: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    hlUnit: {
      color: colors.textSlate,
      fontSize: 9,
      fontWeight: '500',
    },
    hlLabel: {
      color: colors.textMuted,
      fontSize: 9.5,
      fontWeight: 'bold',
      marginTop: 4,
    },

    // Standard metric cards (Weekly/Monthly/Yearly)
    metricsGrid: {
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    metricCardHalf: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 14,
    },
    metricCardTitle: {
      color: colors.textSlate,
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 1,
      marginBottom: 8,
    },
    metricCardValRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    metricCardValText: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
    },
    metricCardUnitText: {
      color: colors.textSlate,
      fontSize: 9.5,
      marginLeft: 4,
      fontWeight: '500',
    },
    metricCardDiffRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    metricCardVal: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
      lineHeight: 24,
    },
    metricCardSub: {
      color: colors.textMuted,
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
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textSlate,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1.2,
    },
    panelHeaderRightLabel: {
      color: colors.accent,
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
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    panelTitleSmall: {
      color: colors.textSlate,
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
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
      lineHeight: 24,
    },
    donutScoreLabel: {
      color: colors.textSlate,
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
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: 'bold',
    },
    legendValText: {
      color: colors.textSlate,
      fontSize: 7,
      fontWeight: 'bold',
      marginTop: 1,
    },

    // Radar chart layout
    radarWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 140,
      marginTop: 0,
    },

    // Insights Panel Card
    insightsPanelCard: {
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
      marginRight: 10,
    },
    trophyIconOuter: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(0, 245, 255, 0.3)' : 'rgba(8, 145, 178, 0.3)',
      backgroundColor: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(8, 145, 178, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    trophyIconInner: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    insightsTextCol: {
      flex: 1,
    },
    insightTitle: {
      color: colors.accent,
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 1,
      marginBottom: 2,
    },
    insightMain: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    insightDesc: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 14,
    },
    insightsRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    insPerfText: {
      color: colors.textSlate,
      fontSize: 8,
      fontWeight: '500',
    },
    insDateText: {
      color: colors.text,
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
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
    },

    // Monthly wide card style
    metricCardWide: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
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
    dateNavigationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      marginHorizontal: 20,
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    dateNavBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateRangeText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    bottomSpacer: {
      height: 40,
    },
  });
}
