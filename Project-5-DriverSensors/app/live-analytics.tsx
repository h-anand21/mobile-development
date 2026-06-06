import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDriveStore } from '../src/store/driveStore';
import { useSensorStore } from '../src/store/sensorStore';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

const MAX_HISTORY = 20;

export default function LiveAnalyticsScreen() {
  const router = useRouter();
  
  // Stores
  const currentSession = useDriveStore((state) => state.currentSession);
  const accelerometerData = useSensorStore((state) => state.accelerometerData);
  const gyroscopeData = useSensorStore((state) => state.gyroscopeData);
  const magnetometerData = useSensorStore((state) => state.magnetometerData);
  const deviceMotionData = useSensorStore((state) => state.deviceMotionData);

  // States for rolling sensor history (for the real-time wave charts)
  const [accelHistory, setAccelHistory] = useState<{x: number[], y: number[], z: number[]}>({ x: [], y: [], z: [] });
  const [gyroHistory, setGyroHistory] = useState<{x: number[], y: number[], z: number[]}>({ x: [], y: [], z: [] });
  const [magnetoHistory, setMagnetoHistory] = useState<{x: number[], y: number[], z: number[]}>({ x: [], y: [], z: [] });

  // Speed data from GPS route
  const route = currentSession?.route || [];
  const currentSpeedMs = route.length > 0 ? route[route.length - 1].speed : 0;
  const currentSpeedKmH = Math.round(currentSpeedMs * 3.6);

  // Speed statistics (calculated dynamically or fallbacks)
  const averageSpeedKmH = route.length > 0
    ? Math.round((route.reduce((acc, p) => acc + p.speed, 0) / route.length) * 3.6)
    : 52;
  const maxSpeedKmH = route.length > 0
    ? Math.round(Math.max(...route.map(p => p.speed)) * 3.6)
    : 92;
  const topSpeedKmH = Math.max(maxSpeedKmH, 98); // top speed of drive

  // Raw sensor values
  const ax = accelerometerData?.x ?? -0.23;
  const ay = accelerometerData?.y ?? 0.41;
  const az = accelerometerData?.z ?? 9.81;

  const gx = gyroscopeData?.x ?? 0.02; // in rad/s
  const gy = gyroscopeData?.y ?? -0.015;
  const gz = gyroscopeData?.z ?? 0.01;

  // Convert gyro from rad/s to deg/s
  const gxDeg = gx * (180 / Math.PI);
  const gyDeg = gy * (180 / Math.PI);
  const gzDeg = gz * (180 / Math.PI);

  const mx = magnetometerData?.x ?? 22.4;
  const my = magnetometerData?.y ?? -15.8;
  const mz = magnetometerData?.z ?? -42.1;

  const dmPitch = deviceMotionData?.rotation?.beta ?? 0.12;
  const dmRoll = deviceMotionData?.rotation?.gamma ?? -0.06;
  const dmYaw = deviceMotionData?.rotation?.alpha ?? 1.58;

  const dmPitchDeg = dmPitch * (180 / Math.PI);
  const dmRollDeg = dmRoll * (180 / Math.PI);
  const dmYawDeg = dmYaw * (180 / Math.PI);

  const dmRotX = deviceMotionData?.rotationRate?.beta ?? 0.002;
  const dmRotY = deviceMotionData?.rotationRate?.gamma ?? -0.001;
  const dmRotZ = deviceMotionData?.rotationRate?.alpha ?? 0.004;

  const dmAccX = deviceMotionData?.acceleration?.x ?? 0.02;
  const dmAccY = deviceMotionData?.acceleration?.y ?? -0.04;
  const dmAccZ = deviceMotionData?.acceleration?.z ?? 0.11;

  const dmAccGravX = deviceMotionData?.accelerationIncludingGravity?.x ?? -0.23;
  const dmAccGravY = deviceMotionData?.accelerationIncludingGravity?.y ?? 9.77;
  const dmAccGravZ = deviceMotionData?.accelerationIncludingGravity?.z ?? 0.88;

  // G-Force Calculations
  // Gravity component: 9.81 m/s^2 is 1G
  const latG = ax / 9.81; // Lateral
  const vertG = (ay - 9.81) / 9.81; // Vertical (subtracting gravity factor roughly)
  const longG = az / 9.81; // Longitudinal
  
  // Linear G-force magnitude (approximate)
  const totalG = Math.sqrt(latG * latG + longG * longG);

  // Update rolling histories
  useEffect(() => {
    if (!currentSession) return;

    setAccelHistory(prev => {
      const nextX = [...prev.x, ax].slice(-MAX_HISTORY);
      const nextY = [...prev.y, ay].slice(-MAX_HISTORY);
      const nextZ = [...prev.z, az].slice(-MAX_HISTORY);
      return { x: nextX, y: nextY, z: nextZ };
    });

    setGyroHistory(prev => {
      const nextX = [...prev.x, gxDeg].slice(-MAX_HISTORY);
      const nextY = [...prev.y, gyDeg].slice(-MAX_HISTORY);
      const nextZ = [...prev.z, gzDeg].slice(-MAX_HISTORY);
      return { x: nextX, y: nextY, z: nextZ };
    });

    setMagnetoHistory(prev => {
      const nextX = [...prev.x, mx].slice(-MAX_HISTORY);
      const nextY = [...prev.y, my].slice(-MAX_HISTORY);
      const nextZ = [...prev.z, mz].slice(-MAX_HISTORY);
      return { x: nextX, y: nextY, z: nextZ };
    });
  }, [accelerometerData, gyroscopeData, magnetometerData, currentSession]);

  // Formulating SVG chart path
  const getPathData = (history: number[], scale: number, height: number) => {
    const pointsCount = history.length;
    if (pointsCount === 0) return `M 0 ${height / 2}`;
    
    return history.map((val, index) => {
      const xPos = (index / (MAX_HISTORY - 1)) * 160; // chart width is 160
      const yPos = (height / 2) - (val * scale);
      const clampedY = Math.max(3, Math.min(height - 3, yPos));
      return `${index === 0 ? 'M' : 'L'} ${xPos.toFixed(1)} ${clampedY.toFixed(1)}`;
    }).join(' ');
  };

  // Speedometer Dial Math
  // Speed maps 0 to 160 km/h
  const speed = currentSpeedKmH || 68;
  const targetSpeed = Math.min(160, speed);
  const angle = 135 + (targetSpeed / 160) * 270; // Map to 135deg - 405deg
  const angleRad = (angle - 90) * (Math.PI / 180);
  const needleLength = 50;
  const needleX = 100 + needleLength * Math.cos(angleRad);
  const needleY = 100 + needleLength * Math.sin(angleRad);

  // G-Force Radar coordinate positioning
  // Center is (50, 50), Max display value is 1G (50px boundary)
  const radarScale = 40; // 1G = 40px offset
  const rx = 50 + latG * radarScale;
  const ry = 50 - longG * radarScale;
  // Clamp within boundary circle (radius 40)
  const dist = Math.sqrt((rx - 50) * (rx - 50) + (ry - 50) * (ry - 50));
  let clampedRx = rx;
  let clampedRy = ry;
  if (dist > 40) {
    clampedRx = 50 + ((rx - 50) / dist) * 40;
    clampedRy = 50 + ((ry - 50) / dist) * 40;
  }

  // Start & Est. End times
  const startTimeStr = currentSession 
    ? dayjs(currentSession.startTime).format('hh:mm A') 
    : '08:15 AM';
  const endTimeStr = currentSession 
    ? dayjs(currentSession.startTime + 42 * 60000).format('hh:mm A') // mock 42 mins duration
    : '08:57 AM';

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Live Analytics</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: currentSession ? '#06b6d4' : '#64748b' }]} />
            <Text style={[styles.statusText, { color: currentSession ? '#06b6d4' : '#94a3b8' }]}>
              {currentSession ? 'Drive in Progress' : 'No Active Session'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconCircle}>
          <Feather name="info" size={20} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Speed Stats Section (Gauge & Indicators) */}
        <View style={styles.speedStatsSection}>
          <View style={styles.speedLeftCol}>
            <Text style={styles.speedTextLabel}>CURRENT SPEED</Text>
            <Text style={styles.speedValue}>{speed}</Text>
            <Text style={styles.speedUnit}>km/h</Text>
            
            <View style={styles.speedLimitCapsule}>
              <Text style={styles.speedLimitText}>Speed Limit 80 km/h</Text>
            </View>
          </View>

          {/* Speedometer Gauge Dial */}
          <View style={styles.speedGaugeContainer}>
            <Svg width={180} height={180} viewBox="0 0 200 200">
              <Defs>
                <SvgLinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#06b6d4" />
                  <Stop offset="50%" stopColor="#22c55e" />
                  <Stop offset="100%" stopColor="#eab308" />
                </SvgLinearGradient>
              </Defs>
              {/* Outer dial track */}
              <Circle 
                cx="100" cy="100" r="75" 
                stroke="#121e33" 
                strokeWidth="6" 
                fill="none" 
                strokeDasharray="353" 
                strokeDashoffset="0" 
                strokeLinecap="round" 
                transform="rotate(135 100 100)"
              />
              {/* Active track */}
              <Circle 
                cx="100" cy="100" r="75" 
                stroke="url(#gaugeGrad)" 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray="353" 
                strokeDashoffset={353 - (353 * (targetSpeed / 160))} 
                strokeLinecap="round" 
                transform="rotate(135 100 100)"
              />
              
              {/* Needle pivot */}
              <Circle cx="100" cy="100" r="10" fill="#080f1a" stroke="#06b6d4" strokeWidth="2" />
              
              {/* Speed Needle */}
              <Line 
                x1="100" y1="100" 
                x2={needleX} y2={needleY} 
                stroke="#06b6d4" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              <Circle cx={needleX} cy={needleY} r="2" fill="#06b6d4" />

              {/* Speed Dial ticks & markers */}
              <Text style={styles.dialTickLabel} x="45" y="155">0</Text>
              <Text style={styles.dialTickLabel} x="35" y="95">40</Text>
              <Text style={styles.dialTickLabel} x="100" y="45">80</Text>
              <Text style={styles.dialTickLabel} x="150" y="95">120</Text>
              <Text style={styles.dialTickLabel} x="140" y="155">160</Text>
            </Svg>
          </View>

          {/* Speed Right Col */}
          <View style={styles.speedRightCol}>
            <View style={styles.sideSpeedStat}>
              <Text style={styles.sideLabel}>AVERAGE SPEED</Text>
              <Text style={styles.sideVal}>{averageSpeedKmH} <Text style={styles.sideValUnit}>km/h</Text></Text>
            </View>
            <View style={styles.sideSpeedStat}>
              <Text style={styles.sideLabel}>MAX SPEED</Text>
              <Text style={styles.sideVal}>{maxSpeedKmH} <Text style={styles.sideValUnit}>km/h</Text></Text>
            </View>
            <View style={styles.sideSpeedStat}>
              <Text style={styles.sideLabel}>TOP SPEED</Text>
              <Text style={styles.sideVal}>{topSpeedKmH} <Text style={styles.sideValUnit}>km/h</Text></Text>
            </View>
          </View>
        </View>

        {/* Section Header: SENSOR VALUES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>SENSOR VALUES</Text>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="chevron-right" size={14} color="#06b6d4" />
          </TouchableOpacity>
        </View>

        {/* Accelerometer Sensor Card */}
        <View style={styles.sensorCard}>
          <View style={styles.sensorLeftCol}>
            <View style={styles.sensorIconCircle}>
              <MaterialCommunityIcons name="pulse" size={20} color="#0ea5e9" />
            </View>
            <Text style={styles.sensorCardTitle}>ACCELEROMETER</Text>
            
            <View style={styles.axisValueRow}>
              <View style={[styles.axisDot, { backgroundColor: '#06b6d4' }]} />
              <Text style={styles.axisLabel}>X  <Text style={styles.axisVal}>{ax.toFixed(2)}</Text> m/s²</Text>
            </View>
            <View style={styles.axisValueRow}>
              <View style={[styles.axisDot, { backgroundColor: '#84cc16' }]} />
              <Text style={styles.axisLabel}>Y  <Text style={styles.axisVal}>{ay.toFixed(2)}</Text> m/s²</Text>
            </View>
            <View style={styles.axisValueRow}>
              <View style={[styles.axisDot, { backgroundColor: '#eab308' }]} />
              <Text style={styles.axisLabel}>Z  <Text style={styles.axisVal}>{az.toFixed(2)}</Text> m/s²</Text>
            </View>
          </View>

          {/* Real-time Rolling Waveform Chart */}
          <View style={styles.sensorChartContainer}>
            <Svg width={160} height={70} viewBox="0 0 160 70">
              {/* Horizontal grid guide */}
              <Line x1="0" y1="35" x2="160" y2="35" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="3 3" />
              <Text style={styles.chartAxisTick} x="0" y="15">2</Text>
              <Text style={styles.chartAxisTick} x="0" y="40">0</Text>
              <Text style={styles.chartAxisTick} x="0" y="65">-2</Text>
              
              {/* Paths representing histories (scale factor 8) */}
              <Path d={getPathData(accelHistory.x, 8, 70)} stroke="#06b6d4" strokeWidth="1.5" fill="none" />
              <Path d={getPathData(accelHistory.y, 8, 70)} stroke="#84cc16" strokeWidth="1.5" fill="none" />
              <Path d={getPathData(accelHistory.z - 9.81 ? accelHistory.z.map(z => z - 9.81) : [], 8, 70)} stroke="#eab308" strokeWidth="1.5" fill="none" />
            </Svg>
          </View>
        </View>

        {/* Gyroscope Sensor Card */}
        <View style={styles.sensorCard}>
          <View style={styles.sensorLeftCol}>
            <View style={[styles.sensorIconCircle, { borderColor: 'rgba(34, 197, 94, 0.2)' }]}>
              <MaterialCommunityIcons name="orbit" size={20} color="#84cc16" />
            </View>
            <Text style={styles.sensorCardTitle}>GYROSCOPE</Text>
            
            <View style={styles.axisValueRow}>
              <View style={[styles.axisDot, { backgroundColor: '#06b6d4' }]} />
              <Text style={styles.axisLabel}>X  <Text style={styles.axisVal}>{gxDeg.toFixed(1)}</Text> °/s</Text>
            </View>
            <View style={styles.axisValueRow}>
              <View style={[styles.axisDot, { backgroundColor: '#84cc16' }]} />
              <Text style={styles.axisLabel}>Y  <Text style={styles.axisVal}>{gyDeg.toFixed(1)}</Text> °/s</Text>
            </View>
            <View style={styles.axisValueRow}>
              <View style={[styles.axisDot, { backgroundColor: '#eab308' }]} />
              <Text style={styles.axisLabel}>Z  <Text style={styles.axisVal}>{gzDeg.toFixed(1)}</Text> °/s</Text>
            </View>
          </View>

          {/* Gyro rolling chart (scale factor 0.3) */}
          <View style={styles.sensorChartContainer}>
            <Svg width={160} height={70} viewBox="0 0 160 70">
              <Line x1="0" y1="35" x2="160" y2="35" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="3 3" />
              <Text style={styles.chartAxisTick} x="0" y="15">2</Text>
              <Text style={styles.chartAxisTick} x="0" y="40">0</Text>
              <Text style={styles.chartAxisTick} x="0" y="65">-2</Text>

              <Path d={getPathData(gyroHistory.x, 0.3, 70)} stroke="#06b6d4" strokeWidth="1.5" fill="none" />
              <Path d={getPathData(gyroHistory.y, 0.3, 70)} stroke="#84cc16" strokeWidth="1.5" fill="none" />
              <Path d={getPathData(gyroHistory.z, 0.3, 70)} stroke="#eab308" strokeWidth="1.5" fill="none" />
            </Svg>
          </View>
        </View>

        {/* Magnetometer Sensor Card */}
        {(() => {
          const heading = Math.round(Math.atan2(my, mx) * (180 / Math.PI));
          const normalizedHeading = heading < 0 ? heading + 360 : heading;
          const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
          const cardinalIndex = Math.round(normalizedHeading / 45) % 8;
          const cardinal = cardinals[cardinalIndex];

          return (
            <View style={styles.sensorCard}>
              <View style={[styles.sensorLeftCol, { width: '35%' }]}>
                <View style={[styles.sensorIconCircle, { borderColor: 'rgba(234, 179, 8, 0.2)', backgroundColor: 'rgba(234, 179, 8, 0.05)' }]}>
                  <MaterialCommunityIcons name="compass-outline" size={20} color="#eab308" />
                </View>
                <Text style={styles.sensorCardTitle}>MAGNETOMETER</Text>
                
                <View style={styles.axisValueRow}>
                  <View style={[styles.axisDot, { backgroundColor: '#06b6d4' }]} />
                  <Text style={styles.axisLabel}>X  <Text style={styles.axisVal}>{mx.toFixed(1)}</Text> µT</Text>
                </View>
                <View style={styles.axisValueRow}>
                  <View style={[styles.axisDot, { backgroundColor: '#84cc16' }]} />
                  <Text style={styles.axisLabel}>Y  <Text style={styles.axisVal}>{my.toFixed(1)}</Text> µT</Text>
                </View>
                <View style={styles.axisValueRow}>
                  <View style={[styles.axisDot, { backgroundColor: '#eab308' }]} />
                  <Text style={styles.axisLabel}>Z  <Text style={styles.axisVal}>{mz.toFixed(1)}</Text> µT</Text>
                </View>
              </View>

              {/* Dynamic SVG Compass Dial */}
              <View style={{ width: '25%', alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={52} height={52} viewBox="0 0 80 80">
                  <Circle cx="40" cy="40" r="32" stroke="#122540" strokeWidth="2.5" fill="#050B14" />
                  <SvgText x="40" y="16" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">N</SvgText>
                  <SvgText x="40" y="72" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">S</SvgText>
                  <SvgText x="13" y="44" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">W</SvgText>
                  <SvgText x="67" y="44" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">E</SvgText>
                  <g transform={`rotate(${-normalizedHeading} 40 40)`}>
                    <Polygon points="40,16 45,40 35,40" fill="#ef4444" />
                    <Polygon points="40,64 45,40 35,40" fill="#94a3b8" />
                    <Circle cx="40" cy="40" r="3.5" fill="#ffffff" />
                  </g>
                </Svg>
                <Text style={{ color: '#eab308', fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>
                  {normalizedHeading}° {cardinal}
                </Text>
              </View>

              {/* Magnetometer rolling chart */}
              <View style={[styles.sensorChartContainer, { width: '38%' }]}>
                <Svg width={120} height={70} viewBox="0 0 160 70">
                  <Line x1="0" y1="35" x2="160" y2="35" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="3 3" />
                  <Path d={getPathData(magnetoHistory.x, 0.3, 70)} stroke="#06b6d4" strokeWidth="1.5" fill="none" />
                  <Path d={getPathData(magnetoHistory.y, 0.3, 70)} stroke="#84cc16" strokeWidth="1.5" fill="none" />
                  <Path d={getPathData(magnetoHistory.z, 0.3, 70)} stroke="#eab308" strokeWidth="1.5" fill="none" />
                </Svg>
              </View>
            </View>
          );
        })()}

        {/* G-FORCE Section */}
        <View style={styles.gForceCard}>
          <Text style={styles.gForceHeader}>G-FORCE</Text>
          
          <View style={styles.gForceRow}>
            {/* Crosshair radar logo */}
            <View style={styles.gForceIconOuter}>
              <MaterialCommunityIcons name="target" size={24} color="#eab308" />
            </View>

            {/* Circular G-force gauge */}
            <View style={styles.gForceGaugeWrap}>
              <Svg width={90} height={90} viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="40" stroke="#121e33" strokeWidth="4" fill="none" />
                <Circle 
                  cx="50" cy="50" r="40" 
                  stroke="#06b6d4" 
                  strokeWidth="5" 
                  fill="none"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (251 * Math.min(1.0, totalG))}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </Svg>
              <View style={styles.gForceInnerValue}>
                <Text style={styles.gForceNumText}>{totalG.toFixed(2)}</Text>
                <Text style={styles.gForceUnitText}>G</Text>
              </View>
            </View>

            {/* Axis G-forces labels */}
            <View style={styles.gForceLabelColumn}>
              <Text style={styles.gForceAxisLabel}>LATERAL</Text>
              <Text style={styles.gForceAxisValueCyan}>{latG.toFixed(2)} G</Text>
              
              <Text style={styles.gForceAxisLabel}>VERTICAL</Text>
              <Text style={styles.gForceAxisValueGreen}>{vertG.toFixed(2)} G</Text>

              <Text style={styles.gForceAxisLabel}>LONGITUDINAL</Text>
              <Text style={styles.gForceAxisValueYellow}>{longG.toFixed(2)} G</Text>
            </View>

            {/* G-Force Crosshair Radar Graphic */}
            <View style={styles.radarContainer}>
              <Svg width={90} height={90} viewBox="0 0 100 100">
                {/* Concentric grid circles */}
                <Circle cx="50" cy="50" r="40" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" fill="none" />
                <Circle cx="50" cy="50" r="25" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="1" fill="none" />
                <Circle cx="50" cy="50" r="10" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="1" fill="none" />
                {/* Crosshair lines */}
                <Line x1="10" y1="50" x2="90" y2="50" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />
                <Line x1="50" y1="10" x2="50" y2="90" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />
                
                {/* Center dot */}
                <Circle cx="50" cy="50" r="3" fill="#06b6d4" />
                
                {/* Live Position dot (glowing) */}
                <Circle 
                  cx={clampedRx} 
                  cy={clampedRy} 
                  r="5" 
                  fill="#06b6d4"
                  shadowColor="#06b6d4"
                  shadowOpacity="0.8"
                  shadowRadius="5"
                />
              </Svg>
            </View>
        </View>

        {/* Device Motion Diagnostics Card */}
        <View style={styles.gForceCard}>
          <Text style={styles.gForceHeader}>DEVICE MOTION DIAGNOSTICS</Text>
          
          <View style={styles.dmRow}>
            {/* 1. Attitude / Horizon indicator */}
            <View style={styles.dmColAttitude}>
              <View style={styles.horizonIndicatorWrap}>
                <Svg width={66} height={66} viewBox="0 0 80 80">
                  <Defs>
                    <clipPath id="horizonClip">
                      <Circle cx="40" cy="40" r="30" />
                    </clipPath>
                  </Defs>
                  {/* Outer bezel */}
                  <Circle cx="40" cy="40" r="32" stroke="#122540" strokeWidth="2.5" fill="none" />
                  <Circle cx="40" cy="40" r="30" fill="#000000" />
                  
                  {/* Rotating/translating sky-ground plane */}
                  <g clipPath="url(#horizonClip)" transform={`rotate(${-dmRollDeg} 40 40) translate(0 ${Math.min(18, Math.max(-18, dmPitch * 18))})`}>
                    {/* Sky */}
                    <Rect x="-20" y="-20" width="120" height="60" fill="#0b2447" />
                    {/* Ground */}
                    <Rect x="-20" y="40" width="120" height="60" fill="#1b4235" />
                    {/* Horizon line */}
                    <Line x1="-20" y1="40" x2="100" y2="40" stroke="#00f5ff" strokeWidth="1.5" />
                  </g>
                  {/* Pitch indicator ticks */}
                  <Line x1="32" y1="28" x2="48" y2="28" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <Line x1="32" y1="52" x2="48" y2="52" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  
                  {/* Center fixed miniature aircraft */}
                  <Circle cx="40" cy="40" r="2" fill="#ef4444" />
                  <Line x1="26" y1="40" x2="34" y2="40" stroke="#ef4444" strokeWidth="2" />
                  <Line x1="46" y1="40" x2="54" y2="40" stroke="#ef4444" strokeWidth="2" />
                </Svg>
              </View>
              <View style={styles.dmValLabelContainer}>
                <Text style={styles.dmValLabel}>PITCH: <Text style={styles.dmValText}>{dmPitchDeg.toFixed(1)}°</Text></Text>
                <Text style={styles.dmValLabel}>ROLL: <Text style={styles.dmValText}>{dmRollDeg.toFixed(1)}°</Text></Text>
                <Text style={styles.dmValLabel}>YAW: <Text style={styles.dmValText}>{dmYawDeg.toFixed(1)}°</Text></Text>
              </View>
            </View>

            {/* 2. Rotation Rate column */}
            <View style={styles.dmColRate}>
              <Text style={styles.dmSubHeader}>ROTATION RATE</Text>
              
              <View style={styles.dmStatRow}>
                <Text style={styles.dmStatLabel}>Pitch (X)</Text>
                <Text style={styles.dmStatValue}>{dmRotX.toFixed(3)} <Text style={styles.dmStatUnit}>rad/s</Text></Text>
              </View>
              <View style={styles.dmStatRow}>
                <Text style={styles.dmStatLabel}>Roll (Y)</Text>
                <Text style={styles.dmStatValue}>{dmRotY.toFixed(3)} <Text style={styles.dmStatUnit}>rad/s</Text></Text>
              </View>
              <View style={styles.dmStatRow}>
                <Text style={styles.dmStatLabel}>Yaw (Z)</Text>
                <Text style={styles.dmStatValue}>{dmRotZ.toFixed(3)} <Text style={styles.dmStatUnit}>rad/s</Text></Text>
              </View>
            </View>

            {/* 3. Raw Acceleration columns */}
            <View style={styles.dmColAccel}>
              <Text style={styles.dmSubHeader}>LINEAR ACCEL</Text>
              <Text style={styles.dmAccelVal}>X: <Text style={styles.dmValText}>{dmAccX.toFixed(2)}</Text> <Text style={styles.dmStatUnit}>m/s²</Text></Text>
              <Text style={styles.dmAccelVal}>Y: <Text style={styles.dmValText}>{dmAccY.toFixed(2)}</Text> <Text style={styles.dmStatUnit}>m/s²</Text></Text>
              <Text style={styles.dmAccelVal}>Z: <Text style={styles.dmValText}>{dmAccZ.toFixed(2)}</Text> <Text style={styles.dmStatUnit}>m/s²</Text></Text>

              <Text style={[styles.dmSubHeader, { marginTop: 6 }]}>ACCEL (+G)</Text>
              <Text style={styles.dmAccelVal}>X: <Text style={styles.dmValText}>{dmAccGravX.toFixed(2)}</Text> <Text style={styles.dmStatUnit}>m/s²</Text></Text>
              <Text style={styles.dmAccelVal}>Y: <Text style={styles.dmValText}>{dmAccGravY.toFixed(2)}</Text> <Text style={styles.dmStatUnit}>m/s²</Text></Text>
              <Text style={styles.dmAccelVal}>Z: <Text style={styles.dmValText}>{dmAccGravZ.toFixed(2)}</Text> <Text style={styles.dmStatUnit}>m/s²</Text></Text>
            </View>
          </View>
        </View>

        {/* MAP PREVIEW Section */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeaderRow}>
            <Text style={styles.mapTitle}>MAP PREVIEW</Text>
            <View style={styles.liveLocationContainer}>
              <View style={styles.blueLocationDot} />
              <Text style={styles.liveLocationText}>Live Location</Text>
            </View>
          </View>

          {/* Simulated Dark Grid Map */}
          <View style={styles.simulatedMap}>
            {/* Grid overlay */}
            <Svg width="100%" height="150" style={styles.mapSvgBackground}>
              {/* Draw roads */}
              <Path 
                d="M -20 120 Q 100 80, 200 40 T 400 20" 
                stroke="#121e33" 
                strokeWidth="8" 
                fill="none" 
              />
              <Path 
                d="M -20 120 Q 100 80, 200 40 T 400 20" 
                stroke="#0f172a" 
                strokeWidth="4" 
                fill="none" 
              />
              
              {/* Route segment */}
              <Path 
                d="M 20 115 Q 110 78, 195 41" 
                stroke="#06b6d4" 
                strokeWidth="4" 
                fill="none" 
                opacity="0.85"
              />
              <Path 
                d="M 195 41 Q 250 30, 320 25" 
                stroke="#84cc16" 
                strokeWidth="4" 
                fill="none" 
                opacity="0.85"
              />

              {/* Cursor / Car position marker (chevron pointer) */}
              <Path 
                d="M 195 41 L 188 47 L 195 44 L 202 47 Z" 
                fill="#00e5ff" 
                shadowColor="#00e5ff"
                shadowRadius="10"
                transform="rotate(65 195 41)"
              />
              <Circle cx="195" cy="41" r="8" fill="rgba(6, 182, 212, 0.3)" />
            </Svg>

            {/* Start point details overlay */}
            <View style={[styles.mapOverlayLabel, styles.startOverlay]}>
              <View style={[styles.tinyDot, { backgroundColor: '#84cc16' }]} />
              <Text style={styles.overlayTime}>{startTimeStr}</Text>
              <Text style={styles.overlayAddr}>MG Road, Delhi</Text>
            </View>

            {/* Est. End details overlay */}
            <View style={[styles.mapOverlayLabel, styles.endOverlay]}>
              <View style={[styles.tinyDot, { backgroundColor: '#eab308' }]} />
              <Text style={styles.overlayTime}>{endTimeStr}</Text>
              <Text style={styles.overlayAddr}>Connaught Place</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSpacer: {
    height: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#050B14',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Speed Stats Section
  speedStatsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 15, 26, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#121e33',
    padding: 16,
    marginBottom: 25,
  },
  speedLeftCol: {
    width: '28%',
    alignItems: 'center',
  },
  speedTextLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  speedValue: {
    color: '#06b6d4',
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
  },
  speedUnit: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  speedLimitCapsule: {
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  speedLimitText: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: 'bold',
  },
  speedGaugeContainer: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialTickLabel: {
    fill: '#475569',
    fontSize: 10,
    fontWeight: 'bold',
    textAnchor: 'middle',
  },
  speedRightCol: {
    width: '28%',
    justifyContent: 'center',
  },
  sideSpeedStat: {
    marginBottom: 10,
  },
  sideLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sideVal: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sideValUnit: {
    color: '#64748b',
    fontSize: 10,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },

  // Sensor Cards
  sensorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#080f1a',
    borderWidth: 1,
    borderColor: '#121e33',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sensorLeftCol: {
    width: '50%',
  },
  sensorIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(14, 165, 233, 0.2)',
    backgroundColor: 'rgba(14, 165, 233, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sensorCardTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  axisValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  axisDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  axisLabel: {
    color: '#94a3b8',
    fontSize: 10,
  },
  axisVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sensorChartContainer: {
    width: '48%',
    height: 70,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chartAxisTick: {
    fill: '#334155',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // G-Force Card
  gForceCard: {
    backgroundColor: '#080f1a',
    borderWidth: 1,
    borderColor: '#121e33',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  gForceHeader: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  gForceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gForceIconOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gForceGaugeWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gForceInnerValue: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gForceNumText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gForceUnitText: {
    color: '#64748b',
    fontSize: 9,
  },
  gForceLabelColumn: {
    width: '32%',
  },
  gForceAxisLabel: {
    color: '#64748b',
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  gForceAxisValueCyan: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  gForceAxisValueGreen: {
    color: '#84cc16',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  gForceAxisValueYellow: {
    color: '#eab308',
    fontSize: 11,
    fontWeight: 'bold',
  },
  radarContainer: {
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: '#050B14',
  },

  // Map Card
  mapCard: {
    backgroundColor: '#080f1a',
    borderWidth: 1,
    borderColor: '#121e33',
    borderRadius: 20,
    padding: 16,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  liveLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blueLocationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e5ff',
    marginRight: 6,
  },
  liveLocationText: {
    color: '#00e5ff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  simulatedMap: {
    height: 150,
    backgroundColor: '#050b14',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#121e33',
  },
  mapSvgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapOverlayLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(12, 22, 38, 0.85)',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    minWidth: 100,
  },
  startOverlay: {
    bottom: 12,
    left: 12,
  },
  endOverlay: {
    top: 12,
    right: 12,
  },
  tinyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginBottom: 3,
  },
  overlayTime: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  overlayAddr: {
    color: '#94a3b8',
    fontSize: 8,
  },
  dmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dmColAttitude: {
    width: '33%',
    alignItems: 'center',
  },
  dmColRate: {
    width: '32%',
    paddingLeft: 4,
  },
  dmColAccel: {
    width: '33%',
    paddingLeft: 6,
  },
  horizonIndicatorWrap: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmValLabelContainer: {
    alignItems: 'center',
  },
  dmValLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dmValText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dmSubHeader: {
    color: '#06b6d4',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dmStatRow: {
    marginBottom: 6,
  },
  dmStatLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '500',
  },
  dmStatValue: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 1,
  },
  dmStatUnit: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '400',
  },
  dmAccelVal: {
    color: '#64748b',
    fontSize: 9.5,
    marginBottom: 2,
  },
});
