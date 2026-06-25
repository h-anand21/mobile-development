import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../hooks/use-habits';
import { Frequency } from '../lib/habits/types';

const POPULAR_EMOJIS = ['💧', '📖', '💪', '🧘', '🍎', '💻', '🚶', '🏃', '🎵', '✏️', '💊', '🧹'];
const WEEKDAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

export default function CreateHabitScreen() {
  const router = useRouter();
  const { createHabit } = useHabits();

  // Form states
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💧');
  const [kind, setKind] = useState<'daily' | 'weekly'>('daily');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);

  // Time picker helpers
  const incrementHour = () => setHour(h => (h + 1) % 24);
  const decrementHour = () => setHour(h => (h - 1 + 24) % 24);
  const incrementMinute = () => setMinute(m => (m + 5) % 60);
  const decrementMinute = () => setMinute(m => (m - 5 + 60) % 60);

  const toggleWeekday = (val: number) => {
    if (selectedWeekdays.includes(val)) {
      if (selectedWeekdays.length === 1) {
        Alert.alert('Selection Required', 'Please select at least one weekday for weekly frequency.');
        return;
      }
      setSelectedWeekdays(selectedWeekdays.filter(w => w !== val));
    } else {
      setSelectedWeekdays([...selectedWeekdays, val].sort());
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a habit name.');
      return;
    }

    const frequency: Frequency =
      kind === 'daily'
        ? { kind: 'daily', hour, minute }
        : { kind: 'weekly', weekdays: selectedWeekdays, hour, minute };

    try {
      await createHabit(name, emoji, frequency);
      router.back();
    } catch (error) {
      console.error('Failed to create habit', error);
      Alert.alert('Error', 'Failed to save habit. Please try again.');
    }
  };

  // Preview helper
  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const displayMinute = String(m).padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>New Habit</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Live Preview Card */}
          <Text style={styles.sectionLabel}>Live Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewEmojiBox}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
            </View>
            <View style={styles.previewDetails}>
              <Text style={styles.previewName}>{name || 'Habit Name'}</Text>
              <Text style={styles.previewFreq}>
                {kind === 'daily'
                  ? `Daily at ${formatTime(hour, minute)}`
                  : `${selectedWeekdays.map(w => WEEKDAYS.find(d => d.value === w)?.label).join(', ')} at ${formatTime(hour, minute)}`}
              </Text>
            </View>
            <View style={styles.previewToggle}>
              <Ionicons name="ellipse-outline" size={28} color="#5EEAD4" />
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Habit Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Drink Water, Workout"
              placeholderTextColor="#94A3B8"
              maxLength={26}
            />
          </View>

          {/* Emoji Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Select Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiList}>
              {POPULAR_EMOJIS.map(item => (
                <Pressable
                  key={item}
                  style={[styles.emojiItem, emoji === item && styles.emojiItemActive]}
                  onPress={() => setEmoji(item)}
                >
                  <Text style={styles.emojiText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Reminder Time Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Reminder Time</Text>
            <View style={styles.timeSelectorContainer}>
              <View style={styles.timeColumn}>
                <Pressable onPress={incrementHour} style={styles.arrowBtn}>
                  <Ionicons name="chevron-up" size={22} color="#5EEAD4" />
                </Pressable>
                <View style={styles.timeValBox}>
                  <Text style={styles.timeValText}>{String(hour).padStart(2, '0')}</Text>
                </View>
                <Pressable onPress={decrementHour} style={styles.arrowBtn}>
                  <Ionicons name="chevron-down" size={22} color="#5EEAD4" />
                </Pressable>
                <Text style={styles.timeLabel}>Hours</Text>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              <View style={styles.timeColumn}>
                <Pressable onPress={incrementMinute} style={styles.arrowBtn}>
                  <Ionicons name="chevron-up" size={22} color="#5EEAD4" />
                </Pressable>
                <View style={styles.timeValBox}>
                  <Text style={styles.timeValText}>{String(minute).padStart(2, '0')}</Text>
                </View>
                <Pressable onPress={decrementMinute} style={styles.arrowBtn}>
                  <Ionicons name="chevron-down" size={22} color="#5EEAD4" />
                </Pressable>
                <Text style={styles.timeLabel}>Minutes</Text>
              </View>

              <View style={styles.ampmBox}>
                <Text style={styles.ampmText}>{hour >= 12 ? 'PM' : 'AM'}</Text>
              </View>
            </View>
          </View>

          {/* Frequency Type */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Frequency</Text>
            <View style={styles.freqToggleRow}>
              <Pressable
                style={[styles.freqOption, kind === 'daily' && styles.freqOptionActive]}
                onPress={() => setKind('daily')}
              >
                <Ionicons name="calendar-outline" size={16} color={kind === 'daily' ? '#0A1628' : '#94A3B8'} />
                <Text style={[styles.freqText, kind === 'daily' && styles.freqTextActive]}>Daily</Text>
              </Pressable>

              <Pressable
                style={[styles.freqOption, kind === 'weekly' && styles.freqOptionActive]}
                onPress={() => setKind('weekly')}
              >
                <Ionicons name="repeat-outline" size={16} color={kind === 'weekly' ? '#0A1628' : '#94A3B8'} />
                <Text style={[styles.freqText, kind === 'weekly' && styles.freqTextActive]}>Weekly</Text>
              </Pressable>
            </View>
          </View>

          {/* Weekday Selector (Weekly mode) */}
          {kind === 'weekly' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Select Weekdays</Text>
              <View style={styles.weekdayRow}>
                {WEEKDAYS.map(day => {
                  const active = selectedWeekdays.includes(day.value);
                  return (
                    <Pressable
                      key={day.value}
                      style={[styles.weekdayChip, active && styles.weekdayChipActive]}
                      onPress={() => toggleWeekday(day.value)}
                    >
                      <Text style={[styles.weekdayChipLabel, active && styles.weekdayChipLabelActive]}>
                        {day.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Save Button */}
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Create Habit</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.06)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0F1E35',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: '#0F1E35',
    borderColor: 'rgba(94, 234, 212, 0.25)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  previewEmojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(94, 234, 212, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  previewEmoji: {
    fontSize: 22,
  },
  previewDetails: {
    flex: 1,
  },
  previewName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  previewFreq: {
    fontSize: 11,
    color: '#94A3B8',
  },
  previewToggle: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#0F1E35',
    borderColor: 'rgba(148, 163, 184, 0.08)',
    borderWidth: 1,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
  },
  emojiList: {
    paddingVertical: 4,
  },
  emojiItem: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0F1E35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
  },
  emojiItemActive: {
    borderColor: '#5EEAD4',
    backgroundColor: 'rgba(94, 234, 212, 0.05)',
  },
  emojiText: {
    fontSize: 22,
  },
  timeSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F1E35',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
  },
  timeColumn: {
    alignItems: 'center',
    width: 70,
  },
  arrowBtn: {
    padding: 6,
  },
  timeValBox: {
    width: 56,
    height: 48,
    backgroundColor: '#0A1628',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  timeValText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5EEAD4',
    marginHorizontal: 16,
    bottom: 8,
  },
  ampmBox: {
    backgroundColor: 'rgba(94, 234, 212, 0.08)',
    borderColor: 'rgba(94, 234, 212, 0.2)',
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 16,
  },
  ampmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5EEAD4',
  },
  freqToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0F1E35',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
  },
  freqOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
  },
  freqOptionActive: {
    backgroundColor: '#5EEAD4',
  },
  freqText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 6,
  },
  freqTextActive: {
    color: '#0A1628',
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0F1E35',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.06)',
  },
  weekdayChipActive: {
    backgroundColor: '#5EEAD4',
    borderColor: '#5EEAD4',
  },
  weekdayChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  weekdayChipLabelActive: {
    color: '#0A1628',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#0F1E35',
    borderColor: '#5EEAD4',
    borderWidth: 1,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#5EEAD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5EEAD4',
  },
});
