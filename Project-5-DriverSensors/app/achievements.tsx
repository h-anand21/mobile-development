import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Modal, Clipboard } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Polygon, Ellipse } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { driveRepository } from '../src/database/repositories/driveRepository';
import { useAppTheme } from '../src/ui/theme';

const { width } = Dimensions.get('window');

// 3-Column Card Width Math
const cardWidth = (width - 40 - 16) / 3;

// Mock Achievement List Data
const INITIAL_ACHIEVEMENTS = [
  {
    id: '1',
    category: 'driving',
    title: 'Safe Driver',
    desc: 'Drive 10 safe drives without any harsh events',
    points: 100,
    status: 'COMPLETED',
    icon: <Feather name="check" size={18} color="#22c55e" />,
    color: '#22c55e'
  },
  {
    id: '2',
    category: 'milestone',
    title: '100 KM Explorer',
    desc: 'Drive 100 kilometers in total',
    points: 150,
    status: 'COMPLETED',
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
    status: 'COMPLETED',
    icon: <MaterialCommunityIcons name="steering" size={16} color="#a855f7" />,
    color: '#a855f7'
  },
  {
    id: '4',
    category: 'driving',
    title: 'Speed Master',
    desc: 'Maintain average speed below 60 km/h for 5 drives',
    points: 120,
    status: 'PROGRESS',
    current: 3,
    total: 5,
    icon: <MaterialCommunityIcons name="speedometer" size={18} color="#eab308" />,
    color: '#eab308'
  },
  {
    id: '5',
    category: 'driving',
    title: 'Eco Driver',
    desc: 'Drive 50 km with smooth acceleration',
    points: 150,
    status: 'PROGRESS',
    current: 32,
    total: 50,
    icon: <MaterialCommunityIcons name="leaf" size={16} color="#84cc16" />,
    color: '#84cc16'
  },
  {
    id: '6',
    category: 'driving',
    title: 'Night Rider',
    desc: 'Complete 10 night drives safely',
    points: 100,
    status: 'PROGRESS',
    current: 6,
    total: 10,
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
      <View style={{ alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
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
    icon: <Feather name="users" size={16} color="#94a3b8" style={{ opacity: 0.4 }} />,
    color: '#64748b'
  },
  {
    id: '9',
    category: 'special',
    title: 'Perfect Week',
    desc: 'Get 7 safe drives in a single week',
    points: 300,
    status: 'LOCKED',
    icon: <FontAwesome5 name="trophy" size={16} color="#94a3b8" style={{ opacity: 0.4 }} />,
    color: '#64748b'
  }
];

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

  // Combine DB logic to unlock achievements
  const achievementsList = useMemo(() => {
    const list = [...INITIAL_ACHIEVEMENTS];
    
    if (dbDrives.length > 0) {
      const dbDistance = dbDrives.reduce((acc, d) => acc + d.distance, 0);
      
      // Update 100 KM Explorer Explorer
      const explorer = list.find(a => a.id === '2');
      if (explorer) {
        const km = dbDistance / 1000;
        if (km >= 100) {
          explorer.status = 'COMPLETED';
        } else {
          explorer.status = 'PROGRESS';
          explorer.current = Math.round(km);
          explorer.total = 100;
        }
      }

      // Update 500 KM Journey
      const journey = list.find(a => a.id === '7');
      if (journey) {
        const km = dbDistance / 1000;
        if (km >= 500) {
          journey.status = 'COMPLETED';
        } else {
          journey.status = 'LOCKED';
          journey.current = Math.round(km);
          journey.total = 500;
        }
      }
    }

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
  }, [activeTab, sortBy, dbDrives]);

  const unlockedCount = useMemo(() => {
    return INITIAL_ACHIEVEMENTS.filter(a => a.status === 'COMPLETED').length;
  }, []);

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
                <Text style={styles.bannerStatValue}>18</Text>
                <Text style={styles.bannerStatLabel} numberOfLines={1}>Unlocked</Text>
              </View>
              <View style={styles.bannerStatItem}>
                <Feather name="star" size={13} color="#eab308" style={{ marginBottom: 3 }} />
                <Text style={styles.bannerStatValue}>2,450</Text>
                <Text style={styles.bannerStatLabel} numberOfLines={1}>Total Points</Text>
              </View>
              <View style={styles.bannerStatItem}>
                <MaterialCommunityIcons name="trending-up" size={13} color="#a855f7" style={{ marginBottom: 3 }} />
                <Text style={styles.bannerStatValue}>Level 4</Text>
                <Text style={styles.bannerStatLabel} numberOfLines={1}>Confident</Text>
              </View>
              <View style={styles.bannerStatItem}>
                <Feather name="award" size={13} color="#00f5ff" style={{ marginBottom: 3 }} />
                <Text style={styles.bannerStatValue}>Top 23%</Text>
                <Text style={styles.bannerStatLabel} numberOfLines={1}>Drivers Rank</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Level Progression Bar */}
        <View style={styles.levelBarCard}>
          <HexagonBadge size={38} color="#84cc16">
            <Text style={{ color: '#84cc16', fontSize: 13, fontWeight: 'bold' }}>4</Text>
          </HexagonBadge>
          <View style={styles.levelMiddle}>
            <View style={styles.levelTitleRow}>
              <Text style={styles.levelMainText}>Level 4</Text>
              <Text style={styles.levelXpText}>2,450 <Text style={{ color: '#64748b', fontWeight: 'normal' }}>/ 3,000 XP</Text></Text>
            </View>
            <Text style={styles.levelSubText}>Confident Driver</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '81.6%' }]} />
            </View>
            <Text style={styles.progressBarSub}>550 XP to reach Level 5</Text>
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
            <Text style={{ color: '#64748b' }}> / 32 Achievements Unlocked</Text>
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

        {/* 6. Achievements 3-Column Grid */}
        <View style={styles.achievementsGrid}>
          {achievementsList.map((ach) => {
            const isCompleted = ach.status === 'COMPLETED';
            const isProgress = ach.status === 'PROGRESS';
            const isLocked = ach.status === 'LOCKED';

            return (
              <View key={ach.id} style={[styles.achievementCard, isLocked && styles.lockedCard]}>
                {/* Hexagon icon */}
                <HexagonBadge size={40} color={ach.color} isLocked={isLocked}>
                  {ach.icon}
                </HexagonBadge>

                {/* Content */}
                <Text style={[styles.cardTitle, isLocked && { color: '#64748b' }]} numberOfLines={1}>{ach.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={3}>{ach.desc}</Text>

                {/* Footer status / progress */}
                <View style={styles.cardFooter}>
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Feather name="check" size={8} color="#22c55e" style={{ marginRight: 2 }} />
                      <Text style={styles.completedBadgeText}>Completed</Text>
                    </View>
                  )}
                  {isProgress && (
                    <Text style={[styles.progressRatioText, { color: ach.color }]}>
                      {ach.current}<Text style={{ color: '#475569' }}>/{ach.total}</Text>
                    </Text>
                  )}
                  {isLocked && (
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedBadgeText}>Locked</Text>
                    </View>
                  )}

                  <Text style={styles.cardXpLabel}>+{ach.points} XP</Text>
                </View>

                {/* Thin progress bar for in-progress items */}
                {isProgress && ach.current !== undefined && ach.total !== undefined && (
                  <View style={styles.cardProgressBarBg}>
                    <View style={[styles.cardProgressBarFill, { width: `${(ach.current / ach.total) * 100}%`, backgroundColor: ach.color }]} />
                  </View>
                )}
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
                <Text style={styles.streakDaysText}>5 <Text style={{ fontSize: 11, fontWeight: 'normal', color: '#64748b' }}>Days</Text></Text>
              </View>
            </View>

            <View style={styles.streakDivider} />

            <View style={styles.streakMiddleCol}>
              <Text style={styles.streakTitle}>Keep it up!</Text>
              <Text style={styles.streakDesc}>2 more days to unlock Streak Pro badge.</Text>
            </View>

            <View style={styles.streakDivider} />

            <View style={styles.streakRightCol}>
              <Text style={styles.streakLabel}>Best Streak</Text>
              <View style={styles.bestStreakRow}>
                <FontAwesome5 name="trophy" size={13} color="#eab308" style={{ marginRight: 4 }} />
                <Text style={styles.bestStreakVal}>12 Days</Text>
              </View>
              <Text style={styles.bestStreakDate}>Apr 22 – May 3</Text>
            </View>
          </View>

          {/* Dots row */}
          <View style={styles.streakDotsRow}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const isChecked = idx < 5;
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
                      onPress={() => {
                        Clipboard.setString('DRIVESAFE10');
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
                      onPress={() => {
                        Clipboard.setString('PREMIUM5SAFE');
                        Alert.alert('Code Copied', 'Coupon code "PREMIUM5SAFE" copied to clipboard!');
                      }}
                    >
                      <Text style={styles.copyBtnText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Reward 3 */}
                <View style={[styles.rewardCard, { opacity: 0.65 }]}>
                  <View style={styles.rewardHeader}>
                    <MaterialCommunityIcons name="ev-station" size={24} color="#00f5ff" />
                    <View style={styles.rewardTitleCol}>
                      <Text style={styles.rewardTitleText}>Free 15 kWh EV Charging</Text>
                      <Text style={styles.rewardSource}>ChargeUp Fast EV Network</Text>
                    </View>
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedText}>LOCKED</Text>
                    </View>
                  </View>
                  <Text style={styles.rewardDesc}>
                    Claim free EV charging session. Unlocks after accumulating 100+ km of safety-monitored driving.
                  </Text>
                  <View style={styles.rewardProgressRow}>
                    <Text style={styles.progressLabel}>Progress: 28.6 / 100 km</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: '28.6%' }]} />
                    </View>
                  </View>
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
                      onPress={() => {
                        Clipboard.setString('FREEBREWCAFE');
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
      fontSize: 12.5,
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

    // Achievements Grid List
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingBottom: 10,
    },
    cardWrapper: {
      width: cardWidth,
      marginBottom: 16,
    },
    achievementCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 10,
      alignItems: 'center',
      height: 125,
      justifyContent: 'center',
    },
    cardLocked: {
      opacity: 0.65,
    },
    cardLabel: {
      color: colors.text,
      fontSize: 10,
      fontWeight: 'bold',
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 12,
      height: 24, // fits max 2 lines
    },
    cardPoints: {
      fontSize: 8.5,
      fontWeight: '800',
      marginTop: 4,
    },

    // Details Slider Section (Single selected achievement highlight card)
    focusAchievementCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      padding: 16,
      marginBottom: 16,
      position: 'relative',
      overflow: 'hidden',
    },
    focusGradientAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    focusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    focusHeaderRight: {
      flex: 1,
      marginLeft: 12,
    },
    focusPointsBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      marginTop: 4,
    },
    focusPointsText: {
      fontSize: 9,
      fontWeight: 'bold',
    },
    focusTitle: {
      color: colors.text,
      fontSize: 15.5,
      fontWeight: 'bold',
    },
    focusDesc: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      marginBottom: 14,
    },

    // Progression Bar Row
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressBarOuter: {
      flex: 1,
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginRight: 12,
      overflow: 'hidden',
    },
    progressBarInner: {
      height: '100%',
      borderRadius: 4,
    },
    progressPercentText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: 'bold',
    },

    // Quick Stats Row
    statBadgeText: {
      color: colors.text,
      fontSize: 10,
      fontWeight: 'bold',
    },
    focusStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.25)',
    },
    focusStatusText: {
      color: '#22c55e',
      fontSize: 10,
      fontWeight: 'bold',
      marginLeft: 4,
    },

    // Streak Calendar Panel
    streakCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      padding: 16,
      marginBottom: 16,
    },
    streakHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 12,
      marginBottom: 14,
    },
    streakHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
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
    progressBarBg: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: 2,
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
