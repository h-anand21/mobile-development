import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Alert, Modal, TextInput, Switch } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { driveRepository } from '../../src/database/repositories/driveRepository';
import { useAppTheme } from '../../src/ui/theme';
import dayjs from 'dayjs';

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
const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Rookie Driver', minXp: 0, maxXp: 1000 },
  { level: 2, name: 'Safe Commuter', minXp: 1000, maxXp: 2500 },
  { level: 3, name: 'Skilled Cruiser', minXp: 2500, maxXp: 5000 },
  { level: 4, name: 'Confident Driver', minXp: 5000, maxXp: 8000 },
  { level: 5, name: 'Road Master', minXp: 8000, maxXp: 12000 },
  { level: 6, name: 'Safety Legend', minXp: 12000, maxXp: 99999999 }
];

function getLevelInfo(totalXp: number) {
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

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  // Load drives from DB
  const dbDrives = driveRepository.getAllDrives();

  // Profile Editable States
  const [name, setName] = useState('Arjun Sharma');
  const [email, setEmail] = useState('arjun.sharma@email.com');
  const [experience, setExperience] = useState('5 Years');

  // Vehicle States
  const [vehicleType, setVehicleType] = useState('EV'); // Sedan, SUV, EV, Truck
  const [vehicleModel, setVehicleModel] = useState('Tesla Model 3');
  const [vehiclePlate, setVehiclePlate] = useState('DL 3C AB 1234');

  // Privacy States
  const [shareTelemetry, setShareTelemetry] = useState(true);
  const [encryption, setEncryption] = useState(true);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);

  // Modal Control States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Temp editing states (to allow Cancel without saving)
  const [tempName, setTempName] = useState('Arjun Sharma');
  const [tempEmail, setTempEmail] = useState('arjun.sharma@email.com');
  const [tempExperience, setTempExperience] = useState('5 Years');

  const [tempVehicleType, setTempVehicleType] = useState('EV');
  const [tempVehicleModel, setTempVehicleModel] = useState('Tesla Model 3');
  const [tempVehiclePlate, setTempVehiclePlate] = useState('DL 3C AB 1234');

  // Stats calculation dynamically from real drives
  const totalDrivesCount = dbDrives.length;
  const avgScore = dbDrives.length > 0
    ? Math.round(dbDrives.reduce((acc, d) => acc + d.score, 0) / dbDrives.length)
    : 0;
  const totalDistanceKm = dbDrives.length > 0
    ? (dbDrives.reduce((acc, d) => acc + d.distance, 0) / 1000).toFixed(1)
    : '0.0';
  const totalDurationHrs = dbDrives.length > 0
    ? Math.round(dbDrives.reduce((acc, d) => acc + d.duration, 0) / 3600)
    : 0;
  const totalDurationMins = dbDrives.length > 0
    ? Math.round((dbDrives.reduce((acc, d) => acc + d.duration, 0) % 3600) / 60)
    : 0;

  const scoreRating = dbDrives.length > 0
    ? (avgScore >= 90 ? 'Excellent' : avgScore >= 70 ? 'Good' : avgScore >= 60 ? 'Fair' : 'Poor')
    : 'No Data';
  const ratingColor = dbDrives.length > 0
    ? (avgScore >= 90 ? '#22c55e' : avgScore >= 70 ? '#22c55e' : avgScore >= 60 ? '#eab308' : '#ef4444')
    : '#64748b';

  // Leveling and XP calculation dynamically (synchronized with AchievementsScreen)
  const { totalXp, levelInfo } = React.useMemo(() => {
    const drivesXp = dbDrives.reduce((acc, d) => acc + (d.score * 10), 0);
    
    const totalDistanceKmVal = dbDrives.reduce((acc, d) => acc + d.distance, 0) / 1000;
    const safeDrivesCount = dbDrives.filter(d => !d.events || d.events.length === 0).length;
    const goodDrivesCount = dbDrives.filter(d => d.score >= 85).length;
    const lowSpeedDrives = dbDrives.filter(d => {
      const avg = d.duration > 0 ? (d.distance / d.duration) * 3.6 : 0;
      return avg > 0 && avg < 60;
    }).length;
    const ecoKm = dbDrives.filter(d => d.score >= 90).reduce((acc, d) => acc + d.distance, 0) / 1000;
    const nightDrives = dbDrives.filter(d => {
      const hour = dayjs(d.startTime).hour();
      const isNight = hour >= 20 || hour < 6;
      return isNight && d.score >= 80;
    }).length;
    const safeDriveDates = Array.from(new Set(
      dbDrives.filter(d => d.score >= 80).map(d => dayjs(d.startTime).format('YYYY-MM-DD'))
    )).sort().reverse();
    
    let currentStreak = 0;
    if (safeDriveDates.length > 0) {
      let checkDate = dayjs();
      const hasToday = safeDriveDates.includes(checkDate.format('YYYY-MM-DD'));
      const hasYesterday = safeDriveDates.includes(checkDate.subtract(1, 'day').format('YYYY-MM-DD'));
      if (hasToday || hasYesterday) {
        currentStreak = 1;
        let indexDate = hasToday ? checkDate : checkDate.subtract(1, 'day');
        while (true) {
          indexDate = indexDate.subtract(1, 'day');
          if (safeDriveDates.includes(indexDate.format('YYYY-MM-DD'))) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }
    const startOfWeek = dayjs().startOf('week').valueOf();
    const thisWeekSafeDrives = dbDrives.filter(d => d.startTime >= startOfWeek && d.score >= 90).length;

    let unlocked = 0;
    let achievementsXp = 0;

    const checkAndAdd = (condition: boolean, points: number) => {
      if (condition) {
        unlocked++;
        achievementsXp += points;
      }
    };

    checkAndAdd(safeDrivesCount >= 10, 100);
    checkAndAdd(totalDistanceKmVal >= 100, 150);
    checkAndAdd(goodDrivesCount >= 30, 200);
    checkAndAdd(lowSpeedDrives >= 5, 120);
    checkAndAdd(ecoKm >= 50, 150);
    checkAndAdd(nightDrives >= 10, 100);
    checkAndAdd(totalDistanceKmVal >= 500, 250);
    checkAndAdd(currentStreak >= 7, 200);
    checkAndAdd(thisWeekSafeDrives >= 7, 300);

    const totalXpVal = drivesXp + achievementsXp;
    const info = getLevelInfo(totalXpVal);

    return {
      totalXp: totalXpVal,
      levelInfo: info
    };
  }, [dbDrives]);

  const smoothDrivesPct = dbDrives.length > 0
    ? Math.round((dbDrives.filter(d => d.score >= 85).length / dbDrives.length) * 100)
    : 0;

  // Driving summary mockups (Safety score and smooth drives dynamic)
  const summaryItems = [
    { id: '1', title: 'Smooth Drives', value: `${smoothDrivesPct}%`, color: '#22c55e', icon: 'check-circle', iconType: 'feather', wave: 'M 0,10 Q 15,4 30,12 T 60,6 T 90,12' },
    { id: '2', title: 'Safety Score', value: `${avgScore}%`, color: '#22c55e', icon: 'shield-check-outline', iconType: 'material', wave: 'M 0,8 Q 15,14 30,6 T 60,12 T 90,8' },
    { id: '3', title: 'Consistency', value: dbDrives.length > 0 ? '85%' : '0%', color: '#00f5ff', icon: 'circle-double', iconType: 'material', wave: 'M 0,12 Q 15,8 30,14 T 60,8 T 90,12' },
    { id: '4', title: 'Improvement', value: dbDrives.length > 0 ? '+18%' : '0%', color: '#a855f7', icon: 'trending-up', iconType: 'feather', wave: 'M 0,6 Q 15,12 30,8 T 60,14 T 90,8' }
  ];

  // Dynamic preview for the first 4 achievements (Completed vs Locked)
  const achievements = React.useMemo(() => {
    const list = [
      { id: '1', title: 'Safe Driver', key: '1', req: 10, count: dbDrives.filter(d => !d.events || d.events.length === 0).length, color: '#22c55e', icon: <Feather name="check" size={20} /> },
      { id: '2', title: '100 KM Explorer', key: '2', req: 100, count: dbDrives.reduce((acc, d) => acc + d.distance, 0) / 1000, color: '#00f5ff', icon: <FontAwesome5 name="road" size={18} /> },
      { id: '3', title: '30 Safe Drives', key: '3', req: 30, count: dbDrives.filter(d => d.score >= 85).length, color: '#a855f7', icon: <MaterialCommunityIcons name="steering" size={20} /> },
      { id: '4', title: 'Speed Master', key: '4', req: 5, count: dbDrives.filter(d => {
        const avg = d.duration > 0 ? (d.distance / d.duration) * 3.6 : 0;
        return avg > 0 && avg < 60;
      }).length, color: '#eab308', icon: <MaterialCommunityIcons name="speedometer" size={20} /> }
    ];

    return list.map(item => {
      const isCompleted = item.count >= item.req;
      return {
        id: item.id,
        title: item.title,
        subtitle: isCompleted ? 'Completed' : `${Math.round(item.count)}/${item.req} ${item.id === '2' ? 'km' : 'drives'}`,
        color: isCompleted ? item.color : '#64748b',
        icon: React.cloneElement(item.icon, { color: isCompleted ? item.color : '#64748b' }),
        isCompleted
      };
    });
  }, [dbDrives]);

  // Menu Settings mockups
  const menuSettings = [
    { id: 'personal', title: 'Personal Information', icon: 'person-outline', iconType: 'ion', color: '#00f5ff' },
    { id: 'vehicles', title: 'Vehicles', icon: 'car-outline', iconType: 'material', color: '#22c55e' },
    { id: 'preferences', title: 'Driving Preferences', icon: 'sliders', iconType: 'feather', color: '#eab308' },
    { id: 'notifications', title: 'Notification Settings', icon: 'bell', iconType: 'feather', color: '#a855f7' },
    { id: 'privacy', title: 'Privacy & Security', icon: 'lock-closed-outline', iconType: 'ion', color: '#ef4444' }
  ];

  const handleEditProfile = () => {
    setTempName(name);
    setTempEmail(email);
    setTempExperience(experience);
    setShowProfileModal(true);
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
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
                <Circle cx="25" cy="25" r="20" stroke={colors.border} strokeWidth="3.5" fill="none" />
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
            <Text style={{ color: '#84cc16', fontSize: 15, fontWeight: 'bold' }}>{levelInfo.level}</Text>
          </HexagonBadge>

          <View style={styles.levelMiddle}>
            <View style={styles.levelRow}>
              <Text style={styles.levelTitle}>Level {levelInfo.level}</Text>
              <Text style={styles.levelXp}>{levelInfo.xpInLevel.toLocaleString()} <Text style={{ color: '#64748b', fontWeight: '500' }}>/ {levelInfo.xpRequiredForNext.toLocaleString()} XP</Text></Text>
            </View>
            <Text style={styles.levelSub}>{levelInfo.name}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${levelInfo.progressPct}%` }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.nextLevelCol} onPress={() => router.push('/achievements')}>
            <Text style={styles.nextLevelLabel}>Next Level</Text>
            <View style={styles.nextLevelValRow}>
              <Text style={styles.nextLevelVal}>Level {levelInfo.level + 1}</Text>
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
              <View key={item.id} style={[styles.achievementCard, !item.isCompleted && { opacity: 0.65 }]}>
                <HexagonBadge size={54} color={item.color}>
                  {item.icon}
                </HexagonBadge>
                <Text style={[styles.achievementTitle, !item.isCompleted && { color: colors.textMuted }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.achievementSub}>{item.subtitle}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 7. Settings List Card */}
        <View style={styles.menuListCard}>
          {menuSettings.map((item, idx) => {
            let subtitle = '';
            if (item.id === 'personal') {
              subtitle = `${experience} Experience`;
            } else if (item.id === 'vehicles') {
              subtitle = `${vehicleType} (${vehicleModel})`;
            } else if (item.id === 'privacy') {
              subtitle = shareTelemetry ? 'Telemetry Sharing: ON' : 'Telemetry Sharing: OFF';
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItemRow, idx === menuSettings.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => {
                  if (item.id === 'personal') {
                    setTempName(name);
                    setTempEmail(email);
                    setTempExperience(experience);
                    setShowProfileModal(true);
                  } else if (item.id === 'vehicles') {
                    setTempVehicleType(vehicleType);
                    setTempVehicleModel(vehicleModel);
                    setTempVehiclePlate(vehiclePlate);
                    setShowVehicleModal(true);
                  } else if (item.id === 'privacy') {
                    setShowPrivacyModal(true);
                  } else if (item.id === 'preferences' || item.id === 'notifications') {
                    router.push('/settings');
                  }
                }}
              >
                <View style={[styles.menuIconContainer, { borderColor: item.color + '40', backgroundColor: item.color + '0a' }]}>
                  {item.iconType === 'feather' && <Feather name={item.icon as any} size={16} color={item.color} />}
                  {item.iconType === 'material' && <MaterialCommunityIcons name={item.icon as any} size={17} color={item.color} />}
                  {item.iconType === 'ion' && <Ionicons name={item.icon as any} size={16} color={item.color} />}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  {!!subtitle && <Text style={styles.menuItemSubtext}>{subtitle}</Text>}
                </View>

                <Feather name="chevron-right" size={16} color="#475569" />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 1. Edit Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Feather name="user" size={20} color="#00f5ff" />
              <Text style={styles.modalTitle}>Edit Personal Info</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter full name"
                placeholderTextColor="#475569"
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.modalInput}
                value={tempEmail}
                onChangeText={setTempEmail}
                placeholder="Enter email address"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Driving Experience</Text>
              <TextInput
                style={styles.modalInput}
                value={tempExperience}
                onChangeText={setTempExperience}
                placeholder="E.g. 5 Years"
                placeholderTextColor="#475569"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSave}
                onPress={() => {
                  if (!tempName.trim()) {
                    Alert.alert('Error', 'Name cannot be empty');
                    return;
                  }
                  setName(tempName);
                  setEmail(tempEmail);
                  setExperience(tempExperience);
                  setShowProfileModal(false);
                  Alert.alert('Success', 'Profile details updated successfully!');
                }}
              >
                <Text style={styles.btnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Edit Vehicle Modal */}
      <Modal
        visible={showVehicleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="car-cog" size={22} color="#22c55e" />
              <Text style={styles.modalTitle}>Manage Vehicles</Text>
              <TouchableOpacity onPress={() => setShowVehicleModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Vehicle Type</Text>
              <View style={styles.vehicleTypeRow}>
                {['Sedan', 'SUV', 'EV', 'Truck'].map((type) => {
                  const isSelected = tempVehicleType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.vehicleTypeBtn,
                        isSelected && styles.vehicleTypeBtnSelected,
                      ]}
                      onPress={() => setTempVehicleType(type)}
                    >
                      <Text
                        style={[
                          styles.vehicleTypeBtnText,
                          isSelected && styles.vehicleTypeBtnTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Vehicle Model</Text>
              <TextInput
                style={styles.modalInput}
                value={tempVehicleModel}
                onChangeText={setTempVehicleModel}
                placeholder="E.g. Tesla Model 3"
                placeholderTextColor="#475569"
              />

              <Text style={styles.inputLabel}>License Plate</Text>
              <TextInput
                style={styles.modalInput}
                value={tempVehiclePlate}
                onChangeText={setTempVehiclePlate}
                placeholder="E.g. DL 3C AB 1234"
                placeholderTextColor="#475569"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setShowVehicleModal(false)}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSave}
                onPress={() => {
                  if (!tempVehicleModel.trim()) {
                    Alert.alert('Error', 'Vehicle model cannot be empty');
                    return;
                  }
                  setVehicleType(tempVehicleType);
                  setVehicleModel(tempVehicleModel);
                  setVehiclePlate(tempVehiclePlate);
                  setShowVehicleModal(false);
                  Alert.alert('Success', 'Vehicle info updated successfully!');
                }}
              >
                <Text style={styles.btnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. Privacy & Security Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#ef4444" />
              <Text style={styles.modalTitle}>Privacy & Security</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.privacyOptionRow}>
                <View style={styles.privacyOptionInfo}>
                  <Text style={styles.privacyOptionTitle}>Share Telemetry</Text>
                  <Text style={styles.privacyOptionDesc}>
                    Upload live sensor data to analyze and calculate score
                  </Text>
                </View>
                <Switch
                  value={shareTelemetry}
                  onValueChange={setShareTelemetry}
                  trackColor={{ false: colors.border, true: '#00f5ff30' }}
                  thumbColor={shareTelemetry ? '#00f5ff' : '#64748b'}
                />
              </View>

              <View style={styles.privacyOptionRow}>
                <View style={styles.privacyOptionInfo}>
                  <Text style={styles.privacyOptionTitle}>End-to-End Encryption</Text>
                  <Text style={styles.privacyOptionDesc}>
                    Encrypt database entries stored locally on the device
                  </Text>
                </View>
                <Switch
                  value={encryption}
                  onValueChange={setEncryption}
                  trackColor={{ false: colors.border, true: '#22c55e30' }}
                  thumbColor={encryption ? '#22c55e' : '#64748b'}
                />
              </View>

              <View style={styles.privacyOptionRow}>
                <View style={styles.privacyOptionInfo}>
                  <Text style={styles.privacyOptionTitle}>Anonymous Analytics</Text>
                  <Text style={styles.privacyOptionDesc}>
                    Remove identity tags from reports sent to insurance
                  </Text>
                </View>
                <Switch
                  value={anonymousAnalytics}
                  onValueChange={setAnonymousAnalytics}
                  trackColor={{ false: colors.border, true: '#eab30830' }}
                  thumbColor={anonymousAnalytics ? '#eab308' : '#64748b'}
                />
              </View>

              <View style={styles.privacyOptionRow}>
                <View style={styles.privacyOptionInfo}>
                  <Text style={styles.privacyOptionTitle}>Save Drive History</Text>
                  <Text style={styles.privacyOptionDesc}>
                    Keep records of all previous drives in localized DB
                  </Text>
                </View>
                <Switch
                  value={saveHistory}
                  onValueChange={setSaveHistory}
                  trackColor={{ false: colors.border, true: '#a855f730' }}
                  thumbColor={saveHistory ? '#a855f7' : '#64748b'}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseMainBtn}
              onPress={() => {
                setShowPrivacyModal(false);
                Alert.alert('Success', 'Privacy preferences saved successfully!');
              }}
            >
              <Text style={styles.modalCloseMainBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStyles(colors: any) {
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
  headerTitle: {
    color: colors.text,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.accent,
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
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileEmail: {
    color: colors.textSlate,
    fontSize: 12,
    marginBottom: 6,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    color: colors.accent,
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  safeDriverBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.success + '4d',
    backgroundColor: colors.success + '0d',
    borderRadius: 14,
    width: 76,
    height: 64,
    position: 'relative',
  },
  safeDriverText: {
    color: colors.success,
    fontSize: 8.5,
    fontWeight: 'bold',
    marginTop: 22,
    textAlign: 'center',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.border,
    height: '60%',
    alignSelf: 'center',
  },
  statLabel: {
    color: colors.textSlate,
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statSubText: {
    color: colors.textSlate,
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
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  // Level Progression
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  levelXp: {
    color: colors.success,
    fontSize: 11,
    fontWeight: 'bold',
  },
  levelSub: {
    color: colors.textSlate,
    fontSize: 10,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  nextLevelCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  nextLevelLabel: {
    color: colors.textSlate,
    fontSize: 8,
    fontWeight: '500',
    marginBottom: 2,
  },
  nextLevelValRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextLevelVal: {
    color: colors.text,
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
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Summary Scroll
  summaryScroll: {
    paddingRight: 10,
  },
  summaryGridCard: {
    width: 115,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textSlate,
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  miniWaveChart: {
    position: 'absolute',
    bottom: 6,
    left: 12,
  },

  // Achievements
  achievementCard: {
    width: 130,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  achievementTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  achievementSub: {
    color: colors.textSlate,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },

  // Menu Settings Card
  menuListCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.text,
    fontSize: 13.5,
    fontWeight: 'bold',
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
  menuItemSubtext: {
    color: colors.textSlate,
    fontSize: 11,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
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
  modalBody: {
    paddingVertical: 10,
  },
  inputLabel: {
    color: colors.textSlate,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 13.5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
  },
  btnCancelText: {
    color: colors.textSlate,
    fontSize: 13,
    fontWeight: 'bold',
  },
  btnSave: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  btnSaveText: {
    color: '#050B14',
    fontSize: 13,
    fontWeight: 'bold',
  },
  vehicleTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  vehicleTypeBtn: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  vehicleTypeBtnSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success + '1a',
  },
  vehicleTypeBtnText: {
    color: colors.textSlate,
    fontSize: 12,
    fontWeight: 'bold',
  },
  vehicleTypeBtnTextSelected: {
    color: colors.success,
  },
  privacyOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  privacyOptionInfo: {
    flex: 1,
    marginRight: 15,
  },
  privacyOptionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  privacyOptionDesc: {
    color: colors.textSlate,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 2,
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
