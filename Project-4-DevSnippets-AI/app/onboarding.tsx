import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform, FlatList, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, ArrowRight, ArrowLeft, Layers } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';

const { width, height } = Dimensions.get('window');

const PAGES = [
  {
    id: '1',
    headlinePart1: 'Welcome to\n',
    headlineGreen: 'DevNest ',
    headlinePart2: '👋',
    subtitle: 'Organize your code smarter.\nSave snippets, folders and projects\nin one beautiful workspace.',
    image: require('../assets/on-bording screen/screen-1.png'),
    imageScale: 1.0,
  },
  {
    id: '2',
    headlinePart1: 'Smart ',
    headlineGreen: 'AI\n',
    headlinePart2: 'Assistant ✨',
    subtitle: 'AI that explains, fixes and\ngenerates code.\nWorks instantly inside DevNest.',
    image: require('../assets/on-bording screen/screen-2.png'),
  },
  {
    id: '3',
    headlinePart1: 'Powerful\n',
    headlineGreen: 'File Organization',
    headlinePart2: '',
    subtitle: 'Create folders for every project.\nKeep your snippets organized\nand easy to find.',
    image: require('../assets/on-bording screen/screen3.png'),
  },
  {
    id: '4',
    headlinePart1: 'Search\n',
    headlineGreen: 'Everything',
    headlinePart2: '',
    subtitle: 'Find any snippet, project or\nfolder in seconds.\nSearch by language, tags\nor folder.',
    image: require('../assets/on-bording screen/screen4.png'),
    imageScale: 1.35,
  },
  {
    id: '5',
    headlinePart1: 'Offline\n',
    headlineGreen: 'Developer\n',
    headlinePart2: 'Workspace',
    subtitle: 'Your code stays with you.\nFast, private and offline-first.',
    image: require('../assets/on-bording screen/screen-5.png'),
  },
  {
    id: '6',
    headlinePart1: 'Everything a\n',
    headlineGreen: 'Developer ',
    headlinePart2: 'Needs',
    subtitle: 'Save • Organize • Create\nAll in one beautiful workspace.',
    image: require('../assets/on-bording screen/screen6.png'),
    extraTextTop: '🚀 Built for developers. Loved by coders.',
    extraTextBottom: "Let's build something amazing together! 🚀",
    imageScale: 1.35,
  }
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

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  const handleSkip = async () => {
    await setOnboardingDone();
    router.replace('/profile-setup');
  };

  const renderPage = ({ item }: { item: typeof PAGES[0] }) => (
    <View style={styles.page}>
      {/* Hero Text */}
      <View style={styles.textContent}>
        <Text style={styles.headline}>
          {item.headlinePart1}
          <Text style={styles.headlineGreen}>{item.headlineGreen}</Text>
          {item.headlinePart2}
        </Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>

      {/* Image / Hero Graphic */}
      <View style={styles.imageContainer}>
        <Image 
          source={item.image}
          style={[styles.heroImage, { transform: [{ scale: item.imageScale || 1.2 }, { translateY: -25 }] }]}
          resizeMode="contain"
        />
      </View>

      {item.extraTextTop && (
        <Text style={styles.extraTextTop}>{item.extraTextTop}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Layers size={24} color={Colors.accent.primary} strokeWidth={2.5} />
          <Text style={styles.logoText}>Dev<Text style={styles.logoGreen}>Nest</Text></Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
          <ChevronRight size={16} color={Colors.accent.primary} />
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

      {/* Pagination Dots */}
      <View style={styles.dots}>
        {PAGES.map((_, i) => {
          const isActive = i === currentIndex;
          return (
            <View key={i} style={[styles.dot, isActive && styles.dotActive]} />
          );
        })}
      </View>

      {/* Action Buttons */}
      <View style={styles.bottom}>
        {currentIndex === 0 ? (
          <TouchableOpacity style={styles.startBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.startText}>Next</Text>
            <ArrowRight size={22} color="#000" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : isLast ? (
          <View style={styles.bottomButtonsColumn}>
            <TouchableOpacity style={styles.startBtn} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.startText}>Get Started</Text>
              <ArrowRight size={22} color="#000" strokeWidth={2.5} />
            </TouchableOpacity>
            {PAGES[currentIndex].extraTextBottom && (
              <Text style={styles.extraTextBottom}>{PAGES[currentIndex].extraTextBottom}</Text>
            )}
          </View>
        ) : (
          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.85}>
              <ArrowLeft size={20} color="#CCC" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.nextBtnHalf} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.startText}>{isLast ? 'Get Started' : 'Next'}</Text>
              <ArrowRight size={22} color="#000" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  logoGreen: {
    color: Colors.accent.primary,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    gap: 4,
  },
  skipText: {
    color: '#CCC',
    fontSize: 14,
    fontWeight: '500',
  },
  page: {
    width,
    flex: 1,
  },
  textContent: {
    paddingHorizontal: 24,
    marginTop: height * 0.04, // Responsive margin
  },
  headline: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
    lineHeight: 48,
  },
  headlineGreen: {
    color: Colors.accent.primary,
  },
  subtitle: {
    color: '#999',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 16,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    maxHeight: height * 0.55, // Ensure it fits on smaller screens
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotActive: {
    backgroundColor: Colors.accent.primary,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 16 : 32,
  },
  startBtn: {
    backgroundColor: Colors.accent.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 30,
    gap: 8,
    width: '100%',
  },
  startText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  bottomButtonsColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  backBtn: {
    flex: 0.35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CCC',
  },
  nextBtnHalf: {
    flex: 0.65,
    backgroundColor: Colors.accent.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 30,
    gap: 8,
  },
  extraTextTop: {
    color: '#CCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  extraTextBottom: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
});
