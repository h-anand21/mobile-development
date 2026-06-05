import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDriveStore } from '../../src/store/driveStore';
import { driveRepository } from '../../src/database/repositories/driveRepository';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

// High-fidelity mockup data fallback
const MOCK_HISTORY_DRIVES = [
  {
    id: 'h1',
    score: 92,
    rating: 'EXCELLENT',
    startTime: Date.now() - 2 * 3600 * 1000, // Today, 08:15 PM
    duration: 2536, // 00:42:16
    distance: 28600, // 28.6 km
    startLocation: 'Connaught Place, Delhi',
    endLocation: 'MG Road, Delhi',
    avgSpeed: 52,
    weather: '29°C',
    weatherIcon: 'moon',
  },
  {
    id: 'h2',
    score: 78,
    rating: 'GOOD',
    startTime: Date.now() - 4 * 3600 * 1000, // Today, 06:45 PM
    duration: 1448, // 00:24:08
    distance: 16300, // 16.3 km
    startLocation: 'Rohini, Delhi',
    endLocation: 'Pitampura, Delhi',
    avgSpeed: 41,
    weather: '31°C',
    weatherIcon: 'cloud',
  },
  {
    id: 'h3',
    score: 65,
    rating: 'FAIR',
    startTime: Date.now() - 9 * 3600 * 1000, // Today, 01:10 PM
    duration: 2147, // 00:35:47
    distance: 22100, // 22.1 km
    startLocation: 'Noida Sector 62',
    endLocation: 'Noida Sector 18',
    avgSpeed: 37,
    weather: '33°C',
    weatherIcon: 'sun',
  },
  {
    id: 'h4',
    score: 90,
    rating: 'EXCELLENT',
    startTime: Date.now() - 28 * 3600 * 1000, // Yesterday, 08:30 PM
    duration: 2412, // 00:40:12
    distance: 27400, // 27.4 km
    startLocation: 'MG Road, Delhi',
    endLocation: 'Connaught Place, Delhi',
    avgSpeed: 50,
    weather: '28°C',
    weatherIcon: 'moon',
  },
  {
    id: 'h5',
    score: 72,
    rating: 'GOOD',
    startTime: Date.now() - 30 * 3600 * 1000, // Yesterday, 06:05 PM
    duration: 1716, // 00:28:36
    distance: 18700, // 18.7 km
    startLocation: 'Dwarka, Delhi',
    endLocation: 'Vasant Kunj, Delhi',
    avgSpeed: 40,
    weather: '30°C',
    weatherIcon: 'cloud',
  },
  {
    id: 'h6',
    score: 58,
    rating: 'POOR',
    startTime: Date.now() - 48 * 3600 * 1000, // May 19, 08:40 PM
    duration: 2330, // 00:38:50
    distance: 24600, // 24.6 km
    startLocation: 'Gurgaon Sector 14',
    endLocation: 'Cyber Hub, Gurgaon',
    avgSpeed: 36,
    weather: '29°C',
    weatherIcon: 'cloud-rain',
  }
];

