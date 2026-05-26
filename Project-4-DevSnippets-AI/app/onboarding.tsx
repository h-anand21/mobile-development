// ============================================================
// DevNest — Onboarding Screen
// ============================================================
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';

const { width, height } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  badge?: string;
  headline: string;
  headlineGreen: string;
  headlineRest?: string;
  description: string;
  emoji: string;
  highlights?: string[];
}

const PAGES: OnboardingPage[] = [
  {
    id: '1',
    headline: 'Your Offline ',
    headlineGreen: 'AI-Powered',
    headlineRest: ' Developer Workspace.',
    description: 'Save, organize, and understand your code snippets — all offline, all private.',
    emoji: '💻',
    highlights: ['</> Built for Developers', '📵 Works Offline', '⚡ Blazing Fast', '🛡️ Your Data. Your Control'],
  },
  {
    id: '2',
    badge: '2',
    headline: '',
    headlineGreen: 'Organize',
    headlineRest: ' Your Code Beautifully',
    description: 'Save, organize, tag and find your code snippets instantly. Works completely offline.',
    emoji: '📁',
  },
  {
    id: '3',
    badge: '3',
    headline: '',
    headlineGreen: 'Attach & ',
    headlineRest: 'Manage Everything',
    description: 'Add screenshots, files and templates. Keep everything in one secure place on your device.',
    emoji: '📎',
  },
  {
    id: '4',
    badge: '4',
    headline: '',
    headlineGreen: 'AI',
    headlineRest: ' That Understands Developers',
    description: 'Get explanations, summaries, improvements and more using powerful Gemini AI.',
    emoji: '🤖',
  },
  {
    id: '5',
    badge: '5',
    headline: 'Private. Secure. Always ',
    headlineGreen: 'Offline.',
    description: 'Your code never leaves your device. No tracking, no cloud sync, 100% private.',
    emoji: '🛡️',
    highlights: ['📵 No Tracking', '☁️🚫 No Cloud Sync', '🔒 100% Private'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingDone } = useSettingsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = currentIndex === PAGES.length - 1;

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      await setOnboardingDone();
      router.replace('/profile-setup');
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = async () => {
    await setOnboardingDone();
    router.replace('/profile-setup');
  };

  const renderPage = ({ item }: { item: OnboardingPage }) => (
    <View style={styles.page}>
      {/* Badge */}
      {item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}

      {/* Emoji Illustration */}
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.emojiGlow} />
      </View>

      {/* Headline */}
      <Text style={styles.headline}>
        {item.headline}
        <Text style={styles.headlineGreen}>{item.headlineGreen}</Text>
        {item.headlineRest ?? ''}
      </Text>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Highlights grid */}
      {item.highlights && (
        <View style={styles.highlightsRow}>
          {item.highlights.map((h, i) => (
            <View key={i} style={styles.highlightChip}>
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>
          Dev<Text style={styles.logoGreen}>Nest</Text>
        </Text>
        <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skip}>Skip &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Pages */}
      <Animated.FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom */}
      <View style={styles.bottom}>
        {/* Page dots */}
        <View style={styles.dots}>
          {PAGES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [6, 20, 6], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
          <ChevronRight size={20} color="#000" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Skip for now */}
        {!isLast && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipNow}>
            <Text style={styles.skipNowText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4,
  },
  logo: { fontSize: 22, fontWeight: '800', color: Colors.text.primary },
  logoGreen: { color: Colors.accent.primary },
  skip: { fontSize: 14, color: Colors.text.secondary, fontWeight: '500' },

  page: {
    width, paddingHorizontal: 28, paddingTop: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    width: 40, height: 40, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.border.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  badgeText: { color: Colors.text.primary, fontWeight: '700', fontSize: 16 },

  emojiWrap: { alignItems: 'center', marginBottom: 28, position: 'relative' },
  emoji: { fontSize: 90 },
  emojiGlow: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.accent.glow, top: -10,
  },

  headline: {
    fontSize: 26, fontWeight: '800', color: Colors.text.primary,
    textAlign: 'center', lineHeight: 36, marginBottom: 16,
  },
  headlineGreen: { color: Colors.accent.primary },
  description: {
    fontSize: 15, color: Colors.text.secondary, textAlign: 'center',
    lineHeight: 24, marginBottom: 24, paddingHorizontal: 8,
  },
  highlightsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  highlightChip: {
    backgroundColor: Colors.bg.secondary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border.primary,
  },
  highlightText: { color: Colors.text.primary, fontSize: 12, fontWeight: '500' },

  bottom: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 16 : 24, alignItems: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  dot: { height: 6, borderRadius: 3, backgroundColor: Colors.accent.primary },

  nextBtn: {
    width: '100%', backgroundColor: Colors.accent.primary,
    borderRadius: 14, height: 54, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  skipNow: { marginTop: 14 },
  skipNowText: { color: Colors.text.secondary, fontSize: 14 },
});
