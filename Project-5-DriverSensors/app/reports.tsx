import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Line, Rect, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { driveRepository } from '../src/database/repositories/driveRepository';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

// Mock data for Weeks
const WEEKLY_REPORTS = [
  {
    dateRange: 'May 14 – May 20, 2025',
    avgScore: 84,
    avgScoreRating: 'Good',
    avgScoreDiff: '↑ 12%',
    totalDrives: 12,
    totalDrivesDiff: '↑ 2',
    totalDistance: '198.6',
    totalDistanceDiff: '↑ 18.4',
    totalDuration: '6h 42m',
    totalDurationDiff: '↑ 1h 05m',
    trendPoints: [68, 72, 78, 85, 81, 88, 92],
    trendLabels: ['May 14', 'May 15', 'May 16', 'May 17', 'May 18', 'May 19', 'May 20'],
    events: {
      harshBrakes: 8,
      harshBrakesDiff: '↓ 2',
      sharpTurns: 6,
      sharpTurnsDiff: '↓ 1',
      phoneUsage: 3,
      phoneUsageSec: 18,
      phoneUsageDiff: '↓ 2',
      steering: 4,
      steeringDiff: '↓ 1'
    },
    distribution: {
      highway: { count: 5, pct: 42 },
      city: { count: 4, pct: 33 },
      suburban: { count: 2, pct: 17 },
      night: { count: 1, pct: 8 }
    },
    improvements: {
      braking: 78,
      steering: 68,
      speed: 62,
      phone: 72
    },
    topDrives: [
      { id: 't1', score: 92, rating: 'Excellent', date: 'May 20, 08:15 PM', distance: '28.6', duration: '00:42:16' },
      { id: 't2', score: 90, rating: 'Excellent', date: 'May 19, 08:30 PM', distance: '27.4', duration: '00:40:12' },
      { id: 't3', score: 88, rating: 'Good', date: 'May 18, 07:10 PM', distance: '22.1', duration: '00:35:47' }
    ]
  },
  {
    dateRange: 'May 7 – May 13, 2025',
    avgScore: 78,
    avgScoreRating: 'Good',
    avgScoreDiff: '↑ 5%',
    totalDrives: 10,
    totalDrivesDiff: '↑ 1',
    totalDistance: '162.3',
    totalDistanceDiff: '↑ 12.5',
    totalDuration: '5h 12m',
    totalDurationDiff: '↑ 34m',
    trendPoints: [70, 75, 71, 74, 82, 79, 83],
    trendLabels: ['May 7', 'May 8', 'May 9', 'May 10', 'May 11', 'May 12', 'May 13'],
    events: {
      harshBrakes: 10,
      harshBrakesDiff: '↓ 1',
      sharpTurns: 7,
      sharpTurnsDiff: '↓ 2',
      phoneUsage: 5,
      phoneUsageSec: 32,
      phoneUsageDiff: '↓ 1',
      steering: 5,
      steeringDiff: '↑ 1'
    },
    distribution: {
      highway: { count: 4, pct: 40 },
      city: { count: 3, pct: 30 },
      suburban: { count: 2, pct: 20 },
      night: { count: 1, pct: 10 }
    },
    improvements: {
      braking: 72,
      steering: 64,
      speed: 59,
      phone: 65
    },
    topDrives: [
      { id: 't4', score: 85, rating: 'Good', date: 'May 11, 04:20 PM', distance: '24.2', duration: '00:36:10' },
      { id: 't5', score: 83, rating: 'Good', date: 'May 13, 08:45 PM', distance: '18.1', duration: '00:26:40' },
      { id: 't6', score: 82, rating: 'Good', date: 'May 11, 09:15 AM', distance: '21.5', duration: '00:32:05' }
    ]
  }
];

