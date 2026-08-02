import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Switch, Alert, BackHandler, Image, TextInput, Dimensions,
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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import TabBar from '../components/TabBar';
import { useWatchSync } from '../hooks/use-watch-sync';
import WatchPairingModal from '../components/WatchPairingModal';

const DEFAULT_AVATARS = ['ðŸ§˜', 'ðŸƒ', 'ðŸ’§', 'ðŸ“–', 'ðŸ’ª'];

export default function SettingsScreen() {
  const router = useRouter();
  const { T, isDark, toggleTheme } = useTheme();
  const { pairedDevice, disconnectDevice } = useWatchSync();
  const [pairingModalVisible, setPairingModalVisible] = useState(false);

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

  const [profileUri,       setProfileUri]       = useState<string | null>(null);
  const [profileEmoji,     setProfileEmoji]     = useState('ðŸ§˜');
  const [profileName,      setProfileName]      = useState('Himanshu');
  const [editingName,      setEditingName]      = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [quietHours,       setQuietHours]       = useState(false);
  const [soundEnabled,     setSoundEnabled]     = useState(true);

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Allow HabitFlow to access your photos.', [{ text: 'OK' }]);
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
      await AsyncStorage.setItem('PROFILE_URI', uri);
    }
  };

  const selectEmoji = async (emoji: string) => {
    setProfileEmoji(emoji); setProfileUri(null); setShowAvatarPicker(false);
    await AsyncStorage.multiSet([['PROFILE_EMOJI', emoji], ['PROFILE_URI', '']]);
  };

  const saveName = async (name: string) => {
    const trimmed = name.trim() || 'Himanshu';
    setProfileName(trimmed); setEditingName(false);
    await AsyncStorage.setItem('PROFILE_NAME', trimmed);
  };

  const handleQuietHours = async (val: boolean) => {
    setQuietHours(val);
    await AsyncStorage.setItem('SETTINGS_QUIET_HOURS', String(val));
    if (val) Alert.alert('Quiet Hours', 'Reminders muted 10 PM â€“ 7 AM.');
  };

  const handleSound = async (val: boolean) => {
    setSoundEnabled(val);
    await AsyncStorage.setItem('SETTINGS_SOUND_ENABLED', String(val));
  };

  const handleReset = () => {
    Alert.alert('âš ï¸ Reset All Data', 'This will permanently delete all habits, streaks, and cancel all reminders.', [
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
    ]);
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

        {/* â”€â”€ HEADER â”€â”€ */}
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIconWrap, { backgroundColor: T.tealDim }]}>
              <Ionicons name="person" size={22} color={T.teal} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: T.textPrimary }]}>Profile</Text>
              <Text style={[styles.headerSub, { color: T.textMuted }]}>Manage your settings</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={[styles.gearBtn, { backgroundColor: T.bgCard }]}
          >
            <Ionicons name="settings-outline" size={20} color={T.textSub} />
          </Pressable>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* â”€â”€ PROFILE CARD â”€â”€ */}
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <View style={[styles.profileCard, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              {/* Avatar */}
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

              {/* Name + badge */}
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
                  <Text style={{ fontSize: 11 }}>â­</Text>
                  <Text style={[styles.motiveBadgeText, { color: T.teal }]}>Keep going, stay consistent!</Text>
                </View>
              </View>
            </View>

            {showAvatarPicker && (
              <Animated.View entering={FadeInDown.duration(300).springify()}
                style={[styles.avatarPickerPanel, { backgroundColor: T.bgCard, borderColor: T.border }]}>
                <Text style={[styles.pickerTitle, { color: T.textMuted }]}>CHOOSE AVATAR</Text>
                <Pressable onPress={pickImage}
                  style={[styles.galleryBtn, { backgroundColor: T.tealDim, borderColor: T.tealBorder }]}>
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

          {/* â”€â”€ APPEARANCE â”€â”€ */}
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="color-palette-outline" size={13} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>APPEARANCE</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <View style={styles.row}>
                <View style={[styles.rowIconBubble, { backgroundColor: '#1A2340' }]}>
                  <Text style={{ fontSize: 22 }}>{isDark ? 'ðŸŒ™' : 'â˜€ï¸'}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>{isDark ? 'Deep blue theme' : 'Light airy theme'}</Text>
                </View>
                <Animated.View style={toggleStyle}>
                  <Switch
                    value={isDark}
                    onValueChange={handleToggle}
                    trackColor={{ false: '#334155', true: T.teal }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#334155"
                  />
                </Animated.View>
              </View>
            </View>
          </Animated.View>

          {/* â”€â”€ NOTIFICATIONS â”€â”€ */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="notifications-outline" size={13} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>NOTIFICATIONS</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <View style={styles.row}>
                <View style={[styles.rowIconBubble, { backgroundColor: '#1E1535' }]}>
                  <Text style={{ fontSize: 22 }}>ðŸ’¤</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Quiet Hours</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Mute reminders 10 PM â€“ 7 AM</Text>
                </View>
                <Switch value={quietHours} onValueChange={handleQuietHours}
                  trackColor={{ false: '#334155', true: T.teal }}
                  thumbColor="#FFFFFF" ios_backgroundColor="#334155" />
              </View>
              <View style={[styles.divider, { backgroundColor: T.border }]} />
              <View style={styles.row}>
                <View style={[styles.rowIconBubble, { backgroundColor: '#0D2A28' }]}>
                  <Text style={{ fontSize: 22 }}>ðŸ”Š</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Sound Effects</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Play audio for reminders</Text>
                </View>
                <Switch value={soundEnabled} onValueChange={handleSound}
                  trackColor={{ false: '#334155', true: T.teal }}
                  thumbColor="#FFFFFF" ios_backgroundColor="#334155" />
              </View>
            </View>
          </Animated.View>

          {/* â”€â”€ DEVICE CONNECTIONS â”€â”€ */}
          <Animated.View entering={FadeInDown.delay(230).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="link-outline" size={13} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>DEVICE CONNECTIONS</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              {pairedDevice ? (
                <View style={styles.row}>
                  <View style={[styles.rowIconBubble, { backgroundColor: '#0D2A28' }]}>
                    <Text style={{ fontSize: 22 }}>âŒš</Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: T.teal }]}>{pairedDevice.name}</Text>
                    <Text style={[styles.rowDesc, { color: T.textMuted }]}>
                      Connected ðŸŸ¢  Â·  Battery: {pairedDevice.battery}%  Â·  {pairedDevice.lastSync}
                    </Text>
                  </View>
                  <Pressable onPress={disconnectDevice}
                    style={[styles.disconnectBtn, { backgroundColor: 'rgba(234,94,94,0.15)' }]}>
                    <Text style={[styles.disconnectBtnText, { color: '#EA5E5E' }]}>Disconnect</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                  onPress={() => setPairingModalVisible(true)}>
                  <View style={[styles.rowIconBubble, { backgroundColor: '#0D2A28' }]}>
                    <Text style={{ fontSize: 22 }}>âŒš</Text>
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

          {/* â”€â”€ APP CONFIGURATION â”€â”€ */}
          <Animated.View entering={FadeInDown.delay(260).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="options-outline" size={13} color={T.teal} />
              <Text style={[styles.sectionLabel, { color: T.textMuted }]}>APP CONFIGURATION</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: T.border }]}>
              <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                onPress={() => router.push('/notifications')}>
                <View style={[styles.rowIconBubble, { backgroundColor: '#1A2010' }]}>
                  <Text style={{ fontSize: 22 }}>ðŸ””</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: T.textPrimary }]}>Notification Registry</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Push tokens & permission status</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={T.textMuted} />
              </Pressable>
            </View>
          </Animated.View>

          {/* â”€â”€ DANGER ZONE â”€â”€ */}
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="warning-outline" size={13} color="#EA5E5E" />
              <Text style={[styles.sectionLabel, { color: '#EA5E5E' }]}>DANGER ZONE</Text>
            </View>
            <View style={[styles.group, { backgroundColor: T.bgCard, borderColor: 'rgba(234,94,94,0.3)' }]}>
              <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]} onPress={handleReset}>
                <View style={[styles.rowIconBubble, { backgroundColor: 'rgba(234,94,94,0.15)' }]}>
                  <Ionicons name="trash-outline" size={22} color="#EA5E5E" />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: '#EA5E5E' }]}>Reset Application Data</Text>
                  <Text style={[styles.rowDesc, { color: T.textMuted }]}>Clear all habits & cancel reminders</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#EA5E5E" />
              </Pressable>
            </View>
          </Animated.View>

          {/* â”€â”€ ABOUT â”€â”€ */}
          <Animated.View entering={FadeInDown.delay(380).springify()} style={styles.about}>
            <Text style={[styles.aboutApp, { color: T.teal }]}>ðŸŒ¿ HabitFlow</Text>
            <Text style={[styles.aboutVer, { color: T.textMuted }]}>Version 1.0.0  â€¢  Expo SDK 55</Text>
            <Text style={[styles.aboutMode, { color: T.textMuted }]}>ðŸŒ™ Dark Neumorphic Design</Text>
          </Animated.View>

          <View style={{ height: 110 }} />
        </ScrollView>

        <TabBar activeTab="profile" />

        <WatchPairingModal
          visible={pairingModalVisible}
          onClose={() => setPairingModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  gearBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 18, paddingLeft: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.4 },

  group: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 4, borderWidth: 1 },

  profileCard: { borderRadius: 24, padding: 20, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 18, borderWidth: 1 },
  avatarWrap: { position: 'relative', width: 84, height: 84 },
  avatarImg: { width: 84, height: 84, borderRadius: 42 },
  avatarEmojiBg: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  avatarEmojiText: { fontSize: 42 },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  profileName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  profileNameHint: { fontSize: 11, fontWeight: '500', marginBottom: 10 },
  nameInput: { fontSize: 18, fontWeight: '700', borderBottomWidth: 1.5, paddingBottom: 4, marginBottom: 4 },
  motiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  motiveBadgeText: { fontSize: 11, fontWeight: '700' },

  avatarPickerPanel: { borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 1 },
  pickerTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 },
  galleryBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  galleryBtnTitle: { fontSize: 14, fontWeight: '700' },
  galleryBtnDesc: { fontSize: 11, marginTop: 2 },
  pickerSubLabel: { fontSize: 11, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  stickerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  stickerBtn: { flex: 1, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stickerEmoji: { fontSize: 28 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  rowIconBubble: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowText: { flex: 1, marginRight: 10 },
  rowTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  rowDesc: { fontSize: 12, lineHeight: 17 },
  divider: { height: 1, marginVertical: 2 },

  disconnectBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  disconnectBtnText: { fontSize: 11, fontWeight: '700' },

  about: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  aboutApp: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  aboutVer: { fontSize: 12 },
  aboutMode: { fontSize: 11, fontStyle: 'italic' },
});
