import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { usePushNotifications } from "../hooks/use-push-notifications";
import { openNotificationSettings } from "../lib/notifications/setup";
import { useTheme } from "../context/ThemeContext";

export default function NotificationsScreen() {
  const router = useRouter();
  const { T, isDark } = useTheme();
  const { pushToken, permissionStatus, isRegistering, register, copyToken, checkPermissions } = usePushNotifications();

  useEffect(() => {
    register();
    checkPermissions();
  }, []);

  const handleOpenSettings = () => {
    openNotificationSettings();
    setTimeout(checkPermissions, 1500);
  };

  const isGranted = permissionStatus === "granted";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* ── HEADER ── */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: T.bgCard }]}>
            <Ionicons name="arrow-back" size={20} color={T.textPrimary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={[styles.headerIconBubble, { backgroundColor: "rgba(45,212,191,0.18)" }]}>
              <Ionicons name="notifications" size={24} color={T.teal} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Notification Center</Text>
              <Text style={[styles.headerSub, { color: T.textMuted }]}>Manage how and when you get notified</Text>
            </View>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── SYSTEM STATUS ── */}
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <View style={styles.sectionRow}>
              <Ionicons name="radio-outline" size={12} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>SYSTEM STATUS</Text>
            </View>

            <View style={[styles.statusCard, {
              backgroundColor: T.bgCard,
              borderColor: isGranted ? "rgba(45,212,191,0.4)" : "rgba(249,115,22,0.4)",
              borderWidth: 1.5,
            }]}>
              {/* Big Icon Left */}
              <View style={[styles.statusIconWrap, {
                backgroundColor: isGranted ? "rgba(45,212,191,0.12)" : "rgba(249,115,22,0.12)",
              }]}>
                <Ionicons name={isGranted ? "notifications" : "notifications-off"} size={32}
                  color={isGranted ? T.teal : T.orange} />
                <View style={[styles.statusCheckBadge, {
                  backgroundColor: isGranted ? T.teal : T.orange,
                }]}>
                  <Ionicons name={isGranted ? "checkmark" : "close"} size={10} color="#0D1525" />
                </View>
              </View>

              {/* Text */}
              <View style={styles.statusText}>
                <Text style={[styles.statusTitle, { color: T.textPrimary }]}>
                  {isGranted ? "Notifications Enabled" : "Notifications Disabled"}
                </Text>
                <Text style={[styles.statusDesc, { color: T.textMuted }]}>
                  {isGranted
                    ? "Your local habit reminders and push alerts are configured correctly."
                    : "You must grant notification permissions to schedule reminders."}
                </Text>
              </View>

              {/* Toggle Right */}
              <Switch
                value={isGranted}
                onValueChange={isGranted ? undefined : handleOpenSettings}
                trackColor={{ false: "#334155", true: T.teal }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#334155"
              />
            </View>
          </Animated.View>

          {/* ── LOCAL REMINDERS ── */}
          <Animated.View entering={FadeInDown.delay(160).springify()}>
            <View style={styles.sectionRow}>
              <Ionicons name="location-outline" size={12} color="#A78BFA" />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>LOCAL REMINDERS</Text>
            </View>

            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              {/* Row 1: Background Reminders */}
              <Pressable style={({ pressed }) => [styles.infoRow, pressed && { opacity: 0.7 }]}>
                <View style={[styles.rowIconBubble, { backgroundColor: "#1E1535" }]}>
                  <Ionicons name="alarm" size={22} color="#F87171" />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Background Reminders</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>
                    Reminders are scheduled locally on your device and trigger even if offline.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={T.textMuted} />
              </Pressable>

              <View style={[styles.divider, { backgroundColor: T.border }]} />

              {/* Row 2: Android Importance Channel */}
              <Pressable style={({ pressed }) => [styles.infoRow, pressed && { opacity: 0.7 }]}>
                <View style={[styles.rowIconBubble, { backgroundColor: "#0D2A28" }]}>
                  <Ionicons name="phone-portrait-outline" size={22} color={T.teal} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Android Importance Channel</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>
                    Created high-priority "habit-reminders" channel to ensure alerts show as heads-up banners.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={T.textMuted} />
              </Pressable>
            </View>
          </Animated.View>

          {/* ── PUSH NOTIFICATIONS ── */}
          <Animated.View entering={FadeInDown.delay(240).springify()}>
            <View style={styles.sectionRow}>
              <Ionicons name="paper-plane-outline" size={12} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>PUSH NOTIFICATIONS</Text>
            </View>

            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              {/* Expo Push Token row */}
              <View style={styles.infoRow}>
                <View style={[styles.rowIconBubble, { backgroundColor: "#0D1F3C" }]}>
                  <Ionicons name="cloud-upload-outline" size={22} color="#60A5FA" />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Expo Push Token</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>
                    This unique token allows push servers to send announcements or streak nudges to your device.
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: T.border }]} />

              {/* Token State */}
              {isRegistering ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={T.teal} />
                  <Text style={[styles.loadingText, { color: T.textMuted }]}>Fetching Push Token...</Text>
                </View>
              ) : pushToken ? (
                <View style={[styles.tokenBox, { backgroundColor: T.bgPress, borderColor: T.border }]}>
                  <Ionicons name="key-outline" size={14} color={T.teal} />
                  <Text style={[styles.tokenText, { color: T.textSub }]} numberOfLines={2}>{pushToken}</Text>
                  <Pressable onPress={copyToken} style={[styles.copyBtn, { backgroundColor: T.tealDim, borderColor: T.tealBorder }]}>
                    <Ionicons name="copy-outline" size={15} color={T.teal} />
                    <Text style={[styles.copyBtnText, { color: T.teal }]}>Copy</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={[styles.errorBox, { backgroundColor: "rgba(249,115,22,0.08)", borderColor: "rgba(249,115,22,0.3)" }]}>
                  <View style={[styles.rowIconBubble, { backgroundColor: "rgba(249,115,22,0.15)" }]}>
                    <Ionicons name="shield-outline" size={22} color={T.orange} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: T.orange }]}>Physical Device Required</Text>
                    <Text style={[styles.rowDesc, { color: T.textMuted }]}>
                      Push tokens require a physical device and an EAS development build client.
                    </Text>
                  </View>
                </View>
              )}

              {!pushToken && !isRegistering && (
                <Pressable
                  onPress={register}
                  style={({ pressed }) => [styles.retryBtn, { opacity: pressed ? 0.85 : 1, backgroundColor: "#7C3AED" }]}
                >
                  <Ionicons name="refresh-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.retryBtnText}>Retry Registration</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* ── FOOTER BANNER ── */}
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <View style={[styles.footerBanner, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <View style={[styles.rowIconBubble, { backgroundColor: "rgba(45,212,191,0.12)", width: 52, height: 52, borderRadius: 16 }]}>
                <Ionicons name="notifications-circle" size={28} color={T.teal} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.footerTitle, { color: T.textPrimary }]}>Stay updated, never miss a reminder!</Text>
                <Text style={[styles.footerDesc, { color: T.textMuted }]}>
                  We will notify you about habits, streaks and important updates.
                </Text>
              </View>
              <Ionicons name="paper-plane" size={22} color={T.teal} />
            </View>
          </Animated.View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  headerIconBubble: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: 11, fontWeight: "500", marginTop: 1 },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  sectionRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, marginTop: 18, paddingLeft: 2 },
  sectionLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.4 },

  group: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 4, borderWidth: 1 },

  statusCard: {
    borderRadius: 22, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
    marginBottom: 4,
  },
  statusIconWrap: {
    width: 70, height: 70, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  statusCheckBadge: {
    position: "absolute", bottom: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  statusText: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  statusDesc: { fontSize: 12, lineHeight: 17 },

  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  rowIconBubble: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 14 },
  rowText: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  rowDesc: { fontSize: 12, lineHeight: 17 },
  divider: { height: 1, marginVertical: 2 },

  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, justifyContent: "center" },
  loadingText: { fontSize: 13 },

  tokenBox: {
    borderRadius: 16, borderWidth: 1, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8,
  },
  tokenText: { flex: 1, fontSize: 11, fontFamily: "monospace", lineHeight: 15 },
  copyBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1,
  },
  copyBtnText: { fontSize: 12, fontWeight: "700" },

  errorBox: {
    borderRadius: 16, borderWidth: 1, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 8,
  },

  retryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 16, marginTop: 8, marginBottom: 4,
  },
  retryBtnText: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },

  footerBanner: {
    borderRadius: 20, padding: 16,
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, marginTop: 12,
  },
  footerTitle: { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  footerDesc: { fontSize: 11, lineHeight: 16 },
});