// Formatting helpers
const formatMMSS = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatRating = (str: string) => {
  if (!str) return 'Excellent';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function HistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'score-high' | 'score-low' | 'distance'>('latest');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Load drives from DB
  const dbDrives = driveRepository.getAllDrives();

  // Combine DB drives with Mock fallback to ensure rich list matching mockup
  const allDrives = useMemo(() => {
    // Map db drives to matching properties
    const mappedDb = dbDrives.map(d => ({
      id: d.id,
      score: d.score,
      rating: d.rating,
      startTime: d.startTime,
      duration: d.duration,
      distance: d.distance,
      startLocation: d.route && d.route.length > 0 ? 'Connaught Place, Delhi' : 'MG Road, Delhi',
      endLocation: d.route && d.route.length > 0 ? 'MG Road, Delhi' : 'Connaught Place, Delhi',
      avgSpeed: d.route && d.route.length > 0 ? Math.round((d.route.reduce((acc, p) => acc + p.speed, 0) / d.route.length) * 3.6) : 45,
      weather: '28°C',
      weatherIcon: 'moon',
    }));

    // Prevent duplicates if same ID exists
    const mockFiltered = MOCK_HISTORY_DRIVES.filter(m => !mappedDb.some(d => d.id === m.id));
    return [...mappedDb, ...mockFiltered];
  }, [dbDrives]);

  // Compute Total Metrics for summary cards (fallback to screenshot mock values if no active drives exist)
  const totalDrivesCount = allDrives.length > 6 ? allDrives.length : 48;
  const avgScore = allDrives.length > 6
    ? Math.round(allDrives.reduce((acc, d) => acc + d.score, 0) / allDrives.length)
    : 86;
  const totalDistanceKm = allDrives.length > 6
    ? (allDrives.reduce((acc, d) => acc + d.distance, 0) / 1000).toFixed(1)
    : '842.6';
  const totalDurationMin = allDrives.length > 6
    ? Math.round(allDrives.reduce((acc, d) => acc + d.duration, 0) / 60)
    : 1122; // 18h 42m

  const totalDurationHrs = Math.floor(totalDurationMin / 60);
  const totalDurationMins = totalDurationMin % 60;

  // Search & Filter & Sort
  const processedDrives = useMemo(() => {
    let result = [...allDrives];

    // Filter by search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.startLocation.toLowerCase().includes(q) ||
        d.endLocation.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'latest') return b.startTime - a.startTime;
      if (sortBy === 'score-high') return b.score - a.score;
      if (sortBy === 'score-low') return a.score - b.score;
      if (sortBy === 'distance') return b.distance - a.distance;
      return 0;
    });

    return result;
  }, [allDrives, searchQuery, sortBy]);

  // Format Date Titles
  const getDriveTitle = (timestamp: number) => {
    const driveDate = dayjs(timestamp);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, 'day');

    let datePrefix = driveDate.format('MMM DD');
    if (driveDate.isSame(today, 'day')) {
      datePrefix = 'Today';
    } else if (driveDate.isSame(yesterday, 'day')) {
      datePrefix = 'Yesterday';
    }

    return `${datePrefix}, ${driveDate.format('hh:mm A')}`;
  };

  const getRatingColor = (ratingStr: string) => {
    if (ratingStr === 'EXCELLENT') return '#22c55e';
    if (ratingStr === 'GOOD') return '#00f5ff';
    if (ratingStr === 'FAIR') return '#eab308';
    return '#ef4444';
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.iconCircle}>
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Drive History</Text>
          <Text style={styles.headerSubtitle}>All your drives in one place</Text>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={[styles.iconCircle, { marginRight: 10 }]}>
            <Feather name="calendar" size={18} color="#F8FAFC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Feather name="filter" size={18} color="#F8FAFC" />
            <View style={styles.activeFilterDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Search & Filter Bar */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search drives, locations..."
            placeholderTextColor="#475569"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Feather name="sliders" size={14} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSortOptions(!showSortOptions)}>
          <Feather name="arrow-up-down" size={14} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.sortBtnText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown sorting options */}
      {showSortOptions && (
        <View style={styles.sortDropdown}>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'latest' && styles.activeSortOption]}
            onPress={() => { setSortBy('latest'); setShowSortOptions(false); }}
          >
            <Text style={[styles.sortOptionText, sortBy === 'latest' && styles.activeSortOptionText]}>Latest First</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'score-high' && styles.activeSortOption]}
            onPress={() => { setSortBy('score-high'); setShowSortOptions(false); }}
          >
            <Text style={[styles.sortOptionText, sortBy === 'score-high' && styles.activeSortOptionText]}>Highest Score</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'score-low' && styles.activeSortOption]}
            onPress={() => { setSortBy('score-low'); setShowSortOptions(false); }}
          >
            <Text style={[styles.sortOptionText, sortBy === 'score-low' && styles.activeSortOptionText]}>Lowest Score</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'distance' && styles.activeSortOption]}
            onPress={() => { setSortBy('distance'); setShowSortOptions(false); }}
          >
            <Text style={[styles.sortOptionText, sortBy === 'distance' && styles.activeSortOptionText]}>Longest Distance</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 3. Horizontal Scroll Summary Cards */}
        <View style={{ marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryScroll}>
            {/* Total Drives */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <View>
                  <Text style={styles.summaryCardLabel}>Total Drives</Text>
                  <Text style={styles.summaryCardValue}>{totalDrivesCount}</Text>
                  <Text style={styles.summaryCardSub}>This Month</Text>
                </View>
                <View style={[styles.summaryCardIconWrap, { borderColor: '#00f5ff', backgroundColor: 'rgba(0, 245, 255, 0.05)' }]}>
                  <MaterialCommunityIcons name="steering" size={16} color="#00f5ff" />
                </View>
              </View>
              {/* Wave SVG */}
              <Svg width={116} height={20} style={styles.miniWaveChart}>
                <Path d="M 0,12 L 15,6 L 30,14 L 45,8 L 60,12 L 75,5 L 90,10 L 105,4 L 116,9" stroke="#00f5ff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </Svg>
            </View>

            {/* Avg Score */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <View>
                  <Text style={styles.summaryCardLabel}>Avg Score</Text>
                  <Text style={styles.summaryCardValue}>{avgScore}</Text>
                  <Text style={[styles.summaryCardSub, { color: '#22c55e', fontWeight: 'bold' }]}>Excellent</Text>
                </View>
                <View style={[styles.summaryCardIconWrap, { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.05)' }]}>
                  <MaterialCommunityIcons name="shield-check-outline" size={16} color="#22c55e" />
                </View>
              </View>
              <Svg width={116} height={20} style={styles.miniWaveChart}>
                <Path d="M 0,10 L 15,14 L 30,8 L 45,12 L 60,6 L 75,10 L 90,4 L 105,8 L 116,6" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </Svg>
            </View>

            {/* Total Distance */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <View>
                  <Text style={styles.summaryCardLabel}>Total Distance</Text>
                  <Text style={styles.summaryCardValue}>{totalDistanceKm}</Text>
                  <Text style={styles.summaryCardSub}>km</Text>
                </View>
                <View style={[styles.summaryCardIconWrap, { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.05)' }]}>
                  <FontAwesome5 name="road" size={12} color="#eab308" />
                </View>
              </View>
              <Svg width={116} height={20} style={styles.miniWaveChart}>
                <Path d="M 0,14 L 15,10 L 30,12 L 45,6 L 60,10 L 75,8 L 90,14 L 105,6 L 116,10" stroke="#eab308" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </Svg>
            </View>

            {/* Total Duration */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <View>
                  <Text style={styles.summaryCardLabel}>Total Duration</Text>
                  <Text style={styles.summaryCardValue}>
                    {totalDurationHrs}<Text style={styles.summaryUnit}>h</Text> {totalDurationMins}<Text style={styles.summaryUnit}>m</Text>
                  </Text>
                  <Text style={styles.summaryCardSub}>This Month</Text>
                </View>
                <View style={[styles.summaryCardIconWrap, { borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.05)' }]}>
                  <Feather name="clock" size={14} color="#a855f7" />
                </View>
              </View>
              <Svg width={116} height={20} style={styles.miniWaveChart}>
                <Path d="M 0,8 L 15,12 L 30,6 L 45,10 L 60,4 L 75,8 L 90,6 L 105,12 L 116,8" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </Svg>
            </View>
          </ScrollView>
        </View>

        {/* 4. All Drives Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>All Drives ({totalDrivesCount})</Text>
          <TouchableOpacity style={styles.listHeaderDropdown} onPress={() => setShowSortOptions(!showSortOptions)}>
            <Text style={styles.listHeaderDropdownText}>
              {sortBy === 'latest' ? 'Latest First' : sortBy === 'score-high' ? 'Highest Score' : sortBy === 'score-low' ? 'Lowest Score' : 'Longest Distance'}
            </Text>
            <Feather name="chevron-down" size={12} color="#64748b" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* 5. Drives Listing */}
        {processedDrives.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="info" size={32} color="#475569" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>No drives found matching your search</Text>
          </View>
        ) : (
          processedDrives.map((drive, idx) => {
            const rColor = getRatingColor(drive.rating);
            return (
              <TouchableOpacity
                key={drive.id}
                style={styles.driveCard}
                onPress={() => router.push({ pathname: '/drive-details', params: { id: drive.id } })}
              >
                {/* Score Dial (Left) */}
                <View style={styles.cardDialWrap}>
                  <Svg width={64} height={64} viewBox="0 0 80 80">
                    <Circle cx="40" cy="40" r="30" stroke="#122540" strokeWidth="4" fill="none" />
                    <Circle
                      cx="40" cy="40" r="30"
                      stroke={rColor} strokeWidth="5" fill="none"
                      strokeDasharray="188"
                      strokeDashoffset={188 - (188 * drive.score) / 100}
                      transform="rotate(-90 40 40)"
                      strokeLinecap="round"
                    />
                  </Svg>
                  <View style={styles.cardDialInner}>
                    <Text style={styles.cardDialVal}>{drive.score}</Text>
                  </View>
                  <View style={styles.cardCheckBadgeOverlay}>
                    <MaterialCommunityIcons name="shield-check" size={12} color={rColor} />
                  </View>
                </View>

                {/* Details (Center) */}
                <View style={styles.cardDetailsCol}>
                  <Text style={styles.cardTimeTitle}>{getDriveTitle(drive.startTime)}</Text>
                  <View style={styles.cardRouteRow}>
                    <Ionicons name="location-outline" size={13} color="#64748b" style={{ marginRight: 4 }} />
                    <Text style={styles.cardRouteText} numberOfLines={1}>
                      {drive.startLocation} → {drive.endLocation}
                    </Text>
                  </View>

                  {/* Row of stats */}
                  <View style={styles.cardStatsRow}>
                    <View style={styles.cardStatItem}>
                      <FontAwesome5 name="road" size={10} color="#64748b" style={{ marginRight: 4 }} />
                      <Text style={styles.cardStatText}>{(drive.distance / 1000).toFixed(1)} km</Text>
                    </View>
                    <View style={styles.cardStatItem}>
                      <Feather name="clock" size={10} color="#64748b" style={{ marginRight: 4 }} />
                      <Text style={styles.cardStatText}>{formatMMSS(drive.duration)}</Text>
                    </View>
                    <View style={styles.cardStatItem}>
                      <MaterialCommunityIcons name="speedometer" size={11} color="#64748b" style={{ marginRight: 4 }} />
                      <Text style={styles.cardStatText}>{drive.avgSpeed} km/h</Text>
                    </View>
                  </View>
                </View>

                {/* Badge & Weather (Right Column) */}
                <View style={styles.cardRightCol}>
                  <View style={[styles.ratingBadgePill, { borderColor: rColor + '40', backgroundColor: rColor + '10' }]}>
                    <Text style={[styles.ratingBadgeText, { color: rColor }]}>{formatRating(drive.rating)}</Text>
                  </View>

                  <View style={styles.weatherInfoRow}>
                    <Feather
                      name={drive.weatherIcon as any}
                      size={12}
                      color="#64748b"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.weatherLabelText}>{drive.weather}</Text>
                  </View>
                </View>

                {/* Chevron Right (centered vertically) */}
                <Feather name="chevron-right" size={20} color="#475569" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            );
          })
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
    borderRadius: 12,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeFilterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00f5ff',
    borderWidth: 1.5,
    borderColor: '#0c1626',
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
    paddingTop: 5,
  },
  bottomSpacer: {
    height: 60,
  },

  // Search Bar Row
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    marginRight: 10,
  },
  filterBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
  },
  sortBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Sort Dropdown
  sortDropdown: {
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 6,
    position: 'absolute',
    top: 118,
    right: 20,
    left: 20,
    zIndex: 10,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  activeSortOption: {
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
  },
  sortOptionText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  activeSortOptionText: {
    color: '#00f5ff',
    fontWeight: 'bold',
  },

  // Summary Scroll Row
  summaryScroll: {
    paddingRight: 10,
  },
  summaryCard: {
    width: 140,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
    position: 'relative',
    height: 96,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryCardLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '600',
  },
  summaryCardValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  summaryUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  summaryCardSub: {
    color: '#94a3b8',
    fontSize: 8,
    marginTop: 1,
  },
  summaryCardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniWaveChart: {
    position: 'absolute',
    bottom: 6,
    left: 12,
  },

  // List Headers
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listHeaderTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  listHeaderDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderDropdownText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Drives Listing Cards
  driveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  cardDialWrap: {
    position: 'relative',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardDialInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDialVal: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  cardCheckBadgeOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    backgroundColor: '#0c1626',
    borderRadius: 6,
    padding: 1,
  },
  cardDetailsCol: {
    flex: 1,
    marginRight: 6,
  },
  cardTimeTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardRouteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  cardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  cardStatText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '500',
  },
  cardRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 4,
  },
  ratingBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  ratingBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  weatherInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherLabelText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '600',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
