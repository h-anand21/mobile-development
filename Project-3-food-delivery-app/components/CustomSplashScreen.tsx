import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const BG = '#050505';

export function CustomSplashScreen() {
  // Logo is immediately visible (matches native splash — no flash)
  const infoOpacity  = useSharedValue(0);
  const infoY        = useSharedValue(20);
  const badgeScale   = useSharedValue(0.75);

  useEffect(() => {
    // Delay extra content so logo is already visible when they appear
    infoOpacity.value  = withDelay(300, withTiming(1, { duration: 600 }));
    infoY.value        = withDelay(300, withSpring(0, { damping: 18 }));
    badgeScale.value   = withDelay(550, withSpring(1, { damping: 12 }));
  }, []);

  const infoAnim   = useAnimatedStyle(() => ({ opacity: infoOpacity.value, transform: [{ translateY: infoY.value }] }));
  const badgeAnim  = useAnimatedStyle(() => ({ transform: [{ scale: badgeScale.value }] }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Logo — NO animation, instantly visible to match native splash */}
      <View style={styles.logoSection}>
        <Image
          source={require('../assets/images/img2.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Tagline + badges */}
      <Animated.View style={[styles.infoSection, infoAnim]}>
        <Text style={styles.tagline}>
          Good Food.{'  '}
          <Text style={styles.taglineOrange}>Fast Delivery.</Text>
        </Text>

        <Animated.View style={[styles.locationBadge, badgeAnim]}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>Patuli, Kolkata</Text>
        </Animated.View>

        <View style={styles.deliveryTag}>
          <View style={styles.scooterRing}>
            <Text style={styles.scooterEmoji}>🛵</Text>
          </View>
          <View>
            <Text style={styles.fastDelivery}>Fast Delivery</Text>
            <Text style={styles.greatDeals}>Great Deals</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const BURGER_H   = height * 0.52;   // container height (what's visible)
const BURGER_IMG = height * 0.68;   // image height (taller → top gets cropped)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',   // ← centers everything vertically
    overflow: 'hidden',
  },

  /* ── Logo ───────────────────────────────────────────── */
  logoSection: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoImage: {
    width: width * 0.68,
    height: height * 0.24,
  },

  /* ── Info ───────────────────────────────────────────── */
  infoSection: {
    alignItems: 'center',
    zIndex: 10,
    marginTop: -height * 0.01,
  },
  tagline: {
    color: '#cccccc',
    fontSize: 16,
    marginBottom: 20,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  taglineOrange: {
    color: '#ff6b00',
    fontWeight: '700',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff6b00',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 11,
    marginBottom: 22,
    gap: 7,
  },
  locationPin: { fontSize: 16 },
  locationText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  deliveryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scooterRing: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2, borderColor: '#ff6b00',
    justifyContent: 'center', alignItems: 'center',
  },
  scooterEmoji: { fontSize: 20 },
  fastDelivery: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  greatDeals:   { color: '#888888', fontSize: 12, marginTop: 2 },
});
