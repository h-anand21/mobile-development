// ============================================================
// DevNest — Profile Setup Screen (3 Steps)
// ============================================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Dimensions, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ArrowLeft, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { AVATARS } from '@/constants/avatars';

const { width } = Dimensions.get('window');

function ProgressBar({ step }: { step: number }) {
  return (
    <View style={styles.progressRow}>
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <View style={[styles.progressNode, step >= s && styles.progressNodeActive]}>
            <Text style={[styles.progressNodeText, step >= s && styles.progressNodeTextActive]}>{s}</Text>
          </View>
          {s < 3 && (
            <View style={[styles.progressLine, step > s && styles.progressLineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { setProfileSetupDone, setUserProfile } = useSettingsStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) return;
      setStep(3);
    } else {
      await setUserProfile({ name: name.trim(), avatarIndex: selectedAvatar });
      await setProfileSetupDone();
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleSkip = async () => {
    await setProfileSetupDone();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ArrowLeft size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <ProgressBar step={step} />
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.emoji}>🪪</Text>
            <View style={styles.glowCircle} />
            <Text style={styles.headline}>
              {"Let's Get "}
              <Text style={styles.green}>Started 👋</Text>
            </Text>
            <Text style={styles.subtitle}>
              Create your profile to personalize your DevNest AI experience.
            </Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.avatarCircle}>
              <User size={64} color={Colors.accent.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.headline}>
              {"What's your "}
              <Text style={styles.green}>name?</Text>
            </Text>
            <Text style={styles.subtitle}>This will be used across your workspace.</Text>
            <View style={styles.inputWrap}>
              <User size={18} color={Colors.text.secondary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={Colors.text.tertiary}
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={30}
              />
            </View>
            <Text style={styles.inputHint}>Display name is visible to you only.</Text>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.headline}>
              {'Choose your '}
              <Text style={styles.green}>avatar</Text>
            </Text>
            <Text style={styles.subtitle}>Pick an avatar that represents you.</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.avatarItem, selectedAvatar === index && styles.avatarItemSelected]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedAvatar(index);
                  }}
                >
                  <Image source={avatar} style={styles.avatarImage} />
                  {selectedAvatar === index && (
                    <View style={styles.avatarCheck}>
                      <Text style={styles.avatarCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.nextBtn, (step === 2 && !name.trim()) && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={step === 2 && !name.trim()}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {step === 1 ? 'Create Profile' : 'Continue'}
          </Text>
          <ChevronRight size={20} color="#000" strokeWidth={2.5} />
        </TouchableOpacity>

        {step === 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.laterBtn}>
            <Text style={styles.laterText}>I'll do this later</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  progressNode: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: Colors.border.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  progressNodeActive: { borderColor: Colors.accent.primary, backgroundColor: Colors.accent.glow },
  progressNodeText: { color: Colors.text.secondary, fontSize: 11, fontWeight: '700' },
  progressNodeTextActive: { color: Colors.accent.primary },
  progressLine: { width: 28, height: 2, backgroundColor: Colors.border.primary },
  progressLineActive: { backgroundColor: Colors.accent.primary },

  body: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20 },
  stepContent: { alignItems: 'center', paddingBottom: 20 },
  emoji: { fontSize: 90, marginBottom: 20 },
  glowCircle: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.accent.glow, top: -10,
  },
  avatarCircle: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderColor: Colors.accent.primary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.accent.muted, marginBottom: 28,
  },
  headline: {
    fontSize: 26, fontWeight: '800', color: Colors.text.primary,
    textAlign: 'center', lineHeight: 36, marginBottom: 12,
  },
  green: { color: Colors.accent.primary },
  subtitle: {
    fontSize: 14, color: Colors.text.secondary,
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  inputWrap: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border.primary,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  input: { flex: 1, color: Colors.text.primary, fontSize: 15 },
  inputHint: { color: Colors.text.tertiary, fontSize: 12, marginTop: 8 },

  avatarGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 12,
    width: '100%',
  },
  avatarItem: {
    width: (width - 56 - 36) / 4, aspectRatio: 1,
    borderRadius: 16, backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.border.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarItemSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.muted,
  },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarCheck: {
    position: 'absolute', bottom: 2, right: 2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarCheckText: { color: '#000', fontSize: 10, fontWeight: '900' },

  bottomArea: {
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 16 : 24,
    paddingTop: 12, alignItems: 'center',
  },
  nextBtn: {
    width: '100%', backgroundColor: Colors.accent.primary,
    borderRadius: 14, height: 54, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  laterBtn: { marginTop: 14 },
  laterText: { color: Colors.text.secondary, fontSize: 14 },
});
