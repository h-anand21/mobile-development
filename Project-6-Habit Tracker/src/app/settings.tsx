import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Switch, Alert, BackHandler, Image, TextInput, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import Animated, {
  FadeInDown, useAnimatedStyle, useSharedValue,
  withSequence, withSpring,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";
import TabBar from "../components/TabBar";
import { useWatchSync } from "../hooks/use-watch-sync";
import WatchPairingModal from "../components/WatchPairingModal";
import { useHabits } from "../hooks/use-habits";
import { useWorkout } from "../hooks/use-workout";
import { getActiveStreak } from "../lib/habits/streak";

const { width: SW } = Dimensions.get("window");
const DEFAULT_AVATARS = ["🧘", "🏃", "💧", "📖", "💪"];

export default function SettingsScreen() {
  const router = useRouter();
  const { T, isDark, toggleTheme } = useTheme();
  const { pairedDevice, disconnectDevice } = useWatchSync();
  const { habits } = useHabits();
  const { allSessions } = useWorkout();

  const [pairingModalVisible, setPairingModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace("/");
        return true;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const [profileUri,       setProfileUri]       = useState<string | null>(null);
  const [profileEmoji,     setProfileEmoji]     = useState("🧘");
  const [profileName,      setProfileName]      = useState("Himanshu");
  const [editingName,      setEditingName]      = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [quietHours,       setQuietHours]       = useState(false);
  const [soundEnabled,     setSoundEnabled]     = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet([
      "PROFILE_URI", "PROFILE_EMOJI", "PROFILE_NAME",
      "SETTINGS_QUIET_HOURS", "SETTINGS_SOUND_ENABLED",
    ]).then(pairs => {
      if (pairs[0][1]) setProfileUri(pairs[0][1]);
      if (pairs[1][1]) setProfileEmoji(pairs[1][1]);
      if (pairs[2][1]) setProfileName(pairs[2][1]);
      if (pairs[3][1] !== null) setQuietHours(pairs[3][1] === "true");
      if (pairs[4][1] !== null) setSoundEnabled(pairs[4][1] === "true");
    }).catch(() => {});
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Allow HabitFlow to access your photos.", [{ text: "OK" }]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      setProfileUri(uri);
      setShowAvatarPicker(false);
      await AsyncStorage.setItem("PROFILE_URI", uri);
    }
  };

  const selectEmoji = async (emoji: string) => {
    setProfileEmoji(emoji); setProfileUri(null); setShowAvatarPicker(false);
    await AsyncStorage.multiSet([["PROFILE_EMOJI", emoji], ["PROFILE_URI", ""]]);
  };

  const saveName = async (name: string) => {
    const trimmed = name.trim() || "Himanshu";
    setProfileName(trimmed); setEditingName(false);
    await AsyncStorage.setItem("PROFILE_NAME", trimmed);
  };

  const handleQuietHours = async (val: boolean) => {
    setQuietHours(val);
    await AsyncStorage.setItem("SETTINGS_QUIET_HOURS", String(val));
    if (val) Alert.alert("Quiet Hours", "Reminders muted 10 PM – 7 AM.");
  };

  const handleSound = async (val: boolean) => {
    setSoundEnabled(val);
    await AsyncStorage.setItem("SETTINGS_SOUND_ENABLED", String(val));
  };

  const handleReset = () => {
    Alert.alert("⚠️ Reset All Data", "This will permanently delete all habits, streaks, and cancel all reminders.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset Everything", style: "destructive",
        onPress: async () => {
          try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            await AsyncStorage.clear();
            router.replace("/onboarding/screen1");
          } catch (e) { console.error(e); }
        },
      },
    ]);
  };

  const toggleScale = useSharedValue(1);
  const toggleStyle = useAnimatedStyle(() => ({ transform: [{ scale: toggleScale.value }] }));
  const handleToggle = () => {
    toggleScale.value = withSequence(withSpring(0.85), withSpring(1, { damping: 8 }));
    toggleTheme();
  };

  // ─── LIFETIME PERFORMANCE METRICS ───
  const totalHabits = habits.length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, getActiveStreak(h)), 0);
  const totalHabitLogs = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const totalWorkouts = allSessions.length;
  const totalCalories = allSessions.reduce((sum, s) => sum + s.calories, 0);
  const totalDistance = allSessions.reduce((sum, s) => sum + s.distanceKm, 0);

  // ─── 7-DAY OVERALL ACTIVITY GRAPH CALCULATION ───
  const getProfile7DayGraph = () => {
    const points = [];
    const width = SW - 70; // responsive graph width
    const height = 80;
    const marginX = 14;
    const stepX = (width - 2 * marginX) / 6;

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // Count completions for this day (habits + workouts)
      const habitCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
      const workoutCount = allSessions.filter(s => s.date === dateStr).length;
      const totalEvents = habitCount + workoutCount;

      const x = marginX + (6 - i) * stepX;
      // Dynamic height y: 0 events = y: 60, >0 events = higher curve
      const y = totalEvents > 0 ? Math.max(12, 55 - totalEvents * 14) : 58;
      const dayDate = d.getDate();

      points.push({ x, y, totalEvents, dateStr, dayDate });
    }

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      pathD += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} 64 L ${points[0].x} 64 Z`;

    return { points, pathD, areaD, width };
  };

  const profileGraph = getProfile7DayGraph();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* ── HEADER ── */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIconWrap, { backgroundColor: T.tealDim }]}>
              <Ionicons name="person" size={22} color={T.teal} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Profile</Text>
              <Text style={[styles.headerSub, { color: T.textMuted }]}>Manage your profile & performance</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push("/notifications")} style={[styles.gearBtn, { backgroundColor: T.bgCard }]}>
            <Ionicons name="settings-outline" size={20} color={T.textSub} />
          </Pressable>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── PROFILE CARD ── */}
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <View style={[styles.profileCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <Pressable onPress={() => setShowAvatarPicker(v => !v)} style={styles.avatarWrap}>
                {profileUri ? (
                  <Image source={{ uri: profileUri }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarEmojiBg, { backgroundColor: T.tealDim, borderColor: T.teal, borderWidth: 2.5 }]}>
                    <Text style={styles.avatarEmojiText}>{profileEmoji}</Text>
                  </View>
                )}
                <View style={[styles.cameraBadge, { backgroundColor: T.teal }]}>
                  <Ionicons name="camera" size={11} color="#0D1525" />
                </View>
              </Pressable>
              <View style={styles.profileInfo}>
                {editingName ? (
                  <TextInput
                    style={[styles.nameInput, { color: T.textPrimary, borderColor: T.tealBorder }]}
                    value={profileName}
                    onChangeText={setProfileName}
                    onBlur={() => saveName(profileName)}
                    onSubmitEditing={() => saveName(profileName)}
                    autoFocus maxLength={24}
                  />
                ) : (
                  <Pressable onPress={() => setEditingName(true)} style={styles.nameRow}>
                    <Text style={[styles.profileName, { color: T.textPrimary }]}>{profileName}</Text>
                    <Ionicons name="pencil" size={14} color={T.teal} style={{ marginLeft: 8 }} />
                  </Pressable>
                )}
                <Text style={[styles.profileNameHint, { color: T.textMuted }]}>Tap to edit name</Text>
                <View style={[styles.motiveBadge, { backgroundColor: T.tealDim, borderColor: T.tealBorder }]}>
                  <Ionicons name="star" size={11} color={T.teal} />
                  <Text style={[styles.motiveBadgeText, { color: T.teal }]}>Keep going, stay consistent!</Text>
                </View>
              </View>
            </View>

            {showAvatarPicker && (
              <Animated.View entering={FadeInDown.duration(300).springify()}
                style={[styles.avatarPickerPanel, { backgroundColor: T.bgCard, borderColor: T.border }]}>
                <Text style={[styles.pickerTitle, { color: T.textMuted }]}>CHOOSE AVATAR</Text>
                <Pressable onPress={pickImage} style={[styles.galleryBtn, { backgroundColor: T.tealDim, borderColor: T.tealBorder }]}>
                  <Ionicons name="images-outline" size={22} color={T.teal} />
                  <View>
                    <Text style={[styles.galleryBtnTitle, { color: T.teal }]}>Pick from Gallery</Text>
                    <Text style={[styles.galleryBtnDesc, { color: T.textMuted }]}>Choose any photo from your library</Text>
                  </View>
                </Pressable>
                <Text style={[styles.pickerSubLabel, { color: T.textMuted }]}>or pick a habit sticker</Text>
                <View style={styles.stickerRow}>
                  {DEFAULT_AVATARS.map(emoji => (
                    <Pressable key={emoji} onPress={() => selectEmoji(emoji)}
                      style={[
                        styles.stickerBtn,
                        { backgroundColor: T.bg, borderColor: T.border, borderWidth: 1 },
                        profileEmoji === emoji && !profileUri && { backgroundColor: T.tealDim, borderColor: T.teal, borderWidth: 2 },
                      ]}>
                      <Text style={styles.stickerEmoji}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* ── PERFORMANCE OVERVIEW GRID & GRAPH ── */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="stats-chart-outline" size={13} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>PERFORMANCE & HISTORY OVERVIEW</Text>
            </View>

            {/* Lifetime Stats 4 Cards */}
            <View style={styles.perfGridRow}>
              <View style={[styles.perfCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
                <View style={[styles.perfIconWrap, { backgroundColor: "rgba(45,212,191,0.15)" }]}>
                  <Ionicons name="list" size={18} color={T.teal} />
                </View>
                <Text style={[styles.perfVal, { color: T.teal }]}>{totalHabits}</Text>
                <Text style={[styles.perfLabel, { color: T.textMuted }]}>Active Habits</Text>
              </View>

              <View style={[styles.perfCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
                <View style={[styles.perfIconWrap, { backgroundColor: "rgba(249,115,22,0.15)" }]}>
                  <Ionicons name="flame" size={18} color={T.orange} />
                </View>
                <Text style={[styles.perfVal, { color: T.orange }]}>{bestStreak}d</Text>
                <Text style={[styles.perfLabel, { color: T.textMuted }]}>Best Streak</Text>
              </View>

              <View style={[styles.perfCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
                <View style={[styles.perfIconWrap, { backgroundColor: "rgba(168,85,247,0.15)" }]}>
                  <Ionicons name="fitness" size={18} color={T.purple} />
                </View>
                <Text style={[styles.perfVal, { color: T.purple }]}>{totalWorkouts}</Text>
                <Text style={[styles.perfLabel, { color: T.textMuted }]}>Workouts</Text>
              </View>

              <View style={[styles.perfCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
                <View style={[styles.perfIconWrap, { backgroundColor: "rgba(234,179,8,0.15)" }]}>
                  <Ionicons name="flash" size={18} color="#EAB308" />
                </View>
                <Text style={[styles.perfVal, { color: "#EAB308" }]}>{totalCalories}</Text>
                <Text style={[styles.perfLabel, { color: T.textMuted }]}>Kcal Burned</Text>
              </View>
            </View>

            {/* 7-Day Activity Trend Graph Card */}
            <View style={[styles.graphCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <View style={styles.graphCardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="analytics" size={18} color={T.teal} />
                  <Text style={[styles.graphCardTitle, { color: T.textPrimary }]}>7-Day Activity Trend</Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: T.teal }}>
                  {totalHabitLogs} Total Checkins
                </Text>
              </View>

              <View style={styles.graphWrap}>
                <Svg width={profileGraph.width} height={85} viewBox={`0 0 ${profileGraph.width} 85`}>
                  <Path d={profileGraph.pathD} fill="none" stroke={T.teal} strokeWidth="3" strokeLinecap="round" />
                  <Path d={profileGraph.areaD} fill="rgba(45,212,191,0.12)" />
                  {profileGraph.points.map((p, idx) => (
                    <React.Fragment key={idx}>
                      <Circle
                        cx={p.x}
                        cy={p.y}
                        r={idx === 6 ? 5 : 3.5}
                        fill={p.totalEvents > 0 ? T.teal : T.bgCard}
                        stroke={p.totalEvents > 0 ? (idx === 6 ? "#FFFFFF" : T.teal) : "#475569"}
                        strokeWidth={idx === 6 ? 2 : 1}
                      />
                      <SvgText
                        x={p.x}
                        y={78}
                        fill={p.totalEvents > 0 ? T.teal : "#64748B"}
                        fontSize="9"
                        fontWeight={p.totalEvents > 0 ? "900" : "600"}
                        textAnchor="middle"
                      >
                        {p.dayDate}
                      </SvgText>
                    </React.Fragment>
                  ))}
                </Svg>
              </View>
            </View>

            {/* Lifetime Full Summary Breakdown Card */}
            <View style={[styles.summaryCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <Text style={[styles.summaryTitle, { color: T.textPrimary }]}>Lifetime Record Details</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: T.textMuted }]}>Habit Checkins Completed</Text>
                  <Text style={[styles.summaryValue, { color: T.teal }]}>{totalHabitLogs} logs</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: T.textMuted }]}>Workout Distance Covered</Text>
                  <Text style={[styles.summaryValue, { color: T.purple }]}>{totalDistance.toFixed(1)} km</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: T.textMuted }]}>Smartwatch Connection</Text>
                  <Text style={[styles.summaryValue, { color: pairedDevice ? T.teal : T.textMuted }]}>
                    {pairedDevice ? pairedDevice.name : "Not Connected"}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* ── APPEARANCE ── */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="color-palette-outline" size={13} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>APPEARANCE</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <View style={styles.row}>
                <View style={[styles.rowIconBubble, { backgroundColor: "#1A2340" }]}>
                  <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={isDark ? "#A78BFA" : "#FCD34D"} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>{isDark ? "Dark Mode" : "Light Mode"}</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>{isDark ? "Deep blue theme" : "Light airy theme"}</Text>
                </View>
                <Animated.View style={toggleStyle}>
                  <Switch value={isDark} onValueChange={handleToggle}
                    trackColor={{ false: "#334155", true: T.teal }}
                    thumbColor="#FFFFFF" ios_backgroundColor="#334155" />
                </Animated.View>
              </View>
            </View>
          </Animated.View>

          {/* ── NOTIFICATIONS ── */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="notifications-outline" size={13} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>NOTIFICATIONS</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <View style={styles.row}>
                <View style={[styles.rowIconBubble, { backgroundColor: "#1E1535" }]}>
                  <Ionicons name="notifications-off-outline" size={22} color="#A78BFA" />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Quiet Hours</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Mute reminders 10 PM - 7 AM</Text>
                </View>
                <Switch value={quietHours} onValueChange={handleQuietHours}
                  trackColor={{ false: "#334155", true: T.teal }}
                  thumbColor="#FFFFFF" ios_backgroundColor="#334155" />
              </View>
              <View style={[styles.divider, { backgroundColor: T.border }]} />
              <View style={styles.row}>
                <View style={[styles.rowIconBubble, { backgroundColor: "#0D2A28" }]}>
                  <Ionicons name="volume-high" size={22} color={T.teal} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Sound Effects</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Play audio for reminders</Text>
                </View>
                <Switch value={soundEnabled} onValueChange={handleSound}
                  trackColor={{ false: "#334155", true: T.teal }}
                  thumbColor="#FFFFFF" ios_backgroundColor="#334155" />
              </View>
            </View>
          </Animated.View>

          {/* ── DEVICE CONNECTIONS ── */}
          <Animated.View entering={FadeInDown.delay(230).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="link-outline" size={13} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>DEVICE CONNECTIONS</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              {pairedDevice ? (
                <View style={styles.row}>
                  <View style={[styles.rowIconBubble, { backgroundColor: "#0D2A28" }]}>
                    <Ionicons name="watch-outline" size={22} color={T.teal} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: T.teal }]}>{pairedDevice.name}</Text>
                    <Text style={[styles.rowDesc, { color: T.textMuted }]}>
                      Connected  Battery: {pairedDevice.battery}%  {pairedDevice.lastSync}
                    </Text>
                  </View>
                  <Pressable onPress={disconnectDevice}
                    style={[styles.disconnectBtn, { backgroundColor: "rgba(234,94,94,0.15)" }]}>
                    <Text style={[styles.disconnectBtnText, { color: "#EA5E5E" }]}>Disconnect</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                  onPress={() => setPairingModalVisible(true)}>
                  <View style={[styles.rowIconBubble, { backgroundColor: "#0D2A28" }]}>
                    <Ionicons name="watch-outline" size={22} color={T.teal} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Pair Smart Watch</Text>
                    <Text style={[styles.rowDesc, { color: T.textMuted }]}>Connect Fitbit, Apple Watch, Garmin or Noise</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={T.textMuted} />
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* ── APP CONFIGURATION ── */}
          <Animated.View entering={FadeInDown.delay(260).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="options-outline" size={13} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>APP CONFIGURATION</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                onPress={() => router.push("/notifications")}>
                <View style={[styles.rowIconBubble, { backgroundColor: "#1A2010" }]}>
                  <Ionicons name="notifications" size={22} color="#FCD34D" />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Notification Registry</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Push tokens & permission status</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={T.textMuted} />
              </Pressable>
            </View>
          </Animated.View>

          {/* ── DANGER ZONE ── */}
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="warning-outline" size={13} color="#EA5E5E" />
              <Text style={[styles.sectionLabel, { color: "#EA5E5E" }]}>DANGER ZONE</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: "rgba(234,94,94,0.3)" }]}>
              <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]} onPress={handleReset}>
                <View style={[styles.rowIconBubble, { backgroundColor: "rgba(234,94,94,0.15)" }]}>
                  <Ionicons name="trash-outline" size={22} color="#EA5E5E" />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: "#EA5E5E" }]}>Reset Application Data</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Clear all habits & cancel reminders</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#EA5E5E" />
              </Pressable>
            </View>
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>

        <TabBar activeTab="profile" />

        <WatchPairingModal visible={pairingModalVisible} onClose={() => setPairingModalVisible(false)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, fontWeight: "500", marginTop: 1 },
  gearBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, marginTop: 18, paddingLeft: 4 },
  sectionLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.4 },

  group: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 4, borderWidth: 1 },

  profileCard: { borderRadius: 24, padding: 20, marginBottom: 4, flexDirection: "row", alignItems: "center", gap: 18, borderWidth: 1 },
  avatarWrap: { position: "relative", width: 84, height: 84 },
  avatarImg: { width: 84, height: 84, borderRadius: 42 },
  avatarEmojiBg: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center" },
  avatarEmojiText: { fontSize: 42 },
  cameraBadge: { position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  profileName: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  profileNameHint: { fontSize: 11, fontWeight: "500", marginBottom: 10 },
  nameInput: { fontSize: 18, fontWeight: "700", borderBottomWidth: 1.5, paddingBottom: 4, marginBottom: 4 },
  motiveBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  motiveBadgeText: { fontSize: 11, fontWeight: "700" },

  avatarPickerPanel: { borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 1 },
  pickerTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 },
  galleryBtn: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  galleryBtnTitle: { fontSize: 14, fontWeight: "700" },
  galleryBtnDesc: { fontSize: 11, marginTop: 2 },
  pickerSubLabel: { fontSize: 11, fontWeight: "600", marginBottom: 10, textAlign: "center" },
  stickerRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  stickerBtn: { flex: 1, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  stickerEmoji: { fontSize: 28 },

  perfGridRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  perfCard: { flex: 1, borderRadius: 18, padding: 10, borderWidth: 1, alignItems: "center" },
  perfIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  perfVal: { fontSize: 15, fontWeight: "900", marginBottom: 2 },
  perfLabel: { fontSize: 9, fontWeight: "700", textAlign: "center" },

  graphCard: { borderRadius: 20, padding: 14, borderWidth: 1, marginBottom: 10 },
  graphCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  graphCardTitle: { fontSize: 13, fontWeight: "800" },
  graphWrap: { alignItems: "center" },

  summaryCard: { borderRadius: 20, padding: 14, borderWidth: 1, marginBottom: 4 },
  summaryTitle: { fontSize: 13, fontWeight: "800", marginBottom: 10 },
  summaryGrid: { gap: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 11, fontWeight: "600" },
  summaryValue: { fontSize: 12, fontWeight: "800" },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 13 },
  rowIconBubble: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 14 },
  rowText: { flex: 1, marginRight: 10 },
  rowTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  rowDesc: { fontSize: 12, lineHeight: 17 },
  divider: { height: 1, marginVertical: 2 },

  disconnectBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  disconnectBtnText: { fontSize: 11, fontWeight: "700" },
});