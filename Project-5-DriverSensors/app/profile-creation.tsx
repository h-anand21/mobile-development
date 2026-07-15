import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ScrollView, TouchableOpacity, TextInput, Switch, Modal, FlatList, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Path, Line, Defs, Stop, Rect, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { storage } from '../src/database/storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { DeviceMotion } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 750;

const DefaultAvatar = () => (
  <View style={{ width: 84, height: 84, borderRadius: 42, overflow: 'hidden', backgroundColor: '#0a122c', justifyContent: 'center', alignItems: 'center' }}>
    <Svg width={84} height={84} viewBox="0 0 84 84">
      <Defs>
        <SvgLinearGradient id="cyberAvatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0ea5e9" />
          <Stop offset="100%" stopColor="#22c55e" />
        </SvgLinearGradient>
        <SvgLinearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#0f172a" />
          <Stop offset="100%" stopColor="#020617" />
        </SvgLinearGradient>
      </Defs>
      
      {/* Background */}
      <Rect width={84} height={84} fill="url(#bgGrad)" />
      
      {/* Tech Grid Lines in Background */}
      <Line x1="10" y1="42" x2="74" y2="42" stroke="rgba(0, 245, 255, 0.08)" strokeWidth="1" />
      <Line x1="42" y1="10" x2="42" y2="74" stroke="rgba(0, 245, 255, 0.08)" strokeWidth="1" />
      
      {/* Target Crosshairs */}
      <Circle cx="42" cy="42" r="34" stroke="rgba(34, 197, 94, 0.15)" strokeWidth="1" strokeDasharray="3 4" />
      
      {/* Stylized User Outline */}
      {/* Head */}
      <Circle cx="42" cy="32" r="13" fill="url(#cyberAvatarGrad)" />
      {/* Shoulders */}
      <Path 
        d="M 20 62 C 20 50, 30 46, 42 46 C 54 46, 64 50, 64 62 C 64 63, 64 65, 64 65 L 20 65 Z" 
        fill="url(#cyberAvatarGrad)" 
      />
      
      {/* Sleek cyber HUD lines over avatar */}
      <Path d="M 28 65 L 56 65" stroke="#00f5ff" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="42" cy="32" r="16" stroke="#00f5ff" strokeWidth="1.2" strokeDasharray="2 3" opacity={0.6} />
    </Svg>
  </View>
);

