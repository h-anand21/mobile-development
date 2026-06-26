import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onPress?: () => void;
}

export default function EmptyState({
  title = 'No Habits Yet',
  description = 'Small daily actions build massive streaks. Create your first habit!',
  buttonText = '＋ Create Habit',
  onPress,
}: EmptyStateProps) {
  const { T } = useTheme();

  const button = (
    <View style={[T.neo, styles.btn, { borderColor: T.tealBorder }]}>
      <Text style={[styles.btnText, { color: T.teal }]}>{buttonText}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={[T.neo, styles.iconCircle]}>
        <Text style={styles.icon}>✨</Text>
      </View>
      <Text style={[styles.title, { color: T.textPrimary }]}>{title}</Text>
      <Text style={[styles.desc, { color: T.textMuted }]}>{description}</Text>

      {onPress ? (
        <Pressable onPress={onPress}>{button}</Pressable>
      ) : (
        <Link href="/new" asChild>
          <Pressable>{button}</Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 28, marginTop: 20 },
  iconCircle: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  icon:  { fontSize: 32 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  desc:  { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 22, maxWidth: 260 },
  btn:   { paddingHorizontal: 28, paddingVertical: 13, borderRadius: 16, borderWidth: 1 },
  btnText: { fontSize: 15, fontWeight: '700' },
});
