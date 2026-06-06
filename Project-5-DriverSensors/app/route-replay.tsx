import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect, Ellipse, Text as SvgText } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDriveStore, DriveSession } from '../src/store/driveStore';
import { driveRepository } from '../src/database/repositories/driveRepository';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

// 1. Mock Coordinates for Delhi Route Replay (MG Road to Connaught Place)
const ANCHOR_COORDINATES = [
  { x: 80, y: 60, time: 0, speed: 45, label: 'Start' },
  { x: 130, y: 100, time: 180, speed: 30, label: 'Sharp Turn' },
  { x: 180, y: 160, time: 420, speed: 12, label: 'Harsh Brake' },
  { x: 220, y: 220, time: 720, speed: 50, label: 'Phone Usage' },
  { x: 260, y: 280, time: 960, speed: 40, label: 'Aggressive Steering' },
  { x: 300, y: 320, time: 1200, speed: 15, label: 'Harsh Brake' },
  { x: 340, y: 350, time: 2536, speed: 0, label: 'End' }
];

// Interpolate 200 points for smooth playback tracking
const generateInterpolatedRoute = () => {
  const points = [];
  const totalPoints = 200;
  const totalDuration = 2536; // seconds (42:16)
  
  for (let i = 0; i < totalPoints; i++) {
    const progress = i / (totalPoints - 1);
    const targetTime = progress * totalDuration;
    
    // Find enclosing anchors
    let startAnchor = ANCHOR_COORDINATES[0];
    let endAnchor = ANCHOR_COORDINATES[ANCHOR_COORDINATES.length - 1];
    
    for (let j = 0; j < ANCHOR_COORDINATES.length - 1; j++) {
      if (targetTime >= ANCHOR_COORDINATES[j].time && targetTime <= ANCHOR_COORDINATES[j + 1].time) {
        startAnchor = ANCHOR_COORDINATES[j];
        endAnchor = ANCHOR_COORDINATES[j + 1];
        break;
      }
    }
    
    const durationBetween = endAnchor.time - startAnchor.time;
    const ratio = durationBetween === 0 ? 0 : (targetTime - startAnchor.time) / durationBetween;
    
    // Lerp coordinates & speeds
    const x = startAnchor.x + (endAnchor.x - startAnchor.x) * ratio;
    const y = startAnchor.y + (endAnchor.y - startAnchor.y) * ratio;
    const speed = startAnchor.speed + (endAnchor.speed - startAnchor.speed) * ratio;
    
    points.push({
      x,
      y,
      time: targetTime,
      speed: Math.round(speed),
    });
  }
  return points;
};

const ROUTE_POINTS = generateInterpolatedRoute();

