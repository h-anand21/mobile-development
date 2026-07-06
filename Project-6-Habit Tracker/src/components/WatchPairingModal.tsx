import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable,
  ScrollView, ActivityIndicator, TextInput,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat,
  withTiming, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useWatchSync, DiscoveredDevice } from '../hooks/use-watch-sync';

interface WatchPairingModalProps {
  visible: boolean;
  onClose: () => void;
}

// Radar Pulse ring component
function RadarRing({ index, size = 120, T }: { index: number; size?: number; T: any }) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    const delay = index * 800;
    const timer = setTimeout(() => {
      scale.value = withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      opacity.value = withRepeat(
        withTiming(0, { duration: 2400, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.radarRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: T.teal,
          borderWidth: 1.5,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function WatchPairingModal({ visible, onClose }: WatchPairingModalProps) {
  const { T } = useTheme();
  const {
    status,
    bleDevices,
    startScan,
    stopScan,
    connectDevice,
    connectCustomDevice,
  } = useWatchSync();

  const [customName, setCustomName] = useState('');

  // Start scan on open, stop on close
  useEffect(() => {
    if (visible) {
      startScan();
    } else {
      stopScan();
      setCustomName('');
    }
  }, [visible]);

  const handlePairCustom = () => {
    if (customName.trim()) {
      connectCustomDevice(customName);
      setCustomName('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: T.bg }]}>

          {/* Modal Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: T.textPrimary }]}>Pair Smart Watch</Text>
            <Pressable onPress={onClose} style={[T.neo, styles.closeBtn]}>
              <Text style={[styles.closeText, { color: T.textPrimary }]}>✕</Text>
            </Pressable>
          </View>

          {/* Scanning Radar Area */}
          {(status === 'scanning' || status === 'connecting') && (
            <View style={styles.radarContainer}>
              <View style={styles.radarWrapper}>
                <RadarRing index={0} T={T} />
                <RadarRing index={1} T={T} />
                <RadarRing index={2} T={T} />
                <View style={[T.neo, styles.radarCenter, { backgroundColor: T.bg }]}>
                  {status === 'connecting' ? (
                    <ActivityIndicator size="small" color={T.teal} />
                  ) : (
                    <Text style={{ fontSize: 24 }}>⌚</Text>
                  )}
                </View>
              </View>
              <Text style={[styles.radarStatus, { color: T.textSub }]}>
                {status === 'connecting' ? 'Connecting to watch...' : 'Searching for Bluetooth devices...'}
              </Text>
            </View>
          )}

          {/* Devices Scroll List */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollList}>
            {status !== 'connecting' && (
              <>
                <Text style={[styles.sectionLabel, { color: T.textMuted }]}>
                  {bleDevices.length > 0 ? 'Discovered Devices' : ''}
                </Text>
                
                {bleDevices.map((dev) => (
                  <Pressable
                    key={dev.id}
                    onPress={() => connectDevice(dev.id, dev.name)}
                    style={({ pressed }) => [
                      T.neo,
                      styles.deviceRow,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <View style={styles.deviceInfo}>
                      <Text style={{ fontSize: 18 }}>⌚</Text>
                      <View>
                        <Text style={[styles.deviceName, { color: T.textPrimary }]}>
                          {dev.name}
                        </Text>
                        <Text style={[styles.deviceAddress, { color: T.textMuted }]}>
                          Tap to pair
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.rssiText, { color: T.teal }]}>
                      📶 {dev.rssi} dBm
                    </Text>
                  </Pressable>
                ))}

                {/* Custom Device Pairing Section */}
                <View style={[T.neo, styles.customPairSection]}>
                  <Text style={[styles.customLabel, { color: T.textPrimary }]}>
                    Pair Custom Smart Watch
                  </Text>
                  <Text style={[styles.customSub, { color: T.textMuted }]}>
                    Enter any smartwatch model to pair it instantly
                  </Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: T.textPrimary,
                          borderColor: T.borderMid,
                          backgroundColor: T.isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.4)',
                        },
                      ]}
                      placeholder="e.g., Noise Fit Active, Fire-Boltt"
                      placeholderTextColor={T.textMuted}
                      value={customName}
                      onChangeText={setCustomName}
                      maxLength={24}
                    />
                    <Pressable
                      onPress={handlePairCustom}
                      style={[
                        styles.pairBtn,
                        { backgroundColor: T.teal },
                      ]}
                    >
                      <Text style={[styles.pairBtnText, { color: T.isDark ? T.bg : '#ffffff' }]}>
                        Connect
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Radar Animation
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  radarWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing: {
    position: 'absolute',
  },
  radarCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  radarStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },

  // Devices list
  scrollList: {
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
  },
  deviceAddress: {
    fontSize: 10,
    marginTop: 2,
  },
  rssiText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Custom Pair Section
  customPairSection: {
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  customSub: {
    fontSize: 11,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  pairBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
