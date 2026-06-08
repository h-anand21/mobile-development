import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDriveStore } from '../src/store/driveStore';
import { driveRepository } from '../src/database/repositories/driveRepository';
import { useAppTheme } from '../src/ui/theme';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

// Mock Events matching the screenshot exactly
const MOCK_EVENTS = [
  {
    id: '1',
    type: 'HARSH_BRAKE',
    timestamp: Date.now() - 2 * 60000, // 2 mins ago
    severity: 'HIGH',
    speed: 68,
    description: 'Braked too hard',
  },
  {
    id: '2',
    type: 'SHARP_TURN',
    timestamp: Date.now() - 4 * 60000, // 4 mins ago
    severity: 'MEDIUM',
    speed: 42,
    description: 'Turned sharply',
  },
  {
    id: '3',
    type: 'PHONE_USAGE',
    timestamp: Date.now() - 6 * 60000, // 6 mins ago
    severity: 'MEDIUM',
    duration: 8,
    description: 'Phone was used',
  },
  {
    id: '4',
    type: 'AGGRESSIVE_STEERING',
    timestamp: Date.now() - 8 * 60000, // 8 mins ago
    severity: 'LOW',
    description: 'Steering too aggressive',
  },
  {
    id: '5',
    type: 'HARSH_BRAKE',
    timestamp: Date.now() - 10 * 60000, // 10 mins ago
    severity: 'HIGH',
    speed: 72,
    description: 'Braked too hard',
  },
  {
    id: '6',
    type: 'AGGRESSIVE_STEERING',
    timestamp: Date.now() - 13 * 60000, // 13 mins ago
    severity: 'LOW',
    description: 'Steering too aggressive',
  },
  {
    id: '7',
    type: 'SHARP_TURN',
    timestamp: Date.now() - 15 * 60000, // 15 mins ago
    severity: 'MEDIUM',
    speed: 45,
    description: 'Turned sharply',
  },
];

