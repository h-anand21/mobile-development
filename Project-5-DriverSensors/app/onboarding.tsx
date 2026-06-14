import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Line, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { storage } from '../src/database/storage';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 750;

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Animations
  const radarRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseRing1 = useRef(new Animated.Value(0)).current;
  const pulseRing2 = useRef(new Animated.Value(0)).current;
  const carBounce = useRef(new Animated.Value(0)).current;
  const logoFadeIn = useRef(new Animated.Value(0)).current;

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

    return () => {
      radarLoop.stop();
      pulseLoop.stop();
      carFloat.stop();
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
    router.replace('/(tabs)');
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

  return (
    <LinearGradient colors={['#040814', '#02040a']} style={styles.container}>
      {/* Top Header Logo */}
      <Animated.View style={[styles.header, { opacity: logoFadeIn }]}>
        <Image 
          source={require('../assets/icon/black -icon.png')} 
          style={styles.logoIcon} 
        />
        <Text style={styles.logoText}>
          Safe<Text style={styles.logoTextHighlight}>Drive</Text>
        </Text>

        {activeIndex > 0 && activeIndex < 2 && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleFinish}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

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
          {/* Speedometer Gauge/Shield Illustration */}
          <View style={styles.page1IllustrationContainer}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Defs>
                <SvgLinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#00f5ff" />
                  <Stop offset="100%" stopColor="#84cc16" />
                </SvgLinearGradient>
              </Defs>
              
              {/* Outer dashed accent ring */}
              <Circle cx="100" cy="100" r="90" stroke="rgba(0, 245, 255, 0.08)" strokeWidth="1" strokeDasharray="3 6" fill="none" />
              <Circle cx="100" cy="100" r="82" stroke="rgba(132, 204, 22, 0.05)" strokeWidth="1" fill="none" />
              
              {/* Main Shield outline */}
              <Path 
                d="M100 25 L165 48 C165 110, 100 158, 100 170 C100 158, 35 110, 35 48 Z" 
                stroke="url(#shieldGrad)" 
                strokeWidth="2.5" 
                fill="rgba(0, 245, 255, 0.03)" 
              />
              
              {/* Speedometer Arc */}
              <Circle 
                cx="100" 
                cy="95" 
                r="48" 
                stroke="rgba(0, 245, 255, 0.15)" 
                strokeWidth="4" 
                strokeDasharray="210" 
                strokeDashoffset="70"
                fill="none" 
                transform="rotate(135 100 95)"
                strokeLinecap="round"
              />
              
              <Circle 
                cx="100" 
                cy="95" 
                r="48" 
                stroke="#00f5ff" 
                strokeWidth="5" 
                strokeDasharray="210" 
                strokeDashoffset="110"
                fill="none" 
                transform="rotate(135 100 95)"
                strokeLinecap="round"
              />

              {/* Dial ticks */}
              {Array.from({ length: 9 }).map((_, idx) => {
                const angle = 135 + idx * 33.75;
                const rad = (angle * Math.PI) / 180;
                const x1 = 100 + 42 * Math.cos(rad);
                const y1 = 95 + 42 * Math.sin(rad);
                const x2 = 100 + 38 * Math.cos(rad);
                const y2 = 95 + 38 * Math.sin(rad);
                return (
                  <Line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.2" />
                );
              })}

              {/* Speedometer Needle */}
              <Line 
                x1="100" 
                y1="95" 
                x2="128" 
                y2="68" 
                stroke="#84cc16" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              <Circle cx="100" cy="95" r="5" fill="#84cc16" />

              {/* Checkmark in shield */}
              <Path 
                d="M86 130 L95 139 L120 114" 
                stroke="#84cc16" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none" 
              />
            </Svg>
          </View>

          {/* Heading Text */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Drive Safe.{"\n"}
              <Text style={styles.titleHighlight}>Live Safe.</Text>
            </Text>
            <Text style={styles.subtitle}>
              SafeDrive monitors your driving behavior and helps you build safer driving habits.
            </Text>
          </View>

          {/* Road scenery & Car floating animation */}
          <View style={styles.page1RoadContainer}>
            <Svg width={width - 50} height={130} viewBox={`0 0 ${width - 50} 130`} style={styles.perspectiveRoadSvg}>
              <Defs>
                <SvgLinearGradient id="page1Asphalt" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#050a14" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#1e293b" stopOpacity="1" />
                </SvgLinearGradient>
                <SvgLinearGradient id="neonGreenBorder" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="rgba(34, 197, 94, 0.1)" />
                  <Stop offset="100%" stopColor="#22c55e" />
                </SvgLinearGradient>
                <SvgLinearGradient id="neonCyanBorder" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="rgba(0, 245, 255, 0.1)" />
                  <Stop offset="100%" stopColor="#00f5ff" />
                </SvgLinearGradient>
              </Defs>
              
              {/* Skyline background lines */}
              <Line x1="0" y1="20" x2={width - 50} y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <Line x1="0" y1="10" x2={width - 50} y2="10" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

              {/* Road shape */}
              <Path 
                d={`M ${(width - 50) / 2 - 30} 20 L ${(width - 50) / 2 + 30} 20 L ${width - 50} 130 L 0 130 Z`}
                fill="url(#page1Asphalt)"
              />
              
              {/* Left & Right border neon stripes */}
              <Line x1={(width - 50) / 2 - 30} y1="20" x2="0" y2="130" stroke="url(#neonGreenBorder)" strokeWidth="3" />
              <Line x1={(width - 50) / 2 + 30} y1="20" x2={width - 50} y2="130" stroke="url(#neonCyanBorder)" strokeWidth="3" />

              {/* Grid landscape lines */}
              {Array.from({ length: 4 }).map((_, idx) => {
                const yVal = 20 + idx * 30;
                const leftX = ((width - 50) / 2 - 30) - (yVal - 20) * 1.5;
                const rightX = ((width - 50) / 2 + 30) + (yVal - 20) * 1.5;
                return (
                  <Line key={idx} x1={leftX} y1={yVal} x2={rightX} y2={yVal} stroke="rgba(0, 245, 255, 0.1)" strokeWidth="1" />
                );
              })}
            </Svg>

            {/* Floating Black Sports Car */}
            <Animated.Image 
              source={require('../assets/images/drive_car.png')} 
              style={[
                styles.page1Car,
                { transform: [{ translateY: carBounce }] }
              ]} 
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ================= PAGE 2 ================= */}
        <View style={styles.page}>
          <View style={styles.page2HeaderWrap}>
            <Text style={styles.page2Heading}>Smart <Text style={styles.cyanText}>Monitoring</Text></Text>
            <Text style={styles.page2Subtitle}>
              Real-time monitoring of your drive to keep you safe on the road.
            </Text>
          </View>

          {/* Top-down Car and connecting indicators */}
          <View style={styles.page2IllustrationContainer}>
            <Svg width={width - 60} height={isSmallDevice ? 210 : 250} viewBox={`0 0 ${width - 60} 250`}>
              <Defs>
                <SvgLinearGradient id="carLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#00f5ff" />
                  <Stop offset="100%" stopColor="#22c55e" />
                </SvgLinearGradient>
                <SvgLinearGradient id="carBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0f172a" />
                  <Stop offset="100%" stopColor="#020617" />
                </SvgLinearGradient>
              </Defs>
              
              {/* Outer radar concentric rings */}
              <Circle cx={(width - 60) / 2} cy="125" r="105" stroke="rgba(0, 245, 255, 0.03)" strokeWidth="1.5" fill="none" />
              <Circle cx={(width - 60) / 2} cy="125" r="85" stroke="rgba(34, 197, 94, 0.05)" strokeWidth="1" strokeDasharray="3 6" fill="none" />
              <Circle cx={(width - 60) / 2} cy="125" r="65" stroke="rgba(0, 245, 255, 0.06)" strokeWidth="1" fill="none" />

              {/* Connecting lines from Car wheels/sides to the UI cards */}
              {/* Harsh Brake Line (Top Left) */}
              <Path d={`M ${(width - 60) / 2 - 25} 70 L 60 50`} stroke="#eab308" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.8} />
              <Circle cx={(width - 60) / 2 - 25} cy="70" r="3" fill="#eab308" />
              <Circle cx="60" cy="50" r="3.5" fill="#eab308" />

              {/* Sharp Turn Line (Top Right) */}
              <Path d={`M ${(width - 60) / 2 + 25} 70 L ${width - 120} 50`} stroke="#22c55e" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.8} />
              <Circle cx={(width - 60) / 2 + 25} cy="70" r="3" fill="#22c55e" />
              <Circle cx={width - 120} cy="50" r="3.5" fill="#22c55e" />

              {/* Phone Usage Line (Bottom Left) */}
              <Path d={`M ${(width - 60) / 2 - 25} 170 L 60 190`} stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.8} />
              <Circle cx={(width - 60) / 2 - 25} cy="170" r="3" fill="#06b6d4" />
              <Circle cx="60" cy="190" r="3.5" fill="#06b6d4" />

              {/* Speed Line (Bottom Right) */}
              <Path d={`M ${(width - 60) / 2 + 25} 170 L ${width - 120} 190`} stroke="#00f5ff" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.8} />
              <Circle cx={(width - 60) / 2 + 25} cy="170" r="3" fill="#00f5ff" />
              <Circle cx={width - 120} cy="190" r="3.5" fill="#00f5ff" />

              {/* Custom top-down vector car body */}
              {/* Outer glowing border */}
              <Path 
                d={`M ${(width - 60) / 2 - 28} 75 C ${(width - 60) / 2 - 28} 50, ${(width - 60) / 2 - 15} 40, ${(width - 60) / 2} 40 C ${(width - 60) / 2 + 15} 40, ${(width - 60) / 2 + 28} 50, ${(width - 60) / 2 + 28} 75 L ${(width - 60) / 2 + 30} 165 C ${(width - 60) / 2 + 30} 195, ${(width - 60) / 2 - 30} 195, ${(width - 60) / 2 - 30} 165 Z`} 
                stroke="url(#carLineGrad)" 
                strokeWidth="2.5" 
                fill="url(#carBodyGrad)" 
              />
              
              {/* Windshield */}
              <Path 
                d={`M ${(width - 60) / 2 - 20} 78 C ${(width - 60) / 2 - 20} 65, ${(width - 60) / 2 + 20} 65, ${(width - 60) / 2 + 20} 78 Z`} 
                fill="#0f172a" 
                stroke="#00f5ff" 
                strokeWidth="1" 
                opacity="0.9" 
              />
              
              {/* Rear Window */}
              <Path 
                d={`M ${(width - 60) / 2 - 18} 145 C ${(width - 60) / 2 - 18} 155, ${(width - 60) / 2 + 18} 155, ${(width - 60) / 2 + 18} 145 Z`} 
                fill="#0f172a" 
                stroke="#00f5ff" 
                strokeWidth="1" 
                opacity="0.8" 
              />

              {/* Headlights (Cyan glowing lines) */}
              <Line x1={(width - 60) / 2 - 24} y1="42" x2={(width - 60) / 2 - 15} y2="40" stroke="#00f5ff" strokeWidth="2.5" />
              <Line x1={(width - 60) / 2 + 24} y1="42" x2={(width - 60) / 2 + 15} y2="40" stroke="#00f5ff" strokeWidth="2.5" />

              {/* Taillights (Red glowing lines) */}
              <Line x1={(width - 60) / 2 - 22} y1="184" x2={(width - 60) / 2 - 12} y2="184" stroke="#ef4444" strokeWidth="2" />
              <Line x1={(width - 60) / 2 + 22} y1="184" x2={(width - 60) / 2 + 12} y2="184" stroke="#ef4444" strokeWidth="2" />

              {/* Car Side Mirrors */}
              <Rect x={(width - 60) / 2 - 34} y="72" width="6" height="10" rx="3" fill="#1e293b" stroke="#00f5ff" strokeWidth="1" />
              <Rect x={(width - 60) / 2 + 28} y="72" width="6" height="10" rx="3" fill="#1e293b" stroke="#00f5ff" strokeWidth="1" />
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

      {/* Bottom Controls Row */}
      <View style={styles.bottomControls}>
        {/* Left Arrow (Previous) */}
        <View style={styles.prevBtnWrapper}>
          {activeIndex > 0 ? (
            <TouchableOpacity style={styles.navTextBtn} onPress={handlePrev}>
              <Feather name="arrow-left" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.navText}>Previous</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>

        {/* Page Dots in Center */}
        <View style={styles.dotsContainer}>
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

        {/* Right Action Button (Next / Get Started) */}
        <View style={styles.nextBtnWrapper}>
          {activeIndex < 2 ? (
            <TouchableOpacity style={styles.circularNextBtn} onPress={handleNext}>
              <LinearGradient
                colors={['#84cc16', '#22c55e']}
                style={styles.circularGradient}
              >
                <Feather name="chevron-right" size={24} color="#040814" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.getStartedButton} onPress={handleFinish}>
              <LinearGradient
                colors={['#00f5ff', '#22c55e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.getStartedGradient}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <Feather name="arrow-right" size={16} color="#040814" style={{ marginLeft: 6 }} />
              </LinearGradient>
            </TouchableOpacity>
          )}
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
  page1IllustrationContainer: {
    height: height * 0.28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallDevice ? 15 : 25,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 10 : 20,
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
    color: '#84cc16',
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
    width: '100%',
    height: 130,
    position: 'relative',
    marginTop: 'auto',
    marginBottom: isSmallDevice ? 65 : 85,
    alignItems: 'center',
  },
  perspectiveRoadSvg: {
    position: 'absolute',
    bottom: 0,
  },
  page1Car: {
    width: width * 0.46,
    height: 90,
    position: 'absolute',
    bottom: 10,
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
    minWidth: 120,
  },
  badgeTopLeft: {
    top: 25,
    left: 0,
  },
  badgeTopRight: {
    top: 25,
    right: 0,
  },
  badgeBottomLeft: {
    bottom: 35,
    left: 0,
  },
  badgeBottomRight: {
    bottom: 35,
    right: 0,
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
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 25,
    position: 'absolute',
    bottom: isSmallDevice ? 20 : 35,
    height: 54,
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
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#1e293b',
  },
  activeDot: {
    width: 14,
    backgroundColor: '#84cc16',
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
  getStartedButton: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  getStartedText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#040814',
  },
});
