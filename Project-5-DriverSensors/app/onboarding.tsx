import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Line, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { storage } from '../src/database/storage';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 750;

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const roadHeight = isSmallDevice ? 250 : 300;
  const containerWidth = width - 50;

  // Animations
  const radarRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseRing1 = useRef(new Animated.Value(0)).current;
  const pulseRing2 = useRef(new Animated.Value(0)).current;
  const carBounce = useRef(new Animated.Value(0)).current;
  const logoFadeIn = useRef(new Animated.Value(0)).current;
  const roadOffset = useRef(new Animated.Value(0)).current;
  const carSway = useRef(new Animated.Value(0)).current;
  const lightOffset = useRef(new Animated.Value(0)).current;

  // Staggered light progress values (derived from lightOffset)
  const lightProgress0 = Animated.divide(lightOffset, 20);

  const lightProgress1 = lightProgress0.interpolate({
    inputRange: [0, 0.6667, 0.6668, 1],
    outputRange: [0.3333, 1, 0, 0.3333],
  });

  const lightProgress2 = lightProgress0.interpolate({
    inputRange: [0, 0.3333, 0.3334, 1],
    outputRange: [0.6667, 1, 0, 0.6667],
  });

  useEffect(() => {
    // 1. Radar Sweep animation
    const radarLoop = Animated.loop(
      Animated.timing(radarRotateAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    radarLoop.start();

    // 2. Pulse rings animation (Screen 3 Map pin pulse)
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseRing1, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseRing1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ]),
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(pulseRing2, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseRing2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ])
    );
    pulseLoop.start();

    // 3. Car suspension idle float (Screen 1 car)
    const carFloat = Animated.loop(
      Animated.sequence([
        Animated.timing(carBounce, {
          toValue: -3,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(carBounce, {
          toValue: 3,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    );
    carFloat.start();

    // 4. Logo initial bounce/fade
    Animated.timing(logoFadeIn, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 5. Road center lane movement (infinite loop of dash offset)
    const roadScroll = Animated.loop(
      Animated.timing(roadOffset, {
        toValue: 20,
        duration: 400, // Faster scroll speed to make car feel fast
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    roadScroll.start();

    // 5b. Street lights slow movement (independent loop)
    const lightScroll = Animated.loop(
      Animated.timing(lightOffset, {
        toValue: 20,
        duration: 3500, // Even slower duration to avoid crowd effect and feel realistic
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    lightScroll.start();

    // 6. Car steering gentle sway left/right
    const carSwayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(carSway, {
          toValue: -6,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(carSway, {
          toValue: 6,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(carSway, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    );
    carSwayLoop.start();

    return () => {
      radarLoop.stop();
      pulseLoop.stop();
      carFloat.stop();
      roadScroll.stop();
      lightScroll.stop();
      carSwayLoop.stop();
    };
  }, []);

  const handleNext = () => {
    if (activeIndex < 2) {
      scrollViewRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollViewRef.current?.scrollTo({ x: (activeIndex - 1) * width, animated: true });
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleFinish = () => {
    storage.set('has_completed_onboarding', 'true');
    router.replace('/profile-creation');
  };

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / width);
    setActiveIndex(pageIndex);
  };

  const radarRotation = radarRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale1 = pulseRing1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const pulseOpacity1 = pulseRing1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  const pulseScale2 = pulseRing2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const pulseOpacity2 = pulseRing2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  const page2PulseScale1 = pulseRing1.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 115],
  });

  const page2PulseOpacity1 = pulseRing1.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0.7, 0.3, 0],
  });

  const page2PulseScale2 = pulseRing2.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 115],
  });

  const page2PulseOpacity2 = pulseRing2.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0.7, 0.3, 0],
  });

  return (
    <LinearGradient colors={['#040814', '#02040a']} style={styles.container}>
      {/* Top Header Logo (Only on Screen 2 and 3) */}
      {activeIndex > 0 && (
        <Animated.View style={[styles.header, { opacity: logoFadeIn }]}>
          <Image 
            source={require('../assets/icon/black -icon.png')} 
            style={styles.logoIcon} 
          />
          <Text style={styles.logoText}>
            Safe<Text style={styles.logoTextHighlight}>Drive</Text>
          </Text>

          {activeIndex < 2 && (
            <TouchableOpacity style={styles.skipBtn} onPress={handleFinish}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {/* ================= PAGE 1 ================= */}
        <View style={styles.page}>
          {/* Spacer to replace header height */}
          <View style={{ height: isSmallDevice ? 30 : 50 }} />

          {/* Speedometer Gauge/Shield Illustration using high-fidelity logo image with tech backing rings */}
          <View style={styles.page1LogoContainer}>
            <View style={styles.logoOuterWrapper}>
              <View style={styles.logoBackdropCircles}>
                <Svg width={170} height={170} viewBox="0 0 170 170">
                  <Circle cx="85" cy="85" r="80" stroke="rgba(0, 245, 255, 0.12)" strokeWidth="1" strokeDasharray="3 6" />
                  <Circle cx="85" cy="85" r="70" stroke="rgba(34, 197, 94, 0.18)" strokeWidth="1.5" strokeDasharray="40 10 10 10" />
                  <Circle cx="85" cy="85" r="58" stroke="rgba(0, 245, 255, 0.22)" strokeWidth="1" />
                  <Circle cx="85" cy="85" r="46" stroke="rgba(34, 197, 94, 0.08)" strokeWidth="2" strokeDasharray="5 5" />
                  <Circle cx="85" cy="5" r="2" fill="#00f5ff" />
                  <Circle cx="5" cy="85" r="2" fill="#22c55e" />
                  <Circle cx="165" cy="85" r="2" fill="#22c55e" />
                  <Circle cx="85" cy="165" r="2" fill="#00f5ff" />
                </Svg>
              </View>
              <Image 
                source={require('../assets/icon/black -icon.png')} 
                style={styles.page1CenterLogo} 
              />
            </View>
            
            <Text style={styles.page1BrandText}>
              Safe<Text style={styles.page1BrandTextHighlight}>Drive</Text>
            </Text>
            
            {/* Fading gradient line underneath with glowing center dot */}
            <View style={styles.brandLineContainer}>
              <LinearGradient
                colors={['transparent', '#00f5ff', '#22c55e', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.brandLine}
              />
              <View style={styles.brandLineDot} />
            </View>
          </View>

          {/* Heading Text */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Drive Safe.{"\n"}
              <Text style={styles.titleHighlight}>Live Safe.</Text>
            </Text>
            <Text style={styles.subtitle}>
              SyncDrive monitors your driving behavior and helps you build safer driving habits.
            </Text>
          </View>

          {/* Road scenery & Car floating animation */}
          <View style={styles.page1RoadContainer}>
            <Svg width={width} height={roadHeight} viewBox={`0 0 ${width} ${roadHeight}`} style={styles.perspectiveRoadSvg}>
              <Defs>
                <SvgLinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#040814" stopOpacity="0.9" />
                  <Stop offset="60%" stopColor="#0a122c" stopOpacity="0.9" />
                  <Stop offset="100%" stopColor="#02040a" stopOpacity="0.9" />
                </SvgLinearGradient>
                <SvgLinearGradient id="roadAsphalt" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#050a18" stopOpacity="0.8" />
                  <Stop offset="55%" stopColor="#0a1329" stopOpacity="1" />
                  <Stop offset="72%" stopColor="#02040a" stopOpacity="1" />
                  <Stop offset="82%" stopColor="#02040a" stopOpacity="0" />
                  <Stop offset="100%" stopColor="#02040a" stopOpacity="0" />
                </SvgLinearGradient>
                <SvgLinearGradient id="leftBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#84cc16" stopOpacity="0.1" />
                  <Stop offset="50%" stopColor="#84cc16" stopOpacity="0.6" />
                  <Stop offset="100%" stopColor="#84cc16" stopOpacity="1" />
                </SvgLinearGradient>
                <SvgLinearGradient id="rightBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#00f5ff" stopOpacity="0.1" />
                  <Stop offset="50%" stopColor="#00f5ff" stopOpacity="0.6" />
                  <Stop offset="100%" stopColor="#00f5ff" stopOpacity="1" />
                </SvgLinearGradient>
                <SvgLinearGradient id="centerLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
                  <Stop offset="60%" stopColor="#ffffff" stopOpacity="0.65" />
                  <Stop offset="75%" stopColor="#ffffff" stopOpacity="0" />
                  <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              
              {/* Sky Background */}
              <Rect x="0" y="0" width={width} height={roadHeight} fill="url(#skyGrad)" />
              
              {/* City Skyline Silhouette */}
              {/* Left buildings */}
              <Path d="M 0 90 L 10 90 L 10 60 L 25 60 L 25 70 L 35 70 L 35 50 L 50 50 L 50 80 L 65 80 L 65 65 L 75 65 L 75 85 L 85 85 L 85 70 L 95 70 L 95 90 Z" fill="#060d21" opacity="0.9" />
              <Path d="M 30 90 L 45 90 L 45 70 L 58 70 L 58 60 L 70 60 L 70 75 L 85 75 L 85 90 Z" fill="#030611" opacity="0.95" />
              
              {/* Right buildings */}
              <Path d={`M ${width} 90 L ${width - 15} 90 L ${width - 15} 60 L ${width - 30} 60 L ${width - 30} 70 L ${width - 45} 70 L ${width - 45} 45 L ${width - 60} 45 L ${width - 60} 75 L ${width - 75} 75 L ${width - 75} 60 L ${width - 90} 60 L ${width - 90} 80 L ${width - 110} 80 L ${width - 110} 65 L ${width - 125} 65 L ${width - 125} 90 Z`} fill="#060d21" opacity="0.9" />
              <Path d={`M ${width - 25} 90 L ${width - 40} 90 L ${width - 40} 65 L ${width - 55} 65 L ${width - 55} 55 L ${width - 70} 55 L ${width - 70} 80 L ${width - 85} 80 L ${width - 85} 90 Z`} fill="#030611" opacity="0.95" />
              
              {/* Windows in left buildings */}
              <Circle cx="18" cy="68" r="1" fill="#eab308" opacity="0.8" />
              <Circle cx="18" cy="76" r="1" fill="#eab308" opacity="0.8" />
              <Circle cx="42" cy="62" r="1" fill="#22c55e" opacity="0.8" />
              <Circle cx="42" cy="72" r="1" fill="#00f5ff" opacity="0.8" />
              <Circle cx="42" cy="80" r="1" fill="#ffffff" opacity="0.8" />
              <Circle cx="70" cy="70" r="1" fill="#eab308" opacity="0.8" />
              <Circle cx="70" cy="78" r="1" fill="#00f5ff" opacity="0.8" />
              <Circle cx="90" cy="74" r="1" fill="#22c55e" opacity="0.8" />
              <Circle cx="90" cy="82" r="1" fill="#ffffff" opacity="0.8" />

              {/* Windows in right buildings */}
              <Circle cx={width - 22} cy="65" r="1" fill="#eab308" opacity="0.8" />
              <Circle cx={width - 22} cy="75" r="1" fill="#ffffff" opacity="0.8" />
              <Circle cx={width - 52} cy="55" r="1" fill="#00f5ff" opacity="0.8" />
              <Circle cx={width - 52} cy="65" r="1" fill="#22c55e" opacity="0.8" />
              <Circle cx={width - 52} cy="75" r="1" fill="#eab308" opacity="0.8" />
              <Circle cx={width - 80} cy="68" r="1" fill="#ffffff" opacity="0.8" />
              <Circle cx={width - 80} cy="78" r="1" fill="#00f5ff" opacity="0.8" />
              <Circle cx={width - 100} cy="70" r="1" fill="#22c55e" opacity="0.8" />
              <Circle cx={width - 100} cy="80" r="1" fill="#ffffff" opacity="0.8" />

              {/* Horizon glowing light line */}
              <Line x1="0" y1="90" x2={width} y2="90" stroke="rgba(0, 245, 255, 0.15)" strokeWidth="1" />
              <Line x1={width / 2 - 40} y1="90" x2={width / 2 + 40} y2="90" stroke="#00f5ff" strokeWidth="1.5" opacity="0.7" />

              {/* Road Asphalt Shape (goes all the way to bottom of road container) */}
              <Path 
                d={`M ${width / 2 - 20} 90 L ${width / 2 + 20} 90 L ${width + 120} ${roadHeight} L -120 ${roadHeight} Z`}
                fill="url(#roadAsphalt)"
              />
              
              {/* Left & Right neon borders (Perspective lines matching mockup colors) */}
              <Line x1={width / 2 - 20} y1="90" x2="-120" y2={roadHeight} stroke="url(#leftBorderGrad)" strokeWidth="3" />
              <Line x1={width / 2 + 20} y1="90" x2={width + 120} y2={roadHeight} stroke="url(#rightBorderGrad)" strokeWidth="3" strokeLinecap="round" />

              {/* Road center dashed lines - ANIMATED for forward movement */}
              <AnimatedLine 
                x1={width / 2} 
                y1="90" 
                x2={width / 2} 
                y2={roadHeight} 
                stroke="url(#centerLineGrad)" 
                strokeWidth="2" 
                strokeDasharray="8 12" 
                strokeDashoffset={roadOffset}
              />

              {/* Extra perspective light lines/glow elements on the side lanes (mockup side trails) */}
              <Line x1={width / 2 - 30} y1="105" x2="-80" y2={roadHeight} stroke="rgba(132, 204, 22, 0.2)" strokeWidth="1" />
              <Line x1={width / 2 + 30} y1="105" x2={width + 80} y2={roadHeight} stroke="rgba(0, 245, 255, 0.2)" strokeWidth="1" />

              {/* Horizontal helper perspective marks */}
              <Line x1={width / 2 - 35} y1="105" x2={width / 2 + 35} y2="105" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              <Line x1={width / 2 - 55} y1="120" x2={width / 2 + 55} y2="120" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              <Line x1={width / 2 - 80} y1="140" x2={width / 2 + 80} y2="140" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
              <Line x1={width / 2 - 110} y1="170" x2={width / 2 + 110} y2="170" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              <Line x1={width / 2 - 150} y1="200" x2={width / 2 + 150} y2="200" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </Svg>

            {/* Animated Street Lights / Scenery - Left Side (3 staggered objects) */}
            {[lightProgress0, lightProgress1, lightProgress2].map((prog, idx) => {
              // idx 0 is Street Lamp, idx 1 is Billboard, idx 2 is Skyscraper
              const type = idx === 0 ? 'lamp' : idx === 1 ? 'billboard' : 'building';

              // Left base target calculations with dynamic perspective slopes matching border
              const leftSlope = (-120 - (width / 2 - 20)) / (roadHeight - 90);
              const leftLampEndX = (width / 2 - 54.25) + leftSlope * (roadHeight - 136);
              const leftBillboardEndX = (width / 2 - 55) + leftSlope * (roadHeight - 136) - 85.5;
              const leftBuildingEndX = (width / 2 - 55) + leftSlope * (roadHeight - 159) - 85.5;

              const leftX = prog.interpolate({
                inputRange: [0, 1],
                outputRange: type === 'lamp' ? [width / 2 - 54.25, leftLampEndX] : type === 'billboard' ? [width / 2 - 55, leftBillboardEndX] : [width / 2 - 55, leftBuildingEndX]
              });
              const y = prog.interpolate({
                inputRange: [0, 1],
                outputRange: type === 'building' ? [21, roadHeight - 138] : [44, roadHeight - 92]
              });
              const scale = prog.interpolate({
                inputRange: [0, 1],
                outputRange: [0.15, 1.1]
              });
              const opacity = prog.interpolate({
                inputRange: [0, 0.15, 0.85, 1],
                outputRange: [0, 1, 1, 0]
              });

              return (
                <Animated.View
                  key={`left-obj-${idx}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: [
                      { translateX: leftX },
                      { translateY: y },
                      { scale: scale }
                    ],
                    opacity: opacity,
                    zIndex: 4,
                    pointerEvents: 'none',
                  }}
                >
                  {type === 'lamp' && (
                    <Svg width={40} height={80} viewBox="0 0 40 80">
                      <Defs>
                        <SvgLinearGradient id={`beamGradLeft-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#eab308" stopOpacity="0.45" />
                          <Stop offset="100%" stopColor="transparent" />
                        </SvgLinearGradient>
                      </Defs>
                      {/* Light cone beam pointing right/down towards the road */}
                      <Path d="M 30 12 L 10 80 L 50 80 Z" fill={`url(#beamGradLeft-${idx})`} />
                      {/* Pole at x=15 */}
                      <Line x1="15" y1="80" x2="15" y2="15" stroke="#475569" strokeWidth="2.5" />
                      {/* Arm curves right from x=15 to x=30 */}
                      <Path d="M 15 15 C 15 10, 30 10, 30 12" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                      {/* Glowing lamp head at x=30 */}
                      <Circle cx="30" cy="12" r="3" fill="#eab308" />
                    </Svg>
                  )}
                  {type === 'billboard' && (
                    <Svg width={40} height={80} viewBox="0 0 40 80">
                      <Defs>
                        <SvgLinearGradient id={`boardGradLeft-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                          <Stop offset="100%" stopColor="transparent" />
                        </SvgLinearGradient>
                      </Defs>
                      {/* Subtle green glow under the billboard */}
                      <Path d="M 20 20 L 5 80 L 35 80 Z" fill={`url(#boardGradLeft-${idx})`} opacity="0.4" />
                      {/* Pole at center x=20 */}
                      <Line x1="20" y1="80" x2="20" y2="30" stroke="#475569" strokeWidth="2.5" />
                      {/* Billboard board frame */}
                      <Rect x="2" y="6" width="36" height="24" rx="2" fill="#030712" stroke="#22c55e" strokeWidth="1.5" />
                      {/* Glowing cyan checkmark content inside billboard */}
                      <Path d="M 14 18 L 18 22 L 26 13" stroke="#00f5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      {/* Small lights on top of billboard */}
                      <Circle cx="8" cy="3" r="1.5" fill="#eab308" />
                      <Circle cx="20" cy="3" r="1.5" fill="#eab308" />
                      <Circle cx="32" cy="3" r="1.5" fill="#eab308" />
                    </Svg>
                  )}
                  {type === 'building' && (
                    <Svg width={60} height={120} viewBox="0 0 60 120">
                      {/* Building body */}
                      <Rect x="10" y="20" width="40" height="100" fill="#060d21" opacity="0.95" stroke="rgba(0, 245, 255, 0.15)" strokeWidth="1" />
                      {/* Glowing windows */}
                      <Circle cx="20" cy="40" r="1.5" fill="#eab308" opacity="0.8" />
                      <Circle cx="30" cy="40" r="1.5" fill="#00f5ff" opacity="0.8" />
                      <Circle cx="40" cy="40" r="1.5" fill="#22c55e" opacity="0.8" />
                      <Circle cx="20" cy="60" r="1.5" fill="#ffffff" opacity="0.8" />
                      <Circle cx="30" cy="60" r="1.5" fill="#eab308" opacity="0.8" />
                      <Circle cx="40" cy="60" r="1.5" fill="#00f5ff" opacity="0.8" />
                      <Circle cx="20" cy="80" r="1.5" fill="#22c55e" opacity="0.8" />
                      <Circle cx="30" cy="80" r="1.5" fill="#ffffff" opacity="0.8" />
                      <Circle cx="40" cy="80" r="1.5" fill="#eab308" opacity="0.8" />
                    </Svg>
                  )}
                </Animated.View>
              );
            })}

            {/* Animated Street Lights / Scenery - Right Side (3 staggered objects) */}
            {[lightProgress0, lightProgress1, lightProgress2].map((prog, idx) => {
              // idx 0 is Street Lamp, idx 1 is Skyscraper, idx 2 is Billboard
              const type = idx === 0 ? 'lamp' : idx === 1 ? 'building' : 'billboard';

              // Right base target calculations with dynamic perspective slopes matching border
              const rightSlope = ((width + 120) - (width / 2 + 20)) / (roadHeight - 90);
              const rightLampEndX = (width / 2 + 14.25) + rightSlope * (roadHeight - 136);
              const rightBillboardEndX = (width / 2 + 15) + rightSlope * (roadHeight - 136) + 85.5;
              const rightBuildingEndX = (width / 2 + 15) + rightSlope * (roadHeight - 159) + 85.5;

              const rightX = prog.interpolate({
                inputRange: [0, 1],
                outputRange: type === 'lamp' ? [width / 2 + 14.25, rightLampEndX] : type === 'billboard' ? [width / 2 + 15, rightBillboardEndX] : [width / 2 + 15, rightBuildingEndX]
              });
              const y = prog.interpolate({
                inputRange: [0, 1],
                outputRange: type === 'building' ? [21, roadHeight - 138] : [44, roadHeight - 92]
              });
              const scale = prog.interpolate({
                inputRange: [0, 1],
                outputRange: [0.15, 1.1]
              });
              const opacity = prog.interpolate({
                inputRange: [0, 0.15, 0.85, 1],
                outputRange: [0, 1, 1, 0]
              });

              return (
                <Animated.View
                  key={`right-obj-${idx}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: [
                      { translateX: rightX },
                      { translateY: y },
                      { scale: scale }
                    ],
                    opacity: opacity,
                    zIndex: 4,
                    pointerEvents: 'none',
                  }}
                >
                  {type === 'lamp' && (
                    <Svg width={40} height={80} viewBox="0 0 40 80">
                      <Defs>
                        <SvgLinearGradient id={`beamGradRight-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#eab308" stopOpacity="0.45" />
                          <Stop offset="100%" stopColor="transparent" />
                        </SvgLinearGradient>
                      </Defs>
                      {/* Light cone beam pointing left/down towards the road */}
                      <Path d="M 10 12 L -10 80 L 30 80 Z" fill={`url(#beamGradRight-${idx})`} />
                      {/* Pole at x=25 */}
                      <Line x1="25" y1="80" x2="25" y2="15" stroke="#475569" strokeWidth="2.5" />
                      {/* Arm curves left from x=25 to x=10 */}
                      <Path d="M 25 15 C 25 10, 10 10, 10 12" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                      {/* Glowing lamp head at x=10 */}
                      <Circle cx="10" cy="12" r="3" fill="#eab308" />
                    </Svg>
                  )}
                  {type === 'billboard' && (
                    <Svg width={40} height={80} viewBox="0 0 40 80">
                      <Defs>
                        <SvgLinearGradient id={`boardGradRight-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#00f5ff" stopOpacity="0.3" />
                          <Stop offset="100%" stopColor="transparent" />
                        </SvgLinearGradient>
                      </Defs>
                      {/* Subtle cyan glow under the billboard */}
                      <Path d="M 20 20 L 5 80 L 35 80 Z" fill={`url(#boardGradRight-${idx})`} opacity="0.4" />
                      {/* Pole at center x=20 */}
                      <Line x1="20" y1="80" x2="20" y2="30" stroke="#475569" strokeWidth="2.5" />
                      {/* Billboard board frame */}
                      <Rect x="2" y="6" width="36" height="24" rx="2" fill="#030712" stroke="#00f5ff" strokeWidth="1.5" />
                      {/* Glowing green checkmark/arrow content inside billboard */}
                      <Path d="M 14 18 L 18 22 L 26 13" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      {/* Small lights on top of billboard */}
                      <Circle cx="8" cy="3" r="1.5" fill="#eab308" />
                      <Circle cx="20" cy="3" r="1.5" fill="#eab308" />
                      <Circle cx="32" cy="3" r="1.5" fill="#eab308" />
                    </Svg>
                  )}
                  {type === 'building' && (
                    <Svg width={60} height={120} viewBox="0 0 60 120">
                      {/* Building body */}
                      <Rect x="10" y="20" width="40" height="100" fill="#060d21" opacity="0.95" stroke="rgba(0, 245, 255, 0.15)" strokeWidth="1" />
                      {/* Glowing windows */}
                      <Circle cx="20" cy="40" r="1.5" fill="#eab308" opacity="0.8" />
                      <Circle cx="30" cy="40" r="1.5" fill="#00f5ff" opacity="0.8" />
                      <Circle cx="40" cy="40" r="1.5" fill="#22c55e" opacity="0.8" />
                      <Circle cx="20" cy="60" r="1.5" fill="#ffffff" opacity="0.8" />
                      <Circle cx="30" cy="60" r="1.5" fill="#eab308" opacity="0.8" />
                      <Circle cx="40" cy="60" r="1.5" fill="#00f5ff" opacity="0.8" />
                      <Circle cx="20" cy="80" r="1.5" fill="#22c55e" opacity="0.8" />
                      <Circle cx="30" cy="80" r="1.5" fill="#ffffff" opacity="0.8" />
                      <Circle cx="40" cy="80" r="1.5" fill="#eab308" opacity="0.8" />
                    </Svg>
                  )}
                </Animated.View>
              );
            })}

            {/* Floating Black Sports Car with suspension & sway animation */}
            <Animated.Image 
              source={require('../assets/images/drive_car.png')} 
              style={[
                styles.page1Car,
                { bottom: isSmallDevice ? 95 : 125, transform: [{ translateY: carBounce }, { translateX: carSway }] }
              ]} 
              resizeMode="contain"
            />

            {/* Features Row: Transparent Row Layout matching screenshot perfectly */}
            <View style={styles.featuresTransparentRow}>
              <View style={styles.featureCol}>
                <View style={[styles.featureIconCircle, { borderColor: 'rgba(34, 197, 94, 0.15)', backgroundColor: 'rgba(10, 25, 47, 0.6)' }]}>
                  <Feather name="shield" size={16} color="#22c55e" />
                </View>
                <Text style={styles.featureTitle}>Safety Score</Text>
                <Text style={styles.featureDesc}>Track your{"\n"}driving safety</Text>
              </View>
              
              <View style={styles.featureVerticalDivider} />
              
              <View style={styles.featureCol}>
                <View style={[styles.featureIconCircle, { borderColor: 'rgba(14, 165, 233, 0.15)', backgroundColor: 'rgba(10, 25, 47, 0.6)' }]}>
                  <Feather name="map-pin" size={16} color="#0ea5e9" />
                </View>
                <Text style={styles.featureTitle}>Route Tracking</Text>
                <Text style={styles.featureDesc}>View your trips{"\n"}and routes</Text>
              </View>
              
              <View style={styles.featureVerticalDivider} />
              
              <View style={styles.featureCol}>
                <View style={[styles.featureIconCircle, { borderColor: 'rgba(34, 197, 94, 0.15)', backgroundColor: 'rgba(10, 25, 47, 0.6)' }]}>
                  <MaterialCommunityIcons name="robot-outline" size={16} color="#22c55e" />
                </View>
                <Text style={styles.featureTitle}>AI Coach</Text>
                <Text style={styles.featureDesc}>Get smart tips{"\n"}to improve</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= PAGE 2 ================= */}
        <View style={styles.page}>
          {/* Spacer to push content down to center it vertically */}
          <View style={{ height: isSmallDevice ? 30 : 60 }} />
          
          <View style={styles.page2HeaderWrap}>
            <Text style={styles.page2Heading}>Smart <Text style={styles.cyanText}>Monitoring</Text></Text>
            <Text style={styles.page2Subtitle}>
              Real-time monitoring of your drive to keep you safe on the road.
            </Text>
          </View>

          {/* Top-down Car and connecting indicators */}
          <View style={styles.page2IllustrationContainer}>
            <Svg width={containerWidth} height={250} viewBox={`0 0 ${containerWidth} 250`}>
              <Defs>
                <SvgLinearGradient id="carLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#00f5ff" />
                  <Stop offset="100%" stopColor="#22c55e" />
                </SvgLinearGradient>
                <SvgLinearGradient id="carBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0c1938" />
                  <Stop offset="100%" stopColor="#040814" />
                </SvgLinearGradient>
              </Defs>
              
              {/* Pulsing radar concentric rings */}
              <AnimatedCircle 
                cx={containerWidth / 2} 
                cy="115" 
                r={page2PulseScale1} 
                stroke="rgba(0, 245, 255, 0.12)" 
                strokeWidth="1.2" 
                fill="none" 
                opacity={page2PulseOpacity1}
              />
              <AnimatedCircle 
                cx={containerWidth / 2} 
                cy="115" 
                r={page2PulseScale2} 
                stroke="rgba(34, 197, 94, 0.12)" 
                strokeWidth="1.2" 
                fill="none" 
                opacity={page2PulseOpacity2}
              />
              <Circle 
                cx={containerWidth / 2} 
                cy="115" 
                r="38" 
                stroke="rgba(255, 255, 255, 0.04)" 
                strokeWidth="1" 
                fill="none" 
              />

              {/* Connecting lines from Car wheels/sides to the UI cards */}
              {/* Harsh Brake Line (Top Left) */}
              <Path d={`M ${containerWidth / 2 - 22} 85 L 128 55`} stroke="#eab308" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.8} />
              <Circle cx={containerWidth / 2 - 22} cy="85" r="3" fill="#eab308" />
              <Circle cx="128" cy="55" r="3.5" fill="#eab308" />

              {/* Sharp Turn Line (Top Right) */}
              <Path d={`M ${containerWidth / 2 + 22} 85 L ${containerWidth - 128} 55`} stroke="#22c55e" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.8} />
              <Circle cx={containerWidth / 2 + 22} cy="85" r="3" fill="#22c55e" />
              <Circle cx={containerWidth - 128} cy="55" r="3.5" fill="#22c55e" />

              {/* Phone Usage Line (Bottom Left) */}
              <Path d={`M ${containerWidth / 2 - 22} 145 L 128 185`} stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.8} />
              <Circle cx={containerWidth / 2 - 22} cy="145" r="3" fill="#06b6d4" />
              <Circle cx="128" cy="185" r="3.5" fill="#06b6d4" />

              {/* Speed Line (Bottom Right) */}
              <Path d={`M ${containerWidth / 2 + 22} 145 L ${containerWidth - 128} 185`} stroke="#00f5ff" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.8} />
              <Circle cx={containerWidth / 2 + 22} cy="145" r="3" fill="#00f5ff" />
              <Circle cx={containerWidth - 128} cy="185" r="3.5" fill="#00f5ff" />

              {/* Detailed High-Fidelity Cyber Sports Car */}
              {/* Outer glow shadow */}
              <Rect 
                x={containerWidth / 2 - 28} 
                y="52" 
                width="56" 
                height="124" 
                rx="18" 
                fill="none" 
                stroke="#00f5ff" 
                strokeWidth="5" 
                opacity="0.1" 
              />
              
              {/* Main Silhouette body */}
              <Path 
                d={`
                  M ${containerWidth / 2 - 18} 52 
                  C ${containerWidth / 2 - 10} 50, ${containerWidth / 2 + 10} 50, ${containerWidth / 2 + 18} 52 
                  C ${containerWidth / 2 + 25} 55, ${containerWidth / 2 + 27} 75, ${containerWidth / 2 + 27} 85 
                  C ${containerWidth / 2 + 29} 95, ${containerWidth / 2 + 27} 110, ${containerWidth / 2 + 27} 130
                  C ${containerWidth / 2 + 27} 150, ${containerWidth / 2 + 25} 170, ${containerWidth / 2 + 22} 176
                  L ${containerWidth / 2 - 22} 176
                  C ${containerWidth / 2 - 25} 170, ${containerWidth / 2 - 27} 150, ${containerWidth / 2 - 27} 130
                  C ${containerWidth / 2 - 27} 110, ${containerWidth / 2 - 29} 95, ${containerWidth / 2 - 27} 85
                  C ${containerWidth / 2 - 27} 75, ${containerWidth / 2 - 25} 55, ${containerWidth / 2 - 18} 52 Z
                `}
                fill="url(#carBodyGrad)"
                stroke="url(#carLineGrad)"
                strokeWidth="2.2"
              />

              {/* Wheels */}
              <Rect x={containerWidth / 2 - 29} y="62" width="5" height="15" rx="1.5" fill="#1e293b" />
              <Rect x={containerWidth / 2 + 24} y="62" width="5" height="15" rx="1.5" fill="#1e293b" />
              <Rect x={containerWidth / 2 - 29} y="145" width="5" height="17" rx="1.5" fill="#1e293b" />
              <Rect x={containerWidth / 2 + 24} y="145" width="5" height="17" rx="1.5" fill="#1e293b" />

              {/* Headlights (Cyan glowing beams) */}
              <Line x1={containerWidth / 2 - 15} y1="52" x2={containerWidth / 2 - 15} y2="44" stroke="#00f5ff" strokeWidth="2.5" strokeLinecap="round" />
              <Line x1={containerWidth / 2 + 15} y1="52" x2={containerWidth / 2 + 15} y2="44" stroke="#00f5ff" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* Taillights (Red glowing lines) */}
              <Line x1={containerWidth / 2 - 18} y1="176" x2={containerWidth / 2 - 8} y2="176" stroke="#ef4444" strokeWidth="2" />
              <Line x1={containerWidth / 2 + 18} y1="176" x2={containerWidth / 2 + 8} y2="176" stroke="#ef4444" strokeWidth="2" />

              {/* Windshield */}
              <Path 
                d={`
                  M ${containerWidth / 2 - 18} 82 
                  C ${containerWidth / 2 - 16} 70, ${containerWidth / 2 + 16} 70, ${containerWidth / 2 + 18} 82
                  C ${containerWidth / 2 + 15} 84, ${containerWidth / 2 - 15} 84, ${containerWidth / 2 - 18} 82 Z
                `}
                fill="#0a1329"
                stroke="#00f5ff"
                strokeWidth="1.5"
                opacity="0.95"
              />
              
              {/* Roof Cabin shape */}
              <Path 
                d={`
                  M ${containerWidth / 2 - 16} 85 
                  L ${containerWidth / 2 + 16} 85
                  C ${containerWidth / 2 + 18} 100, ${containerWidth / 2 + 18} 125, ${containerWidth / 2 + 16} 135
                  L ${containerWidth / 2 - 16} 135
                  C ${containerWidth / 2 - 18} 125, ${containerWidth / 2 - 18} 100, ${containerWidth / 2 - 16} 85 Z
                `}
                fill="none"
                stroke="rgba(0, 245, 255, 0.3)"
                strokeWidth="1"
              />

              {/* Rear window */}
              <Path 
                d={`
                  M ${containerWidth / 2 - 14} 138
                  C ${containerWidth / 2 - 10} 145, ${containerWidth / 2 + 10} 145, ${containerWidth / 2 + 14} 138
                  C ${containerWidth / 2 + 11} 136, ${containerWidth / 2 - 11} 136, ${containerWidth / 2 - 14} 138 Z
                `}
                fill="#0a1329"
                stroke="#00f5ff"
                strokeWidth="1.2"
                opacity="0.8"
              />

              {/* Side Mirrors */}
              <Rect x={containerWidth / 2 - 32} y="77" width="5" height="10" rx="2" fill="#1e293b" stroke="#00f5ff" strokeWidth="1" />
              <Rect x={containerWidth / 2 + 27} y="77" width="5" height="10" rx="2" fill="#1e293b" stroke="#00f5ff" strokeWidth="1" />

              {/* Hood detail lines */}
              <Path 
                d={`M ${containerWidth / 2 - 10} 58 L ${containerWidth / 2} 70 L ${containerWidth / 2 + 10} 58`} 
                fill="none" 
                stroke="rgba(34, 197, 94, 0.45)" 
                strokeWidth="1.2" 
              />
              
              {/* Side accent stripes */}
              <Path d={`M ${containerWidth / 2 - 23} 98 L ${containerWidth / 2 - 23} 124`} fill="none" stroke="#22c55e" strokeWidth="1.5" />
              <Path d={`M ${containerWidth / 2 + 23} 98 L ${containerWidth / 2 + 23} 124`} fill="none" stroke="#22c55e" strokeWidth="1.5" />
              
              {/* Spoiler wings (Bottom) */}
              <Path d={`M ${containerWidth / 2 - 24} 176 L ${containerWidth / 2 - 28} 182 L ${containerWidth / 2 - 15} 182`} fill="none" stroke="#22c55e" strokeWidth="1.5" />
              <Path d={`M ${containerWidth / 2 + 24} 176 L ${containerWidth / 2 + 28} 182 L ${containerWidth / 2 + 15} 182`} fill="none" stroke="#22c55e" strokeWidth="1.5" />
            </Svg>

            {/* Left & Right Badges overlayed floating on sides */}
            {/* Top-Left: Harsh Brake */}
            <View style={[styles.badge, styles.badgeTopLeft]}>
              <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                <Feather name="alert-triangle" size={12} color="#eab308" />
              </View>
              <View style={styles.badgeTextCol}>
                <Text style={styles.badgeLabel}>Harsh Brake</Text>
                <Text style={styles.badgeValue}>Monitoring</Text>
              </View>
            </View>

            {/* Top-Right: Sharp Turn */}
            <View style={[styles.badge, styles.badgeTopRight]}>
              <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                <MaterialCommunityIcons name="steering" size={13} color="#22c55e" />
              </View>
              <View style={styles.badgeTextCol}>
                <Text style={styles.badgeLabel}>Sharp Turn</Text>
                <Text style={styles.badgeValue}>Monitoring</Text>
              </View>
            </View>

            {/* Bottom-Left: Phone Usage */}
            <View style={[styles.badge, styles.badgeBottomLeft]}>
              <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
                <Feather name="smartphone" size={12} color="#06b6d4" />
              </View>
              <View style={styles.badgeTextCol}>
                <Text style={styles.badgeLabel}>Phone Usage</Text>
                <Text style={styles.badgeValue}>Monitoring</Text>
              </View>
            </View>

            {/* Bottom-Right: Speed */}
            <View style={[styles.badge, styles.badgeBottomRight]}>
              <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(0, 245, 255, 0.1)' }]}>
                <MaterialCommunityIcons name="speedometer" size={13} color="#00f5ff" />
              </View>
              <View style={styles.badgeTextCol}>
                <Text style={styles.badgeLabel}>Speed</Text>
                <Text style={styles.badgeValue}>Monitoring</Text>
              </View>
            </View>
          </View>

          {/* Real-time Detection Details Panel */}
          <View style={styles.sensorGridPanel}>
            <View style={styles.sensorGridHeader}>
              <Text style={styles.sensorGridTitle}>Real-time detection using:</Text>
            </View>
            <View style={styles.sensorGridContent}>
              {/* Radar sweeps animation widget */}
              <View style={styles.radarSweepWidget}>
                <Svg width={44} height={44} viewBox="0 0 44 44">
                  <Circle cx="22" cy="22" r="20" stroke="rgba(34, 197, 94, 0.15)" strokeWidth="1" fill="none" />
                  <Circle cx="22" cy="22" r="14" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="1" fill="none" />
                  <Circle cx="22" cy="22" r="8" stroke="rgba(34, 197, 94, 0.25)" strokeWidth="1" fill="none" />
                  
                  {/* Rotating sweep line */}
                  <Animated.View style={{
                    position: 'absolute',
                    width: 44,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ rotate: radarRotation }],
                    pointerEvents: 'none',
                  }}>
                    <View style={{
                      width: 1,
                      height: 22,
                      backgroundColor: '#22c55e',
                      position: 'absolute',
                      top: 0,
                      left: 21.5,
                      opacity: 0.85,
                    }} />
                  </Animated.View>
                </Svg>
              </View>

              {/* Sensor details list (4 Items) */}
              <View style={styles.sensorsList}>
                <View style={styles.sensorRow}>
                  <View style={styles.sensorItem}>
                    <MaterialCommunityIcons name="waveform" size={15} color="#22c55e" style={{ marginRight: 6 }} />
                    <Text style={styles.sensorName}>Accelerometer</Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <Feather name="smartphone" size={13} color="#00f5ff" style={{ marginRight: 6 }} />
                    <Text style={styles.sensorName}>Device Motion</Text>
                  </View>
                </View>
                <View style={styles.sensorRow}>
                  <View style={styles.sensorItem}>
                    <MaterialCommunityIcons name="circle-double" size={14} color="#22c55e" style={{ marginRight: 6 }} />
                    <Text style={styles.sensorName}>Gyroscope</Text>
                  </View>
                  <View style={styles.sensorItem}>
                    <Feather name="map-pin" size={13} color="#00f5ff" style={{ marginRight: 6 }} />
                    <Text style={styles.sensorName}>GPS</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ================= PAGE 3 ================= */}
        <View style={styles.page}>
          {/* Spacer to push content down to center it vertically */}
          <View style={{ height: isSmallDevice ? 30 : 60 }} />
          
          <View style={styles.page2HeaderWrap}>
            <Text style={styles.page2Heading}>Route <Text style={styles.greenText}>Replay</Text>{"\n"}& <Text style={styles.cyanText}>AI Coach</Text></Text>
            <Text style={styles.page2Subtitle}>
              Replay your drives, review events, and get AI-powered insights to improve.
            </Text>
          </View>

          {/* Map Route Replay representation */}
          <View style={styles.mapCard}>
            <Svg width={width - 55} height={130} viewBox={`0 0 ${width - 55} 130`} style={styles.mapGridSvg}>
              <Defs>
                <SvgLinearGradient id="routeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#84cc16" />
                  <Stop offset="50%" stopColor="#eab308" />
                  <Stop offset="100%" stopColor="#00f5ff" />
                </SvgLinearGradient>
              </Defs>
              
              {/* Map grid streets */}
              <Line x1="10" y1="0" x2="10" y2="130" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
              <Line x1="70" y1="0" x2="70" y2="130" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
              <Line x1="130" y1="0" x2="130" y2="130" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
              <Line x1="200" y1="0" x2="200" y2="130" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
              <Line x1="270" y1="0" x2="270" y2="130" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
              
              <Line x1="0" y1="20" x2={width - 55} y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
              <Line x1="0" y1="65" x2={width - 55} y2="65" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
              <Line x1="0" y1="105" x2={width - 55} y2="105" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />

              {/* Winding neon route line */}
              <Path 
                d="M 60 115 C 80 90, 110 95, 120 70 C 130 40, 185 50, 195 25 L 245 25"
                stroke="url(#routeLineGrad)" 
                strokeWidth="4" 
                fill="none" 
                strokeLinecap="round" 
              />
              
              {/* Start pulsing point */}
              <Circle cx="60" cy="115" r="7" fill="#84cc16" opacity="0.4" />
              <Circle cx="60" cy="115" r="4.5" fill="#84cc16" />

              {/* End pin glowing markers */}
              <Circle cx="245" cy="25" r="6" fill="#00f5ff" />
            </Svg>

            {/* Map point indicators overlays */}
            {/* Pulsing ring around end map pin */}
            <Animated.View style={[
              styles.mapPulseRing,
              { 
                left: 245 - 22, 
                top: 25 - 22, 
                transform: [{ scale: pulseScale1 }], 
                opacity: pulseOpacity1 
              }
            ]} />
            <Animated.View style={[
              styles.mapPulseRing,
              { 
                left: 245 - 22, 
                top: 25 - 22, 
                transform: [{ scale: pulseScale2 }], 
                opacity: pulseOpacity2 
              }
            ]} />

            {/* End Destination Pin Badge */}
            <View style={[styles.mapPinContainer, { left: 236, top: -2 }]}>
              <Ionicons name="location" size={18} color="#00f5ff" />
            </View>

            {/* Harsh Brake Event Banner */}
            <View style={[styles.mapEventBanner, { left: 20, top: 46 }]}>
              <View style={[styles.eventIconIndicator, { backgroundColor: '#eab308' }]}>
                <Feather name="alert-triangle" size={10} color="#040814" />
              </View>
              <View>
                <Text style={styles.eventLabelText}>Harsh Brake</Text>
                <Text style={styles.eventTimeText}>07:48 PM</Text>
              </View>
            </View>

            {/* Phone Usage Event Banner */}
            <View style={[styles.mapEventBanner, { left: 138, top: 76 }]}>
              <View style={[styles.eventIconIndicator, { backgroundColor: '#06b6d4' }]}>
                <Feather name="smartphone" size={9} color="#040814" />
              </View>
              <View>
                <Text style={styles.eventLabelText}>Phone Usage</Text>
                <Text style={styles.eventTimeText}>07:16 PM</Text>
              </View>
            </View>

            {/* Sharp Turn Event Banner */}
            <View style={[styles.mapEventBanner, { left: 184, top: 28 }]}>
              <View style={[styles.eventIconIndicator, { backgroundColor: '#22c55e' }]}>
                <Feather name="corner-up-right" size={9} color="#040814" />
              </View>
              <View>
                <Text style={styles.eventLabelText}>Sharp Turn</Text>
                <Text style={styles.eventTimeText}>08:26 PM</Text>
              </View>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <FontAwesome5 name="road" size={11} color="#84cc16" />
              </View>
              <View style={styles.statLabelCol}>
                <Text style={styles.statTitleText}>DISTANCE</Text>
                <Text style={styles.statValueText}>28.6 <Text style={styles.statUnitText}>km</Text></Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <Feather name="clock" size={12} color="#0ea5e9" />
              </View>
              <View style={styles.statLabelCol}>
                <Text style={styles.statTitleText}>DURATION</Text>
                <Text style={styles.statValueText}>00:42 <Text style={styles.statUnitText}>hr</Text></Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <Feather name="shield" size={12} color="#84cc16" />
              </View>
              <View style={styles.statLabelCol}>
                <Text style={styles.statTitleText}>SAFETY SCORE</Text>
                <Text style={styles.statValueText}>86 <Text style={[styles.statUnitText, { color: '#84cc16', fontWeight: 'bold' }]}>Excellent</Text></Text>
              </View>
            </View>
          </View>

          {/* AI Coach card */}
          <View style={styles.coachCard}>
            <View style={styles.coachTopRow}>
              {/* Glowing Robot Icon */}
              <View style={styles.robotGlowWrap}>
                <Svg width={30} height={30} viewBox="0 0 30 30">
                  <Circle cx="15" cy="15" r="14" fill="#030712" stroke="#22c55e" strokeWidth="1.5" />
                  {/* Robot eyes */}
                  <Circle cx="10" cy="13" r="2.5" fill="#22c55e" />
                  <Circle cx="20" cy="13" r="2.5" fill="#22c55e" />
                  {/* Antennas */}
                  <Line x1="15" y1="8" x2="15" y2="4" stroke="#22c55e" strokeWidth="1.5" />
                  <Circle cx="15" cy="4" r="1.5" fill="#22c55e" />
                  {/* Smile */}
                  <Path d="M11 19 Q15 22, 19 19" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </Svg>
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.coachNameText}>AI Coach</Text>
                <Text style={styles.coachMessage}>
                  You frequently use your phone while driving. Consider using a dashboard mount to stay focused and safe.
                </Text>
              </View>
            </View>
            <View style={styles.coachActionRow}>
              <View style={styles.coachBadgeAlert}>
                <Ionicons name="bulb-outline" size={14} color="#84cc16" style={{ marginRight: 5 }} />
                <Text style={styles.coachBadgeText}>Focus more. Drive safer.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation and Actions */}
      <View style={styles.bottomSection}>
        <View style={styles.page2BottomContainer}>
          {/* Left Wrapper (Symmetric with Right circular next button) */}
          <View style={{ width: 80, alignItems: 'flex-start' }}>
            {activeIndex > 0 && (
              <TouchableOpacity style={styles.navTextBtn} onPress={handlePrev}>
                <Feather name="arrow-left" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.navText}>Previous</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Center: Dots Indicators */}
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((idx) => (
              <View 
                key={idx} 
                style={[
                  styles.dot, 
                  idx === activeIndex ? styles.activeDot : styles.inactiveDot
                ]} 
              />
            ))}
          </View>
          
          {/* Right Wrapper (Symmetric with Left previous button) */}
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <TouchableOpacity 
              style={styles.circularNextBtn} 
              onPress={activeIndex === 2 ? handleFinish : handleNext}
            >
              <LinearGradient
                colors={['#84cc16', '#22c55e']}
                style={styles.circularGradient}
              >
                <Feather name="chevron-right" size={24} color="#040814" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 55,
    paddingBottom: 5,
    zIndex: 10,
  },
  logoIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  logoTextHighlight: {
    color: '#22c55e',
  },
  skipBtn: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 25,
    justifyContent: 'flex-start',
  },
  
  // ================= PAGE 1 =================
  page1LogoContainer: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 8 : 15,
  },
  logoOuterWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoBackdropCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page1CenterLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    zIndex: 2,
  },
  page1BrandText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: -8,
    letterSpacing: 0.5,
  },
  page1BrandTextHighlight: {
    color: '#22c55e',
  },
  brandLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 6,
    marginTop: 8,
    position: 'relative',
  },
  brandLine: {
    width: '100%',
    height: 1.5,
  },
  brandLineDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00f5ff',
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 5 : 10,
    width: '100%',
  },
  title: {
    fontSize: isSmallDevice ? 32 : 38,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 38 : 44,
    letterSpacing: -0.5,
  },
  titleHighlight: {
    color: '#22c55e',
  },
  subtitle: {
    fontSize: isSmallDevice ? 12.5 : 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 15,
    fontWeight: '400',
  },
  page1RoadContainer: {
    width: width, // Full screen width to match street lights coordinates
    height: isSmallDevice ? 250 : 300,
    position: 'relative',
    marginTop: isSmallDevice ? 10 : 20,
    marginBottom: isSmallDevice ? 55 : 75, // Bottom margin adjusted to balance taller container height
    alignItems: 'center',
    overflow: 'hidden', // Prevent spilling into next horizontal screen page
  },
  perspectiveRoadSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0, // Align to left edge of container
  },
  page1Car: {
    width: width * 0.46,
    height: 90,
    position: 'absolute',
    zIndex: 5,
  },

  // ================= PAGE 2 =================
  page2HeaderWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: isSmallDevice ? 10 : 20,
  },
  page2Heading: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 32 : 36,
  },
  cyanText: {
    color: '#00f5ff',
  },
  greenText: {
    color: '#84cc16',
  },
  page2Subtitle: {
    fontSize: 12.5,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  page2IllustrationContainer: {
    width: '100%',
    height: isSmallDevice ? 210 : 250,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallDevice ? 10 : 20,
  },
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 25, 47, 0.75)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: 125, // Fixed width for perfect mathematical alignment!
  },
  badgeTopLeft: {
    top: 25,
    left: 8,
  },
  badgeTopRight: {
    top: 25,
    right: 8,
  },
  badgeBottomLeft: {
    bottom: 35,
    left: 8,
  },
  badgeBottomRight: {
    bottom: 35,
    right: 8,
  },
  badgeIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeTextCol: {
    flex: 1,
  },
  badgeLabel: {
    fontSize: 9.5,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  badgeValue: {
    fontSize: 8.5,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  sensorGridPanel: {
    width: '100%',
    backgroundColor: 'rgba(10, 25, 47, 0.35)',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 245, 255, 0.08)',
    padding: 12,
    marginTop: isSmallDevice ? 10 : 20,
  },
  sensorGridHeader: {
    marginBottom: 8,
  },
  sensorGridTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#22c55e',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sensorGridContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radarSweepWidget: {
    marginRight: 15,
  },
  sensorsList: {
    flex: 1,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sensorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
  sensorName: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // ================= PAGE 3 =================
  mapCard: {
    width: '100%',
    height: 130,
    backgroundColor: 'rgba(10, 25, 47, 0.4)',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 245, 255, 0.1)',
    position: 'relative',
    marginTop: isSmallDevice ? 10 : 20,
    overflow: 'hidden',
  },
  mapGridSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mapPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#00f5ff',
    backgroundColor: 'rgba(0, 245, 255, 0.08)',
    pointerEvents: 'none',
  },
  mapPinContainer: {
    position: 'absolute',
    shadowColor: '#00f5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
  mapEventBanner: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  eventIconIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  eventLabelText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  eventTimeText: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 0.5,
  },
  statsBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10, 25, 47, 0.35)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statLabelCol: {
    justifyContent: 'center',
  },
  statTitleText: {
    fontSize: 7.5,
    color: '#64748b',
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  statValueText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 1,
  },
  statUnitText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#94a3b8',
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignSelf: 'center',
  },
  coachCard: {
    width: '100%',
    backgroundColor: 'rgba(10, 25, 47, 0.45)',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(34, 197, 94, 0.1)',
    padding: 12,
    marginTop: 12,
  },
  coachTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  robotGlowWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  coachNameText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  coachMessage: {
    fontSize: 9.5,
    color: '#94a3b8',
    lineHeight: 14,
    marginTop: 3,
  },
  coachActionRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  coachBadgeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  coachBadgeText: {
    fontSize: 8.5,
    color: '#84cc16',
    fontWeight: 'bold',
  },

  // ================= BOTTOM CONTROLS =================
  bottomSection: {
    position: 'absolute',
    bottom: isSmallDevice ? 15 : 30,
    left: 0,
    right: 0,
    paddingHorizontal: 25,
    zIndex: 10,
  },
  page1BottomContainer: {
    alignItems: 'center',
    width: '100%',
  },
  page2BottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 54,
  },
  page3BottomContainer: {
    alignItems: 'center',
    width: '100%',
  },
  page3NavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 44,
    marginTop: 10,
  },
  dotsRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  wideActionButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  wideButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  wideButtonText: {
    color: '#040814',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0EA5E9', // vibrant sky blue background
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
  },
  prevBtnWrapper: {
    width: 80,
    alignItems: 'flex-start',
  },
  navTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#334155', // darker slate grey
  },
  activeDot: {
    width: 14,
    backgroundColor: '#22c55e', // neon green active dot
  },
  nextBtnWrapper: {
    width: 120,
    alignItems: 'flex-end',
  },
  circularNextBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#84cc16',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  circularGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresTransparentRow: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  featureCol: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 13,
  },
  featureVerticalDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'center',
  },
});
