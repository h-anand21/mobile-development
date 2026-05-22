import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Dimensions, FlatList, ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const GREEN = '#1ed760';
const DARK  = '#050505';

const SLIDES = [
  {
    id: '1',
    image: require('../../assets/image-of-front/1.png'),
    headline: 'Delicious Food\nAt Your ',
    highlight: 'Fingertips',
    sub: 'Order your favorite food from\ntop restaurants in your city',
    textPos: 'bottom',   // text at bottom, logo at top
  },
  {
    id: '2',
    image: require('../../assets/image-of-front/2.png'),
    headline: 'Your Favorite\nFood, ',
    highlight: 'Delivered',
    sub: 'Choose from top restaurants\nand get it delivered fast.',
    textPos: 'top',
    footerNote: 'Fast delivery at your doorstep',
    features: [
      { icon: 'location-sharp',   color: '#FF6B35', label: 'Live Tracking',  desc: 'Track your order in real time' },
      { icon: 'time-outline',     color: GREEN,     label: 'Fast Delivery',  desc: 'Quick food at your doorstep' },
      { icon: 'pricetag-outline', color: GREEN,     label: 'Best Offers',    desc: 'Enjoy exclusive deals & discounts' },
    ],
  },
  {
    id: '3',
    image: require('../../assets/image-of-front/3.png'),
    headline: 'Fresh Ingredients,\n',
    highlight: 'Great Quality',
    sub: 'We use only the freshest ingredients\nto make your day better.',
    textPos: 'top',
    featureBoxes: [
      { icon: 'leaf-outline',   label: 'Fresh\nIngredients' },
      { icon: 'ribbon-outline', label: 'Top\nQuality' },
      { icon: 'time-outline',   label: 'Super Fast\nDelivery' },
    ],
  },
  {
    id: '4',
    image: require('../../assets/image-of-front/4.png'),
    headline: 'Hot Food,\n',
    highlight: 'Happy Mood',
    sub: "Delicious food is just a tap away.\nLet's get started!",
    textPos: 'top',
    isLast: true,
  },
];