// Mock data for Months
const MONTHLY_REPORTS = [
  {
    dateRange: 'May 2025',
    avgScore: 82,
    avgScoreRating: 'Good',
    avgScoreDiff: '↑ 6%',
    totalDrives: 48,
    totalDrivesDiff: '↑ 8',
    totalDistance: '842.6',
    totalDistanceDiff: '↑ 94.2',
    totalDuration: '26h 15m',
    totalDurationDiff: '↑ 3h 20m',
    trendPoints: [75, 78, 80, 84, 82],
    trendLabels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'],
    events: {
      harshBrakes: 32,
      harshBrakesDiff: '↓ 8',
      sharpTurns: 24,
      sharpTurnsDiff: '↓ 5',
      phoneUsage: 12,
      phoneUsageSec: 78,
      phoneUsageDiff: '↓ 4',
      steering: 16,
      steeringDiff: '↓ 2'
    },
    distribution: {
      highway: { count: 21, pct: 44 },
      city: { count: 15, pct: 31 },
      suburban: { count: 8, pct: 17 },
      night: { count: 4, pct: 8 }
    },
    improvements: {
      braking: 80,
      steering: 71,
      speed: 65,
      phone: 78
    },
    topDrives: [
      { id: 'm1', score: 95, rating: 'Excellent', date: 'May 24, 11:15 AM', distance: '32.4', duration: '00:46:50' },
      { id: 'm2', score: 92, rating: 'Excellent', date: 'May 20, 08:15 PM', distance: '28.6', duration: '00:42:16' },
      { id: 'm3', score: 90, rating: 'Excellent', date: 'May 19, 08:30 PM', distance: '27.4', duration: '00:40:12' }
    ]
  },
  {
    dateRange: 'April 2025',
    avgScore: 76,
    avgScoreRating: 'Good',
    avgScoreDiff: '↑ 3%',
    totalDrives: 40,
    totalDrivesDiff: '↑ 4',
    totalDistance: '748.4',
    totalDistanceDiff: '↑ 62.8',
    totalDuration: '22h 55m',
    totalDurationDiff: '↑ 2h 10m',
    trendPoints: [72, 74, 76, 75, 78],
    trendLabels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'],
    events: {
      harshBrakes: 40,
      harshBrakesDiff: '↓ 3',
      sharpTurns: 29,
      sharpTurnsDiff: '↓ 2',
      phoneUsage: 16,
      phoneUsageSec: 104,
      phoneUsageDiff: '↓ 1',
      steering: 18,
      steeringDiff: '↑ 1'
    },
    distribution: {
      highway: { count: 16, pct: 40 },
      city: { count: 13, pct: 32 },
      suburban: { count: 7, pct: 18 },
      night: { count: 4, pct: 10 }
    },
    improvements: {
      braking: 74,
      steering: 66,
      speed: 60,
      phone: 71
    },
    topDrives: [
      { id: 'm4', score: 88, rating: 'Good', date: 'Apr 18, 06:10 PM', distance: '25.3', duration: '00:38:22' },
      { id: 'm5', score: 86, rating: 'Good', date: 'Apr 22, 09:15 AM', distance: '19.4', duration: '00:29:45' },
      { id: 'm6', score: 85, rating: 'Good', date: 'Apr 12, 08:30 PM', distance: '21.0', duration: '00:31:10' }
    ]
  }
];

