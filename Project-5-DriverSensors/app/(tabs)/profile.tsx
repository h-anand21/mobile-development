import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { driveRepository } from '../../src/database/repositories/driveRepository';

const { width } = Dimensions.get('window');

// Hexagon Badge Wrapper using SVG
const HexagonBadge = ({ size = 56, color = '#22c55e', children }: { size?: number, color?: string, children?: React.ReactNode }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Polygon
          points="50,5 93,25 93,75 50,95 7,75 7,25"
          fill="rgba(8, 15, 26, 0.4)"
          stroke={color}
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </Svg>
      <View style={{ zIndex: 2 }}>
        {children}
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();

  // Load drives from DB
  const dbDrives = driveRepository.getAllDrives();

  // Stats calculation (adapt dynamically to real drives, fallback to mockup)
  const totalDrivesCount = dbDrives.length > 5 ? dbDrives.length : 128;
  const avgScore = dbDrives.length > 5
    ? Math.round(dbDrives.reduce((acc, d) => acc + d.score, 0) / dbDrives.length)
    : 84;
  const totalDistanceKm = dbDrives.length > 5
    ? (dbDrives.reduce((acc, d) => acc + d.distance, 0) / 1000).toFixed(1)
    : '2,356.8';
  const totalDurationHrs = dbDrives.length > 5
    ? Math.round(dbDrives.reduce((acc, d) => acc + d.duration, 0) / 3600)
    : 52;
  const totalDurationMins = dbDrives.length > 5
    ? Math.round((dbDrives.reduce((acc, d) => acc + d.duration, 0) % 3600) / 60)
    : 18;

  const scoreRating = avgScore >= 90 ? 'Excellent' : avgScore >= 70 ? 'Good' : avgScore >= 60 ? 'Fair' : 'Poor';
  const ratingColor = avgScore >= 90 ? '#22c55e' : avgScore >= 70 ? '#22c55e' : avgScore >= 60 ? '#eab308' : '#ef4444';

  // Driving summary mockups
  const summaryItems = [
    { id: '1', title: 'Smooth Drives', value: '76%', color: '#22c55e', icon: 'check-circle', iconType: 'feather', wave: 'M 0,10 Q 15,4 30,12 T 60,6 T 90,12' },
    { id: '2', title: 'Safety Score', value: '92%', color: '#22c55e', icon: 'shield-check-outline', iconType: 'material', wave: 'M 0,8 Q 15,14 30,6 T 60,12 T 90,8' },
    { id: '3', title: 'Consistency', value: '88%', color: '#00f5ff', icon: 'circle-double', iconType: 'material', wave: 'M 0,12 Q 15,8 30,14 T 60,8 T 90,12' },
    { id: '4', title: 'Improvement', value: '+18%', color: '#a855f7', icon: 'trending-up', iconType: 'feather', wave: 'M 0,6 Q 15,12 30,8 T 60,14 T 90,8' }
  ];

  // Achievements mockups
  const achievements = [
    {
      id: 'a1',
      title: 'Consistency Pro',
      subtitle: '10 consistent drives',
      color: '#22c55e',
      icon: <Feather name="star" size={22} color="#22c55e" />
    },
    {
      id: 'a2',
      title: 'Long Distance',
      subtitle: 'Drove 500+ km in a week',
      color: '#00f5ff',
      icon: <FontAwesome5 name="road" size={18} color="#00f5ff" />
    },
    {
      id: 'a3',
      title: 'Night Owl',
      subtitle: 'Completed 10 night drives',
      color: '#a855f7',
      icon: <Feather name="moon" size={20} color="#a855f7" />
    },
    {
      id: 'a4',
      title: 'Speed Master',
      subtitle: 'Maintained speed control',
      color: '#eab308',
      icon: <MaterialCommunityIcons name="speedometer" size={22} color="#eab308" />
    }
  ];

  // Menu Settings mockups
  const menuSettings = [
    { id: 'personal', title: 'Personal Information', icon: 'person-outline', iconType: 'ion', color: '#00f5ff' },
    { id: 'vehicles', title: 'Vehicles', icon: 'car-outline', iconType: 'material', color: '#22c55e' },
    { id: 'preferences', title: 'Driving Preferences', icon: 'sliders', iconType: 'feather', color: '#eab308' },
    { id: 'notifications', title: 'Notification Settings', icon: 'bell', iconType: 'feather', color: '#a855f7' },
    { id: 'privacy', title: 'Privacy & Security', icon: 'lock-closed-outline', iconType: 'ion', color: '#ef4444' }
  ];

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing is coming soon!', [{ text: 'OK' }]);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.iconBtn}>
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Driver Profile</Text>

        <TouchableOpacity onPress={handleEditProfile} style={styles.iconBtn}>
          <Feather name="edit-3" size={20} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Profile Details Panel */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop' }}
              style={styles.avatarImg}
            />
            <View style={styles.cameraIconBadge}>
              <Feather name="camera" size={10} color="#ffffff" />
            </View>
          </View>

          <View style={styles.profileInfoCol}>
            <Text style={styles.profileName}>Arjun Sharma</Text>
            <Text style={styles.profileEmail}>arjun.sharma@email.com</Text>
            <View style={styles.verifiedRow}>
              <MaterialCommunityIcons name="check-decagram" size={14} color="#00f5ff" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>Verified Driver</Text>
            </View>
          </View>

          <View style={styles.safeDriverBadge}>
            <Feather name="shield" size={22} color="#22c55e" />
            <Feather name="star" size={10} color="#22c55e" style={{ position: 'absolute', top: 12 }} />
            <Text style={styles.safeDriverText}>Safe Driver</Text>
          </View>
        </View>

        {/* 3. Short Stats Grid */}
        <View style={styles.statsRow}>
          {/* Average Score */}
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Average Score</Text>
            <View style={styles.gaugeContainer}>
              <Svg width={44} height={44} viewBox="0 0 50 50">
                <Circle cx="25" cy="25" r="20" stroke="#122540" strokeWidth="3.5" fill="none" />
                <Circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="#22c55e"
                  strokeWidth="4.5"
                  fill="none"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * avgScore) / 100}
                  transform="rotate(-90 25 25)"
                  strokeLinecap="round"
                />
              </Svg>
              <View style={styles.gaugeCenterTextWrap}>
                <Text style={styles.gaugeCenterText}>{avgScore}</Text>
              </View>
            </View>
            <Text style={[styles.statSubText, { color: ratingColor, fontWeight: 'bold' }]}>{scoreRating}</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Total Distance */}
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Total Distance</Text>
            <FontAwesome5 name="road" size={18} color="#eab308" style={{ marginVertical: 4 }} />
            <Text style={styles.statValue}>{totalDistanceKm}</Text>
            <Text style={styles.statSubText}>km</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Total Drives */}
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Total Drives</Text>
            <MaterialCommunityIcons name="steering" size={20} color="#00f5ff" style={{ marginVertical: 3 }} />
            <Text style={styles.statValue}>{totalDrivesCount}</Text>
            <Text style={styles.statSubText}>drives</Text>
          </View>

          <View style={styles.statDivider} />

          {/* Total Duration */}
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Total Duration</Text>
            <Feather name="clock" size={18} color="#a855f7" style={{ marginVertical: 4 }} />
            <Text style={styles.statValue}>{totalDurationHrs}h {totalDurationMins}m</Text>
            <Text style={styles.statSubText}>hours</Text>
          </View>
        </View>

        {/* 4. Level progression bar card */}
        <View style={styles.levelCard}>
          <HexagonBadge size={44} color="#84cc16">
            <Feather name="award" size={20} color="#84cc16" />
          </HexagonBadge>

          <View style={styles.levelMiddle}>
            <View style={styles.levelRow}>
              <Text style={styles.levelTitle}>Level 4</Text>
              <Text style={styles.levelXp}>2,450 <Text style={{ color: '#64748b', fontWeight: '500' }}>/ 3,000 XP</Text></Text>
            </View>
            <Text style={styles.levelSub}>Confident Driver</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '81.6%' }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.nextLevelCol}>
            <Text style={styles.nextLevelLabel}>Next Level</Text>
            <View style={styles.nextLevelValRow}>
              <Text style={styles.nextLevelVal}>Level 5</Text>
              <Feather name="chevron-right" size={12} color="#64748b" style={{ marginLeft: 3 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. Driving Summary section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Driving Summary</Text>
          <TouchableOpacity onPress={() => router.push('/reports')} style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="chevron-right" size={12} color="#00f5ff" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryScroll}>
            {summaryItems.map((item) => (
              <View key={item.id} style={styles.summaryGridCard}>
                <View style={styles.summaryCardHeader}>
                  {item.iconType === 'feather' ? (
                    <Feather name={item.icon as any} size={11} color={item.color} style={{ marginRight: 4 }} />
                  ) : (
                    <MaterialCommunityIcons name={item.icon as any} size={12} color={item.color} style={{ marginRight: 4 }} />
                  )}
                  <Text style={styles.summaryCardTitle} numberOfLines={1}>{item.title}</Text>
                </View>
                <Text style={[styles.summaryCardValue, { color: item.color }]}>{item.value}</Text>
                <Svg width={90} height={20} style={styles.miniWaveChart}>
                  <Path d={item.wave} stroke={item.color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </Svg>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 6. Recent Achievements section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Recent Achievements</Text>
          <TouchableOpacity onPress={() => router.push('/achievements')} style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="chevron-right" size={12} color="#00f5ff" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryScroll}>
            {achievements.map((item) => (
              <View key={item.id} style={styles.achievementCard}>
                <HexagonBadge size={54} color={item.color}>
                  {item.icon}
                </HexagonBadge>
                <Text style={styles.achievementTitle}>{item.title}</Text>
                <Text style={styles.achievementSub}>{item.subtitle}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 7. Settings List Card */}
        <View style={styles.menuListCard}>
          {menuSettings.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItemRow, idx === menuSettings.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => {
                if (item.id === 'preferences' || item.id === 'notifications') {
                  router.push('/settings');
                } else {
                  Alert.alert(item.title, `${item.title} page is coming soon!`);
                }
              }}
            >
              <View style={[styles.menuIconContainer, { borderColor: item.color + '40', backgroundColor: item.color + '0a' }]}>
                {item.iconType === 'feather' && <Feather name={item.icon as any} size={16} color={item.color} />}
                {item.iconType === 'material' && <MaterialCommunityIcons name={item.icon as any} size={17} color={item.color} />}
                {item.iconType === 'ion' && <Ionicons name={item.icon as any} size={16} color={item.color} />}
              </View>

              <Text style={styles.menuItemText}>{item.title}</Text>

              <Feather name="chevron-right" size={16} color="#475569" />
            </TouchableOpacity>
          ))}
        </View>

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
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },

  // Profile details card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  avatarWrap: {
    position: 'relative',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#00f5ff',
    padding: 2,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#050B14',
    borderWidth: 1.5,
    borderColor: '#00f5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileEmail: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 6,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#00f5ff',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  safeDriverBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: 14,
    width: 76,
    height: 64,
    position: 'relative',
  },
  safeDriverText: {
    color: '#22c55e',
    fontSize: 8.5,
    fontWeight: 'bold',
    marginTop: 22,
    textAlign: 'center',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#0c1626',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#122540',
    paddingVertical: 14,
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#122540',
    height: '60%',
    alignSelf: 'center',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statSubText: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 2,
  },

  // Score circular gauge
  gaugeContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenterTextWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },

  // Level Progression
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
  },
  levelMiddle: {
    flex: 1,
    marginHorizontal: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  levelTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  levelXp: {
    color: '#84cc16',
    fontSize: 11,
    fontWeight: 'bold',
  },
  levelSub: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#122540',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#84cc16',
    borderRadius: 3,
  },
  nextLevelCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  nextLevelLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '500',
    marginBottom: 2,
  },
  nextLevelValRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextLevelVal: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#00f5ff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Summary Scroll
  summaryScroll: {
    paddingRight: 10,
  },
  summaryGridCard: {
    width: 115,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 18,
    padding: 12,
    marginRight: 10,
    height: 96,
    position: 'relative',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  summaryCardTitle: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  miniWaveChart: {
    position: 'absolute',
    bottom: 6,
    left: 12,
  },

  // Achievements
  achievementCard: {
    width: 130,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 18,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  achievementTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  achievementSub: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },

  // Menu Settings Card
  menuListCard: {
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#122540',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: 'bold',
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  }
});