export default function OnboardingScreen() {
  const router     = useRouter();
  const insets     = useSafeAreaInsets();
  const setOnboard = useAuthStore((s) => s.setOnboarded);
  const [idx, setIdx] = useState(0);
  const listRef    = useRef<FlatList>(null);

  const goTo   = (i: number) => listRef.current?.scrollToIndex({ index: i, animated: true });
  const goNext = () => {
    if (idx < SLIDES.length - 1) goTo(idx + 1);
    else { setOnboard(); router.replace('/(auth)/login'); }
  };
  const goBack = () => { if (idx > 0) goTo(idx - 1); };
  const skip   = () => { setOnboard(); router.replace('/(auth)/login'); };
  const onEnd  = (e: any) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width));

  const Dots = () => (
    <View style={s.dots}>
      {SLIDES.map((_, i) => (
        <TouchableOpacity key={i} onPress={() => goTo(i)}
          style={[s.dot, i === idx && s.dotActive]} />
      ))}
    </View>
  );

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => {
    const isBottom = item.textPos === 'bottom';

    return (
      <View style={s.slide}>
        <ImageBackground source={item.image} style={s.bg} resizeMode="cover">

          {/* ── Overlay layers ─────────────────────────────── */}
          {/* Full screen dark tint */}
          <View style={s.overlay} />
          {/* Top dark band for logo/text readability */}
          <View style={s.topBand} />
          {/* Bottom dark band for buttons readability */}
          <View style={s.bottomBand} />

          {/* ══════════════════════════════════════════════════
              SLIDE 1 — Logo at top, text+button at bottom
          ══════════════════════════════════════════════════ */}
          {isBottom && (
            <>
              {/* Logo + location */}
              <View style={[s.logoArea, { paddingTop: insets.top + 10 }]}>
                <Image
                  source={require('../../assets/images/img2.png')}
                  style={s.logo} resizeMode="contain"
                />
                <View style={s.locationRow}>
                  <Ionicons name="location-sharp" size={14} color={GREEN} />
                  <Text style={s.locationTxt}>Patuli, Kolkata</Text>
                </View>
              </View>

              {/* Text + button at bottom */}
              <View style={[s.bottomContent, { paddingBottom: insets.bottom + 20 }]}>
                <Text style={s.headline}>
                  {item.headline}<Text style={s.hl}>{item.highlight}</Text>
                </Text>
                <View style={s.accent} />
                <Text style={s.sub}>{item.sub}</Text>
                <TouchableOpacity style={s.getStartedBtn} onPress={goNext}>
                  <View style={s.arrowCircle}>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                  <Text style={s.pillTxt}>Get Started</Text>
                </TouchableOpacity>
                <Dots />
              </View>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              SLIDES 2-4 — Text at top, buttons at bottom
          ══════════════════════════════════════════════════ */}
          {!isBottom && (
            <>
              {/* Top text block */}
              <View style={[s.topContent, { paddingTop: insets.top + 20 }]}>
                <Text style={s.headline}>
                  {item.headline}<Text style={s.hl}>{item.highlight}</Text>
                </Text>
                <Text style={s.sub}>{item.sub}</Text>

                {/* Features list — slide 2 */}
                {item.features && (
                  <View style={s.featList}>
                    {item.features.map((f: any, i: number) => (
                      <View key={i} style={s.featRow}>
                        <View style={[s.featIcon, { backgroundColor: `${f.color}33` }]}>
                          <Ionicons name={f.icon as any} size={17} color={f.color} />
                        </View>
                        <View>
                          <Text style={s.featLabel}>{f.label}</Text>
                          <Text style={s.featDesc}>{f.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Bottom block */}
              <View style={[s.bottomNav, { paddingBottom: insets.bottom + 14 }]}>

                {/* Footer note — slide 2 */}
                {item.footerNote && (
                  <Text style={s.footerNote}>{item.footerNote}</Text>
                )}

                {/* Feature boxes — slide 3 */}
                {item.featureBoxes && (
                  <View style={s.featBoxRow}>
                    {item.featureBoxes.map((f: any, i: number) => (
                      <View key={i} style={s.featBox}>
                        <Ionicons name={f.icon as any} size={24} color={GREEN} />
                        <Text style={s.featBoxTxt}>{f.label}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Nav buttons */}
                {item.isLast ? (
                  /* Slide 4: "Let's Go!" full width — text left, arrow right */
                  <TouchableOpacity style={s.letsGoBtn} onPress={goNext}>
                    <Text style={s.letsGoTxt}>Let's Go!</Text>
                    <View style={s.arrowCircleDark}>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  /* Slides 2-3: back | dots | next */
                  <View style={s.navRow}>
                    <TouchableOpacity
                      style={[s.navCircle, idx === 0 && { opacity: 0.3 }]}
                      onPress={goBack} disabled={idx === 0}
                    >
                      <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Dots />
                    <TouchableOpacity style={[s.navCircle, { backgroundColor: GREEN }]} onPress={goNext}>
                      <Ionicons name="arrow-forward" size={22} color="#000" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}

        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal pagingEnabled bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onEnd}
      />
      {idx < SLIDES.length - 1 && (
        <TouchableOpacity style={[s.skipBtn, { top: insets.top + 14 }]} onPress={skip}>
          <Text style={s.skipTxt}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: DARK },
  slide:   { width, height },
  bg:      { flex: 1 },

  // Overlay layers
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  topBand:    { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.45, backgroundColor: 'rgba(0,0,0,0.50)', zIndex: 1 },
  bottomBand: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.25, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1 },

  // ── Slide 1 (bottom layout) ──────────────────────────────────────────────
  logoArea:    { alignItems: 'center', zIndex: 5 },
  logo:        { width: width * 0.72, height: 120 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -10 },
  locationTxt: { color: '#eee', fontSize: 15, fontWeight: '600' },

  bottomContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 22, paddingTop: 28, zIndex: 5,
  },

  // ── Slides 2-4 (top layout) ──────────────────────────────────────────────
  topContent: {
    paddingHorizontal: 22, zIndex: 5,
  },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 22, zIndex: 5,
  },

  // ── Shared text ──────────────────────────────────────────────────────────
  headline: { fontSize: 40, fontWeight: '900', color: '#fff', lineHeight: 48, marginBottom: 10 },
  hl:       { color: GREEN },
  accent:   { width: 44, height: 3, backgroundColor: GREEN, borderRadius: 2, marginBottom: 12 },
  sub:      { color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 21, marginBottom: 20 },

  // ── Get Started pill (slide 1) ───────────────────────────────────────────
  getStartedBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a6e35', borderRadius: 50,
    paddingVertical: 6, paddingRight: 28, paddingLeft: 6,
    alignSelf: 'stretch', marginBottom: 22,
  },
  arrowCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  pillTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },

  // ── Features list (slide 2) ──────────────────────────────────────────────
  featList:  { gap: 10 },
  featRow:   { flexDirection: 'row', alignItems: 'center', gap: 13 },
  featIcon:  { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  featLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  featDesc:  { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 },

  footerNote: { color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', marginBottom: 12 },

  // ── Feature boxes (slide 3) ──────────────────────────────────────────────
  featBoxRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  featBox:    { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, alignItems: 'center', paddingVertical: 12, marginHorizontal: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  featBoxTxt: { color: '#ccc', fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 7, lineHeight: 16 },

  // ── Let's Go! (slide 4) ──────────────────────────────────────────────────
  letsGoBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: GREEN, borderRadius: 50,
    paddingVertical: 6, paddingLeft: 28, paddingRight: 6,
  },
  letsGoTxt:     { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  arrowCircleDark: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Nav (slides 2-3) ─────────────────────────────────────────────────────
  navRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },

  // ── Dots ─────────────────────────────────────────────────────────────────
  dots:     { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.30)' },
  dotActive:{ width: 22, backgroundColor: GREEN },

  // ── Skip ─────────────────────────────────────────────────────────────────
  skipBtn: { position: 'absolute', right: 22, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.13)', zIndex: 100 },
  skipTxt:  { color: '#fff', fontSize: 14, fontWeight: '600' },
});
