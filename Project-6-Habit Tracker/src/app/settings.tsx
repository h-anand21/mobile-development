import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Switch, Alert, BackHandler, Image, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, {
  FadeInDown, useAnimatedStyle, useSharedValue,
  withSequence, withSpring,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import TabBar from '../components/TabBar';

// 5 default habit-based avatar stickers
const DEFAULT_AVATARS = ['🧘', '🏃', '💧', '📖', '💪'];

export default function SettingsScreen() {
  const router = useRouter();
  const { T, isDark, toggleTheme } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace('/');
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // Profile state
  const [profileUri,       setProfileUri]       = useState<string | null>(null);
  const [profileEmoji,     setProfileEmoji]     = useState('🧘');
  const [profileName,      setProfileName]      = useState('Himanshu');
  const [editingName,      setEditingName]      = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Settings state
  const [quietHours,   setQuietHours]   = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load saved profile + settings
  useEffect(() => {
    AsyncStorage.multiGet([
      'PROFILE_URI', 'PROFILE_EMOJI', 'PROFILE_NAME',
      'SETTINGS_QUIET_HOURS', 'SETTINGS_SOUND_ENABLED',
    ]).then(pairs => {
      if (pairs[0][1]) setProfileUri(pairs[0][1]);
      if (pairs[1][1]) setProfileEmoji(pairs[1][1]);
      if (pairs[2][1]) setProfileName(pairs[2][1]);
      if (pairs[3][1] !== null) setQuietHours(pairs[3][1] === 'true');
      if (pairs[4][1] !== null) setSoundEnabled(pairs[4][1] === 'true');
    }).catch(() => {});
  }, []);

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Allow HabitFlow to access your photos to set a profile picture.',
        [{ text: 'OK' }]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      setProfileUri(uri);
      setShowAvatarPicker(false);
      await AsyncStorage.setItem('PROFILE_URI', uri);
    }
  };

  // Select default emoji sticker
  const selectEmoji = async (emoji: string) => {
    setProfileEmoji(emoji);
    setProfileUri(null);
    setShowAvatarPicker(false);
    await AsyncStorage.multiSet([
      ['PROFILE_EMOJI', emoji],
      ['PROFILE_URI', ''],
    ]);
  };

  // Save edited name
  const saveName = async (name: string) => {
    const trimmed = name.trim() || 'Himanshu';
    setProfileName(trimmed);
    setEditingName(false);
    await AsyncStorage.setItem('PROFILE_NAME', trimmed);
  };

  const handleQuietHours = async (val: boolean) => {
    setQuietHours(val);
    await AsyncStorage.setItem('SETTINGS_QUIET_HOURS', String(val));
    if (val) Alert.alert('Quiet Hours', 'Reminders muted 10 PM – 7 AM.');
  };

  const handleSound = async (val: boolean) => {
    setSoundEnabled(val);
    await AsyncStorage.setItem('SETTINGS_SOUND_ENABLED', String(val));
  };

  const handleReset = () => {
    Alert.alert(
      '⚠️ Reset All Data',
      'This will permanently delete all habits, streaks, and cancel all reminders.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything', style: 'destructive',
          onPress: async () => {
            try {
              await Notifications.cancelAllScheduledNotificationsAsync();
              await AsyncStorage.clear();
              router.replace('/onboarding/screen1');
            } catch (e) { console.error(e); }
          },
        },
      ]
    );
  };

  const toggleScale = useSharedValue(1);
  const toggleStyle = useAnimatedStyle(() => ({ transform: [{ scale: toggleScale.value }] }));
  const handleToggle = () => {
    toggleScale.value = withSequence(withSpring(0.85), withSpring(1, { damping: 8 }));
    toggleTheme();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <Text style={styles.headerEmoji}>👤</Text>
          <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Profile</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── PROFILE CARD ── */}
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <View style={[T.neo, styles.profileCard]}>

              {/* Avatar — tap to open picker */}
              <Pressable onPress={() => setShowAvatarPicker(v => !v)} style={styles.avatarWrap}>
                {profileUri ? (
                  <Image source={{ uri: profileUri }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarEmojiBg, { backgroundColor: T.tealDim, borderColor: T.tealBorder, borderWidth: 2 }]}>
                    <Text style={styles.avatarEmojiText}>{profileEmoji}</Text>
                  </View>
                )}
                {/* Camera badge */}
                <View style={[styles.cameraBadge, { backgroundColor: T.teal }]}>
                  <Text style={{ fontSize: 11 }}>📷</Text>
                </View>
              </Pressable>

              {/* Name */}
              <View style={styles.profileInfo}>
                {editingName ? (
                  <TextInput
                    style={[styles.nameInput, { color: T.textPrimary, borderColor: T.tealBorder }]}
                    value={profileName}
                    onChangeText={setProfileName}
                    onBlur={() => saveName(profileName)}
                    onSubmitEditing={() => saveName(profileName)}
                    autoFocus
                    maxLength={24}
                  />
                ) : (
                  <Pressable onPress={() => setEditingName(true)}>
                    <Text style={[styles.profileName, { color: T.textPrimary }]}>{profileName}</Text>
                    <Text style={[styles.profileNameHint, { color: T.textMuted }]}>Tap to edit name ✏️</Text>
                  </Pressable>
                )}
              </View>

            </View>

            {/* Avatar picker panel */}
            {showAvatarPicker && (
              <Animated.View entering={FadeInDown.duration(300).springify()}
                style={[T.neo, styles.avatarPickerPanel]}>
                <Text style={[styles.pickerTitle, { color: T.textSub }]}>CHOOSE AVATAR</Text>

                {/* Gallery option */}
                <Pressable onPress={pickImage}
                  style={[styles.galleryBtn, { backgroundColor: T.tealDim, borderColor: T.tealBorder }]}>
                  <Text style={{ fontSize: 20 }}>🖼️</Text>
                  <View>
                    <Text style={[styles.galleryBtnTitle, { color: T.teal }]}>Pick from Gallery</Text>
                    <Text style={[styles.galleryBtnDesc, { color: T.textMuted }]}>Choose any photo from your library</Text>
                  </View>
                </Pressable>

                {/* 5 default habit stickers */}
                <Text style={[styles.pickerSubLabel, { color: T.textMuted }]}>or pick a habit sticker</Text>
                <View style={styles.stickerRow}>
                  {DEFAULT_AVATARS.map(emoji => (
                    <Pressable key={emoji} onPress={() => selectEmoji(emoji)}
                      style={[
                        styles.stickerBtn,
                        { backgroundColor: T.bg },
                        T.neo,
                        profileEmoji === emoji && !profileUri && {
                          backgroundColor: T.tealDim,
                          borderColor: T.tealBorder,
                          borderWidth: 2,
                        },
                      ]}>
                      <Text style={styles.stickerEmoji}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* ── APPEARANCE ── */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Appearance</Text>
            <View style={[T.neo, styles.group]}>
              <View style={styles.themeRow}>
                <View style={[T.neo, styles.themeIconBig, { backgroundColor: T.bg }]}>
                  <Text style={{ fontSize: 26 }}>{isDark ? '🌙' : '☀️'}</Text>
                </View>
                <View style={styles.themeText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>
                    {isDark ? 'Deep blue neumorphic theme' : 'Bright airy neumorphic theme'}
                  </Text>
                </View>
                <Animated.View style={[styles.themeToggleBtn, { backgroundColor: isDark ? T.tealDim : T.yellowDim, borderColor: isDark ? T.tealBorder : T.teal }, toggleStyle]}>
                  <Pressable onPress={handleToggle} style={styles.themeToggleInner}>
                    <View style={[styles.themeThumb, { backgroundColor: isDark ? T.teal : T.yellow, transform: [{ translateX: isDark ? 22 : 0 }] }]} />
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </Animated.View>

          {/* ── NOTIFICATIONS ── */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Notifications</Text>
            <View style={[T.neo, styles.group]}>
              <View style={styles.row}>
                <View style={[T.neo, styles.rowIcon, { backgroundColor: T.bg }]}>
                  <Text style={styles.rowEmoji}>🌙</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Quiet Hours</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Mute reminders 10 PM – 7 AM</Text>
                </View>
                <Switch value={quietHours} onValueChange={handleQuietHours}
                  trackColor={{ false: T.border, true: T.teal }} thumbColor={T.bg} />
              </View>

              <View style={[styles.divider, { backgroundColor: T.border }]} />

              <View style={styles.row}>
                <View style={[T.neo, styles.rowIcon, { backgroundColor: T.bg }]}>
                  <Text style={styles.rowEmoji}>🔊</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Sound Effects</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Play audio for reminders</Text>
                </View>
                <Switch value={soundEnabled} onValueChange={handleSound}
                  trackColor={{ false: T.border, true: T.teal }} thumbColor={T.bg} />
              </View>
            </View>
          </Animated.View>

          {/* ── APP CONFIG ── */}
          <Animated.View entering={FadeInDown.delay(260).springify()}>
            <Text style={[styles.sectionLabel, { color: T.textMuted }]}>App Configuration</Text>
            <View style={[T.neo, styles.group]}>
              <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                onPress={() => router.push('/notifications')}>
                <View style={[T.neo, styles.rowIcon, { backgroundColor: T.bg }]}>
                  <Text style={styles.rowEmoji}>🔔</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Notification Registry</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Push tokens & permission status</Text>
                </View>
                <Text style={[styles.chevron, { color: T.textMuted }]}>›</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* ── DANGER ZONE ── */}
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Danger Zone</Text>
            <View style={[T.neo, styles.group]}>
              <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                onPress={handleReset}>
                <View style={[T.neo, styles.rowIcon, { backgroundColor: T.bg }]}>
                  <Text style={styles.rowEmoji}>🗑️</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.red }]}>Reset Application Data</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Clear all habits & cancel reminders</Text>
                </View>
                <Text style={[styles.chevron, { color: T.red }]}>›</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInDown.delay(380).springify()} style={styles.about}>
            <Text style={[styles.aboutApp, { color: T.teal }]}>🌿 HabitFlow</Text>
            <Text style={[styles.aboutVer, { color: T.textMuted }]}>Version 1.0.0  ·  Expo SDK 55</Text>
            <Text style={[styles.aboutMode, { color: T.textMuted }]}>{isDark ? '🌙 Dark' : '☀️ Light'} Neumorphic Design</Text>
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>

        <TabBar activeTab="profile" />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  headerEmoji: { fontSize: 22 },
  headerTitle: { fontSize: 20, fontWeight: '800' },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, marginTop: 12, paddingLeft: 4 },
  group: { borderRadius: 22, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 6 },

  // Profile card
  profileCard:      { borderRadius: 24, padding: 20, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 18 },
  avatarWrap:       { position: 'relative', width: 80, height: 80 },
  avatarImg:        { width: 80, height: 80, borderRadius: 40 },
  avatarEmojiBg:    { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarEmojiText:  { fontSize: 40 },
  cameraBadge:      { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  profileInfo:      { flex: 1 },
  profileName:      { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  profileNameHint:  { fontSize: 11 },
  nameInput:        { fontSize: 18, fontWeight: '700', borderBottomWidth: 1.5, paddingBottom: 4, marginBottom: 4 },

  // Avatar picker
  avatarPickerPanel: { borderRadius: 22, padding: 16, marginBottom: 10 },
  pickerTitle:       { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 },
  galleryBtn:        { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  galleryBtnTitle:   { fontSize: 14, fontWeight: '700' },
  galleryBtnDesc:    { fontSize: 11, marginTop: 2 },
  pickerSubLabel:    { fontSize: 11, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  stickerRow:        { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  stickerBtn:        { flex: 1, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stickerEmoji:      { fontSize: 30 },

  // Theme row
  themeRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  themeIconBig:    { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  themeText:       { flex: 1, marginRight: 12 },
  themeToggleBtn:  { width: 52, height: 30, borderRadius: 15, borderWidth: 1, justifyContent: 'center', paddingHorizontal: 3 },
  themeToggleInner:{ flex: 1, justifyContent: 'center' },
  themeThumb:      { width: 24, height: 24, borderRadius: 12 },

  // Normal row
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowIcon:  { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowEmoji: { fontSize: 18 },
  rowText:  { flex: 1, marginRight: 10 },
  rowTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  rowDesc:  { fontSize: 11, lineHeight: 16 },
  chevron:  { fontSize: 22, fontWeight: '300' },
  divider:  { height: 1, marginVertical: 2 },

  about:     { alignItems: 'center', paddingVertical: 20 },
  aboutApp:  { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  aboutVer:  { fontSize: 12, marginBottom: 4 },
  aboutMode: { fontSize: 11, fontStyle: 'italic' },
});
