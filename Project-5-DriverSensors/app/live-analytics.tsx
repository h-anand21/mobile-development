import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Defs, LinearGradient as SvgLinearGradient, Stop, G, Polygon, Text as SvgText, Rect, ClipPath } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDriveStore } from '../src/store/driveStore';
import { useSensorStore } from '../src/store/sensorStore';
import { driveRepository } from '../src/database/repositories/driveRepository';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope, Magnetometer, DeviceMotion } from 'expo-sensors';
import dayjs from 'dayjs';
import { useAppTheme } from '../src/ui/theme';

const { width } = Dimensions.get('window');

const MAX_HISTORY = 20;

export default function LiveAnalyticsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors);
  
  // Stores
  const currentSession = useDriveStore((state) => state.currentSession);
  const accelerometerData = useSensorStore((state) => state.accelerometerData);
  const gyroscopeData = useSensorStore((state) => state.gyroscopeData);
  const magnetometerData = useSensorStore((state) => state.magnetometerData);
  const deviceMotionData = useSensorStore((state) => state.deviceMotionData);

  // Local sensor & location states when no drive is in progress
  const [localLocation, setLocalLocation] = useState<Location.LocationObject | null>(null);
  const [localAccel, setLocalAccel] = useState<any>(null);
  const [localGyro, setLocalGyro] = useState<any>(null);
  const [localMagneto, setLocalMagneto] = useState<any>(null);
  const [localDeviceMotion, setLocalDeviceMotion] = useState<any>(null);

  // Clock state for current time overlay when session is inactive
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Local speed points tracking for live session calculations when drive is inactive
  const [localSpeedPoints, setLocalSpeedPoints] = useState<number[]>([]);

  // States for rolling sensor history (for the real-time wave charts)
  const [accelHistory, setAccelHistory] = useState<{x: number[], y: number[], z: number[]}>({ x: [], y: [], z: [] });
  const [gyroHistory, setGyroHistory] = useState<{x: number[], y: number[], z: number[]}>({ x: [], y: [], z: [] });
  const [magnetoHistory, setMagnetoHistory] = useState<{x: number[], y: number[], z: number[]}>({ x: [], y: [], z: [] });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update local speed tracking for live averages when session is inactive
  useEffect(() => {
    if (currentSession) {
      setLocalSpeedPoints([]);
      return;
    }
    if (localLocation) {
      const speedMs = localLocation.coords.speed !== null && localLocation.coords.speed >= 0 
        ? localLocation.coords.speed 
        : 0;
      const speedKmH = Math.round(speedMs * 3.6);
      setLocalSpeedPoints(prev => [...prev, speedKmH]);
    }
  }, [localLocation, currentSession]);

  // Set up local subscriptions if there is no active drive session
  useEffect(() => {
    let locationSub: Location.LocationSubscription | null = null;
    let accelSub: any = null;
    let gyroSub: any = null;
    let magnetoSub: any = null;
    let dmSub: any = null;

    const startLocalSubscriptions = async () => {
      // If drive is in progress, do not double-subscribe to avoid battery drain
      if (currentSession) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const initialLoc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocalLocation(initialLoc);
        } catch (err) {
          console.warn('Could not get initial position inside live-analytics:', err);
        }

        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (loc) => {
            setLocalLocation(loc);
          }
        );
      }

      // Start sensors
      Accelerometer.setUpdateInterval(500);
      accelSub = Accelerometer.addListener((data) => {
        setLocalAccel(data);
      });

      Gyroscope.setUpdateInterval(500);
      gyroSub = Gyroscope.addListener((data) => {
        setLocalGyro(data);
      });

      Magnetometer.setUpdateInterval(500);
      magnetoSub = Magnetometer.addListener((data) => {
        setLocalMagneto(data);
      });

      DeviceMotion.setUpdateInterval(500);
      dmSub = DeviceMotion.addListener((data) => {
        setLocalDeviceMotion(data);
      });
    };

    startLocalSubscriptions();

    return () => {
      if (locationSub) locationSub.remove();
      if (accelSub) accelSub.remove();
      if (gyroSub) gyroSub.remove();
      if (magnetoSub) magnetoSub.remove();
      if (dmSub) dmSub.remove();
    };
  }, [currentSession]);

  // Merge dynamic live data (active session vs local sensors)
  const accel = currentSession ? accelerometerData : localAccel;
  const gyro = currentSession ? gyroscopeData : localGyro;
  const magneto = currentSession ? magnetometerData : localMagneto;
  const dm = currentSession ? deviceMotionData : localDeviceMotion;

  // Raw sensor values
  const ax = accel?.x ?? 0.0;
  const ay = accel?.y ?? 0.0;
  const az = accel?.z ?? 9.81; // Gravity factor fallback along Z

  const gx = gyro?.x ?? 0.0;
  const gy = gyro?.y ?? 0.0;
  const gz = gyro?.z ?? 0.0;

  // Convert gyro from rad/s to deg/s
  const gxDeg = gx * (180 / Math.PI);
  const gyDeg = gy * (180 / Math.PI);
  const gzDeg = gz * (180 / Math.PI);

  const mx = magneto?.x ?? 0.0;
  const my = magneto?.y ?? 0.0;
  const mz = magneto?.z ?? 0.0;

  const dmPitch = dm?.rotation?.beta ?? 0.0;
  const dmRoll = dm?.rotation?.gamma ?? 0.0;
  const dmYaw = dm?.rotation?.alpha ?? 0.0;

  const dmPitchDeg = dmPitch * (180 / Math.PI);
  const dmRollDeg = dmRoll * (180 / Math.PI);
  const dmYawDeg = dmYaw * (180 / Math.PI);

  const dmRotX = dm?.rotationRate?.beta ?? 0.0;
  const dmRotY = dm?.rotationRate?.gamma ?? 0.0;
  const dmRotZ = dm?.rotationRate?.alpha ?? 0.0;

  const dmAccX = dm?.acceleration?.x ?? 0.0;
  const dmAccY = dm?.acceleration?.y ?? 0.0;
  const dmAccZ = dm?.acceleration?.z ?? 0.0;

  const dmAccGravX = dm?.accelerationIncludingGravity?.x ?? 0.0;
  const dmAccGravY = dm?.accelerationIncludingGravity?.y ?? 9.81;
  const dmAccGravZ = dm?.accelerationIncludingGravity?.z ?? 0.0;

  // G-Force Calculations
  const latG = ax / 9.81; // Lateral
  const vertG = (ay - 9.81) / 9.81; // Vertical (subtracting gravity factor roughly)
  const longG = az / 9.81; // Longitudinal
  
  // Linear G-force magnitude (approximate)
  const totalG = Math.sqrt(latG * latG + longG * longG);

  // Update rolling histories
  useEffect(() => {
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
  }, [ax, ay, az, gxDeg, gyDeg, gzDeg, mx, my, mz]);

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

  // Speed data and calculations
  const route = currentSession?.route || [];
  const currentSpeedKmH = route.length > 0 ? Math.round(route[route.length - 1].speed * 3.6) : 0;
  
  // Resolved dynamic speed
  const speed = currentSession 
    ? currentSpeedKmH 
    : (localLocation?.coords.speed !== null && (localLocation?.coords.speed ?? -1) >= 0 ? Math.round((localLocation?.coords.speed ?? 0) * 3.6) : 0);
  const targetSpeed = Math.min(160, speed);
  const angle = 135 + (targetSpeed / 160) * 270; // Map to 135deg - 405deg
  const angleRad = angle * (Math.PI / 180); // Trigonometric rotation angle mapping
  const needleLength = 50;
  const needleX = 100 + needleLength * Math.cos(angleRad);
  const needleY = 100 + needleLength * Math.sin(angleRad);

  // Load drive history to find all-time top speed
  const allTimeTopSpeed = React.useMemo(() => {
    try {
      const drives = driveRepository.getAllDrives();
      let maxSpeed = 0;
      drives.forEach(d => {
        if (d.route && d.route.length > 0) {
          const driveMax = Math.max(...d.route.map(p => p.speed));
          const driveMaxKmH = Math.round(driveMax * 3.6);
          if (driveMaxKmH > maxSpeed) maxSpeed = driveMaxKmH;
        }
      });
      return maxSpeed;
    } catch (err) {
      console.error("Failed to load all-time top speed:", err);
      return 0;
    }
  }, [currentSession]);

  // Speed statistics
  const averageSpeedKmH = currentSession 
    ? (route.length > 0 ? Math.round((route.reduce((acc, p) => acc + p.speed, 0) / route.length) * 3.6) : 0)
    : (localSpeedPoints.length > 0 ? Math.round(localSpeedPoints.reduce((a, b) => a + b, 0) / localSpeedPoints.length) : 0);

  const maxSpeedKmH = currentSession 
    ? (route.length > 0 ? Math.round(Math.max(...route.map(p => p.speed)) * 3.6) : 0)
    : (localSpeedPoints.length > 0 ? Math.max(...localSpeedPoints) : 0);

  const topSpeedKmH = Math.max(allTimeTopSpeed, maxSpeedKmH);

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
    : '--:--';
  const endTimeStr = currentSession && currentSession.duration > 0
    ? dayjs(currentSession.startTime + currentSession.duration * 1000).format('hh:mm A')
    : '--:--';

  // Memoize route points projected to 300x150 viewBox
  const mapPoints = React.useMemo(() => {
    // Collect coordinates
    let coords: { latitude: number; longitude: number }[] = [];
    if (currentSession && currentSession.route && currentSession.route.length > 0) {
      coords = currentSession.route;
    } else if (localLocation) {
      coords = [{ latitude: localLocation.coords.latitude, longitude: localLocation.coords.longitude }];
    }

    if (coords.length === 0) return [];

    if (coords.length === 1) {
      // Just one point (center it in the 300x150 box)
      return [{ x: 150, y: 75, latitude: coords[0].latitude, longitude: coords[0].longitude }];
    }

    // Bounding box calculation
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    coords.forEach(pt => {
      if (pt.latitude < minLat) minLat = pt.latitude;
      if (pt.latitude > maxLat) maxLat = pt.latitude;
      if (pt.longitude < minLon) minLon = pt.longitude;
      if (pt.longitude > maxLon) maxLon = pt.longitude;
    });

    const latSpan = maxLat - minLat;
    const lonSpan = maxLon - minLon;
    const maxSpan = Math.max(latSpan, lonSpan);
    
    // Scale to fit 300x150 with 30px padding
    const scale = maxSpan > 0 ? 100 / maxSpan : 1;
    const centerLon = minLon + lonSpan / 2;
    const centerLat = minLat + latSpan / 2;

    return coords.map(pt => ({
      x: 150 + (pt.longitude - centerLon) * scale,
      y: 75 - (pt.latitude - centerLat) * scale,
      latitude: pt.latitude,
      longitude: pt.longitude
    }));
  }, [currentSession?.route, localLocation]);

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
              <Text style={styles.speedLimitText} numberOfLines={1} adjustsFontSizeToFit={true}>Speed Limit 80 km/h</Text>
            </View>
          </View>

          {/* Speedometer Gauge Dial */}
          <View style={styles.speedGaugeContainer}>
            <Svg width={125} height={125} viewBox="0 0 200 200">
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
                strokeDasharray={`${353.43} ${471.24 - 353.43}`} 
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
                strokeDasharray={`${(targetSpeed / 160) * 353.43} ${471.24 - (targetSpeed / 160) * 353.43}`} 
                strokeDashoffset="0" 
                strokeLinecap="round" 
                transform="rotate(135 100 100)"
              />
              
              {/* Needle pivot */}
              <Circle cx="100" cy="100" r="10" fill="#050b14" stroke="#06b6d4" strokeWidth="2.5" />
              
              {/* Speed Needle */}
              <Line 
                x1="100" y1="100" 
                x2={needleX} y2={needleY} 
                stroke="#06b6d4" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              <Circle cx={needleX} cy={needleY} r="2.5" fill="#00f5ff" />

              {/* Speed Dial ticks & markers */}
              <SvgText style={styles.dialTickLabel} x="58" y="146" textAnchor="middle">0</SvgText>
              <SvgText style={styles.dialTickLabel} x="44" y="80" textAnchor="middle">40</SvgText>
              <SvgText style={styles.dialTickLabel} x="100" y="52" textAnchor="middle">80</SvgText>
              <SvgText style={styles.dialTickLabel} x="156" y="80" textAnchor="middle">120</SvgText>
              <SvgText style={styles.dialTickLabel} x="142" y="146" textAnchor="middle">160</SvgText>
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
              <Text style={styles.sideVal}>{topSpeedKmH || 98} <Text style={styles.sideValUnit}>km/h</Text></Text>
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
              <SvgText style={styles.chartAxisTick} x="0" y="15">2</SvgText>
              <SvgText style={styles.chartAxisTick} x="0" y="40">0</SvgText>
              <SvgText style={styles.chartAxisTick} x="0" y="65">-2</SvgText>
              
              {/* Paths representing histories (scale factor 8) */}
              <Path d={getPathData(accelHistory.x, 8, 70)} stroke="#06b6d4" strokeWidth="1.5" fill="none" />
              <Path d={getPathData(accelHistory.y, 8, 70)} stroke="#84cc16" strokeWidth="1.5" fill="none" />
              <Path d={getPathData(accelHistory.z.length > 0 ? accelHistory.z.map(z => z - 9.81) : [], 8, 70)} stroke="#eab308" strokeWidth="1.5" fill="none" />
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
              <SvgText style={styles.chartAxisTick} x="0" y="15">2</SvgText>
              <SvgText style={styles.chartAxisTick} x="0" y="40">0</SvgText>
              <SvgText style={styles.chartAxisTick} x="0" y="65">-2</SvgText>

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
                  <Circle cx="40" cy="40" r="32" stroke={colors.border} strokeWidth="2.5" fill={colors.background} />
                  <SvgText x="40" y="16" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">N</SvgText>
                  <SvgText x="40" y="72" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">S</SvgText>
                  <SvgText x="13" y="44" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">W</SvgText>
                  <SvgText x="67" y="44" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">E</SvgText>
                  <G transform={`rotate(${-normalizedHeading} 40 40)`}>
                    <Polygon points="40,16 45,40 35,40" fill="#ef4444" />
                    <Polygon points="40,64 45,40 35,40" fill="#94a3b8" />
                    <Circle cx="40" cy="40" r="3.5" fill="#ffffff" />
                  </G>
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
                    <ClipPath id="horizonClip">
                      <Circle cx="40" cy="40" r="30" />
                    </ClipPath>
                  </Defs>
                  {/* Outer bezel */}
                  <Circle cx="40" cy="40" r="32" stroke={colors.border} strokeWidth="2.5" fill="none" />
                  <Circle cx="40" cy="40" r="30" fill="#000000" />
                  
                  {/* Rotating/translating sky-ground plane */}
                  <G clipPath="url(#horizonClip)" transform={`rotate(${-dmRollDeg} 40 40) translate(0 ${Math.min(18, Math.max(-18, dmPitch * 18))})`}>
                    {/* Sky */}
                    <Rect x="-20" y="-20" width="120" height="60" fill="#0b2447" />
                    {/* Ground */}
                    <Rect x="-20" y="40" width="120" height="60" fill="#1b4235" />
                    {/* Horizon line */}
                    <Line x1="-20" y1="40" x2="100" y2="40" stroke="#00f5ff" strokeWidth="1.5" />
                  </G>
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

          {/* Dynamic Route/GPS SVG Map */}
          <View style={styles.simulatedMap}>
            <Svg width="100%" height="150" style={styles.mapSvgBackground} viewBox="0 0 300 150">
              {/* Dynamic Grid lines */}
              <Line x1="0" y1="37.5" x2="300" y2="37.5" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />
              <Line x1="0" y1="75" x2="300" y2="75" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />
              <Line x1="0" y1="112.5" x2="300" y2="112.5" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />
              <Line x1="75" y1="0" x2="75" y2="150" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />
              <Line x1="150" y1="0" x2="150" y2="150" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />
              <Line x1="225" y1="0" x2="225" y2="150" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />

              {mapPoints.length === 0 ? (
                <SvgText x="150" y="80" fill="#64748b" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Acquiring GPS Signal...
                </SvgText>
              ) : mapPoints.length === 1 ? (
                <G>
                  <Circle cx="150" cy="75" r="25" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" fill="none" />
                  <Circle cx="150" cy="75" r="12" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" fill="none" />
                  <Circle cx="150" cy="75" r="6" fill="#00e5ff" />
                  <Circle cx="150" cy="75" r="12" fill="rgba(0, 229, 255, 0.15)" />
                </G>
              ) : (
                <G>
                  <Path 
                    d={mapPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')} 
                    stroke="#06b6d4" 
                    strokeWidth="3.5" 
                    fill="none" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                  <Circle cx={mapPoints[0].x} cy={mapPoints[0].y} r="5" fill="#84cc16" />
                  <Circle cx={mapPoints[0].x} cy={mapPoints[0].y} r="10" stroke="#84cc16" strokeWidth="1" fill="none" opacity="0.5" />
                  
                  <Circle cx={mapPoints[mapPoints.length - 1].x} cy={mapPoints[mapPoints.length - 1].y} r="6" fill="#00e5ff" />
                  <Circle cx={mapPoints[mapPoints.length - 1].x} cy={mapPoints[mapPoints.length - 1].y} r="12" fill="rgba(0, 229, 255, 0.2)" />
                </G>
              )}
            </Svg>

            {/* Start point details overlay */}
            {currentSession && mapPoints.length > 0 && (
              <View style={[styles.mapOverlayLabel, styles.startOverlay]}>
                <View style={[styles.tinyDot, { backgroundColor: '#84cc16' }]} />
                <Text style={styles.overlayTime}>{startTimeStr}</Text>
                <Text style={styles.overlayAddr}>
                  {`Lat ${mapPoints[0].latitude.toFixed(4)}`}
                  {"\n"}
                  {`Lon ${mapPoints[0].longitude.toFixed(4)}`}
                </Text>
              </View>
            )}

            {/* Est. End / Current details overlay */}
            {mapPoints.length > 0 && (
              <View style={[styles.mapOverlayLabel, styles.endOverlay]}>
                <View style={[styles.tinyDot, { backgroundColor: '#00e5ff' }]} />
                <Text style={styles.overlayTime}>
                  {currentSession ? dayjs().format('hh:mm A') : currentTime.format('hh:mm A')}
                </Text>
                <Text style={styles.overlayAddr}>
                  {`Lat ${mapPoints[mapPoints.length - 1].latitude.toFixed(4)}`}
                  {"\n"}
                  {`Lon ${mapPoints[mapPoints.length - 1].longitude.toFixed(4)}`}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 16,
      backgroundColor: colors.card,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 120,
    },
    speedStatsSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
    },
    speedLeftCol: {
      width: '38%',
      alignItems: 'center',
    },
    speedTextLabel: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    speedValue: {
      color: colors.text,
      fontSize: 48,
      fontWeight: '800',
      lineHeight: 48,
    },
    speedUnit: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
      marginBottom: 8,
    },
    speedLimitCapsule: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    speedLimitText: {
      color: '#ef4444',
      fontSize: 8,
      fontWeight: 'bold',
    },
    speedGaugeContainer: {
      width: '32%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialTickLabel: {
      fill: colors.textMuted,
      fontSize: 10,
      fontWeight: '600',
    },
    speedRightCol: {
      width: '28%',
      justifyContent: 'center',
    },
    sideSpeedStat: {
      marginBottom: 10,
    },
    sideLabel: {
      color: colors.textSlate,
      fontSize: 8,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    sideVal: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    sideValUnit: {
      color: colors.textSlate,
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
      color: colors.textSlate,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1.5,
    },
    viewAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewAllText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: 'bold',
      marginRight: 2,
    },

    // Sensor Cards
    sensorCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
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
      borderColor: colors.accent + '33',
      backgroundColor: colors.accent + '0d',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    sensorCardTitle: {
      color: colors.textSlate,
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
      color: colors.textMuted,
      fontSize: 10,
    },
    axisVal: {
      color: colors.text,
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
      fill: colors.textSlate,
      fontSize: 9,
      fontWeight: 'bold',
    },

    // G-Force Card
    gForceCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 16,
      marginBottom: 20,
    },
    gForceHeader: {
      color: colors.textSlate,
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
      backgroundColor: colors.accent + '1a',
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
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    gForceUnitText: {
      color: colors.textSlate,
      fontSize: 9,
    },
    gForceLabelColumn: {
      width: '32%',
    },
    gForceAxisLabel: {
      color: colors.textSlate,
      fontSize: 7,
      fontWeight: 'bold',
      marginBottom: 1,
    },
    gForceAxisValueCyan: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    gForceAxisValueGreen: {
      color: colors.success,
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
      borderColor: colors.border,
      borderRadius: 45,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },

    // Map Card
    mapCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textSlate,
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
      backgroundColor: colors.accent,
      marginRight: 6,
    },
    liveLocationText: {
      color: colors.accent,
      fontSize: 10,
      fontWeight: 'bold',
    },
    simulatedMap: {
      height: 150,
      backgroundColor: colors.background,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.isDark ? 'rgba(12, 22, 38, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
      fontSize: 11,
      fontWeight: 'bold',
    },
    overlayAddr: {
      color: colors.textMuted,
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
      color: colors.textSlate,
      fontSize: 8,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    dmValText: {
      color: colors.text,
      fontWeight: 'bold',
    },
    dmSubHeader: {
      color: colors.accent,
      fontSize: 8,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    dmStatRow: {
      marginBottom: 6,
    },
    dmStatLabel: {
      color: colors.textSlate,
      fontSize: 8,
      fontWeight: '500',
    },
    dmStatValue: {
      color: colors.text,
      fontSize: 10,
      fontWeight: 'bold',
      marginTop: 1,
    },
    dmStatUnit: {
      color: colors.textSlate,
      fontSize: 8,
      fontWeight: '400',
    },
    dmAccelVal: {
      color: colors.textSlate,
      fontSize: 9.5,
      marginBottom: 2,
    },
  });
}

