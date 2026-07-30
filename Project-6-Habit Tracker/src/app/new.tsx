import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHabits } from '../hooks/use-habits';
import { useTheme } from '../context/ThemeContext';
import { Frequency } from '../lib/habits/types';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';

const POPULAR_EMOJIS = ['🥤','🌱','👟','🧘','🥗','🌙','📖','💪','🍎','💻','🏃','🎵','💊','🧹','🧠'];
const WEEKDAYS = [
  { label: 'S', value: 0 }, { label: 'M', value: 1 }, { label: 'T', value: 2 },
  { label: 'W', value: 3 }, { label: 'T', value: 4 }, { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

export function isImageUri(str?: string): boolean {
  if (!str) return false;
  return str.startsWith('file:') || str.startsWith('content:') || str.startsWith('http:') || str.startsWith('https:') || str.startsWith('data:');
}

export default function CreateHabitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { habits, createHabit, updateHabit } = useHabits();
  const { T } = useTheme();

  const editingHabit = params.id ? habits.find(h => h.id === params.id) : null;

  const [name, setName] = useState(editingHabit ? editingHabit.name : '');
  const [emoji, setEmoji] = useState(editingHabit ? editingHabit.emoji : '🥤');
  const [category, setCategory] = useState<'health' | 'work' | 'mind' | 'body' | 'other'>(
    editingHabit ? (editingHabit.category || 'health') : 'health'
  );
  const [kind, setKind] = useState<'daily' | 'weekly'>(
    editingHabit ? editingHabit.frequency.kind : 'daily'
  );
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(
    editingHabit && editingHabit.frequency.kind === 'weekly' ? editingHabit.frequency.weekdays : [1, 2, 3, 4, 5]
  );
  const [hour, setHour] = useState(
    editingHabit ? editingHabit.frequency.hour : 8
  );
  const [minute, setMinute] = useState(
    editingHabit ? editingHabit.frequency.minute : 0
  );
  const [ampm, setAmPm] = useState<'AM' | 'PM'>(hour >= 12 ? 'PM' : 'AM');

  const incH = () => setHour(h => (h % 12) + 1);
  const decH = () => setHour(h => (h === 1 ? 12 : h - 1));
  const incM = () => setMinute(m => (m + 5) % 60);
  const decM = () => setMinute(m => (m - 5 + 60) % 60);

  const handlePickImage = async () => {
    Alert.alert(
      'Custom Habit Icon / Photo',
      'Choose how you want to select your habit icon photo:',
      [
        {
          text: '📸 Take Photo with Camera',
          onPress: async () => {
            try {
              const permission = await ImagePicker.requestCameraPermissionsAsync();
              if (!permission.granted) {
                Alert.alert('Permission Needed', 'Camera access is required to take a photo.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets[0]?.uri) {
                setEmoji(result.assets[0].uri);
              }
            } catch (e) {
              Alert.alert('Error', 'Could not open camera.');
            }
          },
        },
        {
          text: '🖼️ Pick Photo from Gallery',
          onPress: async () => {
            try {
              const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permission.granted) {
                Alert.alert('Permission Needed', 'Gallery access is required to pick a photo.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets[0]?.uri) {
                setEmoji(result.assets[0].uri);
              }
            } catch (e) {
              Alert.alert('Error', 'Could not open gallery.');
            }
          },
        },
        {
          text: '🥤 Reset to Default Emoji',
          onPress: () => setEmoji('🥤'),
          style: 'destructive',
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const toggleWeekday = (val: number) => {
    if (selectedWeekdays.includes(val)) {
      if (selectedWeekdays.length === 1) {
        Alert.alert('Minimum 1', 'Select at least one weekday.'); return;
      }
      setSelectedWeekdays(selectedWeekdays.filter(w => w !== val));
    } else {
      setSelectedWeekdays([...selectedWeekdays, val].sort());
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Please enter a habit name.'); return; }
    
    let finalHour = hour % 12;
    if (ampm === 'PM') finalHour += 12;

    const frequency: Frequency = kind === 'daily'
      ? { kind: 'daily', hour: finalHour, minute }
      : { kind: 'weekly', weekdays: selectedWeekdays, hour: finalHour, minute };

    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, name, emoji, frequency, category);
      } else {
        await createHabit(name, emoji, frequency, category);
      }
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save habit. Please try again.');
    }
  };

  const formatDisplayTime = () => {
    const displayH = String(hour % 12 || 12).padStart(2, '0');
    const displayM = String(minute).padStart(2, '0');
    return `${displayH}:${displayM} ${ampm}`;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* ── Header with Back Circle & Centered Title ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[T.neo, styles.closeBtn]}>
            <Ionicons name="arrow-back" size={20} color={T.textPrimary} />
          </Pressable>
          
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18 }}>✨</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: T.textPrimary }}>
                {editingHabit ? 'Edit' : 'New'} <Text style={{ color: T.teal }}>Habit</Text>
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: T.textMuted, marginTop: 1 }}>
              Small habits, big changes
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── 1. Live Interactive Card Preview (Clickable Camera Badge) ── */}
          <Animated.View entering={FadeInDown.delay(60).springify()}
            style={[T.neo, styles.previewCard, { backgroundColor: T.bgCard, borderColor: T.tealBorder }]}>
            
            {/* Left Emoji/Image Box with Clickable Camera Badge */}
            <Pressable onPress={handlePickImage} style={{ position: 'relative', marginRight: 14 }}>
              <View style={[T.neo, styles.previewEmojiBox, { backgroundColor: T.bg, overflow: 'hidden' }]}>
                {isImageUri(emoji) ? (
                  <Image source={{ uri: emoji }} style={{ width: 48, height: 48, borderRadius: 14 }} resizeMode="cover" />
                ) : (
                  <Text style={styles.previewEmoji}>{emoji}</Text>
                )}
              </View>
              <View style={[T.neo, styles.cameraBadge, { backgroundColor: T.bgCard }]}>
                <Ionicons name="camera" size={11} color={T.teal} />
              </View>
            </Pressable>

            {/* Habit Info */}
            <View style={styles.previewInfo}>
              <Text style={[styles.previewName, { color: name ? T.textPrimary : T.textMuted }]}>
                {name || 'Habit Name'}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: T.textMuted }}>
                {kind === 'daily' ? 'Daily' : 'Weekly'} at <Text style={{ color: T.teal }}>{formatDisplayTime()}</Text>
              </Text>
            </View>

            {/* Reset/Clear Button */}
            <Pressable onPress={() => { setName(''); setEmoji('🥤'); }} style={[T.neo, styles.previewCheck, { backgroundColor: T.bg }]}>
              <Ionicons name="close" size={16} color={T.textMuted} />
            </Pressable>
          </Animated.View>

          {/* ── 2. Habit Name Input ── */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.field}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Ionicons name="person-outline" size={15} color={T.teal} />
              <Text style={[styles.fieldLabel, { color: T.textPrimary }]}>Habit Name</Text>
            </View>
            <TextInput
              style={[T.neoPressed, styles.input, { color: T.textPrimary, backgroundColor: T.bgPress }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Drink Water, Workout..."
              placeholderTextColor={T.textMuted}
              maxLength={32}
            />
          </Animated.View>

          {/* ── 3. Category Selector Strip ── */}
          <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.field}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Ionicons name="grid-outline" size={15} color={T.teal} />
              <Text style={[styles.fieldLabel, { color: T.textPrimary }]}>Category</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}>
              {([
                { value: 'health', label: 'Health', icon: 'heart-outline' as const },
                { value: 'work',   label: 'Work',   icon: 'briefcase-outline' as const },
                { value: 'mind',   label: 'Mind',   icon: 'bulb-outline' as const },
                { value: 'body',   label: 'Body',   icon: 'barbell-outline' as const },
                { value: 'other',  label: 'Other',  icon: 'ellipsis-horizontal-circle-outline' as const }
              ] as const).map(cat => {
                const active = category === cat.value;
                return (
                  <Pressable key={cat.value} onPress={() => setCategory(cat.value)}
                    style={[
                      T.neo,
                      styles.categoryOption,
                      { backgroundColor: active ? 'transparent' : T.bgCard, borderColor: active ? T.teal : 'transparent', borderWidth: active ? 1.5 : 0 }
                    ]}>
                    <Ionicons name={cat.icon} size={15} color={active ? T.teal : T.textMuted} />
                    <Text style={{ fontSize: 13, fontWeight: active ? '800' : '600', color: active ? T.teal : T.textSub }}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* ── 4. Choose an Icon Carousel + Gallery Upload Button ── */}
          <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.field}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Ionicons name="color-palette-outline" size={15} color={T.teal} />
              <Text style={[styles.fieldLabel, { color: T.textPrimary }]}>Choose an Icon or Photo</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiList}>
              {/* Photo Gallery Picker Button */}
              <Pressable onPress={handlePickImage}
                style={[
                  T.neo,
                  styles.emojiCell,
                  { backgroundColor: T.bgCard, width: 62 },
                  isImageUri(emoji) && { borderColor: T.teal, borderWidth: 2, backgroundColor: 'rgba(45,212,191,0.15)' }
                ]}>
                <Ionicons name="camera-outline" size={20} color={T.teal} />
                <Text style={{ fontSize: 9, fontWeight: '800', color: T.teal, marginTop: 2 }}>Photo</Text>
              </Pressable>

              {POPULAR_EMOJIS.map(em => (
                <Pressable key={em} onPress={() => setEmoji(em)}
                  style={[
                    T.neo,
                    styles.emojiCell,
                    { backgroundColor: T.bgCard },
                    emoji === em && { borderColor: T.teal, borderWidth: 2, backgroundColor: 'rgba(45,212,191,0.1)' }
                  ]}>
                  <Text style={styles.emojiCellText}>{em}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Pagination Dots Indicator */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              <View style={{ width: 18, height: 5, borderRadius: 3, backgroundColor: T.teal }} />
              <View style={{ width: 6, height: 5, borderRadius: 3, backgroundColor: '#334155' }} />
              <View style={{ width: 6, height: 5, borderRadius: 3, backgroundColor: '#334155' }} />
              <View style={{ width: 6, height: 5, borderRadius: 3, backgroundColor: '#334155' }} />
            </View>
          </Animated.View>

          {/* ── 5. Reminder Time with Circular Alarm Ring & AM/PM Toggle ── */}
          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.field}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Ionicons name="alarm-outline" size={15} color={T.teal} />
              <Text style={[styles.fieldLabel, { color: T.textPrimary }]}>Reminder Time</Text>
            </View>
            
            <View style={[T.neo, styles.timePickerCard, { backgroundColor: T.bgCard }]}>
              {/* Left Circular Alarm Dial */}
              <View style={{ width: 72, height: 72, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={72} height={72} style={{ position: 'absolute' }}>
                  <Circle cx={36} cy={36} r={32} stroke="rgba(255,255,255,0.06)" strokeWidth={5} fill="transparent" />
                  <Circle
                    cx={36} cy={36} r={32}
                    stroke={T.teal}
                    strokeWidth={5}
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={(2 * Math.PI * 32) * 0.35}
                    strokeLinecap="round"
                    transform="rotate(-90 36 36)"
                  />
                </Svg>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="notifications" size={22} color={T.teal} />
                </View>
              </View>

              {/* Center HH : MM Selector */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {/* Hour */}
                <View style={styles.timeCol}>
                  <Pressable onPress={incH} style={styles.arrowBtn}>
                    <Ionicons name="chevron-up" size={18} color={T.teal} />
                  </Pressable>
                  <View style={[T.neoPressed, styles.timeValBox, { backgroundColor: T.bgPress }]}>
                    <Text style={[styles.timeText, { color: T.textPrimary }]}>{String(hour % 12 || 12).padStart(2,'0')}</Text>
                  </View>
                  <Pressable onPress={decH} style={styles.arrowBtn}>
                    <Ionicons name="chevron-down" size={18} color={T.teal} />
                  </Pressable>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: T.textMuted, marginTop: 2 }}>HH</Text>
                </View>

                <Text style={{ fontSize: 24, fontWeight: '900', color: T.teal, marginBottom: 14 }}>:</Text>

                {/* Minute */}
                <View style={styles.timeCol}>
                  <Pressable onPress={incM} style={styles.arrowBtn}>
                    <Ionicons name="chevron-up" size={18} color={T.teal} />
                  </Pressable>
                  <View style={[T.neoPressed, styles.timeValBox, { backgroundColor: T.bgPress }]}>
                    <Text style={[styles.timeText, { color: T.textPrimary }]}>{String(minute).padStart(2,'0')}</Text>
                  </View>
                  <Pressable onPress={decM} style={styles.arrowBtn}>
                    <Ionicons name="chevron-down" size={18} color={T.teal} />
                  </Pressable>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: T.textMuted, marginTop: 2 }}>MM</Text>
                </View>
              </View>

              {/* Right AM/PM Segmented Toggle */}
              <View style={[T.neoPressed, { borderRadius: 14, padding: 3, backgroundColor: T.bgPress }]}>
                <Pressable onPress={() => setAmPm('AM')}
                  style={[{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11 }, ampm === 'AM' && { backgroundColor: T.teal }]}>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: ampm === 'AM' ? '#0D1525' : T.textMuted }}>AM</Text>
                </Pressable>
                <Pressable onPress={() => setAmPm('PM')}
                  style={[{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11 }, ampm === 'PM' && { backgroundColor: T.teal }]}>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: ampm === 'PM' ? '#0D1525' : T.textMuted }}>PM</Text>
                </Pressable>
              </View>

            </View>
          </Animated.View>

          {/* ── 6. Frequency Selector ── */}
          <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.field}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Ionicons name="repeat-outline" size={15} color={T.teal} />
              <Text style={[styles.fieldLabel, { color: T.textPrimary }]}>Frequency</Text>
            </View>
            <View style={[T.neoPressed, styles.freqRow, { backgroundColor: T.bgPress }]}>
              {(['daily','weekly'] as const).map(k => (
                <Pressable key={k} onPress={() => setKind(k)}
                  style={[styles.freqOption, kind === k && { backgroundColor: T.teal }]}>
                  <Ionicons name={k === 'daily' ? 'calendar-outline' : 'calendar-number-outline'} size={15} color={kind === k ? '#0D1525' : T.textMuted} style={{ marginRight: 6 }} />
                  <Text style={[styles.freqText, { color: kind === k ? '#0D1525' : T.textMuted },
                    kind === k && { fontWeight: '900' }]}>
                    {k === 'daily' ? 'Daily' : 'Weekly'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Weekday picker */}
          {kind === 'weekly' && (
            <Animated.View entering={FadeInDown.delay(260).springify()} style={styles.field}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Ionicons name="calendar-outline" size={15} color={T.teal} />
                <Text style={[styles.fieldLabel, { color: T.textPrimary }]}>Select Days</Text>
              </View>
              <View style={styles.weekRow}>
                {WEEKDAYS.map(day => {
                  const active = selectedWeekdays.includes(day.value);
                  return (
                    <Pressable key={day.value} onPress={() => toggleWeekday(day.value)}
                      style={[T.neo, styles.dayChip, { backgroundColor: active ? T.teal : T.bgCard }]}>
                      <Text style={[styles.dayLabel, { color: active ? '#0D1525' : T.textMuted },
                        active && { fontWeight: '900' }]}>{day.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* ── 7. Big Rocket Action Button ── */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 10 }}>
            <Pressable
              style={({ pressed }) => [
                T.neo,
                styles.saveBtn,
                { backgroundColor: T.teal, opacity: pressed ? 0.85 : 1 }
              ]}
              onPress={handleSave}>
              <Text style={{ fontSize: 20 }}>🚀</Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#0D1525' }}>
                {editingHabit ? 'Update Habit' : 'Create Habit'}
              </Text>
            </Pressable>
          </Animated.View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  root:   { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 64 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 18 },

  // Preview
  previewCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 14, marginBottom: 22, borderWidth: 1 },
  previewEmojiBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  previewEmoji: { fontSize: 26 },
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  previewInfo:  { flex: 1 },
  previewName:  { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  previewCheck: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  field:      { marginBottom: 22 },
  fieldLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
  input:      { height: 52, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, fontWeight: '600' },

  emojiList: { gap: 10, paddingVertical: 4 },
  emojiCell: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emojiCellText: { fontSize: 24 },

  timePickerCard: { borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeCol:  { alignItems: 'center' },
  arrowBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  timeValBox: { width: 54, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  timeText:   { fontSize: 22, fontWeight: '900' },

  freqRow: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 6 },
  freqOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 12 },
  freqText:   { fontSize: 14, fontWeight: '600' },

  categoryOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, paddingHorizontal: 14, borderRadius: 14, gap: 6 },

  weekRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip:  { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  dayLabel: { fontSize: 13, fontWeight: '600' },

  saveBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
});