export default function ProfileCreationScreen() {
  const router = useRouter();
  
  // Form States
  const [fullName, setFullName] = useState('Himanshu Anand');
  const [age, setAge] = useState('22');
  const [experience, setExperience] = useState('1-3 Years');
  const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'truck' | 'van'>('car');
  const [drivingGoal, setDrivingGoal] = useState<'safe' | 'score' | 'fleet' | 'insurance'>('safe');
  const [aiCoach, setAiCoach] = useState(true);
  
  // Mock image picker states
  const [avatarSelected, setAvatarSelected] = useState<string | boolean>(true); // Default to true to show the cool cyber avatar!
  
  // Dropdown Modal State
  const [showExpModal, setShowExpModal] = useState(false);
  const expOptions = ['Less than 1 Year', '1-3 Years', '3-5 Years', '5+ Years'];

  // Permission States
  const [locationGranted, setLocationGranted] = useState(false);
  const [motionGranted, setMotionGranted] = useState(false);
  const [alertsGranted, setAlertsGranted] = useState(true);
  const [backgroundGranted, setBackgroundGranted] = useState(false);

  const checkPermissions = async () => {
    try {
      const locStatus = await Location.getForegroundPermissionsAsync();
      setLocationGranted(locStatus.granted);
      setBackgroundGranted(locStatus.granted);

      const motionStatus = await DeviceMotion.getPermissionsAsync();
      setMotionGranted(motionStatus.granted);
    } catch (e) {
      console.warn('Error checking permissions:', e);
    }
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    setLocationGranted(granted);
    setBackgroundGranted(granted);
    return granted;
  };

  const requestMotion = async () => {
    const { status } = await DeviceMotion.requestPermissionsAsync();
    const granted = status === 'granted';
    setMotionGranted(granted);
    return granted;
  };

  // Check and prompt permissions on mount
  useEffect(() => {
    const initPermissions = async () => {
      await checkPermissions();
      // Prompt user automatically for both permissions
      const loc = await requestLocation();
      if (loc) {
        await requestMotion();
      } else {
        await requestMotion();
      }
    };
    initPermissions();
  }, []);

  const handleCreateProfile = async () => {
    // Validate that permissions are granted before proceeding
    if (!locationGranted || !motionGranted) {
      Alert.alert(
        'Permissions Required',
        'SyncDrive needs Location and Motion permissions to track your driving safety and sensor telemetry. Please grant them to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Grant Permissions',
            onPress: async () => {
              const loc = await requestLocation();
              const mot = await requestMotion();
              if (loc && mot) {
                // If both are granted after clicking, save and redirect
                saveProfileAndRedirect();
              }
            }
          }
        ]
      );
      return;
    }

    saveProfileAndRedirect();
  };

  const saveProfileAndRedirect = () => {
    // Save profile details to database/MMKV storage
    storage.set('user_full_name', fullName);
    storage.set('user_age', age);
    storage.set('user_experience', experience);
    storage.set('user_vehicle_type', vehicleType);
    storage.set('user_driving_goal', drivingGoal);
    storage.set('user_enable_ai_coach', aiCoach ? 'true' : 'false');
    storage.set('has_completed_onboarding', 'true');
    
    // Redirect to main tabs
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    storage.set('has_completed_onboarding', 'true');
    router.replace('/(tabs)');
  };

  const selectAvatar = async (type: 'camera' | 'library') => {
    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take a photo.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setAvatarSelected(result.assets[0].uri);
          storage.set('user_avatar_uri', result.assets[0].uri);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Photo library permission is required to choose a photo.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setAvatarSelected(result.assets[0].uri);
          storage.set('user_avatar_uri', result.assets[0].uri);
        }
      }
    } catch (error) {
      console.log('Error selecting image:', error);
      Alert.alert('Error', 'Something went wrong while selecting image.');
    }
  };

  const clearAvatar = () => {
    setAvatarSelected(false);
    storage.delete('user_avatar_uri');
  };

  return (
    <LinearGradient colors={['#040814', '#02040a']} style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/onboarding')}>
          <Feather name="arrow-left" size={20} color="#00f5ff" />
        </TouchableOpacity>
        
        <View style={styles.logoRow}>
          <Image 
            source={require('../assets/icon/black -icon.png')} 
            style={styles.logoIcon} 
          />
          <Text style={styles.logoText}>
            Safe<Text style={styles.logoTextHighlight}>Drive</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>
            Let's create your{"\n"}
            <Text style={styles.welcomeTitleHighlight}>driver profile</Text>
          </Text>
          <Text style={styles.welcomeSubtitle}>
            This helps us generate accurate driving insights and safety scores.
          </Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarMainCol}>
            {/* Glowing Ring around Avatar */}
            <View style={styles.avatarGlowCircle}>
              <Svg width={110} height={110} viewBox="0 0 110 110" style={styles.avatarSvgRing}>
                <Defs>
                  <SvgLinearGradient id="avatarRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#00f5ff" />
                    <Stop offset="50%" stopColor="#84cc16" />
                    <Stop offset="100%" stopColor="#22c55e" />
                  </SvgLinearGradient>
                </Defs>
                <Circle cx="55" cy="55" r="50" stroke="url(#avatarRingGrad)" strokeWidth="3" fill="none" />
                <Circle cx="55" cy="55" r="44" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none" strokeDasharray="3 3" />
              </Svg>
              
              {/* Actual Avatar Image */}
              <TouchableOpacity style={styles.avatarTouchable} onPress={() => selectAvatar('library')}>
                {avatarSelected === true ? (
                  <DefaultAvatar />
                ) : typeof avatarSelected === 'string' ? (
                  <Image 
                    source={{ uri: avatarSelected }} 
                    style={styles.avatarImg} 
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person-outline" size={40} color="#64748b" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Camera Icon Overlay */}
              <TouchableOpacity style={styles.cameraIconBadge} onPress={() => selectAvatar('camera')}>
                <Feather name="camera" size={12} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Photo Selection Buttons */}
            <View style={styles.photoActionsRow}>
              <TouchableOpacity style={styles.photoActionBtn} onPress={() => selectAvatar('camera')}>
                <Feather name="camera" size={14} color="#22c55e" style={styles.photoActionIcon} />
                <Text style={styles.photoActionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoActionBtn} onPress={() => selectAvatar('library')}>
                <Feather name="image" size={14} color="#00f5ff" style={styles.photoActionIcon} />
                <Text style={styles.photoActionText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoActionBtn} onPress={clearAvatar}>
                <Feather name="trash-2" size={14} color="#ef4444" style={styles.photoActionIcon} />
                <Text style={styles.photoActionText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Input Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.nameAgeRow}>
            {/* Full Name Input */}
            <View style={[styles.inputBox, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputTextRow}>
                <Feather name="user" size={16} color="#22c55e" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your name"
                  placeholderTextColor="#475569"
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            {/* Age Input */}
            <View style={[styles.inputBox, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Age</Text>
              <View style={styles.inputTextRow}>
                <Feather name="calendar" size={16} color="#84cc16" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={age}
                  onChangeText={setAge}
                  placeholder="22"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  keyboardAppearance="dark"
                  maxLength={3}
                />
              </View>
            </View>
          </View>

          {/* Driving Experience Dropdown */}
          <TouchableOpacity 
            style={styles.dropdownInputBox}
            onPress={() => setShowExpModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.inputLabel}>Driving Experience</Text>
            <View style={styles.dropdownValueRow}>
              <MaterialCommunityIcons name="steering" size={18} color="#22c55e" style={styles.inputIcon} />
              <Text style={styles.dropdownText}>{experience}</Text>
              <Feather name="chevron-down" size={18} color="#64748b" style={styles.dropdownArrow} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Vehicle Type Section */}
        <View style={styles.selectorSection}>
          <View style={styles.selectorHeader}>
            <Ionicons name="car-outline" size={18} color="#22c55e" style={styles.selectorIcon} />
            <Text style={styles.selectorTitle}>Vehicle Type</Text>
          </View>
          
          <View style={styles.cardsRow}>
            {/* Car */}
            <TouchableOpacity 
              style={[styles.selectorCard, vehicleType === 'car' && styles.selectorCardActive]}
              onPress={() => setVehicleType('car')}
            >
              {vehicleType === 'car' && (
                <View style={styles.checkIndicator}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                </View>
              )}
              <FontAwesome5 name="car" size={20} color={vehicleType === 'car' ? '#00f5ff' : '#64748b'} />
              <Text style={[styles.cardLabel, vehicleType === 'car' && styles.cardLabelActive]}>Car</Text>
            </TouchableOpacity>

            {/* Bike */}
            <TouchableOpacity 
              style={[styles.selectorCard, vehicleType === 'bike' && styles.selectorCardActive]}
              onPress={() => setVehicleType('bike')}
            >
              {vehicleType === 'bike' && (
                <View style={styles.checkIndicator}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                </View>
              )}
              <FontAwesome5 name="motorcycle" size={20} color={vehicleType === 'bike' ? '#00f5ff' : '#64748b'} />
              <Text style={[styles.cardLabel, vehicleType === 'bike' && styles.cardLabelActive]}>Bike</Text>
            </TouchableOpacity>

            {/* Truck */}
            <TouchableOpacity 
              style={[styles.selectorCard, vehicleType === 'truck' && styles.selectorCardActive]}
              onPress={() => setVehicleType('truck')}
            >
              {vehicleType === 'truck' && (
                <View style={styles.checkIndicator}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                </View>
              )}
              <FontAwesome5 name="truck" size={18} color={vehicleType === 'truck' ? '#00f5ff' : '#64748b'} />
              <Text style={[styles.cardLabel, vehicleType === 'truck' && styles.cardLabelActive]}>Truck</Text>
            </TouchableOpacity>

            {/* Van */}
            <TouchableOpacity 
              style={[styles.selectorCard, vehicleType === 'van' && styles.selectorCardActive]}
              onPress={() => setVehicleType('van')}
            >
              {vehicleType === 'van' && (
                <View style={styles.checkIndicator}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                </View>
              )}
              <FontAwesome5 name="shuttle-van" size={18} color={vehicleType === 'van' ? '#00f5ff' : '#64748b'} />
              <Text style={[styles.cardLabel, vehicleType === 'van' && styles.cardLabelActive]}>Van</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Driving Goal Section */}
        <View style={styles.selectorSection}>
          <View style={styles.selectorHeader}>
            <MaterialCommunityIcons name="target" size={18} color="#22c55e" style={styles.selectorIcon} />
            <Text style={styles.selectorTitle}>Driving Goal <Text style={styles.optionalText}>(Choose one)</Text></Text>
          </View>

          <View style={styles.cardsRow}>
            {/* Safe Driving */}
            <TouchableOpacity 
              style={[styles.goalCard, drivingGoal === 'safe' && styles.selectorCardActive]}
              onPress={() => setDrivingGoal('safe')}
            >
              {drivingGoal === 'safe' && (
                <View style={styles.checkIndicator}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                </View>
              )}
              <Feather name="shield" size={18} color={drivingGoal === 'safe' ? '#00f5ff' : '#64748b'} />
              <Text style={[styles.cardLabel, drivingGoal === 'safe' && styles.cardLabelActive]}>Safe Driving</Text>
            </TouchableOpacity>

            {/* Improve Score */}
            <TouchableOpacity 
              style={[styles.goalCard, drivingGoal === 'score' && styles.selectorCardActive]}
              onPress={() => setDrivingGoal('score')}
            >
              {drivingGoal === 'score' && (
                <View style={styles.checkIndicator}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                </View>
              )}
              <Feather name="trending-up" size={18} color={drivingGoal === 'score' ? '#00f5ff' : '#64748b'} />
              <Text style={[styles.cardLabel, drivingGoal === 'score' && styles.cardLabelActive]}>Improve Score</Text>
            </TouchableOpacity>

            {/* Fleet Tracking */}
            <TouchableOpacity 
              style={[styles.goalCard, drivingGoal === 'fleet' && styles.selectorCardActive]}
              onPress={() => setDrivingGoal('fleet')}
            >
              {drivingGoal === 'fleet' && (
                <View style={styles.checkIndicator}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                </View>
              )}
              <Feather name="navigation" size={18} color={drivingGoal === 'fleet' ? '#00f5ff' : '#64748b'} />
              <Text style={[styles.cardLabel, drivingGoal === 'fleet' && styles.cardLabelActive]}>Fleet Track</Text>
            </TouchableOpacity>

            {/* Insurance Benefits */}
            <TouchableOpacity 
              style={[styles.goalCard, drivingGoal === 'insurance' && styles.selectorCardActive]}
              onPress={() => setDrivingGoal('insurance')}
            >
              {drivingGoal === 'insurance' && (
                <View style={styles.checkIndicator}>
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                </View>
              )}
              <Feather name="file-text" size={18} color={drivingGoal === 'insurance' ? '#00f5ff' : '#64748b'} />
              <Text style={[styles.cardLabel, drivingGoal === 'insurance' && styles.cardLabelActive]}>Insurance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enable AI Coach Switch Section */}
        <View style={styles.switchBox}>
          <View style={styles.robotIconCircle}>
            <MaterialCommunityIcons name="robot-outline" size={20} color="#00f5ff" />
          </View>
          <View style={styles.switchTextCol}>
            <Text style={styles.switchTitle}>Enable AI Driving Coach</Text>
            <Text style={styles.switchDesc}>Receive personalized driving feedback after every trip.</Text>
          </View>
          <Switch
            trackColor={{ false: '#1e293b', true: '#22c55e' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#1e293b"
            onValueChange={setAiCoach}
            value={aiCoach}
          />
        </View>

        {/* Required Permissions Panel */}
        <View style={styles.permissionsPanel}>
          <View style={styles.permissionsHeader}>
            <Feather name="shield" size={18} color="#00f5ff" style={styles.selectorIcon} />
            <Text style={styles.permissionsTitle}>Required Permissions</Text>
          </View>

          <View style={styles.permissionsRow}>
            {/* Location */}
            <TouchableOpacity 
              style={[styles.permissionItem, { borderWidth: 1, borderColor: locationGranted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.2)' }]} 
              onPress={requestLocation}
            >
              <Ionicons name="location-outline" size={20} color={locationGranted ? "#22c55e" : "#ef4444"} style={styles.permissionIcon} />
              <Text style={[styles.permissionLabel, { color: locationGranted ? "#22c55e" : "#ef4444" }]}>Location</Text>
              <Ionicons name={locationGranted ? "checkmark-circle" : "close-circle"} size={16} color={locationGranted ? "#22c55e" : "#ef4444"} />
            </TouchableOpacity>

            {/* Motion */}
            <TouchableOpacity 
              style={[styles.permissionItem, { borderWidth: 1, borderColor: motionGranted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.2)' }]} 
              onPress={requestMotion}
            >
              <MaterialCommunityIcons name="gesture-double-tap" size={20} color={motionGranted ? "#22c55e" : "#ef4444"} style={styles.permissionIcon} />
              <Text style={[styles.permissionLabel, { color: motionGranted ? "#22c55e" : "#ef4444" }]}>Motion</Text>
              <Ionicons name={motionGranted ? "checkmark-circle" : "close-circle"} size={16} color={motionGranted ? "#22c55e" : "#ef4444"} />
            </TouchableOpacity>

            {/* Alerts */}
            <View style={[styles.permissionItem, { borderWidth: 1, borderColor: alertsGranted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.2)' }]}>
              <Ionicons name="notifications-outline" size={20} color={alertsGranted ? "#22c55e" : "#ef4444"} style={styles.permissionIcon} />
              <Text style={[styles.permissionLabel, { color: alertsGranted ? "#22c55e" : "#ef4444" }]}>Alerts</Text>
              <Ionicons name={alertsGranted ? "checkmark-circle" : "close-circle"} size={16} color={alertsGranted ? "#22c55e" : "#ef4444"} />
            </View>

            {/* Background */}
            <View style={[styles.permissionItem, { borderWidth: 1, borderColor: backgroundGranted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.2)' }]}>
              <MaterialCommunityIcons name="sync" size={20} color={backgroundGranted ? "#22c55e" : "#ef4444"} style={styles.permissionIcon} />
              <Text style={[styles.permissionLabel, { color: backgroundGranted ? "#22c55e" : "#ef4444" }]}>Background</Text>
              <Ionicons name={backgroundGranted ? "checkmark-circle" : "close-circle"} size={16} color={backgroundGranted ? "#22c55e" : "#ef4444"} />
            </View>
          </View>
        </View>

        {/* Security Banner */}
        <View style={styles.securityBanner}>
          {/* Padlock Svg Graphic */}
          <View style={styles.securityIconWrap}>
            <Svg width={36} height={36} viewBox="0 0 36 36">
              <Defs>
                <SvgLinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#84cc16" />
                  <Stop offset="100%" stopColor="#22c55e" />
                </SvgLinearGradient>
              </Defs>
              <Path d="M 18 4 L 30 8 L 30 18 C 30 25, 25 30, 18 32 C 11 30, 6 25, 6 18 L 6 8 Z" fill="none" stroke="url(#shieldGrad)" strokeWidth="1.5" />
              <Rect x="13" y="15" width="10" height="8" rx="1.5" fill="#22c55e" />
              <Path d="M 15 15 L 15 12 C 15 10, 21 10, 21 12 L 21 15" fill="none" stroke="#22c55e" strokeWidth="1.5" />
            </Svg>
          </View>
          <View style={styles.securityTextCol}>
            <Text style={styles.securityTitle}>Your data is secure</Text>
            <Text style={styles.securityDesc}>Your data is encrypted and used only for driving analytics and improving your safety.</Text>
          </View>
        </View>

        {/* Submit Actions */}
        <TouchableOpacity style={styles.wideActionButton} onPress={handleCreateProfile}>
          <LinearGradient
            colors={['#00f5ff', '#84cc16']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.wideButtonGradient}
          >
            <Text style={styles.wideButtonText}>Create Profile</Text>
            <View style={styles.arrowCircle}>
              <Feather name="arrow-right" size={16} color="#ffffff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Pagination Dots at bottom representing page 4 of 4 */}
        <View style={styles.dotsRowCenter}>
          {[0, 1, 2, 3].map((idx) => (
            <View 
              key={idx} 
              style={[
                styles.dot, 
                idx === 3 ? styles.activeDot : styles.inactiveDot
              ]} 
            />
          ))}
        </View>
      </ScrollView>

      {/* Experience Option Modal */}
      <Modal
        visible={showExpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Experience</Text>
              <TouchableOpacity onPress={() => setShowExpModal(false)}>
                <Feather name="x" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={expOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.modalItem, experience === item && styles.modalItemActive]}
                  onPress={() => {
                    setExperience(item);
                    setShowExpModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, experience === item && styles.modalItemTextActive]}>
                    {item}
                  </Text>
                  {experience === item && <Feather name="check" size={18} color="#22c55e" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: 55,
    paddingBottom: 10,
    zIndex: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    marginRight: 6,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  logoTextHighlight: {
    color: '#22c55e',
  },
  skipBtn: {
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
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  welcomeTitleHighlight: {
    color: '#22c55e',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginTop: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarMainCol: {
    alignItems: 'center',
    width: '100%',
  },
  avatarGlowCircle: {
    width: 110,
    height: 110,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSvgRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  avatarTouchable: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    zIndex: 2,
    backgroundColor: '#0a122c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 84,
    height: 84,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#00f5ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#02040a',
    zIndex: 3,
  },
  photoActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 15,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  photoActionIcon: {
    marginRight: 6,
  },
  photoActionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  formSection: {
    width: '100%',
    marginBottom: 20,
  },
  nameAgeRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
  },
  inputBox: {
    backgroundColor: 'rgba(10, 25, 47, 0.35)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  inputLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '600',
    padding: 0,
    height: 24,
  },
  dropdownInputBox: {
    backgroundColor: 'rgba(10, 25, 47, 0.35)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    width: '100%',
  },
  dropdownValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    position: 'relative',
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '600',
  },
  dropdownArrow: {
    position: 'absolute',
    right: 0,
  },
  selectorSection: {
    width: '100%',
    marginBottom: 22,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectorIcon: {
    marginRight: 8,
  },
  selectorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  optionalText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'normal',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  selectorCard: {
    width: (width - 74) / 4,
    height: 64,
    backgroundColor: 'rgba(10, 25, 47, 0.3)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectorCardActive: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.04)',
  },
  checkIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  cardLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: 'bold',
    marginTop: 6,
  },
  cardLabelActive: {
    color: '#ffffff',
  },
  goalCard: {
    width: (width - 74) / 4,
    height: 64,
    backgroundColor: 'rgba(10, 25, 47, 0.3)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 25, 47, 0.35)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    marginBottom: 22,
  },
  robotIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 245, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  switchTextCol: {
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  switchDesc: {
    fontSize: 9.5,
    color: '#64748b',
    lineHeight: 13,
    marginTop: 2,
  },
  permissionsPanel: {
    backgroundColor: 'rgba(10, 25, 47, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    marginBottom: 22,
  },
  permissionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  permissionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  permissionItem: {
    width: (width - 74) / 4,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    borderRadius: 12,
    paddingVertical: 8,
  },
  permissionIcon: {
    marginBottom: 4,
  },
  permissionLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.08)',
    padding: 12,
    marginBottom: 25,
  },
  securityIconWrap: {
    marginRight: 12,
  },
  securityTextCol: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  securityDesc: {
    fontSize: 9.5,
    color: '#64748b',
    lineHeight: 13,
    marginTop: 2,
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
    marginBottom: 20,
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
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
  },
  dotsRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#334155',
  },
  activeDot: {
    width: 14,
    backgroundColor: '#22c55e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#090d16',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 25,
    paddingBottom: 40,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  modalItemActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.02)',
  },
  modalItemText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  modalItemTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