export default function ReportsScreen() {
  const router = useRouter();
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [reportIndex, setReportIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Load actual DB drives
  const dbDrives = driveRepository.getAllDrives();

  // Get current active report data
  const reportData = useMemo(() => {
    const sourceList = reportType === 'weekly' ? WEEKLY_REPORTS : MONTHLY_REPORTS;
    // Bound the index
    const activeIdx = Math.min(Math.max(0, reportIndex), sourceList.length - 1);
    const mockReport = sourceList[activeIdx];

    // If database has drives, and we are viewing the latest report, we can dynamically override the stats!
    // This connects it beautifully to actual user telemetry.
    if (dbDrives.length > 5 && activeIdx === 0) {
      const dbScores = dbDrives.map(d => d.score);
      const avgDbScore = Math.round(dbScores.reduce((acc, s) => acc + s, 0) / dbScores.length);
      const rating = avgDbScore >= 90 ? 'Excellent' : avgDbScore >= 70 ? 'Good' : avgDbScore >= 60 ? 'Fair' : 'Poor';
      const totalDistanceVal = (dbDrives.reduce((acc, d) => acc + d.distance, 0) / 1000).toFixed(1);
      const totalDurationSec = dbDrives.reduce((acc, d) => acc + d.duration, 0);
      const totalDurationHrs = Math.floor(totalDurationSec / 3600);
      const totalDurationMins = Math.floor((totalDurationSec % 3600) / 60);

      // Build trend points from last 7 drives if weekly, or 5 averages if monthly
      let trendPoints = [...mockReport.trendPoints];
      if (reportType === 'weekly') {
        const last7Drives = [...dbDrives].slice(0, 7).reverse();
        trendPoints = last7Drives.map(d => d.score);
        while (trendPoints.length < 7) {
          trendPoints.unshift(70); // fill up to 7 items
        }
      }

      // Map top drives
      const topDrives = [...dbDrives]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((d, index) => ({
          id: d.id,
          score: d.score,
          rating: d.score >= 90 ? 'Excellent' : d.score >= 70 ? 'Good' : d.score >= 60 ? 'Fair' : 'Poor',
          date: dayjs(d.startTime).format('MMM DD, hh:mm A'),
          distance: (d.distance / 1000).toFixed(1),
          duration: formatHHMMSS(d.duration)
        }));

      return {
        ...mockReport,
        avgScore: avgDbScore,
        avgScoreRating: rating,
        totalDrives: dbDrives.length,
        totalDistance: totalDistanceVal,
        totalDuration: `${totalDurationHrs}h ${totalDurationMins}m`,
        trendPoints,
        topDrives: topDrives.length > 0 ? topDrives : mockReport.topDrives
      };
    }

    return mockReport;
  }, [reportType, reportIndex, dbDrives]);

  function formatHHMMSS(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Handle Left/Right Date navigation
  const handlePrevReport = () => {
    const listLen = reportType === 'weekly' ? WEEKLY_REPORTS.length : MONTHLY_REPORTS.length;
    if (reportIndex < listLen - 1) {
      setReportIndex(reportIndex + 1);
    }
  };

  const handleNextReport = () => {
    if (reportIndex > 0) {
      setReportIndex(reportIndex - 1);
    }
  };

  // Mock Export PDF Action
  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      Alert.alert(
        'Export Successful',
        `The ${reportType} report for ${reportData.dateRange} has been exported as PDF and saved to your Device Storage.`,
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  // Donut SVG constants
  const radius = 30;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * radius; // ~188.49

  // SVG Line Chart coordinates math
  const chartWidth = width - 40;
  const chartHeight = 150;
  const chartPadding = 25;

  const chartPaths = useMemo(() => {
    const pts = reportData.trendPoints;
    const usableWidth = chartWidth - chartPadding * 2;
    const usableHeight = chartHeight - chartPadding * 2;

    const coords = pts.map((val, idx) => {
      const x = chartPadding + (idx / (pts.length - 1)) * usableWidth;
      // Map 0-100 score to y (0 score = bottom of chart, 100 score = top)
      const y = chartHeight - chartPadding - ((val - 0) / 100) * usableHeight;
      return { x, y, val };
    });

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    const fillPath = coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(chartHeight - chartPadding).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(chartHeight - chartPadding).toFixed(1)} Z`
      : '';

    return { coords, linePath, fillPath };
  }, [reportData.trendPoints, chartWidth]);

  return (
    <View style={styles.container}>
      {/* 1. Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSubtitle}>Detailed insights of your driving</Text>
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={handleExportPDF} disabled={isExporting}>
          {isExporting ? (
            <Text style={[styles.exportText, { opacity: 0.6 }]}>Exporting...</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="file-pdf-box" size={18} color="#ef4444" style={{ marginRight: 6 }} />
              <Text style={styles.exportText}>Export PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Tabs Selector (Weekly vs Monthly) */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, reportType === 'weekly' && styles.activeTabBtn]}
            onPress={() => { setReportType('weekly'); setReportIndex(0); }}
          >
            <View style={styles.tabContentRow}>
              <MaterialCommunityIcons name="calendar-week" size={16} color={reportType === 'weekly' ? '#00f5ff' : '#94a3b8'} style={{ marginRight: 8 }} />
              <Text style={[styles.tabBtnText, reportType === 'weekly' && styles.activeTabBtnText]}>Weekly Report</Text>
            </View>
            {reportType === 'weekly' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, reportType === 'monthly' && styles.activeTabBtn]}
            onPress={() => { setReportType('monthly'); setReportIndex(0); }}
          >
            <View style={styles.tabContentRow}>
              <MaterialCommunityIcons name="calendar-month" size={16} color={reportType === 'monthly' ? '#00f5ff' : '#94a3b8'} style={{ marginRight: 8 }} />
              <Text style={[styles.tabBtnText, reportType === 'monthly' && styles.activeTabBtnText]}>Monthly Report</Text>
            </View>
            {reportType === 'monthly' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* 3. Date Range Navigation */}
        <View style={styles.dateNavRow}>
          <TouchableOpacity
            style={[styles.dateNavArrow, reportIndex === (reportType === 'weekly' ? WEEKLY_REPORTS.length - 1 : MONTHLY_REPORTS.length - 1) && styles.disabledDateNav]}
            onPress={handlePrevReport}
          >
            <Feather name="chevron-left" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.dateSelectorBox}>
            <Feather name="calendar" size={14} color="#64748b" style={{ marginRight: 8 }} />
            <Text style={styles.dateSelectorText}>{reportData.dateRange}</Text>
            <Feather name="chevron-down" size={12} color="#64748b" style={{ marginLeft: 6 }} />
          </View>

          <TouchableOpacity
            style={[styles.dateNavArrow, reportIndex === 0 && styles.disabledDateNav]}
            onPress={handleNextReport}
          >
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* 4. Overall Summary Card Grid */}
        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>Overall Summary</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
            {/* Avg Score */}
            <View style={styles.metricCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardLabel}>Average Score</Text>
                  <Text style={[styles.cardVal, { color: '#22c55e' }]}>{reportData.avgScore}</Text>
                  <View style={styles.diffRow}>
                    <Text style={styles.cardRating}>{reportData.avgScoreRating}</Text>
                    <Text style={[styles.diffText, { color: '#22c55e' }]}> {reportData.avgScoreDiff}</Text>
                  </View>
                  <Text style={styles.cardSub}>vs Last {reportType === 'weekly' ? 'Week' : 'Month'}</Text>
                </View>
                <View style={[styles.cardIconWrap, { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.05)' }]}>
                  <MaterialCommunityIcons name="shield-check-outline" size={16} color="#22c55e" />
                </View>
              </View>
              <Svg width={116} height={20} style={styles.miniWave}>
                <Path d="M 0,10 L 15,14 L 30,8 L 45,12 L 60,6 L 75,10 L 90,4 L 105,8 L 116,6" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </Svg>
            </View>

            {/* Total Drives */}
            <View style={styles.metricCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardLabel}>Total Drives</Text>
                  <Text style={styles.cardVal}>{reportData.totalDrives}</Text>
                  <View style={styles.diffRow}>
                    <Text style={styles.cardSub}>vs Last {reportType === 'weekly' ? 'Week' : 'Month'}</Text>
                    <Text style={[styles.diffText, { color: '#22c55e' }]}> {reportData.totalDrivesDiff}</Text>
                  </View>
                </View>
                <View style={[styles.cardIconWrap, { borderColor: '#00f5ff', backgroundColor: 'rgba(0, 245, 255, 0.05)' }]}>
                  <MaterialCommunityIcons name="steering" size={16} color="#00f5ff" />
                </View>
              </View>
              <Svg width={116} height={20} style={styles.miniWave}>
                <Path d="M 0,12 L 15,6 L 30,14 L 45,8 L 60,12 L 75,5 L 90,10 L 105,4 L 116,9" stroke="#00f5ff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </Svg>
            </View>

            {/* Total Distance */}
            <View style={styles.metricCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardLabel}>Total Distance</Text>
                  <Text style={styles.cardVal}>
                    {reportData.totalDistance}<Text style={styles.cardUnit}>km</Text>
                  </Text>
                  <View style={styles.diffRow}>
                    <Text style={styles.cardSub}>vs Last {reportType === 'weekly' ? 'Week' : 'Month'}</Text>
                    <Text style={[styles.diffText, { color: '#22c55e' }]}> {reportData.totalDistanceDiff}</Text>
                  </View>
                </View>
                <View style={[styles.cardIconWrap, { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.05)' }]}>
                  <FontAwesome5 name="road" size={11} color="#eab308" />
                </View>
              </View>
              <Svg width={116} height={20} style={styles.miniWave}>
                <Path d="M 0,14 L 15,10 L 30,12 L 45,6 L 60,10 L 75,8 L 90,14 L 105,6 L 116,10" stroke="#eab308" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </Svg>
            </View>

            {/* Total Duration */}
            <View style={styles.metricCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardLabel}>Total Duration</Text>
                  {/* Handle text parse for units */}
                  {reportData.totalDuration.includes('h') ? (
                    (() => {
                      const parts = reportData.totalDuration.split(' ');
                      const hrs = parts[0].replace('h', '');
                      const mins = parts[1] ? parts[1].replace('m', '') : '0';
                      return (
                        <Text style={styles.cardVal}>
                          {hrs}<Text style={styles.cardUnit}>h</Text> {mins}<Text style={styles.cardUnit}>m</Text>
                        </Text>
                      );
                    })()
                  ) : (
                    <Text style={styles.cardVal}>{reportData.totalDuration}</Text>
                  )}
                  <View style={styles.diffRow}>
                    <Text style={styles.cardSub}>vs Last {reportType === 'weekly' ? 'Week' : 'Month'}</Text>
                    <Text style={[styles.diffText, { color: '#22c55e' }]}> {reportData.totalDurationDiff}</Text>
                  </View>
                </View>
                <View style={[styles.cardIconWrap, { borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.05)' }]}>
                  <Feather name="clock" size={14} color="#a855f7" />
                </View>
              </View>
              <Svg width={116} height={20} style={styles.miniWave}>
                <Path d="M 0,8 L 15,12 L 30,6 L 45,10 L 60,4 L 75,8 L 90,6 L 105,12 L 116,8" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </Svg>
            </View>
          </ScrollView>
        </View>

        {/* 5. Score Trend Line Chart */}
        <View style={styles.panelCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.panelTitle}>Score Trend</Text>
            <TouchableOpacity style={styles.chartFilterDropdown}>
              <Text style={styles.chartFilterText}>Daily Average</Text>
              <Feather name="chevron-down" size={10} color="#64748b" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.chartWrapper}>
            <Svg width={chartWidth} height={chartHeight}>
              <Defs>
                <SvgLinearGradient id="chartLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#00f5ff" />
                  <Stop offset="50%" stopColor="#a3e635" />
                  <Stop offset="100%" stopColor="#22c55e" />
                </SvgLinearGradient>
                <SvgLinearGradient id="chartAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                  <Stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                </SvgLinearGradient>
              </Defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((level, i) => {
                const y = chartHeight - chartPadding - (level / 100) * (chartHeight - chartPadding * 2);
                return (
                  <React.Fragment key={level}>
                    <Line x1={chartPadding} y1={y} x2={chartWidth - chartPadding} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <SvgText x={chartPadding - 6} y={y + 3} fill="#475569" fontSize="8" fontWeight="bold" textAnchor="end">{level}</SvgText>
                  </React.Fragment>
                );
              })}

              {/* Area Under Curve */}
              {chartPaths.fillPath.length > 0 && (
                <Path d={chartPaths.fillPath} fill="url(#chartAreaGrad)" />
              )}

              {/* Line Curve */}
              {chartPaths.linePath.length > 0 && (
                <Path d={chartPaths.linePath} stroke="url(#chartLineGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              )}

              {/* Data Dots & Value Labels */}
              {chartPaths.coords.map((c, i) => {
                const isLast = i === chartPaths.coords.length - 1;
                return (
                  <React.Fragment key={i}>
                    {/* Glowing highlight ring for last item */}
                    {isLast && (
                      <Circle cx={c.x} cy={c.y} r="6" fill="rgba(34, 197, 94, 0.4)" />
                    )}
                    <Circle cx={c.x} cy={c.y} r="3.5" fill={isLast ? '#22c55e' : '#00f5ff'} stroke="#0c1626" strokeWidth="1.5" />
                    
                    {/* Score value above dot */}
                    {!isLast && (
                      <SvgText x={c.x} y={c.y - 8} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">{c.val}</SvgText>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Highlighted last value bubble */}
              {chartPaths.coords.length > 0 && (() => {
                const last = chartPaths.coords[chartPaths.coords.length - 1];
                return (
                  <React.Fragment>
                    <Rect x={last.x - 12} y={last.y - 25} width={24} height={16} rx={4} fill="#22c55e" />
                    <SvgText x={last.x} y={last.y - 14} fill="#050B14" fontSize="9" fontWeight="900" textAnchor="middle">{last.val}</SvgText>
                  </React.Fragment>
                );
              })()}
            </Svg>

            {/* X Axis Labels */}
            <View style={styles.chartLabelsRow}>
              {reportData.trendLabels.map((lbl, idx) => (
                <Text key={idx} style={styles.chartAxisLabel}>{lbl}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* 6. Events Summary Panel */}
        <View style={styles.panelCard}>
          <Text style={styles.panelTitle}>Events Summary</Text>
          <View style={styles.eventsGrid}>
            {/* Harsh Brakes */}
            <View style={styles.eventGridCard}>
              <View style={[styles.eventIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <MaterialCommunityIcons name="octagon-outline" size={20} color="#ef4444" />
                <Text style={{ position: 'absolute', color: '#ef4444', fontSize: 10, fontWeight: 'bold' }}>!</Text>
              </View>
              <Text style={styles.eventCardLabel}>Harsh Brakes</Text>
              <Text style={styles.eventCardVal}>{reportData.events.harshBrakes}</Text>
              <View style={styles.eventDiffRow}>
                <Text style={styles.eventDiffLabel}>vs Last {reportType === 'weekly' ? 'Week' : 'Month'}</Text>
                <Text style={[styles.eventDiffVal, { color: '#22c55e' }]}> {reportData.events.harshBrakesDiff}</Text>
              </View>
            </View>

            {/* Sharp Turns */}
            <View style={styles.eventGridCard}>
              <View style={[styles.eventIconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                <MaterialCommunityIcons name="arrow-u-left-top" size={18} color="#eab308" />
              </View>
              <Text style={styles.eventCardLabel}>Sharp Turns</Text>
              <Text style={styles.eventCardVal}>{reportData.events.sharpTurns}</Text>
              <View style={styles.eventDiffRow}>
                <Text style={styles.eventDiffLabel}>vs Last {reportType === 'weekly' ? 'Week' : 'Month'}</Text>
                <Text style={[styles.eventDiffVal, { color: '#22c55e' }]}> {reportData.events.sharpTurnsDiff}</Text>
              </View>
            </View>

            {/* Phone Usage */}
            <View style={styles.eventGridCard}>
              <View style={[styles.eventIconContainer, { backgroundColor: 'rgba(0, 245, 255, 0.1)' }]}>
                <Feather name="phone" size={14} color="#00f5ff" />
              </View>
              <Text style={styles.eventCardLabel}>Phone Usage</Text>
              <Text style={styles.eventCardVal}>
                {reportData.events.phoneUsage}
                <Text style={{ fontSize: 9, fontWeight: 'normal', color: '#64748b' }}> ({reportData.events.phoneUsageSec} sec)</Text>
              </Text>
              <View style={styles.eventDiffRow}>
                <Text style={styles.eventDiffLabel}>vs Last {reportType === 'weekly' ? 'Week' : 'Month'}</Text>
                <Text style={[styles.eventDiffVal, { color: '#22c55e' }]}> {reportData.events.phoneUsageDiff}</Text>
              </View>
            </View>

            {/* Aggressive Steering */}
            <View style={styles.eventGridCard}>
              <View style={[styles.eventIconContainer, { backgroundColor: 'rgba(163, 230, 53, 0.1)' }]}>
                <MaterialCommunityIcons name="steering" size={16} color="#a3e635" />
              </View>
              <Text style={styles.eventCardLabel}>Aggressive Steering</Text>
              <Text style={styles.eventCardVal}>{reportData.events.steering}</Text>
              <View style={styles.eventDiffRow}>
                <Text style={styles.eventDiffLabel}>vs Last {reportType === 'weekly' ? 'Week' : 'Month'}</Text>
                <Text style={[styles.eventDiffVal, { color: '#22c55e' }]}> {reportData.events.steeringDiff}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 7. Driving Distribution & Key Improvements side-by-side */}
        <View style={styles.sideBySideRow}>
          {/* Driving Distribution (Left) */}
          <View style={[styles.panelCardHalf, { marginRight: 8 }]}>
            <Text style={styles.panelTitle}>Driving Distribution</Text>
            
            <View style={styles.donutLayout}>
              <View style={styles.donutChartContainer}>
                <Svg width={100} height={100} viewBox="0 0 100 100">
                  {/* Background base */}
                  <Circle cx={cx} cy={cy} r={radius} stroke="#122540" strokeWidth="10" fill="none" />
                  
                  {/* Highway (42%) */}
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="#22c55e"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={0}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                  />
                  {/* City (33%) */}
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="#00f5ff"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={-circumference * (reportData.distribution.highway.pct / 100)}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                  />
                  {/* Suburban (17%) */}
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="#eab308"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={-circumference * ((reportData.distribution.highway.pct + reportData.distribution.city.pct) / 100)}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                  />
                  {/* Night (8%) */}
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="#a855f7"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={-circumference * ((reportData.distribution.highway.pct + reportData.distribution.city.pct + reportData.distribution.suburban.pct) / 100)}
                    transform="rotate(-90 50 50)"
                    strokeLinecap="round"
                  />
                </Svg>
                <View style={styles.donutCenter}>
                  <Text style={styles.donutCenterVal}>{reportData.totalDrives}</Text>
                  <Text style={styles.donutCenterLabel}>Drives</Text>
                </View>
              </View>

              {/* Legend */}
              <View style={styles.donutLegend}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={styles.legendText}>Highway</Text>
                  <Text style={styles.legendPct}>{reportData.distribution.highway.pct}%</Text>
                  <Text style={styles.legendCount}>({reportData.distribution.highway.count})</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#00f5ff' }]} />
                  <Text style={styles.legendText}>City</Text>
                  <Text style={styles.legendPct}>{reportData.distribution.city.pct}%</Text>
                  <Text style={styles.legendCount}>({reportData.distribution.city.count})</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
                  <Text style={styles.legendText}>Suburban</Text>
                  <Text style={styles.legendPct}>{reportData.distribution.suburban.pct}%</Text>
                  <Text style={styles.legendCount}>({reportData.distribution.suburban.count})</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#a855f7' }]} />
                  <Text style={styles.legendText}>Night</Text>
                  <Text style={styles.legendPct}>{reportData.distribution.night.pct}%</Text>
                  <Text style={styles.legendCount}>({reportData.distribution.night.count})</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Key Improvements (Right) */}
          <View style={[styles.panelCardHalf, { marginLeft: 8 }]}>
            <Text style={styles.panelTitle}>Key Improvements</Text>

            <View style={styles.improvementsList}>
              {/* Braking */}
              <View style={styles.improvementItem}>
                <View style={styles.improvementHeader}>
                  <View style={styles.improvementLabelRow}>
                    <MaterialCommunityIcons name="shield-check-outline" size={13} color="#22c55e" style={{ marginRight: 4 }} />
                    <Text style={styles.improvementName}>Smooth Braking</Text>
                  </View>
                  <Text style={[styles.improvementDiff, { color: '#22c55e' }]}>↑ 18%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${reportData.improvements.braking}%`, backgroundColor: '#22c55e' }]} />
                </View>
              </View>

              {/* Steering */}
              <View style={styles.improvementItem}>
                <View style={styles.improvementHeader}>
                  <View style={styles.improvementLabelRow}>
                    <MaterialCommunityIcons name="steering" size={13} color="#00f5ff" style={{ marginRight: 4 }} />
                    <Text style={styles.improvementName}>Steering Control</Text>
                  </View>
                  <Text style={[styles.improvementDiff, { color: '#00f5ff' }]}>↑ 12%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${reportData.improvements.steering}%`, backgroundColor: '#00f5ff' }]} />
                </View>
              </View>

              {/* Speed */}
              <View style={styles.improvementItem}>
                <View style={styles.improvementHeader}>
                  <View style={styles.improvementLabelRow}>
                    <Feather name="clock" size={12} color="#a855f7" style={{ marginRight: 4 }} />
                    <Text style={styles.improvementName}>Speed Management</Text>
                  </View>
                  <Text style={[styles.improvementDiff, { color: '#a855f7' }]}>↑ 10%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${reportData.improvements.speed}%`, backgroundColor: '#a855f7' }]} />
                </View>
              </View>

              {/* Phone Usage */}
              <View style={styles.improvementItem}>
                <View style={styles.improvementHeader}>
                  <View style={styles.improvementLabelRow}>
                    <Feather name="phone" size={11} color="#eab308" style={{ marginRight: 4 }} />
                    <Text style={styles.improvementName}>Phone Usage</Text>
                  </View>
                  <Text style={[styles.improvementDiff, { color: '#eab308' }]}>↓ 25%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${reportData.improvements.phone}%`, backgroundColor: '#eab308' }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 8. Top Drives Section */}
        <View style={[styles.panelCard, { marginBottom: 30 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.panelTitle}>Top Drives <Text style={{ fontSize: 9, fontWeight: 'normal', color: '#64748b' }}>(By Score)</Text></Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topDrivesList}>
            {reportData.topDrives.map((d, index) => {
              const ringColor = index === 0 ? '#eab308' : index === 1 ? '#94a3b8' : '#d97706';
              return (
                <TouchableOpacity
                  key={d.id}
                  style={styles.topDriveCard}
                  onPress={() => router.push({ pathname: '/drive-details', params: { id: d.id } })}
                >
                  <View style={[styles.rankCircle, { backgroundColor: ringColor }]}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>

                  <View style={styles.topDriveMiddle}>
                    <View style={styles.topDriveScoreRow}>
                      <Text style={styles.topDriveScore}>{d.score}</Text>
                      <Text style={[styles.topDriveRating, { color: d.score >= 90 ? '#22c55e' : '#00f5ff' }]}>{d.rating}</Text>
                    </View>
                    <Text style={styles.topDriveDate}>{d.date}</Text>
                    <View style={styles.topDriveStats}>
                      <FontAwesome5 name="road" size={8} color="#64748b" style={{ marginRight: 4 }} />
                      <Text style={styles.topDriveStatText}>{d.distance} km</Text>
                      <Feather name="clock" size={8} color="#64748b" style={{ marginLeft: 10, marginRight: 4 }} />
                      <Text style={styles.topDriveStatText}>{d.duration}</Text>
                    </View>
                  </View>

                  <Feather name="chevron-right" size={16} color="#475569" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  exportText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    height: 48,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTabBtn: {
    backgroundColor: 'rgba(0, 245, 255, 0.03)',
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabBtnText: {
    color: '#00f5ff',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2.5,
    backgroundColor: '#00f5ff',
    borderRadius: 1.5,
  },

  // Date Navigator
  dateNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateNavArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledDateNav: {
    opacity: 0.4,
  },
  dateSelectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 36,
  },
  dateSelectorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Panels
  panelCard: {
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  panelTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  metricsRow: {
    paddingRight: 10,
  },
  metricCard: {
    width: 140,
    backgroundColor: 'rgba(8, 15, 26, 0.4)',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 18,
    padding: 12,
    marginRight: 10,
    height: 105,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '700',
  },
  cardVal: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  cardUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  cardRating: {
    color: '#22c55e',
    fontSize: 8,
    fontWeight: 'bold',
  },
  diffText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#475569',
    fontSize: 8,
  },
  cardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniWave: {
    position: 'absolute',
    bottom: 6,
    left: 12,
  },

  // Chart
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chartFilterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#050B14',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#122540',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chartFilterText: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
  },
  chartWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 80,
    marginTop: 8,
  },
  chartAxisLabel: {
    color: '#475569',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Events Summary Grid
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventGridCard: {
    width: (width - 82) / 2,
    backgroundColor: 'rgba(8, 15, 26, 0.4)',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  eventIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  eventCardLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  eventCardVal: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  eventDiffRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDiffLabel: {
    color: '#475569',
    fontSize: 8,
  },
  eventDiffVal: {
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Side-by-side Layout
  sideBySideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  panelCardHalf: {
    flex: 1,
    backgroundColor: '#0c1626',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#122540',
    padding: 14,
  },

  // Driving Distribution Donut
  donutLayout: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChartContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterVal: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  donutCenterLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
  },
  donutLegend: {
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: '600',
    flex: 1,
  },
  legendPct: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    marginRight: 4,
  },
  legendCount: {
    color: '#475569',
    fontSize: 8,
  },

  // Improvements List
  improvementsList: {
    marginTop: 2,
  },
  improvementItem: {
    marginBottom: 10,
  },
  improvementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  improvementLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  improvementName: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
  },
  improvementDiff: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#122540',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },

  // Top Drives List
  topDrivesList: {
    marginTop: 2,
  },
  topDriveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 15, 26, 0.4)',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  rankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    color: '#050B14',
    fontSize: 11,
    fontWeight: '900',
  },
  topDriveMiddle: {
    flex: 1,
  },
  topDriveScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topDriveScore: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 6,
  },
  topDriveRating: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  topDriveDate: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '600',
    marginVertical: 1,
  },
  topDriveStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topDriveStatText: {
    color: '#475569',
    fontSize: 8,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#00f5ff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  }
});