export default function LiveEventsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors);
  const currentSession = useDriveStore((state) => state.currentSession);
  
  // Use current session, fallback to last completed session, fallback to mock data
  const lastDrives = driveRepository.getAllDrives();
  const lastSession = lastDrives.length > 0 ? lastDrives[0] : null;
  const isDemoMode = !currentSession && !lastSession;
  
  const displayEvents = currentSession 
    ? currentSession.events 
    : (lastSession && lastSession.events.length > 0 ? lastSession.events : MOCK_EVENTS);

  // Sorting display events: newest first
  const sortedEvents = [...displayEvents].sort((a, b) => b.timestamp - a.timestamp);

  // Helper to format event time
  const formatTime = (timestamp: number) => {
    return dayjs(timestamp).format('hh:mm A');
  };

  // Helper to get event details (icon, label, details text, colors)
  const getEventMeta = (type: string, severity: string) => {
    switch (type) {
      case 'HARSH_BRAKE':
        return {
          title: 'Harsh Brake',
          iconName: 'alert-triangle',
          iconType: 'Feather',
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.12)',
          desc: 'Braked too hard',
        };
      case 'HARSH_ACCELERATION':
        return {
          title: 'Harsh Accel',
          iconName: 'trending-up',
          iconType: 'Feather',
          color: '#eab308',
          bgColor: 'rgba(234, 179, 8, 0.12)',
          desc: 'Accelerated rapidly',
        };
      case 'SHARP_TURN':
        return {
          title: 'Sharp Turn',
          iconName: 'call-split',
          iconType: 'Material',
          color: '#eab308',
          bgColor: 'rgba(234, 179, 8, 0.12)',
          desc: 'Turned sharply',
        };
      case 'PHONE_USAGE':
        return {
          title: 'Phone Usage',
          iconName: 'phone',
          iconType: 'Feather',
          color: '#06b6d4',
          bgColor: 'rgba(6, 182, 212, 0.12)',
          desc: 'Phone was used',
        };
      case 'AGGRESSIVE_STEERING':
        return {
          title: 'Aggressive Steering',
          iconName: 'steering',
          iconType: 'MaterialCommunity',
          color: '#22c55e',
          bgColor: 'rgba(34, 197, 94, 0.12)',
          desc: 'Steering too aggressive',
        };
      case 'OVERSPEEDING':
        return {
          title: 'Overspeeding',
          iconName: 'speedometer',
          iconType: 'MaterialCommunity',
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.12)',
          desc: 'Exceeded speed limit',
        };
      default:
        return {
          title: 'Alert Detected',
          iconName: 'bell',
          iconType: 'Feather',
          color: '#94a3b8',
          bgColor: 'rgba(148, 163, 184, 0.12)',
          desc: 'Telemetry warning',
        };
    }
  };

  // Aggregating counts for the summary row
  const countEvents = (type: string) => {
    return displayEvents.filter(e => e.type === type).length;
  };

  const harshBrakesCount = countEvents('HARSH_BRAKE') + countEvents('HARSH_ACCELERATION');
  const sharpTurnsCount = countEvents('SHARP_TURN');
  const phoneUsageCount = countEvents('PHONE_USAGE');
  const aggressiveSteeringCount = countEvents('AGGRESSIVE_STEERING') + countEvents('EXCESSIVE_MOVEMENT');

  const severityBadgeColors = (severity: string) => {
    const s = severity?.toUpperCase();
    if (s === 'HIGH') return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
    if (s === 'MEDIUM') return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.3)' };
    return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' };
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Live Events</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: currentSession ? '#06b6d4' : '#64748b' }]} />
            <Text style={[styles.statusText, { color: currentSession ? '#06b6d4' : '#94a3b8' }]}>
              {currentSession ? 'Drive in Progress' : isDemoMode ? 'Demo Session Log' : 'Last Session Log'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconCircle}>
          <Feather name="filter" size={20} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {/* Summary Matrix Row */}
      <View style={styles.summaryMatrix}>
        {/* Harsh Brakes */}
        <View style={styles.matrixBox}>
          <Text style={styles.matrixLabel}>Harsh Brakes</Text>
          <View style={[styles.matrixIconCircle, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <View style={styles.brakingIconWrap}>
              <View style={[styles.brakingCurve, { borderLeftWidth: 2, borderTopWidth: 2, borderColor: '#ef4444' }]} />
              <Feather name="alert-circle" size={16} color="#ef4444" />
              <View style={[styles.brakingCurve, { borderRightWidth: 2, borderBottomWidth: 2, borderColor: '#ef4444' }]} />
            </View>
          </View>
          <Text style={[styles.matrixCount, { color: '#ef4444' }]}>{harshBrakesCount}</Text>
        </View>

        <View style={styles.matrixDivider} />

        {/* Sharp Turns */}
        <View style={styles.matrixBox}>
          <Text style={styles.matrixLabel}>Sharp Turns</Text>
          <View style={[styles.matrixIconCircle, { borderColor: 'rgba(234, 179, 8, 0.2)' }]}>
            <MaterialCommunityIcons name="arrow-u-left-top" size={20} color="#eab308" />
          </View>
          <Text style={[styles.matrixCount, { color: '#eab308' }]}>{sharpTurnsCount}</Text>
        </View>

        <View style={styles.matrixDivider} />

        {/* Phone Usage */}
        <View style={styles.matrixBox}>
          <Text style={styles.matrixLabel}>Phone Usage</Text>
          <View style={[styles.matrixIconCircle, { borderColor: 'rgba(6, 182, 212, 0.2)' }]}>
            <Feather name="phone" size={18} color="#06b6d4" />
          </View>
          <Text style={[styles.matrixCount, { color: '#06b6d4' }]}>{phoneUsageCount}</Text>
        </View>

        <View style={styles.matrixDivider} />

        {/* Aggressive Steering */}
        <View style={styles.matrixBox}>
          <Text style={styles.matrixLabel}>Aggressive Steering</Text>
          <View style={[styles.matrixIconCircle, { borderColor: 'rgba(34, 197, 94, 0.2)' }]}>
            <MaterialCommunityIcons name="steering" size={20} color="#22c55e" />
          </View>
          <Text style={[styles.matrixCount, { color: '#22c55e' }]}>{aggressiveSteeringCount}</Text>
        </View>
      </View>

      {/* Events Timeline Scroll */}
      <ScrollView contentContainerStyle={styles.timelineContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.timelineSectionTitle}>TODAY</Text>
        
        {sortedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.shieldGlowCircle}>
              <Feather name="shield" size={48} color="#06b6d4" />
            </View>
            <Text style={styles.emptyStateTitle}>Perfect Driving!</Text>
            <Text style={styles.emptyStateSubtitle}>No harsh events or distractions have been recorded during this session.</Text>
          </View>
        ) : (
          <View style={styles.timelineWrapper}>
            {/* Left Vertical Line */}
            <View style={styles.timelineLine} />

            {/* Timeline Items */}
            {sortedEvents.map((event, index) => {
              const meta = getEventMeta(event.type, event.severity);
              const badge = severityBadgeColors(event.severity);
              const eventTime = formatTime(event.timestamp);

              return (
                <View key={event.id || index} style={styles.timelineItem}>
                  {/* Time label on the left */}
                  <View style={styles.timeLabelContainer}>
                    <Text style={styles.timeLabel}>{eventTime}</Text>
                  </View>

                  {/* Indicator Dot */}
                  <View style={[styles.timelineDot, { backgroundColor: meta.color }]} />

                  {/* Card on the right */}
                  <View style={styles.eventCard}>
                    {/* Event Icon */}
                    <View style={[styles.eventIconWrap, { backgroundColor: meta.bgColor }]}>
                      {meta.iconType === 'Feather' && (
                        <Feather name={meta.iconName as any} size={18} color={meta.color} />
                      )}
                      {meta.iconType === 'Material' && (
                        <Ionicons name={meta.iconName as any} size={18} color={meta.color} />
                      )}
                      {meta.iconType === 'MaterialCommunity' && (
                        <MaterialCommunityIcons name={meta.iconName as any} size={18} color={meta.color} />
                      )}
                    </View>

                    {/* Card Content */}
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{meta.title}</Text>
                      <Text style={styles.cardDesc}>{event.description || meta.desc}</Text>
                      {event.speed !== undefined && (
                        <Text style={styles.cardExtra}>Speed: {event.speed} km/h</Text>
                      )}
                      {event.duration !== undefined && (
                        <Text style={styles.cardExtra}>Duration: {event.duration} sec</Text>
                      )}
                    </View>

                    {/* Severity Badge & Arrow */}
                    <View style={styles.cardRight}>
                      <View style={[styles.severityBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                        <Text style={[styles.severityText, { color: badge.color }]}>
                          {event.severity ? event.severity.charAt(0) + event.severity.slice(1).toLowerCase() : 'Low'}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={18} color="#475569" style={{ marginLeft: 8 }} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Tips Box */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Feather name="shield" size={24} color="#06b6d4" />
            <Feather name="check" size={10} color="#06b6d4" style={{ position: 'absolute', top: 7 }} />
          </View>
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipTitle}>Keep it smooth!</Text>
            <Text style={styles.tipDesc}>Drive safe to improve your score.</Text>
          </View>
        </View>

        {/* View Insights Button */}
        <TouchableOpacity 
          style={styles.insightsButton} 
          onPress={() => router.push('/(tabs)/dashboard')}
        >
          <Ionicons name="stats-chart" size={18} color="#06b6d4" style={{ marginRight: 10 }} />
          <Text style={styles.insightsButtonText}>View Driving Insights</Text>
          <Feather name="chevron-right" size={18} color="#06b6d4" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 15,
      backgroundColor: colors.background,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
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

    // Summary matrix row
    summaryMatrix: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: 20,
      marginVertical: 10,
      paddingVertical: 15,
    },
    matrixBox: {
      flex: 1,
      alignItems: 'center',
    },
    matrixLabel: {
      color: colors.textSlate,
      fontSize: 8,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    matrixIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      marginBottom: 6,
    },
    matrixCount: {
      fontSize: 15,
      fontWeight: 'bold',
    },
    matrixDivider: {
      width: 1,
      backgroundColor: colors.border,
      alignSelf: 'center',
      height: '70%',
    },

    // Timeline section
    timelineContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    timelineSectionTitle: {
      color: colors.textSlate,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1.5,
      marginBottom: 20,
    },
    timelineWrapper: {
      position: 'relative',
      paddingLeft: 70, // offset for time label and vertical line
    },
    timelineLine: {
      position: 'absolute',
      left: 80, // aligned with dot center
      top: 5,
      bottom: 5,
      width: 2,
      backgroundColor: colors.border,
    },
    timelineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      position: 'relative',
    },
    timeLabelContainer: {
      position: 'absolute',
      left: -70,
      width: 60,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    timeLabel: {
      color: colors.textSlate,
      fontSize: 10,
      fontWeight: '500',
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      position: 'absolute',
      left: 10 - 4, // 80 - 70 - dot_width/2
      zIndex: 2,
      borderWidth: 2,
      borderColor: colors.background,
    },
    eventCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 12,
      marginLeft: 25,
    },
    eventIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    cardDesc: {
      color: colors.textMuted,
      fontSize: 10,
      marginBottom: 4,
    },
    cardExtra: {
      color: '#06b6d4',
      fontSize: 9,
      fontWeight: '500',
    },
    cardRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    severityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    severityText: {
      fontSize: 9,
      fontWeight: 'bold',
    },

    // Braking custom icon geometry
    brakingIconWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: 28,
      height: 28,
    },
    brakingCurve: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
    },

    // Empty state styling
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    shieldGlowCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(6, 182, 212, 0.2)',
      marginBottom: 20,
      shadowColor: '#06b6d4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
    },
    emptyStateTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    emptyStateSubtitle: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },

    // Tip box
    tipCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(6, 182, 212, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(6, 182, 212, 0.15)',
      borderRadius: 16,
      padding: 16,
      marginTop: 25,
      marginBottom: 16,
    },
    tipIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: 'rgba(6, 182, 212, 0.3)',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      position: 'relative',
    },
    tipTextWrap: {
      flex: 1,
    },
    tipTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    tipDesc: {
      color: colors.textMuted,
      fontSize: 10,
    },

    // View Insights Button
    insightsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: '#06b6d4',
      borderRadius: 16,
      padding: 15,
      marginVertical: 10,
      shadowColor: '#06b6d4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    },
    insightsButtonText: {
      color: '#06b6d4',
      fontSize: 13,
      fontWeight: 'bold',
    },
    bottomSpacer: {
      height: 60,
    },
  });
}
