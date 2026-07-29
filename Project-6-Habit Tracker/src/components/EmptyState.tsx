import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onPress?: () => void;
}

export default function EmptyState({
  title = 'No active habits',
  description = 'Try selecting another category or add a new habit.',
  buttonText = '+ Create Habit',
  onPress,
}: EmptyStateProps) {
  const { T } = useTheme();

  const button = (
    <View style={[T.neo, styles.btn, { backgroundColor: T.bgCard, borderColor: T.tealBorder }]}>
      <Text style={[styles.btnText, { color: T.teal }]}>{buttonText}</Text>
    </View>
  );

  return (
    <View style={[T.neo, styles.card, { backgroundColor: T.bgCard }]}>
      <View style={styles.contentRow}>
        {/* Left Clipboard Illustration */}
        <View style={styles.illustrationWrap}>
          <View style={[styles.glowBg, { backgroundColor: 'rgba(79, 227, 213, 0.08)' }]} />
          {/* Clipboard SVG */}
          <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
            <Rect x="5" y="4" width="14" height="17" rx="3" fill="#243044" stroke="#475569" strokeWidth="1.5" />
            <Path d="M9 3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4H9V3Z" fill="#334155" stroke="#64748B" strokeWidth="1" />
            <Path d="M8 9H16M8 12H13" stroke="#4FE3D5" strokeWidth="1.8" strokeLinecap="round" />
            <Path d="M14 12L15.5 13.5L18 10" stroke="#4FE3D5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          {/* Glowing Plus Badge */}
          <View style={[styles.plusBadge, { backgroundColor: T.teal }]}>
            <Ionicons name="add" size={12} color="#0D1525" />
          </View>
        </View>

        {/* Center Text */}
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: T.textPrimary }]}>{title}</Text>
          <Text style={[styles.desc, { color: T.textSub }]}>{description}</Text>
        </View>

        {/* Right Button */}
        {onPress ? (
          <Pressable onPress={onPress}>{button}</Pressable>
        ) : (
          <Link href="/new" asChild>
            <Pressable>{button}</Pressable>
          </Link>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  illustrationWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowBg: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    paddingRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  desc: {
    fontSize: 11,
    lineHeight: 15,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
