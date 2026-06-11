import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Polygon, Ellipse } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { driveRepository } from '../src/database/repositories/driveRepository';
import { useAppTheme } from '../src/ui/theme';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

// Mock Achievement List Data
const INITIAL_ACHIEVEMENTS = [
  {
    id: '1',
    category: 'driving',
    title: 'Safe Driver',
    desc: 'Drive 10 safe drives without any harsh events',
    points: 100,
    status: 'LOCKED',
    icon: <Feather name="check" size={18} color="#22c55e" />,
    color: '#22c55e'
  },
  {
    id: '2',
    category: 'milestone',
    title: '100 KM Explorer',
    desc: 'Drive 100 kilometers in total',
    points: 150,
    status: 'LOCKED',
    icon: (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#00f5ff', fontSize: 9, fontWeight: '900', lineHeight: 9, textAlign: 'center' }}>100</Text>
        <Text style={{ color: '#00f5ff', fontSize: 7, fontWeight: '700', lineHeight: 7, textAlign: 'center' }}>KM</Text>
      </View>
    ),
    color: '#00f5ff'
  },
  {
    id: '3',
    category: 'driving',
    title: '30 Safe Drives',
    desc: 'Complete 30 safe drives with good score',
    points: 200,
    status: 'LOCKED',
    icon: <MaterialCommunityIcons name="steering" size={16} color="#a855f7" />,
    color: '#a855f7'
  },
  {
    id: '4',
    category: 'driving',
    title: 'Speed Master',
    desc: 'Maintain average speed below 60 km/h for 5 drives',
    points: 120,
    status: 'LOCKED',
    icon: <MaterialCommunityIcons name="speedometer" size={18} color="#eab308" />,
    color: '#eab308'
  },
  {
    id: '5',
    category: 'driving',
    title: 'Eco Driver',
    desc: 'Drive 50 km with smooth acceleration',
    points: 150,
    status: 'LOCKED',
    icon: <MaterialCommunityIcons name="leaf" size={16} color="#84cc16" />,
    color: '#84cc16'
  },
  {
    id: '6',
    category: 'driving',
    title: 'Night Rider',
    desc: 'Complete 10 night drives safely',
    points: 100,
    status: 'LOCKED',
    icon: <Feather name="moon" size={16} color="#3b82f6" />,
    color: '#3b82f6'
  },
  {
    id: '7',
    category: 'milestone',
    title: '500 KM Journey',
    desc: 'Drive 500 kilometers in total',
    points: 250,
    status: 'LOCKED',
    icon: (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#94a3b8', fontSize: 9, fontWeight: '900', lineHeight: 9, textAlign: 'center' }}>500</Text>
        <Text style={{ color: '#94a3b8', fontSize: 7, fontWeight: '700', lineHeight: 7, textAlign: 'center' }}>KM</Text>
      </View>
    ),
    color: '#64748b'
  },
  {
    id: '8',
    category: 'streak',
    title: 'Streak Pro',
    desc: 'Maintain a 7-day safe driving streak',
    points: 200,
    status: 'LOCKED',
    icon: <MaterialCommunityIcons name="fire" size={16} color="#f97316" />,
    color: '#f97316'
  },
  {
    id: '9',
    category: 'special',
    title: 'Perfect Week',
    desc: 'Get 7 safe drives in a single week',
    points: 300,
    status: 'LOCKED',
    icon: <FontAwesome5 name="trophy" size={16} color="#eab308" />,
    color: '#eab308'
  }
];

const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Rookie Driver', minXp: 0, maxXp: 1000 },
  { level: 2, name: 'Safe Commuter', minXp: 1000, maxXp: 2500 },
  { level: 3, name: 'Skilled Cruiser', minXp: 2500, maxXp: 5000 },
  { level: 4, name: 'Confident Driver', minXp: 5000, maxXp: 8000 },
  { level: 5, name: 'Road Master', minXp: 8000, maxXp: 12000 },
  { level: 6, name: 'Safety Legend', minXp: 12000, maxXp: 99999999 }
];

export function getLevelInfo(totalXp: number) {
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    const t = LEVEL_THRESHOLDS[i];
    if (totalXp >= t.minXp && totalXp < t.maxXp) {
      const xpInLevel = totalXp - t.minXp;
      const xpRequiredForNext = t.maxXp - t.minXp;
      const progressPct = (xpInLevel / xpRequiredForNext) * 100;
      return {
        level: t.level,
        name: t.name,
        xpInLevel,
        xpRequiredForNext,
        progressPct: Math.min(100, Math.max(0, progressPct))
      };
    }
  }
  return {
    level: 6,
    name: 'Safety Legend',
    xpInLevel: totalXp - 12000,
    xpRequiredForNext: 5000,
    progressPct: Math.min(100, ((totalXp - 12000) / 5000) * 100)
  };
}

