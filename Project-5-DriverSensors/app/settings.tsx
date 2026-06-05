import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Dimensions, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../src/store/settingsStore';

const { width } = Dimensions.get('window');

// Color palette constants
const ACCENT_COLORS = ['#00f5ff', '#84cc16', '#a855f7', '#eab308', '#ef4444', '#14b8a6'];

// Custom slide & tap gesture-based slider component
const CustomSlider = ({
  value,
  min,
  max,
  color,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  color: string;
  onChange: (val: number) => void;
}) => {
  const trackWidthRef = useRef(width - 72);

  const handleTouch = (e: any) => {
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / trackWidthRef.current));
    const val = min + ratio * (max - min);
    onChange(val);
  };

  const fillPercentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.sliderTrackContainer}>
      <View
        style={styles.sliderTrackBg}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
        onLayout={(e) => {
          trackWidthRef.current = e.nativeEvent.layout.width;
        }}
      >
        <View 
          pointerEvents="none" 
          style={[styles.sliderTrackFill, { width: `${fillPercentage}%`, backgroundColor: color }]} 
        />
        <View 
          pointerEvents="none" 
          style={[styles.sliderThumb, { left: `${fillPercentage}%` }]} 
        />
      </View>
    </View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();

  // Load from Settings store
  const {
    permissions,
    harshBraking,
    sharpTurn,
    speeding,
    phoneUsage,
    reminders,
    weeklyReports,
    achievements,
    safetyAlerts,
    selectedTheme,
    selectedAccent,
    units,
    setThreshold,
    setNotification,
    setTheme,
    setAccentColor,
    setUnits,
    resetToDefaults,
  } = useSettingsStore();

  const currentAccent = ACCENT_COLORS[selectedAccent];

  // Collapsible sections state
  const [expanded, setExpanded] = useState({
    permissions: true,
    thresholds: true,
    notifications: true,
    theme: true,
    other: true,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleReset = () => {
    resetToDefaults();
    Alert.alert('Reset Thresholds', 'Threshold parameters set to industry defaults.', [{ text: 'OK' }]);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>

        <View style={{ width: 44 }} /> {/* Spacer to center the title */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ==================== 2. Permissions Section ==================== */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('permissions')}>
            <View style={styles.sectionHeaderLeft}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color="#84cc16" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Permissions</Text>
            </View>
            <Feather name={expanded.permissions ? "chevron-up" : "chevron-down"} size={16} color={expanded.permissions ? "#84cc16" : "#64748b"} />
          </TouchableOpacity>

          {expanded.permissions && (
            <View style={styles.sectionBody}>
              {/* Location Access */}
              <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert('Location Access', 'Permission managed by device settings.')}>
                <View style={[styles.iconContainer, { borderColor: '#84cc1640', backgroundColor: '#84cc160a' }]}>
                  <Ionicons name="location-sharp" size={16} color="#84cc16" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Location Access</Text>
                  <Text style={styles.rowSubtitle}>Required for tracking your drives and routes</Text>
                </View>
                <Text style={[styles.rowValueText, { color: '#84cc16' }]}>{permissions.location}</Text>
                <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
              </TouchableOpacity>

              {/* Notifications */}
              <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert('Notifications', 'Permission managed by device settings.')}>
                <View style={[styles.iconContainer, { borderColor: '#3b82f640', backgroundColor: '#3b82f60a' }]}>
                  <Feather name="bell" size={16} color="#3b82f6" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Notifications</Text>
                  <Text style={styles.rowSubtitle}>Get alerts and important updates</Text>
                </View>
                <Text style={[styles.rowValueText, { color: '#3b82f6' }]}>{permissions.notifications}</Text>
                <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
              </TouchableOpacity>

              {/* Motion & Activity */}
              <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert('Motion & Activity', 'Permission managed by device settings.')}>
                <View style={[styles.iconContainer, { borderColor: '#a855f740', backgroundColor: '#a855f70a' }]}>
                  <MaterialCommunityIcons name="run" size={16} color="#a855f7" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Motion & Activity</Text>
                  <Text style={styles.rowSubtitle}>Helps detect driving behavior accurately</Text>
                </View>
                <Text style={[styles.rowValueText, { color: '#a855f7' }]}>{permissions.motion}</Text>
                <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
              </TouchableOpacity>

              {/* Phone Usage Access */}
              <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert('Phone Usage Access', 'Permission managed by device settings.')}>
                <View style={[styles.iconContainer, { borderColor: '#eab30840', backgroundColor: '#eab3080a' }]}>
                  <Feather name="phone" size={16} color="#eab308" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Phone Usage Access</Text>
                  <Text style={styles.rowSubtitle}>Detect phone usage while driving</Text>
                </View>
                <Text style={[styles.rowValueText, { color: '#eab308' }]}>{permissions.phoneUsage}</Text>
                <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
              </TouchableOpacity>

              {/* Background App Refresh */}
              <TouchableOpacity style={[styles.rowItem, { borderBottomWidth: 0 }]} onPress={() => Alert.alert('Background App Refresh', 'Permission managed by device settings.')}>
                <View style={[styles.iconContainer, { borderColor: '#14b8a640', backgroundColor: '#14b8a60a' }]}>
                  <Ionicons name="refresh-outline" size={16} color="#14b8a6" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Background App Refresh</Text>
                  <Text style={styles.rowSubtitle}>Allow continuous drive tracking in background</Text>
                </View>
                <Text style={[styles.rowValueText, { color: '#14b8a6' }]}>{permissions.backgroundRefresh}</Text>
                <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ==================== 3. Thresholds Section ==================== */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('thresholds')}>
            <View style={styles.sectionHeaderLeft}>
              <MaterialCommunityIcons name="chart-bell-curve" size={20} color="#eab308" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Thresholds</Text>
            </View>
            <Feather name={expanded.thresholds ? "chevron-up" : "chevron-down"} size={16} color={expanded.thresholds ? "#eab308" : "#64748b"} />
          </TouchableOpacity>

          {expanded.thresholds && (
            <View style={styles.sectionBody}>
              {/* Harsh Braking Slider */}
              <View style={styles.sliderRowItem}>
                <View style={styles.sliderHeader}>
                  <View style={[styles.iconContainer, { borderColor: '#ef444440', backgroundColor: '#ef44440a' }]}>
                    <MaterialCommunityIcons name="car-brake-alert" size={16} color="#ef4444" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowTitle}>Harsh Braking</Text>
                    <Text style={styles.rowSubtitle}>Deceleration beyond this limit</Text>
                  </View>
                  <Text style={[styles.sliderValText, { color: '#ef4444' }]}>{harshBraking.toFixed(1)} m/s²</Text>
                  <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
                </View>
                <CustomSlider
                  value={harshBraking}
                  min={-5.0}
                  max={-1.0}
                  color="#ef4444"
                  onChange={(val) => setThreshold('harshBraking', Number(val.toFixed(1)))}
                />
              </View>

              {/* Sharp Turn Slider */}
              <View style={styles.sliderRowItem}>
                <View style={styles.sliderHeader}>
                  <View style={[styles.iconContainer, { borderColor: '#eab30840', backgroundColor: '#eab3080a' }]}>
                    <MaterialCommunityIcons name="arrow-u-left-top" size={16} color="#eab308" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowTitle}>Sharp Turn</Text>
                    <Text style={styles.rowSubtitle}>Steering angle beyond this limit</Text>
                  </View>
                  <Text style={[styles.sliderValText, { color: '#eab308' }]}>{sharpTurn}°</Text>
                  <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
                </View>
                <CustomSlider
                  value={sharpTurn}
                  min={15}
                  max={60}
                  color="#eab308"
                  onChange={(val) => setThreshold('sharpTurn', Math.round(val))}
                />
              </View>

              {/* Speeding Slider */}
              <View style={styles.sliderRowItem}>
                <View style={styles.sliderHeader}>
                  <View style={[styles.iconContainer, { borderColor: '#22c55e40', backgroundColor: '#22c55e0a' }]}>
                    <MaterialCommunityIcons name="speedometer" size={16} color="#22c55e" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowTitle}>Speeding</Text>
                    <Text style={styles.rowSubtitle}>Speed limit tolerance</Text>
                  </View>
                  <Text style={[styles.sliderValText, { color: '#22c55e' }]}>+{speeding} km/h</Text>
                  <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
                </View>
                <CustomSlider
                  value={speeding}
                  min={0}
                  max={30}
                  color="#22c55e"
                  onChange={(val) => setThreshold('speeding', Math.round(val))}
                />
              </View>

              {/* Phone Usage Slider */}
              <View style={styles.sliderRowItem}>
                <View style={styles.sliderHeader}>
                  <View style={[styles.iconContainer, { borderColor: '#a855f740', backgroundColor: '#a855f70a' }]}>
                    <Feather name="phone" size={16} color="#a855f7" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowTitle}>Phone Usage</Text>
                    <Text style={styles.rowSubtitle}>Time limit for phone usage</Text>
                  </View>
                  <Text style={[styles.sliderValText, { color: '#a855f7' }]}>{phoneUsage} sec</Text>
                  <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
                </View>
                <CustomSlider
                  value={phoneUsage}
                  min={2}
                  max={15}
                  color="#a855f7"
                  onChange={(val) => setThreshold('phoneUsage', Math.round(val))}
                />
              </View>

              {/* Reset to Default Thresholds */}
              <TouchableOpacity 
                style={[styles.resetBtn, { borderColor: currentAccent + '40' }]} 
                onPress={handleReset}
              >
                <Ionicons name="refresh-outline" size={16} color={currentAccent} style={{ marginRight: 6 }} />
                <Text style={[styles.resetBtnText, { color: currentAccent }]}>Reset to Default Thresholds</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ==================== 4. Notifications Section ==================== */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('notifications')}>
            <View style={styles.sectionHeaderLeft}>
              <Feather name="bell" size={18} color="#3b82f6" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            <Feather name={expanded.notifications ? "chevron-up" : "chevron-down"} size={16} color={expanded.notifications ? "#3b82f6" : "#64748b"} />
          </TouchableOpacity>

          {expanded.notifications && (
            <View style={styles.sectionBody}>
              {/* Drive Reminders */}
              <View style={styles.switchRowItem}>
                <View style={[styles.iconContainer, { borderColor: '#84cc1640', backgroundColor: '#84cc160a' }]}>
                  <Feather name="calendar" size={16} color="#84cc16" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Drive Reminders</Text>
                  <Text style={styles.rowSubtitle}>Remind me to start drive before driving</Text>
                </View>
                <Switch
                  value={reminders}
                  onValueChange={(val) => setNotification('reminders', val)}
                  trackColor={{ false: "#122540", true: "#3b82f6" }}
                  thumbColor={reminders ? "#ffffff" : "#64748b"}
                />
              </View>

              {/* Weekly Reports */}
              <View style={styles.switchRowItem}>
                <View style={[styles.iconContainer, { borderColor: '#a855f740', backgroundColor: '#a855f70a' }]}>
                  <MaterialCommunityIcons name="chart-line" size={16} color="#a855f7" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Weekly Reports</Text>
                  <Text style={styles.rowSubtitle}>Receive weekly performance reports</Text>
                </View>
                <Switch
                  value={weeklyReports}
                  onValueChange={(val) => setNotification('weeklyReports', val)}
                  trackColor={{ false: "#122540", true: "#3b82f6" }}
                  thumbColor={weeklyReports ? "#ffffff" : "#64748b"}
                />
              </View>

              {/* Achievements */}
              <View style={styles.switchRowItem}>
                <View style={[styles.iconContainer, { borderColor: '#eab30840', backgroundColor: '#eab3080a' }]}>
                  <Feather name="trophy" size={16} color="#eab308" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Achievements</Text>
                  <Text style={styles.rowSubtitle}>Notify me about new achievements</Text>
                </View>
                <Switch
                  value={achievements}
                  onValueChange={(val) => setNotification('achievements', val)}
                  trackColor={{ false: "#122540", true: "#3b82f6" }}
                  thumbColor={achievements ? "#ffffff" : "#64748b"}
                />
              </View>

              {/* Safety Alerts */}
              <View style={[styles.switchRowItem, { borderBottomWidth: 0 }]}>
                <View style={[styles.iconContainer, { borderColor: '#ef444440', backgroundColor: '#ef44440a' }]}>
                  <Feather name="alert-triangle" size={16} color="#ef4444" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Safety Alerts</Text>
                  <Text style={styles.rowSubtitle}>Get real-time alerts for dangerous behavior</Text>
                </View>
                <Switch
                  value={safetyAlerts}
                  onValueChange={(val) => setNotification('safetyAlerts', val)}
                  trackColor={{ false: "#122540", true: "#3b82f6" }}
                  thumbColor={safetyAlerts ? "#ffffff" : "#64748b"}
                />
              </View>
            </View>
          )}
        </View>

        {/* ==================== 5. Theme Section ==================== */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('theme')}>
            <View style={styles.sectionHeaderLeft}>
              <MaterialCommunityIcons name="brush" size={18} color="#a855f7" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Theme</Text>
            </View>
            <Feather name={expanded.theme ? "chevron-up" : "chevron-down"} size={16} color={expanded.theme ? "#a855f7" : "#64748b"} />
          </TouchableOpacity>

          {expanded.theme && (
            <View style={styles.sectionBody}>
              {/* Sun/Moon Theme selector row */}
              <View style={styles.themeSelectorRow}>
                {/* Light */}
                <TouchableOpacity
                  style={[styles.themeBox, selectedTheme === 'light' && { borderColor: currentAccent, backgroundColor: currentAccent + '0d' }]}
                  onPress={() => setTheme('light')}
                >
                  <Feather name="sun" size={16} color={selectedTheme === 'light' ? currentAccent : '#64748b'} style={{ marginRight: 8 }} />
                  <Text style={[styles.themeBoxLabel, selectedTheme === 'light' && styles.activeThemeBoxLabel]}>Light</Text>
                  <View style={[styles.themeRadioCircle, selectedTheme === 'light' && { borderColor: currentAccent, backgroundColor: currentAccent }]}>
                    {selectedTheme === 'light' && <Feather name="check" size={8} color="#ffffff" />}
                  </View>
                </TouchableOpacity>

                {/* Dark */}
                <TouchableOpacity
                  style={[styles.themeBox, selectedTheme === 'dark' && { borderColor: currentAccent, backgroundColor: currentAccent + '0d' }]}
                  onPress={() => setTheme('dark')}
                >
                  <Feather name="moon" size={16} color={selectedTheme === 'dark' ? currentAccent : '#64748b'} style={{ marginRight: 8 }} />
                  <Text style={[styles.themeBoxLabel, selectedTheme === 'dark' && styles.activeThemeBoxLabel]}>Dark</Text>
                  <View style={[styles.themeRadioCircle, selectedTheme === 'dark' && { borderColor: currentAccent, backgroundColor: currentAccent }]}>
                    {selectedTheme === 'dark' && <Feather name="check" size={8} color="#ffffff" />}
                  </View>
                </TouchableOpacity>

                {/* System */}
                <TouchableOpacity
                  style={[styles.themeBox, selectedTheme === 'system' && { borderColor: currentAccent, backgroundColor: currentAccent + '0d' }]}
                  onPress={() => setTheme('system')}
                >
                  <Feather name="smartphone" size={16} color={selectedTheme === 'system' ? currentAccent : '#64748b'} style={{ marginRight: 8 }} />
                  <Text style={[styles.themeBoxLabel, selectedTheme === 'system' && styles.activeThemeBoxLabel]}>System</Text>
                  <View style={[styles.themeRadioCircle, selectedTheme === 'system' && { borderColor: currentAccent, backgroundColor: currentAccent }]}>
                    {selectedTheme === 'system' && <Feather name="check" size={8} color="#ffffff" />}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Accent Color Palette row */}
              <View style={[styles.rowItem, { borderBottomWidth: 0, paddingVertical: 10 }]}>
                <View style={[styles.iconContainer, { borderColor: currentAccent + '40', backgroundColor: currentAccent + '0a' }]}>
                  <MaterialCommunityIcons name="palette" size={16} color={currentAccent} />
                </View>
                <Text style={[styles.rowTitle, { flex: 1, marginLeft: 12 }]}>Accent Color</Text>
                
                {/* Dots row */}
                <View style={styles.accentDotsRow}>
                  {ACCENT_COLORS.map((color, idx) => {
                    const isChecked = selectedAccent === idx;
                    return (
                      <TouchableOpacity
                        key={color}
                        style={[styles.accentDot, { backgroundColor: color }]}
                        onPress={() => setAccentColor(idx)}
                      >
                        {isChecked && <Feather name="check" size={10} color="#050B14" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
              </View>
            </View>
          )}
        </View>

        {/* ==================== 6. Other Settings Section ==================== */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('other')}>
            <View style={styles.sectionHeaderLeft}>
              <Feather name="settings" size={18} color="#64748b" style={{ marginRight: 10 }} />
              <Text style={styles.sectionTitle}>Other Settings</Text>
            </View>
            <Feather name={expanded.other ? "chevron-up" : "chevron-down"} size={16} color="#64748b" />
          </TouchableOpacity>

          {expanded.other && (
            <View style={styles.sectionBody}>
              {/* Units */}
              <TouchableOpacity 
                style={styles.rowItem} 
                onPress={() => {
                  const newUnits = units === 'metric' ? 'imperial' : 'metric';
                  setUnits(newUnits);
                  Alert.alert('Units Configured', `Metrics set to ${newUnits === 'metric' ? 'km and km/h' : 'miles and mph'}.`);
                }}
              >
                <View style={[styles.iconContainer, { borderColor: '#00f5ff40', backgroundColor: '#00f5ff0a' }]}>
                  <MaterialCommunityIcons name="speedometer" size={16} color="#00f5ff" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Units</Text>
                  <Text style={styles.rowSubtitle}>Choose distance and speed units</Text>
                </View>
                <Text style={styles.rowValueText}>{units === 'metric' ? 'Metric (km, km/h)' : 'Imperial (mi, mph)'}</Text>
                <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
              </TouchableOpacity>

              {/* Data Management */}
              <TouchableOpacity style={styles.rowItem} onPress={() => Alert.alert('Data Management', 'Export/Delete operations configured successfully.')}>
                <View style={[styles.iconContainer, { borderColor: '#64748b40', backgroundColor: '#64748b0a' }]}>
                  <Feather name="download" size={16} color="#64748b" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>Data Management</Text>
                  <Text style={styles.rowSubtitle}>Export or delete your data</Text>
                </View>
                <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
              </TouchableOpacity>

              {/* About */}
              <TouchableOpacity style={[styles.rowItem, { borderBottomWidth: 0 }]} onPress={() => Alert.alert('About SafeDrive', 'SafeDrive Telemetry System v1.0.0\nBuilt on React Native.')}>
                <View style={[styles.iconContainer, { borderColor: '#64748b40', backgroundColor: '#64748b0a' }]}>
                  <Feather name="info" size={16} color="#64748b" />
                </View>
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowTitle}>About</Text>
                  <Text style={styles.rowSubtitle}>App version, terms and policies</Text>
                </View>
                <Text style={styles.rowValueText}>v1.0.0</Text>
                <Feather name="chevron-right" size={14} color="#475569" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          )}
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
  },

  // Collapsible setting section card
  settingsSection: {
    backgroundColor: '#0c1626',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: 'bold',
  },
  sectionBody: {
    borderTopWidth: 1,
    borderTopColor: '#122540',
    paddingBottom: 8,
  },

  // Standard row list item
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#122540',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  rowTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  rowSubtitle: {
    color: '#64748b',
    fontSize: 10,
    lineHeight: 12,
    marginTop: 2,
  },
  rowValueText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94a3b8',
  },

  // Switch list item
  switchRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#122540',
  },

  // Slider row list item
  sliderRowItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#122540',
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderValText: {
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  sliderTrackContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  sliderTrackBg: {
    height: 6,
    backgroundColor: '#122540',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderTrackFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginTop: -5, // center vertically over track
    transform: [{ translateX: -8 }], // offset by half thumb width
  },

  // Reset Button
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 245, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 14,
    height: 40,
    marginTop: 14,
    marginBottom: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Theme Switches
  themeSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#122540',
  },
  themeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#050B14',
    borderWidth: 1,
    borderColor: '#122540',
    borderRadius: 12,
    paddingHorizontal: 8,
    height: 38,
    marginRight: 6,
  },
  themeBoxLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
  },
  activeThemeBoxLabel: {
    color: '#ffffff',
  },
  themeRadioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Accent Colors
  accentDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomSpacer: {
    height: 40,
  }
});
