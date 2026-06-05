import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Main Component
export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="menu" size={28} color="#06b6d4" />
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingSub}>Good Evening,</Text>
            <View style={styles.nameRow}>
              <Text style={styles.greetingName}>Himanshu</Text>
              <Text style={styles.waveEmoji}>👋</Text>
            </View>
            <Text style={styles.tagline}>Drive safe. Live safe.</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellIcon}>
            <Feather name="bell" size={24} color="#F8FAFC" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <View style={styles.profilePicContainer}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
              style={styles.profilePic} 
            />
          </View>
        </View>
      </View>

      {/* Score Gauge */}
      <View style={styles.gaugeContainer}>
        <Svg width={300} height={300} viewBox="0 0 200 200" style={styles.svgGauge}>
          <Defs>
            <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#0ea5e9" stopOpacity="1" />
              <Stop offset="50%" stopColor="#22c55e" stopOpacity="1" />
              <Stop offset="100%" stopColor="#eab308" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          {/* Background Track */}
          <Circle cx="100" cy="100" r="80" stroke="#1e293b" strokeWidth="8" fill="none" strokeDasharray="377" strokeDashoffset="0" strokeLinecap="round" />
          {/* Glowing Progress */}
          <Circle 
            cx="100" cy="100" r="80" 
            stroke="url(#grad)" 
            strokeWidth="10" 
            fill="none" 
            strokeDasharray="377" 
            strokeDashoffset="75" // ~80% completion
            strokeLinecap="round" 
            transform="rotate(135 100 100)"
          />
        </Svg>
        
        <View style={styles.scoreInner}>
          <View style={styles.shieldIconContainer}>
            <Feather name="shield" size={28} color="#38bdf8" />
            <Feather name="check" size={12} color="#38bdf8" style={{position: 'absolute', top: 9}} />
          </View>
          <Text style={styles.scoreNumber}>92</Text>
          <Text style={styles.scoreLabel}>SAFE SCORE</Text>
          <View style={styles.excellentBadge}>
            <View style={styles.dot} />
            <Text style={styles.excellentText}>Excellent</Text>
          </View>
        </View>
      </View>

      {/* Safety Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <View style={[styles.metricIconWrap, { borderColor: '#0ea5e9' }]}>
            <Feather name="shield" size={20} color="#0ea5e9" />
          </View>
          <View>
            <Text style={[styles.metricTitle, { color: '#0ea5e9' }]}>Safe</Text>
            <Text style={styles.metricSub}>Driving</Text>
          </View>
        </View>
        
        <View style={styles.metricItem}>
          <View style={[styles.metricIconWrap, { borderColor: '#84cc16' }]}>
            <Feather name="target" size={20} color="#84cc16" />
          </View>
          <View>
            <Text style={[styles.metricTitle, { color: '#84cc16' }]}>Focused</Text>
            <Text style={styles.metricSub}>Mind</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <View style={[styles.metricIconWrap, { borderColor: '#38bdf8' }]}>
            <MaterialCommunityIcons name="steering" size={20} color="#38bdf8" />
          </View>
          <View>
            <Text style={[styles.metricTitle, { color: '#38bdf8' }]}>Smooth</Text>
            <Text style={styles.metricSub}>Control</Text>
          </View>
        </View>
      </View>

      {/* Car & Floating Stats */}
      <View style={styles.carSection}>
        {/* Car Image Placeholder */}
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=600&auto=format&fit=crop' }} 
          style={styles.carImage} 
          resizeMode="contain"
        />
        
        {/* Floating Widgets */}
        <View style={[styles.floatingWidget, styles.widgetTopLeft]}>
          <MaterialCommunityIcons name="speedometer" size={24} color="#0ea5e9" />
          <View style={styles.widgetTextContainer}>
            <Text style={styles.widgetLabel}>SPEED</Text>
            <Text style={styles.widgetValue}>68</Text>
            <Text style={styles.widgetUnit}>km/h</Text>
          </View>
        </View>

        <View style={[styles.floatingWidget, styles.widgetTopRight]}>
          <Feather name="clock" size={24} color="#0ea5e9" />
          <View style={styles.widgetTextContainer}>
            <Text style={styles.widgetLabel}>DURATION</Text>
            <Text style={styles.widgetValue}>00:42</Text>
            <Text style={styles.widgetUnit}>hr</Text>
          </View>
        </View>

        <View style={[styles.floatingWidget, styles.widgetBottomLeft]}>
          <MaterialCommunityIcons name="road-variant" size={24} color="#84cc16" />
          <View style={styles.widgetTextContainer}>
            <Text style={styles.widgetLabel}>DISTANCE</Text>
            <Text style={styles.widgetValue}>28.6</Text>
            <Text style={styles.widgetUnit}>km</Text>
          </View>
        </View>

        <View style={[styles.floatingWidget, styles.widgetBottomRight]}>
          <Feather name="phone-call" size={24} color="#84cc16" />
          <View style={styles.widgetTextContainer}>
            <Text style={styles.widgetLabel}>PHONE USAGE</Text>
            <Text style={styles.widgetValue}>0</Text>
            <Text style={styles.widgetUnit}>min</Text>
          </View>
        </View>
      </View>

      {/* Start Drive Button */}
      <TouchableOpacity style={styles.startButtonContainer}>
        <LinearGradient
          colors={['#0ea5e9', '#22c55e', '#eab308']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.startButtonGradient}
        >
          <View style={styles.powerIconWrap}>
            <Feather name="power" size={24} color="#0ea5e9" />
          </View>
          <View style={styles.startButtonTextWrap}>
            <Text style={styles.startButtonTitle}>START DRIVE</Text>
            <Text style={styles.startButtonSub}>Track your drive & improve your score</Text>
          </View>
          <View style={styles.arrowIconWrap}>
            <Feather name="chevron-right" size={24} color="#eab308" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B14', // Very dark blue/black
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    marginLeft: 15,
  },
  greetingSub: {
    color: '#94a3b8',
    fontSize: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  greetingName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  waveEmoji: {
    fontSize: 20,
    marginLeft: 5,
  },
  tagline: {
    color: '#22c55e',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellIcon: {
    marginRight: 15,
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  profilePicContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    padding: 2,
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    marginVertical: 10,
  },
  svgGauge: {
    position: 'absolute',
  },
  scoreInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  scoreNumber: {
    color: '#ffffff',
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 80,
  },
  scoreLabel: {
    color: '#e2e8f0',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 10,
  },
  excellentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06b6d4',
    marginRight: 6,
  },
  excellentText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.6)',
    marginBottom: 30,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricSub: {
    color: '#94a3b8',
    fontSize: 10,
  },
  carSection: {
    height: 250,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  carImage: {
    width: width * 0.7,
    height: 180,
    opacity: 0.9,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  floatingWidget: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
    minWidth: 110,
  },
  widgetTopLeft: { top: 10, left: 0 },
  widgetTopRight: { top: 10, right: 0 },
  widgetBottomLeft: { bottom: 20, left: 0 },
  widgetBottomRight: { bottom: 20, right: 0 },
  widgetTextContainer: {
    marginLeft: 8,
  },
  widgetLabel: {
    color: '#94a3b8',
    fontSize: 8,
    letterSpacing: 1,
  },
  widgetValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  widgetUnit: {
    color: '#94a3b8',
    fontSize: 10,
  },
  startButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  powerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#050B14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonTextWrap: {
    alignItems: 'center',
  },
  startButtonTitle: {
    color: '#050B14',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  startButtonSub: {
    color: '#050B14',
    fontSize: 10,
    opacity: 0.8,
  },
  arrowIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#050B14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 40,
  }
});
