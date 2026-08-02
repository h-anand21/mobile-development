import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Alert,
  Pressable, Image, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { useHabits } from "../../hooks/use-habits";
import { useTheme } from "../../context/ThemeContext";
import { getActiveStreak, getLocalDateString } from "../../lib/habits/streak";

const { width: SW } = Dimensions.get("window");
const isImageUri = (str: string) =>
  str.startsWith("file://") || str.startsWith("http://") || str.startsWith("content://");

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, deleteHabit, toggleCompleteHabit } = useHabits();
  const { T } = useTheme();

  const habit = habits.find(h => h.id === id);

  // Month navigation state for Activity History
  const [viewDate, setViewDate] = useState(new Date());

  if (!habit) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: T.bg }]}>
        <View style={[styles.errorContainer, { backgroundColor: T.bg }]}>
          <Text style={[styles.errorText, { color: T.textMuted }]}>Habit not found or deleted.</Text>
          <Pressable style={[styles.backHomeBtn, { backgroundColor: T.tealDim }]} onPress={() => router.replace("/")}>
            <Text style={{ color: T.teal, fontWeight: "700" }}>Go Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const activeStreak = getActiveStreak(habit);
  const todayStr = getLocalDateString();
  const isCompletedToday = habit.completedDates.includes(todayStr);

  const handleDelete = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? All notifications and historical streaks will be cancelled.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteHabit(habit.id);
            router.replace("/");
          },
        },
      ]
    );
  };

  // Completion metrics
  const completedCount = habit.completedDates.length;
  const shieldedCount = habit.shieldedDates?.length || 0;
  
  const completionRate = habit.completedDates.length > 0 ? Math.round((habit.completedDates.filter(d => {
    const thirtyFiveDaysAgo = new Date();
    thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);
    return new Date(d) >= thirtyFiveDaysAgo;
  }).length / 35) * 100) : 0;

  // Calendar Grid Calculation
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };
  const nextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getStartDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getStartDayOfMonth(currentYear, currentMonth);

  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  // Generate 35 cells for 7x5 grid
  const gridCells = [];
  // Prev month filler
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    gridCells.push({ dayNum, dateStr, isCurrentMonth: false, key: `prev-${dayNum}` });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    gridCells.push({ dayNum: d, dateStr, isCurrentMonth: true, key: `curr-${d}` });
  }
  // Next month filler until 35 cells
  let nextDay = 1;
  while (gridCells.length < 35) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}`;
    gridCells.push({ dayNum: nextDay, dateStr, isCurrentMonth: false, key: `next-${nextDay}` });
    nextDay++;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: T.bg }]}>
      <View style={[styles.container, { backgroundColor: T.bg }]}>
        
        {/* ── HEADER ── */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.circleBtn, { backgroundColor: T.bgCard }]}>
            <Ionicons name="arrow-back" size={20} color={T.textPrimary} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitleText, { color: "#2DD4BF" }]}>HABIT DETAILS</Text>
            <View style={styles.headerGlowBar} />
          </View>

          <View style={styles.headerActions}>
            <Link href={`/edit?id=${habit.id}`} asChild>
              <Pressable style={StyleSheet.flatten([styles.squareBtn, { backgroundColor: "rgba(45,212,191,0.12)", borderColor: "rgba(45,212,191,0.3)" }])}>
                <Ionicons name="create-outline" size={18} color="#2DD4BF" />
              </Pressable>
            </Link>
            <Pressable onPress={handleDelete} style={[styles.squareBtn, { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)" }]}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </Pressable>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* ── 1. HABIT MAIN TITLE CARD ── */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={[styles.topCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <View style={styles.avatarGlowWrap}>
              <View style={styles.avatarBubble}>
                {isImageUri(habit.emoji) ? (
                  <Image source={{ uri: habit.emoji }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarEmojiText}>{habit.emoji}</Text>
                )}
              </View>
            </View>
            <Text style={[styles.habitMainName, { color: T.textPrimary }]}>{habit.name}</Text>
            <Text style={[styles.habitSubtitleText, { color: T.textMuted }]}>
              • {habit.frequency.kind === "daily" ? "Daily Habit" : "Weekly Habit"} •
            </Text>
          </Animated.View>

          {/* ── 2. COMPLETED TODAY BANNER ── */}
          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <Pressable
              onPress={() => toggleCompleteHabit(habit.id)}
              style={[
                styles.statusBanner,
                {
                  backgroundColor: isCompletedToday ? "rgba(45,212,191,0.1)" : T.bgCard,
                  borderColor: isCompletedToday ? "rgba(45,212,191,0.3)" : T.border,
                },
              ]}
            >
              <View style={[styles.checkCircle, { backgroundColor: isCompletedToday ? "#2DD4BF" : "rgba(45,212,191,0.15)" }]}>
                <Ionicons name="checkmark" size={16} color={isCompletedToday ? "#0D1525" : "#2DD4BF"} />
              </View>
              <View style={styles.statusTextWrap}>
                <Text style={[styles.statusTitle, { color: isCompletedToday ? "#2DD4BF" : T.textPrimary }]}>
                  {isCompletedToday ? "Completed Today!" : "Not Completed Today"}
                </Text>
                <Text style={[styles.statusSub, { color: T.textMuted }]}>
                  {isCompletedToday ? "Great job, keep it up!" : "Tap to mark completed"}
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* ── 3. CURRENT STREAK CARD WITH SPARKLINE GRAPH ── */}
          <Animated.View entering={FadeInDown.delay(180).springify()} style={[styles.streakCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            <View style={styles.streakLeftCol}>
              <View style={styles.flameGlowBubble}>
                <Ionicons name="flame" size={32} color="#F97316" />
              </View>
              <View style={styles.streakDetails}>
                <Text style={[styles.streakLabel, { color: T.textMuted }]}>CURRENT STREAK</Text>
                <Text style={[styles.streakBigNum, { color: T.textPrimary }]}>{activeStreak}</Text>
                <Text style={[styles.streakSubText, { color: T.textMuted }]}>Days in a row</Text>
                <View style={styles.fireBadgePill}>
                  <Text style={styles.fireBadgeText}>You're on fire! 🔥</Text>
                </View>
              </View>
            </View>

            {/* Sparkline Graph Vector */}
            <View style={styles.streakGraphWrap}>
              <Svg width={110} height={75} viewBox="0 0 110 75">
                <Path
                  d="M 10 60 Q 35 48 50 32 T 80 28 T 100 12"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <Path
                  d="M 10 60 Q 35 48 50 32 T 80 28 T 100 12 L 100 75 L 10 75 Z"
                  fill="rgba(249,115,22,0.14)"
                />
                <Circle cx="10" cy="60" r="4" fill="#F97316" />
                <Circle cx="50" cy="32" r="4" fill="#F97316" />
                <Circle cx="80" cy="28" r="4" fill="#F97316" />
                <Circle cx="100" cy="12" r="5" fill="#FFA500" stroke="#FFFFFF" strokeWidth="1.5" />
              </Svg>
            </View>
          </Animated.View>

          {/* ── 4. THREE METRIC CARDS GRID ── */}
          <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.metricsGridRow}>
            {/* Card 1: Success Rate */}
            <View style={[styles.metricCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: "rgba(45,212,191,0.15)" }]}>
                <Ionicons name="disc-outline" size={18} color="#2DD4BF" />
              </View>
              <Text style={[styles.metricValText, { color: "#2DD4BF" }]}>{completionRate}%</Text>
              <Text style={[styles.metricTitleText, { color: T.textMuted }]}>SUCCESS RATE</Text>
              <Text style={[styles.metricSubText, { color: T.textMuted }]}>Keep going!</Text>
            </View>

            {/* Card 2: Total Logs */}
            <View style={[styles.metricCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: "rgba(168,85,247,0.15)" }]}>
                <Ionicons name="document-text-outline" size={18} color="#A855F7" />
              </View>
              <Text style={[styles.metricValText, { color: "#A855F7" }]}>{completedCount}</Text>
              <Text style={[styles.metricTitleText, { color: T.textMuted }]}>TOTAL LOGS</Text>
              <Text style={[styles.metricSubText, { color: T.textMuted }]}>All time</Text>
            </View>

            {/* Card 3: Shields Used */}
            <View style={[styles.metricCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: "rgba(249,115,22,0.15)" }]}>
                <Ionicons name="shield-outline" size={18} color="#F97316" />
              </View>
              <Text style={[styles.metricValText, { color: "#F97316" }]}>{shieldedCount}</Text>
              <Text style={[styles.metricTitleText, { color: T.textMuted }]}>SHIELDS USED</Text>
              <Text style={[styles.metricSubText, { color: T.textMuted }]}>Stay protected</Text>
            </View>
          </Animated.View>

          {/* ── 5. ACTIVITY HISTORY (35 DAYS CALENDAR GRID) ── */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.historyCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
            {/* Header */}
            <View style={styles.historyHeader}>
              <View style={styles.historyTitleLeft}>
                <View style={[styles.calendarIconBubble, { backgroundColor: "rgba(45,212,191,0.15)" }]}>
                  <Ionicons name="calendar-outline" size={20} color="#2DD4BF" />
                </View>
                <View>
                  <Text style={[styles.historyTitle, { color: T.textPrimary }]}>Activity History</Text>
                  <Text style={[styles.historySub, { color: T.textMuted }]}>Completions over the last 35 days</Text>
                </View>
              </View>
            </View>

            {/* Grid Container with Nav Arrows */}
            <View style={styles.gridOuterNavRow}>
              <Pressable onPress={prevMonth} style={styles.navArrowBtn}>
                <Ionicons name="chevron-back" size={16} color={T.textMuted} />
              </Pressable>

              <View style={styles.gridCenterCol}>
                {/* Day Names Row */}
                <View style={styles.daysHeaderRow}>
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                    <Text key={day} style={[styles.dayHeaderCell, { color: T.textMuted }]}>
                      {day}
                    </Text>
                  ))}
                </View>

                {/* 35 Day Circles Grid */}
                <View style={styles.daysGridWrap}>
                  {gridCells.map((cell) => {
                    const isDone = habit.completedDates.includes(cell.dateStr);
                    const isShielded = habit.shieldedDates?.includes(cell.dateStr);

                    return (
                      <View key={cell.key} style={styles.cellBox}>
                        <View
                          style={[
                            styles.dateCircle,
                            { backgroundColor: T.bg },
                            isDone && { backgroundColor: "rgba(45,212,191,0.15)", borderColor: "#2DD4BF", borderWidth: 1.5 },
                            isShielded && !isDone && { backgroundColor: "rgba(249,115,22,0.15)", borderColor: "#F97316", borderWidth: 1.5 },
                          ]}
                        >
                          <Text
                            style={[
                              styles.dateText,
                              { color: cell.isCurrentMonth ? T.textPrimary : "#475569" },
                              isDone && { color: "#2DD4BF", fontWeight: "800" },
                              isShielded && !isDone && { color: "#F97316", fontWeight: "800" },
                            ]}
                          >
                            {cell.dayNum}
                          </Text>

                          {/* Completed Teal Check Badge */}
                          {isDone && (
                            <View style={styles.badgeDone}>
                              <Ionicons name="checkmark" size={7} color="#0D1525" />
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              <Pressable onPress={nextMonth} style={styles.navArrowBtn}>
                <Ionicons name="chevron-forward" size={16} color={T.textMuted} />
              </Pressable>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14,
  },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  headerTitleWrap: { alignItems: "center" },
  headerTitleText: { fontSize: 14, fontWeight: "900", letterSpacing: 2 },
  headerGlowBar: { width: 36, height: 3, borderRadius: 1.5, backgroundColor: "#2DD4BF", marginTop: 4 },

  headerActions: { flexDirection: "row", gap: 10 },
  squareBtn: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },

  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  topCard: {
    borderRadius: 24, paddingVertical: 24, paddingHorizontal: 16,
    alignItems: "center", borderWidth: 1, marginBottom: 14,
  },
  avatarGlowWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "rgba(45,212,191,0.12)", borderWidth: 2, borderColor: "#2DD4BF",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  avatarBubble: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "#111723", alignItems: "center", justifyContent: "center",
  },
  avatarImage: { width: 48, height: 48, borderRadius: 12 },
  avatarEmojiText: { fontSize: 40 },
  habitMainName: { fontSize: 24, fontWeight: "800", letterSpacing: -0.4, marginBottom: 4 },
  habitSubtitleText: { fontSize: 12, fontWeight: "600" },

  statusBanner: {
    borderRadius: 20, padding: 16, borderWidth: 1,
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14,
  },
  checkCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  statusTextWrap: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: "800", marginBottom: 2 },
  statusSub: { fontSize: 12 },

  streakCard: {
    borderRadius: 24, padding: 18, borderWidth: 1,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 14,
  },
  streakLeftCol: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  flameGlowBubble: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: "rgba(249,115,22,0.15)", borderWidth: 2, borderColor: "rgba(249,115,22,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  streakDetails: { flex: 1 },
  streakLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 2 },
  streakBigNum: { fontSize: 28, fontWeight: "900", lineHeight: 32 },
  streakSubText: { fontSize: 11, fontWeight: "600", marginBottom: 6 },
  fireBadgePill: {
    backgroundColor: "rgba(249,115,22,0.15)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start",
  },
  fireBadgeText: { fontSize: 10, fontWeight: "700", color: "#F97316" },
  streakGraphWrap: { alignItems: "flex-end" },

  metricsGridRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  metricCard: {
    flex: 1, borderRadius: 20, padding: 12, borderWidth: 1, alignItems: "center",
  },
  metricIconWrap: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  metricValText: { fontSize: 18, fontWeight: "900", marginBottom: 2 },
  metricTitleText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6, marginBottom: 2, textAlign: "center" },
  metricSubText: { fontSize: 9, fontWeight: "500", textAlign: "center" },

  historyCard: { borderRadius: 24, padding: 16, borderWidth: 1, marginBottom: 14 },
  historyHeader: { marginBottom: 16 },
  historyTitleLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  calendarIconBubble: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  historyTitle: { fontSize: 16, fontWeight: "800", marginBottom: 2 },
  historySub: { fontSize: 11, fontWeight: "500" },

  gridOuterNavRow: { flexDirection: "row", alignItems: "center" },
  navArrowBtn: { padding: 4 },
  gridCenterCol: { flex: 1 },

  daysHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, paddingHorizontal: 2 },
  dayHeaderCell: { fontSize: 10, fontWeight: "800", width: (SW - 90) / 7, textAlign: "center" },

  daysGridWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cellBox: { width: (SW - 90) / 7, height: 42, alignItems: "center", justifyContent: "center", marginVertical: 2 },
  dateCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  dateText: { fontSize: 12, fontWeight: "700" },
  badgeDone: {
    position: "absolute", bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#2DD4BF", alignItems: "center", justifyContent: "center",
  },

  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  errorText: { fontSize: 15, marginBottom: 20 },
  backHomeBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
});