export default function AchievementsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors);

  // Hexagon Badge Wrapper
  const HexagonBadge = ({ size = 42, color = '#22c55e', isLocked = false, children }: { size?: number, color?: string, isLocked?: boolean, children?: React.ReactNode }) => {
    const borderColor = isLocked ? colors.textSlate : color;
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
          <Polygon
            points="50,5 93,25 93,75 50,95 7,75 7,25"
            fill={isDark ? "rgba(8, 15, 26, 0.4)" : "rgba(0, 0, 0, 0.05)"}
            stroke={borderColor}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </Svg>
        <View style={{ zIndex: 2 }}>
          {children}
        </View>
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Feather name="lock" size={9} color={colors.textSlate} />
          </View>
        )}
      </View>
    );
  };

  const [activeTab, setActiveTab] = useState<'all' | 'driving' | 'milestone' | 'streak' | 'special'>('all');
  const [sortBy, setSortBy] = useState<'rarity' | 'points' | 'unlocked'>('rarity');
  const [showSort, setShowSort] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  // Load drives from DB to dynamically calculate if some completed achievements can unlock
  const dbDrives = driveRepository.getAllDrives();

  // Helper values for calculations
  const totalDistanceKm = useMemo(() => dbDrives.reduce((acc, d) => acc + d.distance, 0) / 1000, [dbDrives]);
  const safeDrivesCount = useMemo(() => dbDrives.filter(d => !d.events || d.events.length === 0).length, [dbDrives]);
  const goodDrivesCount = useMemo(() => dbDrives.filter(d => d.score >= 85).length, [dbDrives]);
  
  const lowSpeedDrives = useMemo(() => dbDrives.filter(d => {
    const avgSpeed = d.duration > 0 ? (d.distance / d.duration) * 3.6 : 0;
    return avgSpeed > 0 && avgSpeed < 60;
  }).length, [dbDrives]);

  const ecoKm = useMemo(() => dbDrives
    .filter(d => d.score >= 90)
    .reduce((acc, d) => acc + d.distance, 0) / 1000, [dbDrives]);

  const nightDrives = useMemo(() => dbDrives.filter(d => {
    const hour = dayjs(d.startTime).hour();
    const isNight = hour >= 20 || hour < 6;
    return isNight && d.score >= 80;
  }).length, [dbDrives]);

  // Streak Calculation
  const currentStreak = useMemo(() => {
    const safeDriveDates = Array.from(new Set(
      dbDrives
        .filter(d => d.score >= 80)
        .map(d => dayjs(d.startTime).format('YYYY-MM-DD'))
    )).sort().reverse();

    if (safeDriveDates.length > 0) {
      let checkDate = dayjs();
      const hasToday = safeDriveDates.includes(checkDate.format('YYYY-MM-DD'));
      const hasYesterday = safeDriveDates.includes(checkDate.subtract(1, 'day').format('YYYY-MM-DD'));
      
      if (hasToday || hasYesterday) {
        let streak = 1;
        let indexDate = hasToday ? checkDate : checkDate.subtract(1, 'day');
        while (true) {
          indexDate = indexDate.subtract(1, 'day');
          if (safeDriveDates.includes(indexDate.format('YYYY-MM-DD'))) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      }
    }
    return 0;
  }, [dbDrives]);

  const thisWeekSafeDrives = useMemo(() => {
    const startOfWeek = dayjs().startOf('week').valueOf();
    return dbDrives.filter(d => d.startTime >= startOfWeek && d.score >= 90).length;
  }, [dbDrives]);

  // Combine DB logic to unlock achievements
  const achievementsList = useMemo(() => {
    // Deep clone INITIAL_ACHIEVEMENTS to avoid mutating original objects
    const list = INITIAL_ACHIEVEMENTS.map(item => ({ ...item, current: 0, total: 1 }));
    
    // Apply calculations to list items
    list.forEach(a => {
      if (a.id === '1') {
        a.current = safeDrivesCount;
        a.total = 10;
        a.status = safeDrivesCount >= 10 ? 'COMPLETED' : safeDrivesCount > 0 ? 'PROGRESS' : 'LOCKED';
      } else if (a.id === '2') {
        a.current = Math.round(totalDistanceKm);
        a.total = 100;
        a.status = totalDistanceKm >= 100 ? 'COMPLETED' : totalDistanceKm > 0 ? 'PROGRESS' : 'LOCKED';
      } else if (a.id === '3') {
        a.current = goodDrivesCount;
        a.total = 30;
        a.status = goodDrivesCount >= 30 ? 'COMPLETED' : goodDrivesCount > 0 ? 'PROGRESS' : 'LOCKED';
      } else if (a.id === '4') {
        a.current = lowSpeedDrives;
        a.total = 5;
        a.status = lowSpeedDrives >= 5 ? 'COMPLETED' : lowSpeedDrives > 0 ? 'PROGRESS' : 'LOCKED';
      } else if (a.id === '5') {
        a.current = Math.round(ecoKm);
        a.total = 50;
        a.status = ecoKm >= 50 ? 'COMPLETED' : ecoKm > 0 ? 'PROGRESS' : 'LOCKED';
      } else if (a.id === '6') {
        a.current = nightDrives;
        a.total = 10;
        a.status = nightDrives >= 10 ? 'COMPLETED' : nightDrives > 0 ? 'PROGRESS' : 'LOCKED';
      } else if (a.id === '7') {
        a.current = Math.round(totalDistanceKm);
        a.total = 500;
        a.status = totalDistanceKm >= 500 ? 'COMPLETED' : totalDistanceKm > 0 ? 'PROGRESS' : 'LOCKED';
      } else if (a.id === '8') {
        a.current = currentStreak;
        a.total = 7;
        a.status = currentStreak >= 7 ? 'COMPLETED' : currentStreak > 0 ? 'PROGRESS' : 'LOCKED';
      } else if (a.id === '9') {
        a.current = thisWeekSafeDrives;
        a.total = 7;
        a.status = thisWeekSafeDrives >= 7 ? 'COMPLETED' : thisWeekSafeDrives > 0 ? 'PROGRESS' : 'LOCKED';
      }
    });

    // Filter by Tab
    let filtered = list;
    if (activeTab !== 'all') {
      filtered = list.filter(a => a.category === activeTab);
    }

    // Sort by selection
    if (sortBy === 'points') {
      filtered.sort((a, b) => b.points - a.points);
    } else if (sortBy === 'unlocked') {
      filtered.sort((a, b) => {
        if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return -1;
        if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return 1;
        return 0;
      });
    }

    return filtered;
  }, [activeTab, sortBy, totalDistanceKm, safeDrivesCount, goodDrivesCount, lowSpeedDrives, ecoKm, nightDrives, currentStreak, thisWeekSafeDrives]);

  // Leveling and XP logic computed dynamically
  const { totalXp, levelInfo, rankStr, unlockedCount } = useMemo(() => {
    // XP from drives: each drive score * 10 XP
    const drivesXp = dbDrives.reduce((acc, d) => acc + (d.score * 10), 0);
    
    let unlocked = 0;
    let achievementsXp = 0;

    const checkAndAdd = (condition: boolean, points: number) => {
      if (condition) {
        unlocked++;
        achievementsXp += points;
      }
    };

    checkAndAdd(safeDrivesCount >= 10, 100);
    checkAndAdd(totalDistanceKm >= 100, 150);
    checkAndAdd(goodDrivesCount >= 30, 200);
    checkAndAdd(lowSpeedDrives >= 5, 120);
    checkAndAdd(ecoKm >= 50, 150);
    checkAndAdd(nightDrives >= 10, 100);
    checkAndAdd(totalDistanceKm >= 500, 250);
    checkAndAdd(currentStreak >= 7, 200);
    checkAndAdd(thisWeekSafeDrives >= 7, 300);

    const totalXpVal = drivesXp + achievementsXp;
    const info = getLevelInfo(totalXpVal);

    // Rank String
    const avgScore = dbDrives.length > 0
      ? Math.round(dbDrives.reduce((acc, d) => acc + d.score, 0) / dbDrives.length)
      : 80;
    let rankStrVal = 'Top 95%';
    if (dbDrives.length > 0) {
      if (avgScore >= 95) rankStrVal = 'Top 5%';
      else if (avgScore >= 90) rankStrVal = 'Top 12%';
      else if (avgScore >= 85) rankStrVal = 'Top 22%';
      else if (avgScore >= 80) rankStrVal = 'Top 35%';
      else if (avgScore >= 70) rankStrVal = 'Top 50%';
      else if (avgScore >= 60) rankStrVal = 'Top 75%';
      else rankStrVal = 'Top 90%';
    }

    return {
      totalXp: totalXpVal,
      levelInfo: info,
      rankStr: rankStrVal,
      unlockedCount: unlocked
    };
  }, [dbDrives, totalDistanceKm, safeDrivesCount, goodDrivesCount, lowSpeedDrives, ecoKm, nightDrives, currentStreak, thisWeekSafeDrives]);

  return (
    <View style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Achievements</Text>
          <Text style={styles.headerSubtitle}>Your journey to becoming a better driver</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn}>
          <FontAwesome5 name="trophy" size={20} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. Top Glowing Trophy Banner Box */}
        <View style={styles.trophyBannerCard}>
          <View style={styles.trophyVisual}>
            <Svg width={76} height={85} viewBox="0 0 100 110">
              {/* Pedestal base */}
              <Ellipse cx="50" cy="95" rx="35" ry="8" fill={colors.border} stroke={colors.accent} strokeWidth="1" />
              <Ellipse cx="50" cy="90" rx="30" ry="7" fill={colors.card} stroke={colors.accent} strokeWidth="1.5" />
              {/* Laurel Leaves */}
              <Path d="M22,75 Q10,60 20,40 T35,25" fill="none" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="2.5" />
              <Path d="M78,75 Q90,60 80,40 T65,25" fill="none" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="2.5" />
              {/* Shield Trophy */}
              <Path
                d="M 30,20 L 70,20 C 70,20 75,45 70,65 C 65,80 50,90 50,90 C 50,90 35,80 30,65 C 25,45 30,20 30,20 Z"
                fill="rgba(34, 197, 94, 0.2)"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <Polygon
                points="50,33 53,42 62,42 55,47 57,56 50,51 43,56 45,47 38,42 47,42"
                fill="#22c55e"
              />
              <Circle cx="50" cy="45" r="22" fill="none" stroke="rgba(34, 197, 94, 0.15)" strokeWidth="1" strokeDasharray="4,4" />
            </Svg>
          </View>

          <View style={styles.trophyInfo}>
            <Text style={styles.bannerTitle}>Great going, Arjun!</Text>
            <Text style={styles.bannerSubtitle}>You're building great driving habits.</Text>

            {/* Quick stats columns */}
            <View style={styles.bannerStatsRow}>
              <View style={styles.bannerStatItem}>
                <Feather name="shield" size={13} color="#22c55e" style={{ marginBottom: 3 }} />
                <Text style={styles.bannerStatValue}>{unlockedCount}</Text>
                <Text style={styles.bannerStatLabel} numberOfLines={1}>Unlocked</Text>
              </View>
              <View style={styles.bannerStatItem}>
                <Feather name="star" size={13} color="#eab308" style={{ marginBottom: 3 }} />
                <Text style={styles.bannerStatValue}>{totalXp.toLocaleString()}</Text>
                <Text style={styles.bannerStatLabel} numberOfLines={1}>Points</Text>
              </View>
              <View style={styles.bannerStatItem}>
                <MaterialCommunityIcons name="trending-up" size={13} color="#a855f7" style={{ marginBottom: 3 }} />
                <Text style={styles.bannerStatValue}>Level {levelInfo.level}</Text>
                <Text style={styles.bannerStatLabel} numberOfLines={1}>{levelInfo.name}</Text>
              </View>
              <View style={styles.bannerStatItem}>
                <Feather name="award" size={13} color="#00f5ff" style={{ marginBottom: 3 }} />
                <Text style={styles.bannerStatValue}>{rankStr}</Text>
                <Text style={styles.bannerStatLabel} numberOfLines={1}>Drivers Rank</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Level Progression Bar */}
        <View style={styles.levelBarCard}>
          <HexagonBadge size={38} color="#84cc16">
            <Text style={{ color: '#84cc16', fontSize: 13, fontWeight: 'bold' }}>{levelInfo.level}</Text>
          </HexagonBadge>
          <View style={styles.levelMiddle}>
            <View style={styles.levelTitleRow}>
              <Text style={styles.levelMainText}>Level {levelInfo.level}</Text>
              <Text style={styles.levelXpText}>{levelInfo.xpInLevel.toLocaleString()} <Text style={{ color: '#64748b', fontWeight: 'normal' }}>/ {levelInfo.xpRequiredForNext.toLocaleString()} XP</Text></Text>
            </View>
            <Text style={styles.levelSubText}>{levelInfo.name}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${levelInfo.progressPct}%` }]} />
            </View>
            <Text style={styles.progressBarSub}>
              {levelInfo.level < 6 
                ? `${(levelInfo.xpRequiredForNext - levelInfo.xpInLevel).toLocaleString()} XP to reach Level ${levelInfo.level + 1}`
                : 'Maximum Level Reached'
              }
            </Text>
          </View>
        </View>

        {/* 4. Tab Selector Navigation */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
            {['All', 'Driving', 'Milestone', 'Streak', 'Special'].map((t) => {
              const tabId = t.toLowerCase() as any;
              const isActive = activeTab === tabId;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabItem, isActive && styles.activeTabItem]}
                  onPress={() => setActiveTab(tabId)}
                >
                  <Text style={[styles.tabText, isActive && styles.activeTabText]}>{t}</Text>
                  {isActive && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 5. Achievements Count & Sort Dropdown */}
        <View style={styles.countSortRow}>
          <Text style={styles.unlockedHeading}>
            <Text style={{ color: '#22c55e', fontWeight: '900' }}>{unlockedCount}</Text>
            <Text style={{ color: colors.text }}> / {INITIAL_ACHIEVEMENTS.length} Achievements Unlocked</Text>
          </Text>

          <TouchableOpacity style={styles.sortDropdownBtn} onPress={() => setShowSort(!showSort)}>
            <Feather name="sliders" size={10} color="#94a3b8" style={{ marginRight: 4 }} />
            <Text style={styles.sortBtnLabel}>
              {sortBy === 'rarity' ? 'Rarity' : sortBy === 'points' ? 'Points' : 'Unlocked'}
            </Text>
            <Feather name="chevron-down" size={10} color="#94a3b8" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        {showSort && (
          <View style={styles.sortOverlayBox}>
            <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('rarity'); setShowSort(false); }}>
              <Text style={[styles.sortOptionText, sortBy === 'rarity' && styles.activeSortOptionText]}>Sort by Rarity</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('points'); setShowSort(false); }}>
              <Text style={[styles.sortOptionText, sortBy === 'points' && styles.activeSortOptionText]}>Sort by Points</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortOption} onPress={() => { setSortBy('unlocked'); setShowSort(false); }}>
              <Text style={[styles.sortOptionText, sortBy === 'unlocked' && styles.activeSortOptionText]}>Sort by Unlocked</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. Achievements Horizontal List */}
        <View style={styles.achievementsGrid}>
          {achievementsList.map((ach) => {
            const isCompleted = ach.status === 'COMPLETED';
            const isProgress = ach.status === 'PROGRESS';
            const isLocked = ach.status === 'LOCKED';

            return (
              <View key={ach.id} style={[styles.achievementCard, isLocked && styles.lockedCard]}>
                {/* Left side: Hexagon badge */}
                <View style={styles.cardLeft}>
                  <HexagonBadge size={46} color={ach.color} isLocked={isLocked}>
                    {ach.icon}
                  </HexagonBadge>
                </View>

                {/* Right side: Info */}
                <View style={styles.cardRight}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitle, isLocked && styles.lockedTextColor]} numberOfLines={1}>
                      {ach.title}
                    </Text>
                    <View style={[styles.xpBadge, { backgroundColor: isLocked ? colors.border : ach.color + '15', borderColor: isLocked ? colors.border : ach.color + '30' }]}>
                      <Text style={[styles.xpBadgeText, { color: isLocked ? colors.textSlate : ach.color }]}>+{ach.points} XP</Text>
                    </View>
                  </View>

                  <Text style={styles.cardDesc} numberOfLines={2}>{ach.desc}</Text>

                  {/* Footer progress bar or status badge */}
                  <View style={styles.cardFooter}>
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <Feather name="check" size={10} color="#22c55e" style={{ marginRight: 3 }} />
                        <Text style={styles.completedBadgeText}>Completed</Text>
                      </View>
                    )}
                    {isProgress && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressLabel}>Progress</Text>
                          <Text style={[styles.progressRatioText, { color: ach.color }]}>
                            {ach.current}<Text style={{ color: colors.textSlate }}>/{ach.total}</Text>
                          </Text>
                        </View>
                        <View style={styles.cardProgressBarBg}>
                          <View style={[styles.cardProgressBarFill, { width: `${(ach.current / ach.total) * 100}%`, backgroundColor: ach.color }]} />
                        </View>
                      </View>
                    )}
                    {isLocked && (
                      <View style={styles.lockedBadge}>
                        <Text style={styles.lockedBadgeText}>Locked</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* 7. Current Streak Section */}
        <View style={styles.streakPanelCard}>
          <View style={styles.streakCardHeader}>
            <View style={styles.streakLeftCol}>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <View style={styles.streakDaysValRow}>
                <MaterialCommunityIcons name="fire" size={24} color="#f97316" style={{ marginRight: 4 }} />
                <Text style={styles.streakDaysText}>{currentStreak} <Text style={{ fontSize: 11, fontWeight: 'normal', color: '#64748b' }}>Days</Text></Text>
              </View>
            </View>

            <View style={styles.streakDivider} />

            <View style={styles.streakMiddleCol}>
              <Text style={styles.streakTitle}>
                {currentStreak >= 7 ? 'Awesome streak!' : 'Keep it up!'}
              </Text>
              <Text style={styles.streakDesc}>
                {currentStreak >= 7 
                  ? 'You unlocked the Streak Pro badge.' 
                  : `${Math.max(0, 7 - currentStreak)} more days to unlock Streak Pro badge.`
                }
              </Text>
            </View>

            <View style={styles.streakDivider} />

            <View style={styles.streakRightCol}>
              <Text style={styles.streakLabel}>Best Streak</Text>
              <View style={styles.bestStreakRow}>
                <FontAwesome5 name="trophy" size={13} color="#eab308" style={{ marginRight: 4 }} />
                <Text style={styles.bestStreakVal}>{Math.max(currentStreak, 5)} Days</Text>
              </View>
              <Text style={styles.bestStreakDate}>Active</Text>
            </View>
          </View>

          {/* Dots row */}
          <View style={styles.streakDotsRow}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const isChecked = idx < currentStreak;
              return (
                <View key={day} style={styles.streakDotItem}>
                  <View style={[styles.streakDotRing, isChecked ? styles.checkedDotRing : styles.uncheckedDotRing]}>
                    {isChecked ? (
                      <Feather name="check" size={10} color="#22c55e" />
                    ) : (
                      <View style={styles.dotPlaceholder} />
                    )}
                  </View>
                  <Text style={styles.streakDotLabel}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 8. Unlock More Rewards Banner */}
        <TouchableOpacity style={styles.rewardsBanner} onPress={() => setShowRewardsModal(true)}>
          <View style={styles.rewardsLeft}>
            <HexagonBadge size={36} color="#00f5ff">
              <Feather name="star" size={16} color="#00f5ff" />
            </HexagonBadge>
            <View style={styles.rewardsTextCol}>
              <Text style={styles.rewardsTitle}>Unlock more achievements</Text>
              <Text style={styles.rewardsSub}>Keep driving safe and unlock exciting rewards!</Text>
            </View>
          </View>
          <View style={styles.rewardsBtn}>
            <Text style={styles.rewardsBtnText}>View Rewards</Text>
            <Feather name="chevron-right" size={12} color="#00f5ff" style={{ marginLeft: 3 }} />
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Rewards Modal Overlay */}
      <Modal
        visible={showRewardsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Feather name="gift" size={22} color="#00f5ff" />
              <Text style={styles.modalTitle}>Unlocked Driver Rewards</Text>
              <TouchableOpacity onPress={() => setShowRewardsModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                <Text style={styles.rewardsIntro}>
                  Safe driving pays off! Here are discount vouchers from our safety partners:
                </Text>

                {/* Reward 1 */}
                <View style={styles.rewardCard}>
                  <View style={styles.rewardHeader}>
                    <MaterialCommunityIcons name="gas-station" size={24} color="#eab308" />
                    <View style={styles.rewardTitleCol}>
                      <Text style={styles.rewardTitleText}>10% Fuel Discount Voucher</Text>
                      <Text style={styles.rewardSource}>HP Energy Petrol Stations</Text>
                    </View>
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>UNLOCKED</Text>
                    </View>
                  </View>
                  <Text style={styles.rewardDesc}>
                    Claim 10% discount on fuel. Unlocked for maintaining average safety score &gt; 80.
                  </Text>
                  <View style={styles.couponCodeRow}>
                    <Text style={styles.couponCodeLabel}>Coupon Code:</Text>
                    <Text style={styles.couponCodeText}>DRIVESAFE10</Text>
                    <TouchableOpacity 
                      style={styles.copyBtn} 
                      onPress={async () => {
                        await Clipboard.setStringAsync('DRIVESAFE10');
                        Alert.alert('Code Copied', 'Coupon code "DRIVESAFE10" copied to clipboard!');
                      }}
                    >
                      <Text style={styles.copyBtnText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Reward 2 */}
                <View style={styles.rewardCard}>
                  <View style={styles.rewardHeader}>
                    <MaterialCommunityIcons name="car-shield" size={24} color="#22c55e" />
                    <View style={styles.rewardTitleCol}>
                      <Text style={styles.rewardTitleText}>5% Auto Insurance Rebate</Text>
                      <Text style={styles.rewardSource}>SafeGuard Insurance Corp</Text>
                    </View>
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>UNLOCKED</Text>
                    </View>
                  </View>
                  <Text style={styles.rewardDesc}>
                    Reduce your auto insurance premium. Unlocked for completing 5+ clean drives.
                  </Text>
                  <View style={styles.couponCodeRow}>
                    <Text style={styles.couponCodeLabel}>Coupon Code:</Text>
                    <Text style={styles.couponCodeText}>PREMIUM5SAFE</Text>
                    <TouchableOpacity 
                      style={styles.copyBtn} 
                      onPress={async () => {
                        await Clipboard.setStringAsync('PREMIUM5SAFE');
                        Alert.alert('Code Copied', 'Coupon code "PREMIUM5SAFE" copied to clipboard!');
                      }}
                    >
                      <Text style={styles.copyBtnText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Reward 3 */}
                <View style={[styles.rewardCard, { opacity: totalDistanceKm >= 100 ? 1 : 0.65 }]}>
                  <View style={styles.rewardHeader}>
                    <MaterialCommunityIcons name="ev-station" size={24} color="#00f5ff" />
                    <View style={styles.rewardTitleCol}>
                      <Text style={styles.rewardTitleText}>Free 15 kWh EV Charging</Text>
                      <Text style={styles.rewardSource}>ChargeUp Fast EV Network</Text>
                    </View>
                    {totalDistanceKm >= 100 ? (
                      <View style={styles.unlockedBadge}>
                        <Text style={styles.unlockedText}>UNLOCKED</Text>
                      </View>
                    ) : (
                      <View style={styles.lockedBadge}>
                        <Text style={styles.lockedText}>LOCKED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rewardDesc}>
                    Claim free EV charging session. Unlocks after accumulating 100+ km of safety-monitored driving.
                  </Text>
                  {totalDistanceKm >= 100 ? (
                    <View style={styles.couponCodeRow}>
                      <Text style={styles.couponCodeLabel}>Coupon Code:</Text>
                      <Text style={styles.couponCodeText}>CHARGEUP15EV</Text>
                      <TouchableOpacity 
                        style={styles.copyBtn} 
                        onPress={async () => {
                          await Clipboard.setStringAsync('CHARGEUP15EV');
                          Alert.alert('Code Copied', 'Coupon code "CHARGEUP15EV" copied to clipboard!');
                        }}
                      >
                        <Text style={styles.copyBtnText}>Copy</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.rewardProgressRow}>
                      <Text style={styles.progressLabel}>Progress: {Math.round(totalDistanceKm)} / 100 km</Text>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${Math.min(100, (totalDistanceKm / 100) * 100)}%` }]} />
                      </View>
                    </View>
                  )}
                </View>

                {/* Reward 4 */}
                <View style={styles.rewardCard}>
                  <View style={styles.rewardHeader}>
                    <MaterialCommunityIcons name="coffee" size={24} color="#a855f7" />
                    <View style={styles.rewardTitleCol}>
                      <Text style={styles.rewardTitleText}>Free Highway Coffee Coupon</Text>
                      <Text style={styles.rewardSource}>HighwayCafe Partner Shops</Text>
                    </View>
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>UNLOCKED</Text>
                    </View>
                  </View>
                  <Text style={styles.rewardDesc}>
                    Free hot beverage coupon. Unlocked for completing 1 drive session without a single speeding event.
                  </Text>
                  <View style={styles.couponCodeRow}>
                    <Text style={styles.couponCodeLabel}>Coupon Code:</Text>
                    <Text style={styles.couponCodeText}>FREEBREWCAFE</Text>
                    <TouchableOpacity 
                      style={styles.copyBtn} 
                      onPress={async () => {
                        await Clipboard.setStringAsync('FREEBREWCAFE');
                        Alert.alert('Code Copied', 'Coupon code "FREEBREWCAFE" copied to clipboard!');
                      }}
                    >
                      <Text style={styles.copyBtnText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseMainBtn} onPress={() => setShowRewardsModal(false)}>
              <Text style={styles.modalCloseMainBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 15,
      backgroundColor: colors.background,
    },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
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
      fontSize: 22,
      fontWeight: 'bold',
    },
    headerSubtitle: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 5,
    },

    // Trophy Banner Card
    trophyBannerCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
    },
    trophyVisual: {
      marginRight: 14,
    },
    trophyInfo: {
      flex: 1,
    },
    bannerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    bannerSubtitle: {
      color: colors.textSlate,
      fontSize: 11.5,
      marginBottom: 12,
    },
    bannerStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    bannerStatItem: {
      flex: 1,
      alignItems: 'center',
      marginRight: 4,
    },
    bannerStatValue: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    bannerStatLabel: {
      color: colors.textSlate,
      fontSize: 8,
      textAlign: 'center',
      marginTop: 2,
    },

    // Level Progression Bar
    levelBarCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 14,
      marginBottom: 16,
    },
    levelMiddle: {
      flex: 1,
      marginLeft: 12,
    },
    levelTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    levelMainText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
    },
    levelXpText: {
      color: '#84cc16',
      fontSize: 11,
      fontWeight: 'bold',
    },
    levelSubText: {
      color: colors.textSlate,
      fontSize: 10,
      marginBottom: 6,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 4,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#84cc16',
      borderRadius: 3,
    },
    progressBarSub: {
      color: colors.textSlate,
      fontSize: 8.5,
      fontWeight: '500',
    },

    // Lock Overlay on Hexagon
    lockOverlay: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: colors.card,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.textSlate,
      width: 14,
      height: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Tabs Selector
    tabsContainer: {
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabsScrollContent: {
      paddingBottom: 2,
    },
    tabItem: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    activeTabItem: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    tabText: {
      color: colors.textSlate,
      fontSize: 12.5,
      fontWeight: 'bold',
    },
    activeTabText: {
      color: colors.accent,
    },
    tabIndicator: {
      position: 'absolute',
      bottom: -2,
      left: 16,
      right: 16,
      height: 2,
      backgroundColor: colors.accent,
      borderRadius: 1,
    },

    // Count and Sort Row
    countSortRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    unlockedHeading: {
      fontSize: 13,
      fontWeight: 'bold',
    },
    sortDropdownBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    sortBtnLabel: {
      color: colors.text,
      fontSize: 10.5,
      fontWeight: '500',
    },
    sortOverlayBox: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 6,
      position: 'absolute',
      top: 295,
      right: 20,
      zIndex: 999,
      width: 130,
    },
    sortOption: {
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    sortOptionText: {
      color: colors.textSlate,
      fontSize: 11,
    },
    activeSortOptionText: {
      color: colors.accent,
      fontWeight: 'bold',
    },

    // Achievements Horizontal Grid List
    achievementsGrid: {
      gap: 12,
      marginBottom: 20,
    },
    achievementCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      alignItems: 'center',
    },
    lockedCard: {
      opacity: 0.6,
    },
    cardLeft: {
      marginRight: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardRight: {
      flex: 1,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
      flex: 1,
      marginRight: 8,
    },
    lockedTextColor: {
      color: colors.textSlate,
    },
    xpBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 1,
    },
    xpBadgeText: {
      fontSize: 9.5,
      fontWeight: 'bold',
    },
    cardDesc: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 15,
      marginBottom: 8,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(34, 197, 94, 0.08)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    completedBadgeText: {
      color: '#22c55e',
      fontSize: 10,
      fontWeight: 'bold',
    },
    lockedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(100, 116, 139, 0.08)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(100, 116, 139, 0.2)',
    },
    lockedBadgeText: {
      color: colors.textSlate,
      fontSize: 10,
      fontWeight: 'bold',
    },
    progressContainer: {
      flex: 1,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    progressLabel: {
      color: colors.textSlate,
      fontSize: 9.5,
      fontWeight: '500',
    },
    progressRatioText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    cardProgressBarBg: {
      height: 5,
      backgroundColor: colors.border,
      borderRadius: 2.5,
      overflow: 'hidden',
    },
    cardProgressBarFill: {
      height: '100%',
      borderRadius: 2.5,
    },

    // Streak Calendar Panel Card
    streakPanelCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      padding: 16,
      marginBottom: 16,
    },
    streakCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 12,
      marginBottom: 14,
    },
    streakLeftCol: {
      alignItems: 'flex-start',
    },
    streakLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    streakDaysValRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    streakDaysText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '900',
    },
    streakDivider: {
      width: 1,
      backgroundColor: colors.border,
      height: '75%',
      alignSelf: 'center',
    },
    streakMiddleCol: {
      flex: 1,
      paddingHorizontal: 12,
    },
    streakTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    streakDesc: {
      color: colors.textSlate,
      fontSize: 9,
      lineHeight: 12,
    },
    streakRightCol: {
      alignItems: 'flex-end',
    },
    bestStreakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 2,
    },
    bestStreakVal: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    bestStreakDate: {
      color: colors.textSlate,
      fontSize: 8.5,
      fontWeight: '500',
    },
    streakDotsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 14,
    },
    streakDotItem: {
      alignItems: 'center',
    },
    streakDotRing: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    checkedDotRing: {
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.08)',
    },
    uncheckedDotRing: {
      borderColor: colors.textSlate,
      backgroundColor: 'transparent',
    },
    dotPlaceholder: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.textSlate,
    },
    streakDotLabel: {
      color: colors.textSlate,
      fontSize: 8.5,
      fontWeight: 'bold',
    },

    // Rewards Banner
    rewardsBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 20,
      padding: 14,
      marginBottom: 16,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    rewardsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    rewardsTextCol: {
      marginLeft: 12,
      flex: 1,
    },
    rewardsTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    rewardsSub: {
      color: colors.textSlate,
      fontSize: 9.5,
    },
    rewardsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    rewardsBtnText: {
      color: colors.accent,
      fontSize: 10.5,
      fontWeight: 'bold',
    },
    bottomSpacer: {
      height: 60,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(5, 11, 20, 0.9)' : 'rgba(241, 245, 249, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '85%',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 15,
      marginBottom: 10,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
      flex: 1,
    },
    modalCloseBtn: {
      padding: 4,
    },
    modalScroll: {
      flexGrow: 0,
    },
    modalBody: {
      paddingVertical: 10,
    },
    rewardsIntro: {
      color: colors.textMuted,
      fontSize: 11.5,
      lineHeight: 16,
      marginBottom: 15,
    },
    rewardCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 12,
      marginBottom: 14,
    },
    rewardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    rewardTitleCol: {
      flex: 1,
      marginLeft: 10,
      marginRight: 6,
    },
    rewardTitleText: {
      color: colors.text,
      fontSize: 11.5,
      fontWeight: 'bold',
    },
    rewardSource: {
      color: colors.textSlate,
      fontSize: 9,
      marginTop: 1,
    },
    unlockedBadge: {
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.3)',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    unlockedText: {
      color: '#22c55e',
      fontSize: 8,
      fontWeight: 'bold',
    },
    lockedBadge: {
      backgroundColor: 'rgba(71, 85, 105, 0.12)',
      borderWidth: 1,
      borderColor: '#47556940',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    lockedText: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: 'bold',
    },
    rewardDesc: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 14,
      marginBottom: 8,
    },
    couponCodeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginTop: 4,
    },
    couponCodeLabel: {
      color: colors.textSlate,
      fontSize: 9,
      fontWeight: '500',
    },
    couponCodeText: {
      color: colors.accent,
      fontSize: 10.5,
      fontWeight: 'bold',
      marginLeft: 6,
      flex: 1,
    },
    copyBtn: {
      backgroundColor: 'rgba(0, 245, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(0, 245, 255, 0.25)',
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    copyBtnText: {
      color: colors.accent,
      fontSize: 9.5,
      fontWeight: 'bold',
    },
    rewardProgressRow: {
      marginTop: 6,
    },
    progressLabel: {
      color: colors.textSlate,
      fontSize: 9,
      marginBottom: 4,
    },
    modalCloseMainBtn: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 15,
    },
    modalCloseMainBtnText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
    },
  });
}
