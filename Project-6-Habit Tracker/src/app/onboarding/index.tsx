import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { requestNotificationPermissions } from '../../lib/notifications/setup';

const { width: SW } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { T } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Reanimated shared values for Slide 3 flame breathing animation
  const flameScale = useSharedValue(1);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1, // Infinite loop
      true
    );
  }, []);

  const flameAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: flameScale.value }],
    };
  });

  // Handle hardware back press to go to previous slide
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (activeIndex > 0) {
          handlePrev();
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [activeIndex])
  );

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SW);
    if (pageIndex !== activeIndex) {
      setActiveIndex(pageIndex);
    }
  };

  const handleNext = () => {
    if (activeIndex < 4) { // 5 slides (index 0, 1, 2, 3, 4)
      scrollViewRef.current?.scrollTo({ x: (activeIndex + 1) * SW, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollViewRef.current?.scrollTo({ x: (activeIndex - 1) * SW, animated: true });
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleFinish = async () => {
    try {
      // 1. Request notifications permissions
      await requestNotificationPermissions();
      // 2. Persist completion flag
      await AsyncStorage.setItem('ONBOARDING_COMPLETED', 'true');
      // 3. Go to Home Dashboard
      router.replace('/');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Header Logo */}
      <View style={styles.header}>
        <Text style={[styles.appName, { color: T.teal }]}>HabitFlow</Text>
      </View>

      {/* Pages Scroll View */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {/* ================= SLIDE 1: Welcome ================= */}
        <View style={styles.page}>
          <View style={styles.content}>
            <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.illustrationContainer}>
              <View style={[styles.illustrationCircle, { backgroundColor: T.tealDim, borderColor: T.tealBorder }]}>
                <Ionicons name="leaf-outline" size={72} color={T.teal} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.textContainer}>
              <Text style={[styles.title, { color: T.textPrimary }]}>🌱 Build Better{"\n"}Habits</Text>
              <Text style={[styles.subtitle, { color: T.textSub }]}>
                Small actions every single day create massive results over time.
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* ================= SLIDE 2: Reminders ================= */}
        <View style={styles.page}>
          <View style={styles.content}>
            <View style={styles.illustrationContainer}>
              {/* Notification Card 1 */}
              <Animated.View
                entering={FadeInUp.duration(500).delay(100)}
                style={[styles.floatingCard, styles.floatCard1, { backgroundColor: T.bg, borderColor: T.borderMid }, T.neo]}
              >
                <Text style={styles.floatEmoji}>💧</Text>
                <View style={styles.floatTextContainer}>
                  <Text style={[styles.floatTitle, { color: T.textPrimary }]}>Drink Water</Text>
                  <Text style={[styles.floatSubtitle, { color: T.textSub }]}>Reminder: Log 250ml now.</Text>
                </View>
                <Text style={[styles.floatTime, { color: T.teal }]}>08:00 AM</Text>
              </Animated.View>

              {/* Notification Card 2 */}
              <Animated.View
                entering={FadeInUp.duration(500).delay(300)}
                style={[styles.floatingCard, styles.floatCard2, { backgroundColor: T.bgPress, borderColor: T.tealBorder }, T.neoPressed]}
              >
                <Text style={styles.floatEmoji}>📖</Text>
                <View style={styles.floatTextContainer}>
                  <Text style={[styles.floatTitle, { color: T.textPrimary }]}>Read Book</Text>
                  <Text style={[styles.floatSubtitle, { color: T.textSub }]}>Time to finish chapter 4.</Text>
                </View>
                <Text style={[styles.floatTime, { color: T.teal }]}>09:00 PM</Text>
              </Animated.View>

              {/* Notification Card 3 */}
              <Animated.View
                entering={FadeInUp.duration(500).delay(500)}
                style={[styles.floatingCard, styles.floatCard3, { backgroundColor: T.bg, borderColor: T.borderMid }, T.neo]}
              >
                <Text style={styles.floatEmoji}>💪</Text>
                <View style={styles.floatTextContainer}>
                  <Text style={[styles.floatTitle, { color: T.textPrimary }]}>Workout</Text>
                  <Text style={[styles.floatSubtitle, { color: T.textSub }]}>Don't miss today's stretch!</Text>
                </View>
                <Text style={[styles.floatTime, { color: T.teal }]}>06:00 PM</Text>
              </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.textContainer}>
              <Text style={[styles.title, { color: T.textPrimary }]}>⏰ Never Miss{"\n"}A Habit</Text>
              <Text style={[styles.subtitle, { color: T.textSub }]}>
                Smart reminders help you stay consistent and build routines that stick.
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* ================= SLIDE 3: Streaks ================= */}
        <View style={styles.page}>
          <View style={styles.content}>
            <Animated.View style={[styles.streakCard, flameAnimatedStyle, { borderColor: T.yellowDim, shadowColor: T.yellow }, T.neo]} entering={FadeInUp.duration(600).delay(100)}>
              <View style={[styles.fireCircle, { backgroundColor: T.yellowDim, borderColor: 'rgba(234, 212, 94, 0.2)' }]}>
                <Ionicons name="flame" size={60} color={T.yellow} />
              </View>
              <Text style={[styles.streakNumber, { color: T.textPrimary }]}>32</Text>
              <Text style={[styles.streakLabel, { color: T.textSub }]}>Days Consistent</Text>

              <View style={[styles.miniStatsRow, { borderTopColor: T.border }]}>
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatVal, { color: T.teal }]}>92%</Text>
                  <Text style={[styles.miniStatLabel, { color: T.textSub }]}>Success</Text>
                </View>
                <View style={[styles.verticalDivider, { backgroundColor: T.border }]} />
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatVal, { color: T.teal }]}>🏆 5</Text>
                  <Text style={[styles.miniStatLabel, { color: T.textSub }]}>Badges</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.textContainer}>
              <Text style={[styles.title, { color: T.textPrimary }]}>🔥 Track Your{"\n"}Streaks</Text>
              <Text style={[styles.subtitle, { color: T.textSub }]}>
                Stay motivated with visual streaks, completion history and consistent analytics.
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* ================= SLIDE 4: Smart Watch Sync ================= */}
        <View style={styles.page}>
          <View style={styles.content}>
            <Animated.View style={[styles.streakCard, { borderColor: T.tealBorder, shadowColor: T.teal }, T.neo]} entering={FadeInUp.duration(600).delay(100)}>
              <View style={[styles.fireCircle, { backgroundColor: T.tealDim, borderColor: 'rgba(94, 234, 212, 0.15)' }]}>
                <Ionicons name="watch-outline" size={60} color={T.teal} />
              </View>
              <Text style={[styles.streakNumber, { color: T.textPrimary, fontSize: 32 }]}>Watch Sync</Text>
              <Text style={[styles.streakLabel, { color: T.textSub, fontSize: 12 }]}>Bluetooth Connected 🟢</Text>

              <View style={[styles.miniStatsRow, { borderTopColor: T.border }]}>
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatVal, { color: T.teal }]}>❤️ 72</Text>
                  <Text style={[styles.miniStatLabel, { color: T.textSub }]}>Live BPM</Text>
                </View>
                <View style={[styles.verticalDivider, { backgroundColor: T.border }]} />
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatVal, { color: T.teal }]}>🔋 98%</Text>
                  <Text style={[styles.miniStatLabel, { color: T.textSub }]}>Battery</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.textContainer}>
              <Text style={[styles.title, { color: T.textPrimary }]}>⌚ Watch Connection</Text>
              <Text style={[styles.subtitle, { color: T.textSub }]}>
                Connect your smartwatch to automatically sync steps, workouts, and live heart rate.
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* ================= SLIDE 5: Alerts & Action ================= */}
        <View style={styles.page}>
          <View style={styles.content}>
            <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.illustrationContainer}>
              <View style={[styles.illustrationCircle, { backgroundColor: T.purpleDim, borderColor: 'rgba(196, 94, 234, 0.15)' }]}>
                <Ionicons name="notifications-outline" size={72} color={T.purple} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.textContainer}>
              <Text style={[styles.title, { color: T.textPrimary }]}>🔔 Smart Alerts</Text>
              <Text style={[styles.subtitle, { color: T.textSub }]}>
                Receive timely reminders to protect your streak, build routines, and keep your flow alive.
              </Text>
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {/* Navigation Dot Indicators */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3, 4].map((idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                { backgroundColor: T.isDark ? '#0F1E35' : 'rgba(0,0,0,0.1)' },
                activeIndex === idx ? [styles.activeDot, { backgroundColor: T.teal, borderColor: T.teal }] : null,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: T.bg, borderColor: T.tealBorder },
            T.neo,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: T.teal }]}>
            {activeIndex === 4 ? "Let's Flow →" : 'Continue →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SW - 48, // Padding adjusted for SW screen boundaries
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  illustrationContainer: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    width: '100%',
    position: 'relative',
  },
  illustrationCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  floatingCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    position: 'absolute',
  },
  floatCard1: {
    top: 15,
    transform: [{ rotate: '-2deg' }],
  },
  floatCard2: {
    top: 85,
    transform: [{ scale: 1.03 }, { rotate: '1deg' }],
    zIndex: 2,
  },
  floatCard3: {
    top: 155,
    transform: [{ rotate: '-1deg' }],
  },
  floatEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  floatTextContainer: {
    flex: 1,
  },
  floatTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  floatSubtitle: {
    fontSize: 11,
  },
  floatTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  streakCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    marginBottom: 30,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  fireCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatVal: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  miniStatLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: 30,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  activeDot: {
    width: 24,
  },
  button: {
    borderWidth: 1,
    width: '100%',
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
