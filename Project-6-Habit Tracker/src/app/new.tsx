import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useHabits } from '../hooks/use-habits';
import { useTheme } from '../context/ThemeContext';
import { Frequency } from '../lib/habits/types';
import Animated, { FadeInDown } from 'react-native-reanimated';

const POPULAR_EMOJIS = ['💧','📖','💪','🧘','🍎','💻','🚶','🏃','🎵','✏️','💊','🧹','🌿','🛌','🧠'];
const WEEKDAYS = [
  { label: 'S', value: 0 }, { label: 'M', value: 1 }, { label: 'T', value: 2 },
  { label: 'W', value: 3 }, { label: 'T', value: 4 }, { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

export default function CreateHabitScreen() {
  const router = useRouter();
  const { createHabit } = useHabits();
  const { T } = useTheme();

  const [name,  setName]  = useState('');
  const [emoji, setEmoji] = useState('💧');
  const [category, setCategory] = useState<'health' | 'work' | 'mind' | 'body' | 'other'>('other');
  const [kind,  setKind]  = useState<'daily' | 'weekly'>('daily');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [hour,   setHour]   = useState(8);
  const [minute, setMinute] = useState(0);

  const incH = () => setHour(h => (h + 1) % 24);
  const decH = () => setHour(h => (h - 1 + 24) % 24);
  const incM = () => setMinute(m => (m + 5) % 60);
  const decM = () => setMinute(m => (m - 5 + 60) % 60);

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
    const frequency: Frequency = kind === 'daily'
      ? { kind: 'daily', hour, minute }
      : { kind: 'weekly', weekdays: selectedWeekdays, hour, minute };
    try {
      await createHabit(name, emoji, frequency, category);
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save habit. Please try again.');
    }
  };

  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]}>
      <View style={[styles.root, { backgroundColor: T.bg }]}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[T.neo, styles.closeBtn]}>
            <Text style={[styles.closeText, { color: T.textPrimary }]}>✕</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: T.textPrimary }]}>✨ New Habit</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Live Preview */}
          <Animated.View entering={FadeInDown.delay(60).springify()}
            style={[T.neo, styles.previewCard, { borderColor: T.tealBorder }]}>
            <View style={[T.neo, styles.previewEmojiBox, { backgroundColor: T.bg }]}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={[styles.previewName, { color: name ? T.textPrimary : T.textMuted }]}>
                {name || 'Habit Name'}
              </Text>
              <Text style={[styles.previewFreq, { color: T.textMuted }]}>
                {kind === 'daily'
                  ? `Daily at ${formatTime(hour, minute)}`
                  : `${selectedWeekdays.map(w => WEEKDAYS.find(d => d.value === w)?.label).join(' · ')} at ${formatTime(hour, minute)}`}
              </Text>
            </View>
            <View style={[T.neo, styles.previewCheck, { backgroundColor: T.bg }]}>
              <Text style={{ fontSize: 18 }}>○</Text>
            </View>
          </Animated.View>

          {/* Name Input */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: T.textSub }]}>📝 Habit Name</Text>
            <TextInput
              style={[T.neo, styles.input, { color: T.textPrimary }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Drink Water, Workout…"
              placeholderTextColor={T.textMuted}
              maxLength={28}
            />
          </Animated.View>

          {/* Category Selector */}
          <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: T.textSub }]}>🏷️ Category</Text>
            <View style={[T.neo, styles.categoryRow]}>
              {([
                { value: 'health', label: 'Health', emoji: '🌿' },
                { value: 'work', label: 'Work', emoji: '💼' },
                { value: 'mind', label: 'Mind', emoji: '🧠' },
                { value: 'body', label: 'Body', emoji: '🏃' },
                { value: 'other', label: 'Other', emoji: '🌟' }
              ] as const).map(cat => {
                const active = category === cat.value;
                return (
                  <Pressable key={cat.value} onPress={() => setCategory(cat.value)}
                    style={[styles.categoryOption, active && { backgroundColor: T.teal }]}>
                    <Text style={{ fontSize: 13 }}>{cat.emoji}</Text>
                    <Text style={[styles.categoryText, { color: active ? T.bg : T.textMuted }, active && { fontWeight: '700' }]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Emoji Picker */}
          <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: T.textSub }]}>😊 Pick an Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiList}>
              {POPULAR_EMOJIS.map(em => (
                <Pressable key={em} onPress={() => setEmoji(em)}
                  style={[T.neo, styles.emojiCell, emoji === em && { borderColor: T.teal, borderWidth: 2 }]}>
                  <Text style={styles.emojiCellText}>{em}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Reminder Time */}
          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: T.textSub }]}>⏰ Reminder Time</Text>
            <View style={[T.neo, styles.timePicker]}>
              {/* Hour */}
              <View style={styles.timeCol}>
                <Pressable onPress={incH} style={styles.arrowBtn}>
                  <Text style={[styles.arrow, { color: T.teal }]}>▲</Text>
                </Pressable>
                <View style={[T.neoPressed, styles.timeVal]}>
                  <Text style={[styles.timeText, { color: T.textPrimary }]}>{String(hour).padStart(2,'0')}</Text>
                </View>
                <Pressable onPress={decH} style={styles.arrowBtn}>
                  <Text style={[styles.arrow, { color: T.teal }]}>▼</Text>
                </Pressable>
                <Text style={[styles.timeUnit, { color: T.textMuted }]}>HH</Text>
              </View>

              <Text style={[styles.timeSep, { color: T.teal }]}>:</Text>

              {/* Minute */}
              <View style={styles.timeCol}>
                <Pressable onPress={incM} style={styles.arrowBtn}>
                  <Text style={[styles.arrow, { color: T.teal }]}>▲</Text>
                </Pressable>
                <View style={[T.neoPressed, styles.timeVal]}>
                  <Text style={[styles.timeText, { color: T.textPrimary }]}>{String(minute).padStart(2,'0')}</Text>
                </View>
                <Pressable onPress={decM} style={styles.arrowBtn}>
                  <Text style={[styles.arrow, { color: T.teal }]}>▼</Text>
                </Pressable>
                <Text style={[styles.timeUnit, { color: T.textMuted }]}>MM</Text>
              </View>

              {/* AM/PM */}
              <View style={[styles.ampm, { backgroundColor: T.tealDim, borderColor: T.tealBorder }]}>
                <Text style={[styles.ampmText, { color: T.teal }]}>{hour >= 12 ? 'PM' : 'AM'}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Frequency */}
          <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: T.textSub }]}>🔄 Frequency</Text>
            <View style={[T.neo, styles.freqRow]}>
              {(['daily','weekly'] as const).map(k => (
                <Pressable key={k} onPress={() => setKind(k)}
                  style={[styles.freqOption, kind === k && { backgroundColor: T.teal }]}>
                  <Text style={{ fontSize: 14 }}>{k === 'daily' ? '📅' : '🗓️'}</Text>
                  <Text style={[styles.freqText, { color: kind === k ? T.bg : T.textMuted },
                    kind === k && { fontWeight: '700' }]}>
                    {k === 'daily' ? 'Daily' : 'Weekly'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Weekday picker */}
          {kind === 'weekly' && (
            <Animated.View entering={FadeInDown.delay(260).springify()} style={styles.field}>
              <Text style={[styles.fieldLabel, { color: T.textSub }]}>📆 Select Days</Text>
              <View style={styles.weekRow}>
                {WEEKDAYS.map(day => {
                  const active = selectedWeekdays.includes(day.value);
                  return (
                    <Pressable key={day.value} onPress={() => toggleWeekday(day.value)}
                      style={[T.neo, styles.dayChip, active && { backgroundColor: T.teal }]}>
                      <Text style={[styles.dayLabel, { color: active ? T.bg : T.textMuted },
                        active && { fontWeight: '800' }]}>{day.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Save Button */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Pressable style={({ pressed }) => [T.neo, styles.saveBtn,
              { borderColor: T.tealBorder, opacity: pressed ? 0.8 : 1 }]}
              onPress={handleSave}>
              <Text style={styles.saveBtnEmoji}>🚀</Text>
              <Text style={[styles.saveBtnText, { color: T.teal }]}>Create Habit</Text>
            </Pressable>
          </Animated.View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1 },
  root:  { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 58 },
  closeBtn:    { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  closeText:   { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 18 },

  // Preview
  previewCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, padding: 14, marginBottom: 22, borderWidth: 1 },
  previewEmojiBox: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  previewEmoji: { fontSize: 24 },
  previewInfo:  { flex: 1 },
  previewName:  { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  previewFreq:  { fontSize: 11 },
  previewCheck: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  field:      { marginBottom: 22 },
  fieldLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },
  input:      { height: 54, borderRadius: 16, paddingHorizontal: 16, fontSize: 15 },

  emojiList: { gap: 10, paddingVertical: 4 },
  emojiCell: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emojiCellText: { fontSize: 24 },

  timePicker: { borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  timeCol:  { alignItems: 'center' },
  arrowBtn: { padding: 8 },
  arrow:    { fontSize: 16, fontWeight: '700' },
  timeVal:  { width: 58, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  timeText: { fontSize: 22, fontWeight: '900' },
  timeUnit: { fontSize: 9, fontWeight: '700', marginTop: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  timeSep:  { fontSize: 28, fontWeight: '700', marginHorizontal: 4, marginBottom: 18 },
  ampm:     { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginLeft: 12, borderWidth: 1 },
  ampmText: { fontSize: 14, fontWeight: '800' },

  freqRow: { flexDirection: 'row', borderRadius: 16, padding: 5, gap: 6 },
  freqOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 12, gap: 6 },
  freqText:   { fontSize: 14, fontWeight: '600' },

  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 16, padding: 6, gap: 6 },
  categoryOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 38, paddingHorizontal: 12, borderRadius: 10, gap: 4 },
  categoryText:   { fontSize: 12, fontWeight: '600' },

  weekRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip:  { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  dayLabel: { fontSize: 13, fontWeight: '600' },

  saveBtn: { height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtnEmoji: { fontSize: 18 },
  saveBtnText:  { fontSize: 16, fontWeight: '800' },
});