export default function RouteReplayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const sliderWidthRef = useRef<number>(0);

  // Playback Control States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Zoom scale for the SVG map

  // Interactive Map Panning States
  const [mapOffset, setMapOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanningMap, setIsPanningMap] = useState<boolean>(false);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Load completed drive session
  const allDrives = driveRepository.getAllDrives();
  const historicalSession = allDrives.find(d => d.id === id);
  const currentSession = useDriveStore((state) => state.currentSession);
  
  const displaySession = historicalSession 
    ? historicalSession 
    : (currentSession && currentSession.id === id 
        ? currentSession 
        : (allDrives.length > 0 ? allDrives[0] : null));

  // Extract Session Metrics (Fallback to mockup values)
  const score = displaySession ? displaySession.score : 92;
  const rating = displaySession ? displaySession.rating : 'EXCELLENT';
  const distanceKm = displaySession ? (displaySession.distance / 1000).toFixed(1) : '28.6';
  const durationSec = displaySession ? displaySession.duration : 2536; // 42:16

  const driveDateStr = displaySession ? dayjs(displaySession.startTime).format('MMMM DD, YYYY') : 'May 20, 2025';
  const driveTimeStr = displaySession ? dayjs(displaySession.startTime).format('hh:mm A') : '08:15 AM';

  const events = displaySession?.events || [];
  const harshBrakeCount = events.length > 0 ? events.filter(e => e.type === 'HARSH_BRAKE').length : 2;
  const sharpTurnCount = events.length > 0 ? events.filter(e => e.type === 'SHARP_TURN').length : 1;
  const phoneUsageCount = events.length > 0 ? events.filter(e => e.type === 'PHONE_USAGE').length : 1;
  const steeringCount = events.length > 0 ? events.filter(e => e.type === 'AGGRESSIVE_STEERING' || e.type === 'EXCESSIVE_MOVEMENT').length : 2;

  // Playback Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      const intervalMs = 100;
      // Fit 2536s into 42s of real time at 1x speed
      const playSpeedScale = 2536 / 42;
      const stepSize = (intervalMs / 1000) * playSpeedScale * playbackSpeed;
      
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          const next = prev + stepSize;
          if (next >= durationSec) {
            setIsPlaying(false);
            return durationSec;
          }
          return next;
        });
      }, intervalMs);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, durationSec]);

  // Compute Animated Cursor Position
  const getCursorPosition = () => {
    const progress = currentTimeSec / durationSec;
    const pointIdx = Math.round(progress * (ROUTE_POINTS.length - 1));
    const clampedIdx = Math.max(0, Math.min(ROUTE_POINTS.length - 1, pointIdx));
    return ROUTE_POINTS[clampedIdx];
  };

  const cursorPoint = getCursorPosition();

  // Multiplier toggle (1.0x -> 2.0x -> 5.0x -> 1.0x)
  const togglePlaybackSpeed = () => {
    setPlaybackSpeed((prev) => {
      if (prev === 1) return 2;
      if (prev === 2) return 5;
      return 1;
    });
  };

  // Zoom In / Out Handlers
  const zoomIn = () => setZoomLevel((prev) => Math.min(2.5, prev + 0.25));
  const zoomOut = () => setZoomLevel((prev) => Math.max(1, prev - 0.25));
  const resetMap = () => {
    setZoomLevel(1);
    setMapOffset({ x: 0, y: 0 });
    setCurrentTimeSec(0);
    setIsPlaying(false);
  };

  // Helper to project SVG coordinates to the screen container with zoom and offset
  const getCalloutPosition = (x: number, y: number, offsetLeft = -25, offsetTop = -30) => {
    const containerWidth = width - 40;
    const containerHeight = 380;
    
    // Compute SVG viewBox based on zoom and mapOffset
    const viewBoxWidth = 400 / zoomLevel;
    const viewBoxHeight = 400 / zoomLevel;
    const viewBoxX = 200 - viewBoxWidth / 2 + mapOffset.x;
    const viewBoxY = 200 - viewBoxHeight / 2 + mapOffset.y;
    
    const screenX = ((x - viewBoxX) / viewBoxWidth) * containerWidth;
    const screenY = ((y - viewBoxY) / viewBoxHeight) * containerHeight;
    
    return {
      left: screenX + offsetLeft,
      top: screenY + offsetTop,
    };
  };

  // Format Seconds to MM:SS
  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format Seconds to HH:MM:SS
  const formatHHMMSS = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Seek bar touch seeking
  const handleSliderTouch = (event: any) => {
    if (sliderWidthRef.current > 0) {
      const touchX = event.nativeEvent.locationX;
      let progress = touchX / sliderWidthRef.current;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      setCurrentTimeSec(progress * durationSec);
    }
  };

  // Compute SVG viewBox based on zoom and mapOffset
  const viewBoxWidth = 400 / zoomLevel;
  const viewBoxHeight = 400 / zoomLevel;
  // Center zoom on route center (200, 200) plus mapOffset
  const viewBoxX = 200 - viewBoxWidth / 2 + mapOffset.x;
  const viewBoxY = 200 - viewBoxHeight / 2 + mapOffset.y;
  const mapStyleViewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  return (
    <View style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Route Replay</Text>
          <View style={styles.headerStatusRow}>
            <View style={styles.completedDot} />
            <Text style={styles.headerSubtitle}>Drive Completed</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconCircle}>
          <Feather name="share" size={20} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isPanningMap}
      >
        
        {/* 2. Overview Info Card */}
        <TouchableOpacity 
          style={styles.overviewCard}
          onPress={() => router.push({ pathname: '/drive-summary', params: { id } })}
        >
          <View style={styles.overviewLeft}>
            <View style={styles.overviewInfoRow}>
              <Feather name="calendar" size={14} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.overviewText}>{driveDateStr}</Text>
              <Feather name="clock" size={14} color="#64748b" style={{ marginLeft: 16, marginRight: 6 }} />
              <Text style={styles.overviewText}>{driveTimeStr}</Text>
            </View>

            <View style={styles.locationPointsCol}>
              <View style={styles.locationRow}>
                <View style={[styles.locPinIndicator, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.locationLabel} numberOfLines={1}>MG Road, Delhi</Text>
              </View>
              <View style={styles.locationConnector} />
              <View style={styles.locationRow}>
                <View style={[styles.locPinIndicator, { backgroundColor: '#00f5ff' }]} />
                <Text style={styles.locationLabel} numberOfLines={1}>Connaught Place, Delhi</Text>
              </View>
            </View>
          </View>

          {/* Score rating summary */}
          <View style={styles.overviewRight}>
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color="#00f5ff" />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.badgeScoreVal}>{score}</Text>
                <Text style={styles.badgeScoreLabel}>Safe Score</Text>
                <Text style={styles.badgeRatingText}>Excellent</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#64748b" style={{ marginLeft: 8 }} />
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. Interactive Vector Map Box */}
        <View style={styles.mapContainer}>
          <View
            onStartShouldSetResponder={() => true}
            onResponderGrant={(evt) => {
              const { pageX, pageY } = evt.nativeEvent;
              lastTouchRef.current = { x: pageX, y: pageY };
              setIsPanningMap(true);
            }}
            onResponderMove={(evt) => {
              if (!lastTouchRef.current) return;
              const { pageX, pageY } = evt.nativeEvent;
              const dx = pageX - lastTouchRef.current.x;
              const dy = pageY - lastTouchRef.current.y;
              
              const scaleFactor = 1.0 / zoomLevel;
              
              setMapOffset((prev) => ({
                x: prev.x - dx * scaleFactor,
                y: prev.y - dy * scaleFactor
              }));
              
              lastTouchRef.current = { x: pageX, y: pageY };
            }}
            onResponderRelease={() => {
              lastTouchRef.current = null;
              setIsPanningMap(false);
            }}
            onResponderTerminate={() => {
              lastTouchRef.current = null;
              setIsPanningMap(false);
            }}
            style={StyleSheet.absoluteFill}
          >
            <Svg width="100%" height={380} viewBox={mapStyleViewBox}>
              <Defs>
                <SvgLinearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#00f5ff" />
                  <Stop offset="15%" stopColor="#eab308" />
                  <Stop offset="30%" stopColor="#ef4444" />
                  <Stop offset="55%" stopColor="#00f5ff" />
                  <Stop offset="75%" stopColor="#22c55e" />
                  <Stop offset="88%" stopColor="#ef4444" />
                  <Stop offset="100%" stopColor="#a3e635" />
                </SvgLinearGradient>
              </Defs>

              {/* Background street grids simulating GPS map */}
              {/* Horizontal streets */}
              <Line x1="10" y1="70" x2="390" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
              <Line x1="10" y1="180" x2="390" y2="180" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
              <Line x1="10" y1="280" x2="390" y2="280" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
              
              {/* Vertical streets */}
              <Line x1="90" y1="10" x2="90" y2="390" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
              <Line x1="210" y1="10" x2="210" y2="390" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
              <Line x1="330" y1="10" x2="330" y2="390" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />

              {/* Circular Landmark junctions */}
              <Circle cx="210" cy="180" r="30" stroke="rgba(255,255,255,0.02)" strokeWidth="1.5" fill="none" />
              
              {/* Diagonal secondary avenues */}
              <Line x1="10" y1="10" x2="390" y2="390" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <Line x1="390" y1="10" x2="10" y2="390" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

              {/* Landmark text labels */}
              <SvgText x="110" y="85" fill="rgba(255,255,255,0.12)" fontSize="9" fontWeight="bold">MG ROAD</SvgText>
              <SvgText x="270" y="145" fill="rgba(255,255,255,0.12)" fontSize="9" fontWeight="bold">INDIA GATE</SvgText>
              <SvgText x="50" y="240" fill="rgba(255,255,255,0.12)" fontSize="9" fontWeight="bold">SUPREME COURT</SvgText>
              <SvgText x="135" y="270" fill="rgba(255,255,255,0.12)" fontSize="9" fontWeight="bold">JLN MARG</SvgText>
              <SvgText x="235" y="360" fill="rgba(255,255,255,0.12)" fontSize="9" fontWeight="bold">CONNAUGHT PLACE</SvgText>

              {/* The primary Route Path */}
              <Path 
                d="M 80,60 L 130,100 L 180,160 L 220,220 L 260,280 L 300,320 L 340,350"
                stroke="url(#routeGrad)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Event Markers & Callouts */}
              {/* 1. Start Marker */}
              <Circle cx="80" cy="60" r="12" fill="none" stroke="#00f5ff" strokeWidth="2.5" />
              <Circle cx="80" cy="60" r="5" fill="#00f5ff" />

              {/* 2. Sharp Turn (08:18 AM) */}
              <Circle cx="130" cy="100" r="10" fill="#0c1626" stroke="#eab308" strokeWidth="2" />
              
              {/* 3. Harsh Brake 1 (08:22 AM) */}
              <Circle cx="180" cy="160" r="10" fill="#0c1626" stroke="#ef4444" strokeWidth="2" />
              
              {/* 4. Phone Usage (08:27 AM) */}
              <Circle cx="220" cy="220" r="10" fill="#0c1626" stroke="#00f5ff" strokeWidth="2" />
              
              {/* 5. Aggressive Steering (08:31 AM) */}
              <Circle cx="260" cy="280" r="10" fill="#0c1626" stroke="#a3e635" strokeWidth="2" />
              
              {/* 6. Harsh Brake 2 (08:35 AM) */}
              <Circle cx="300" cy="320" r="10" fill="#0c1626" stroke="#ef4444" strokeWidth="2" />

              {/* 7. End Marker */}
              <Path d="M340,335 C334,335 330,339 330,345 C330,353 340,362 340,362 C340,362 350,353 350,345 C350,339 346,335 340,335 Z" fill="#22c55e" />
              <Circle cx="340" cy="345" r="3" fill="#ffffff" />

              {/* Inner Icons for markers */}
              {/* Sharp Turn */}
              <Path d="M 127,103 L 133,103 L 133,98" stroke="#eab308" strokeWidth="1.2" fill="none" />
              <Path d="M 127,103 C 127,99 130,97 133,98" stroke="#eab308" strokeWidth="1.2" fill="none" />
              {/* Harsh Brake 1 */}
              <Line x1="180" y1="156" x2="180" y2="161" stroke="#ef4444" strokeWidth="1.5" />
              <Circle cx="180" cy="164" r="1" fill="#ef4444" />
              {/* Phone Usage */}
              <Path d="M 218,217 L 222,217 L 222,223 L 218,223 Z" fill="#00f5ff" />
              {/* Aggressive Steering */}
              <Circle cx="260" cy="280" r="4" stroke="#a3e635" strokeWidth="1" fill="none" />
              {/* Harsh Brake 2 */}
              <Line x1="300" y1="316" x2="300" y2="321" stroke="#ef4444" strokeWidth="1.5" />
              <Circle cx="300" cy="324" r="1" fill="#ef4444" />

              {/* Replay Cursor (Car Position) */}
              {cursorPoint && (
                <>
                  <Circle cx={cursorPoint.x} cy={cursorPoint.y} r="16" fill="rgba(0, 245, 255, 0.15)" stroke="#00f5ff" strokeWidth="1.5" />
                  <Circle cx={cursorPoint.x} cy={cursorPoint.y} r="6" fill="#00f5ff" />
                </>
              )}
            </Svg>
          </View>

          {/* Absolute Map Callout Popovers matching mockup and panning position */}
          {/* Start Popover */}
          <View style={[styles.mapCallout, getCalloutPosition(80, 60, -25, -20)]}>
            <Text style={styles.calloutTitle}>START</Text>
            <Text style={styles.calloutTime}>08:15 AM</Text>
          </View>

          {/* Sharp Turn Popover */}
          <View style={[styles.mapCallout, getCalloutPosition(130, 100, -35, -35)]}>
            <Text style={styles.calloutTime}>08:18 AM</Text>
            <Text style={styles.calloutTitle}>Sharp Turn</Text>
          </View>

          {/* Harsh Brake 1 Popover */}
          <View style={[styles.mapCallout, getCalloutPosition(180, 160, -35, -35)]}>
            <Text style={styles.calloutTime}>08:22 AM</Text>
            <Text style={styles.calloutTitle}>Harsh Brake</Text>
          </View>

          {/* Phone Usage Popover */}
          <View style={[styles.mapCallout, getCalloutPosition(220, 220, -35, -45)]}>
            <Text style={styles.calloutTime}>08:27 AM</Text>
            <Text style={styles.calloutTitle}>Phone Usage</Text>
            <Text style={styles.calloutSub}>8 sec</Text>
          </View>

          {/* Aggressive Steering Popover */}
          <View style={[styles.mapCallout, getCalloutPosition(260, 280, -45, -35)]}>
            <Text style={styles.calloutTime}>08:31 AM</Text>
            <Text style={styles.calloutTitle}>Aggressive Steering</Text>
          </View>

          {/* Harsh Brake 2 Popover */}
          <View style={[styles.mapCallout, getCalloutPosition(300, 320, -35, -35)]}>
            <Text style={styles.calloutTime}>08:35 AM</Text>
            <Text style={styles.calloutTitle}>Harsh Brake</Text>
          </View>

          {/* End Popover */}
          <View style={[styles.mapCallout, getCalloutPosition(340, 350, -25, -35)]}>
            <Text style={[styles.calloutTitle, { color: '#22c55e' }]}>END</Text>
            <Text style={styles.calloutTime}>08:57 AM</Text>
          </View>

          {/* Float Map Overlay Buttons (Right) */}
          <View style={styles.mapControlsColumn}>
            <TouchableOpacity style={styles.mapFloatBtn} onPress={resetMap}>
              <Feather name="crosshair" size={18} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapFloatBtn} onPress={zoomIn}>
              <Feather name="plus" size={18} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapFloatBtn} onPress={zoomOut}>
              <Feather name="minus" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Map Legend Overlay (Bottom-Left) */}
          <View style={styles.legendContainer}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#00f5ff' }]} />
              <Text style={styles.legendText}>Your Route</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Harsh Brake</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
              <Text style={styles.legendText}>Sharp Turn</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#00f5ff' }]} />
              <Text style={styles.legendText}>Phone Usage</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#a3e635' }]} />
              <Text style={styles.legendText}>Aggressive Steering</Text>
            </View>
          </View>
        </View>

        {/* 4. Player Controls Panel */}
        <View style={styles.playerPanel}>
          {/* Play/Pause Button */}
          <TouchableOpacity 
            style={[styles.playButtonCircle, isPlaying && styles.playingBtn]} 
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Feather name={isPlaying ? "pause" : "play"} size={22} color="#00f5ff" />
          </TouchableOpacity>

          {/* Timeline Seek Bar */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderTimeText}>{formatMMSS(currentTimeSec)}</Text>
            
            <View 
              style={styles.sliderTrackWrap}
              onLayout={(e) => { sliderWidthRef.current = e.nativeEvent.layout.width; }}
              onTouchStart={handleSliderTouch}
              onTouchMove={handleSliderTouch}
            >
              <View style={styles.sliderTrackBg}>
                {/* Active fill */}
                <View style={[styles.sliderTrackFill, { width: `${(currentTimeSec / durationSec) * 100}%` }]} />
                
                {/* Event Marker Dots on seekbar track */}
                <View style={[styles.sliderEventDot, { left: '7%', backgroundColor: '#eab308' }]} />
                <View style={[styles.sliderEventDot, { left: '16.6%', backgroundColor: '#ef4444' }]} />
                <View style={[styles.sliderEventDot, { left: '28.5%', backgroundColor: '#00f5ff' }]} />
                <View style={[styles.sliderEventDot, { left: '38%', backgroundColor: '#a3e635' }]} />
                <View style={[styles.sliderEventDot, { left: '47.6%', backgroundColor: '#ef4444' }]} />
              </View>

              {/* Slider thumb dot */}
              <View style={[styles.sliderThumb, { left: `${(currentTimeSec / durationSec) * 96}%` }]} />
            </View>
            
            <Text style={styles.sliderTimeText}>42:16</Text>
          </View>

          {/* Speed Toggle Badge */}
          <TouchableOpacity style={styles.speedPill} onPress={togglePlaybackSpeed}>
            <Text style={styles.speedText}>{playbackSpeed.toFixed(1)}x</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Metrics Grid Row */}
        <View style={styles.metricsBox}>
          {/* Distance */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <View style={styles.metricLabelRow}>
              <Feather name="activity" size={14} color="#00f5ff" style={{ marginRight: 6 }} />
              <Text style={styles.metricLabel}>Distance</Text>
            </View>
            <Text style={styles.metricVal}>{distanceKm} km</Text>
          </View>

          {/* Duration */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <View style={styles.metricLabelRow}>
              <Feather name="clock" size={14} color="#00f5ff" style={{ marginRight: 6 }} />
              <Text style={styles.metricLabel}>Duration</Text>
            </View>
            <Text style={styles.metricVal}>{formatHHMMSS(currentTimeSec)}</Text>
          </View>

          {/* Avg Speed */}
          <View style={[styles.metricCell, styles.cellBorder]}>
            <View style={styles.metricLabelRow}>
              <MaterialCommunityIcons name="speedometer" size={15} color="#00f5ff" style={{ marginRight: 6 }} />
              <Text style={styles.metricLabel}>Avg Speed</Text>
            </View>
            <Text style={styles.metricVal}>{cursorPoint ? cursorPoint.speed : 52} km/h</Text>
          </View>

          {/* Safe Score */}
          <View style={styles.metricCell}>
            <View style={styles.metricLabelRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={15} color="#00f5ff" style={{ marginRight: 6 }} />
              <Text style={styles.metricLabel}>Safe Score</Text>
            </View>
            <Text style={styles.metricVal}>{score}</Text>
            <Text style={styles.metricSubText}>Excellent</Text>
          </View>
        </View>

        {/* 6. Event Summary Section */}
        <View style={styles.eventSection}>
          <View style={styles.sectionHeaderRowMain}>
            <Text style={styles.sectionTitle}>Event Summary</Text>
            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/live-events')}>
              <Text style={styles.linkText}>View All</Text>
              <Feather name="chevron-right" size={14} color="#00f5ff" />
            </TouchableOpacity>
          </View>

          {/* Horizontal scroll listing of violation counters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsScroll}>
            {/* Harsh Brakes */}
            <View style={[styles.eventCounterCard, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
              <View style={styles.cardHeader}>
                <Feather name="alert-triangle" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={styles.eventCardTitle}>Harsh Brakes</Text>
              </View>
              <Text style={[styles.eventCardCount, { color: '#ef4444' }]}>{harshBrakeCount}</Text>
            </View>

            {/* Sharp Turns */}
            <View style={[styles.eventCounterCard, { borderColor: 'rgba(234, 179, 8, 0.3)' }]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="arrow-u-left-top" size={16} color="#eab308" style={{ marginRight: 6 }} />
                <Text style={styles.eventCardTitle}>Sharp Turns</Text>
              </View>
              <Text style={[styles.eventCardCount, { color: '#eab308' }]}>{sharpTurnCount}</Text>
            </View>

            {/* Phone Usage */}
            <View style={[styles.eventCounterCard, { borderColor: 'rgba(6, 182, 212, 0.3)' }]}>
              <View style={styles.cardHeader}>
                <Feather name="phone" size={14} color="#00f5ff" style={{ marginRight: 6 }} />
                <Text style={styles.eventCardTitle}>Phone Usage</Text>
              </View>
              <View style={styles.phoneValRow}>
                <Text style={[styles.eventCardCount, { color: '#00f5ff' }]}>{phoneUsageCount}</Text>
                <Text style={styles.phoneSecText}>8 sec</Text>
              </View>
            </View>

            {/* Aggressive Steering */}
            <View style={[styles.eventCounterCard, { borderColor: 'rgba(163, 230, 53, 0.3)' }]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="steering" size={15} color="#a3e635" style={{ marginRight: 6 }} />
                <Text style={styles.eventCardTitle}>Aggressive Steering</Text>
              </View>
              <Text style={[styles.eventCardCount, { color: '#a3e635' }]}>{steeringCount}</Text>
            </View>
          </ScrollView>
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
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  completedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  headerSubtitle: {
    color: '#00f5ff',
    fontSize: 10,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSpacer: {
    height: 60,
  },

  // Overview Card
  overviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 16,
    padding: 14,
    marginBottom: 15,
  },
  overviewLeft: {
    flex: 1,
    marginRight: 10,
  },
  overviewInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  overviewText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  locationPointsCol: {
    position: 'relative',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  locPinIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  locationLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationConnector: {
    position: 'absolute',
    left: 3,
    top: 10,
    width: 2,
    height: 12,
    backgroundColor: '#122540',
  },
  overviewRight: {
    justifyContent: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  badgeScoreVal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  badgeScoreLabel: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: '500',
  },
  badgeRatingText: {
    color: '#22c55e',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Map Container
  mapContainer: {
    height: 380,
    backgroundColor: '#040a12',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#122540',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 15,
  },
  mapCallout: {
    position: 'absolute',
    backgroundColor: 'rgba(4, 10, 18, 0.9)',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  calloutTitle: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  calloutTime: {
    color: '#94a3b8',
    fontSize: 7,
  },
  calloutSub: {
    color: '#00f5ff',
    fontSize: 7,
    fontWeight: 'bold',
  },
  mapControlsColumn: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(4, 10, 18, 0.85)',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    padding: 4,
  },
  mapFloatBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(4, 10, 18, 0.85)',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 10,
    padding: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2.5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: '500',
  },

  // Player Panel
  playerPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 15, 26, 0.6)',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
  },
  playButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#00f5ff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
  },
  playingBtn: {
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
  },
  sliderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  sliderTimeText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sliderTrackWrap: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
    marginHorizontal: 8,
    position: 'relative',
  },
  sliderTrackBg: {
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    position: 'relative',
  },
  sliderTrackFill: {
    height: '100%',
    backgroundColor: '#00f5ff',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00f5ff',
    borderWidth: 2,
    borderColor: '#050B14',
    top: 5,
  },
  sliderEventDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: -1,
  },
  speedPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00f5ff',
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
  },
  speedText: {
    color: '#00f5ff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Metrics Grid Box
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  metricCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellBorder: {
    borderRightWidth: 1,
    borderRightColor: '#122540',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '500',
  },
  metricVal: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  metricSubText: {
    color: '#22c55e',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 1,
  },

  // Event Summary Section
  eventSection: {
    marginBottom: 20,
  },
  sectionHeaderRowMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#00f5ff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },
  eventsScroll: {
    paddingRight: 10,
  },
  eventCounterCard: {
    width: 125,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventCardTitle: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '500',
  },
  eventCardCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  phoneSecText: {
    color: '#64748b',
    fontSize: 9,
    marginLeft: 6,
    fontWeight: '500',
  },
});
