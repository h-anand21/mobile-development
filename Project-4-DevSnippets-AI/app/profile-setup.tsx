// ============================================================
// DevNest — Profile Setup Screen (3 Steps)
// ============================================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Dimensions, Image, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ArrowLeft, User, ArrowRight, CheckCircle, Edit2, Check, Sparkles, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';
import { AVATARS } from '@/constants/avatars';

const { width } = Dimensions.get('window');

function ProgressBar({ step }: { step: number }) {
  if (step === 1) {
    return (
      <View style={styles.pillIndicator}>
        <Text style={styles.pillTextActive}>1</Text>
        <Text style={styles.pillTextInactive}> / 3</Text>
      </View>
    );
  }
  return (
    <View style={styles.headerRightGroup}>
      <View style={styles.progressRow}>
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <View style={[styles.progressNode, step >= s && styles.progressNodeActive, step === s && styles.progressNodeCurrent]}>
              {s < step ? (
                <Check size={14} color="#000" strokeWidth={3} />
              ) : (
                <Text style={[styles.progressNodeText, step >= s && styles.progressNodeTextActive, step === s && styles.progressNodeTextCurrent]}>{s}</Text>
              )}
            </View>
            {s < 3 && (
              <View style={[styles.progressLine, step > s && styles.progressLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.pillIndicator}>
        <Text style={styles.pillTextActive}>{step}</Text>
        <Text style={styles.pillTextInactive}> / 3</Text>
      </View>
    </View>
  );
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { setProfileSetupDone, setUserProfile } = useSettingsStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) return;
      setStep(3);
    } else {
      await setUserProfile({ name: name.trim(), avatarIndex: selectedAvatar, bio: bio.trim() });
      await setProfileSetupDone();
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await setProfileSetupDone();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ArrowLeft size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          <ProgressBar step={step} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View style={styles.stepContent1}>
            <Text style={styles.headlineLeft}>
              Create Your{'\n'}
              <Text style={styles.green}>Profile 👋</Text>
            </Text>
            <Text style={styles.subtitleLeft}>
              Personalize DevNest and unlock a smarter coding workspace.
            </Text>
            
            <View style={styles.imageContainer}>
               <Image 
                 source={require('../assets/profile-cretion/screen-1.png')} 
                 style={styles.heroImage} 
                 resizeMode="cover"
               />
            </View>

            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent2}>
            <View style={styles.topRow}>
              <View style={styles.textColumn}>
                <Text style={styles.headlineLeft}>
                  Tell Us{'\n'}
                  <Text style={styles.green}>About You 👋</Text>
                </Text>
                <Text style={styles.subtitleLeft}>
                  Help us personalize your{'\n'}
                  <Text style={styles.green}>DevNest</Text> experience.
                </Text>
              </View>

              <View style={styles.imageColumn}>
                 <Image 
                   source={require('../assets/profile-cretion/screen-2.png')} 
                   style={styles.heroImage} 
                   resizeMode="contain"
                 />
              </View>
            </View>
            
            {/* Display Name Field */}
            <Text style={styles.inputLabel}>Display Name</Text>
            <View style={styles.fieldContainer}>
              <User size={20} color={name.length > 0 ? Colors.accent.primary : Colors.text.secondary} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter your name"
                placeholderTextColor={Colors.text.tertiary}
                value={name}
                onChangeText={setName}
                maxLength={20}
              />
              {name.length > 0 && <CheckCircle size={20} color={Colors.accent.primary} />}
            </View>
            <View style={styles.fieldFooter}>
              <Text style={styles.fieldHint}>This will be visible to others in the workspace.</Text>
              <Text style={styles.fieldCount}>{name.length}/20</Text>
            </View>

            {/* Bio Field */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Bio (Optional)</Text>
            <View style={[styles.fieldContainer, { alignItems: 'flex-start', paddingVertical: 12 }]}>
              <Edit2 size={20} color={bio.length > 0 ? Colors.accent.primary : Colors.text.secondary} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.fieldInput, { height: 48, textAlignVertical: 'top' }]}
                placeholder="Tell us about yourself..."
                placeholderTextColor={Colors.text.tertiary}
                value={bio}
                onChangeText={setBio}
                maxLength={100}
                multiline
              />
            </View>
            <View style={styles.fieldFooter}>
              <Text style={styles.fieldHint}></Text>
              <Text style={styles.fieldCount}>{bio.length}/100</Text>
            </View>

          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent3}>
            <View style={[styles.topRow, { minHeight: 100, marginBottom: 16 }]}>
              <View style={styles.textColumn}>
                <Text style={styles.headlineLeft}>
                  Choose Your{'\n'}
                  <Text style={styles.green}>Avatar ✨</Text>
                </Text>
                <Text style={styles.subtitleLeft}>
                  Pick an avatar that represents{'\n'}
                  you in the <Text style={styles.green}>DevNest</Text> community.
                </Text>
              </View>

              <View style={[styles.imageColumn, { top: 0, right: -10, width: 160, height: 180, zIndex: -1 }]}>
                 <Image 
                   source={require('../assets/profile-cretion/screen-3.png')} 
                   style={styles.heroImage} 
                   resizeMode="contain"
                 />
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
               <User size={16} color={Colors.text.primary} />
               <Text style={{ color: Colors.text.primary, fontSize: 13, fontWeight: '600' }}>Select an Avatar</Text>
            </View>

            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.avatarItem, selectedAvatar === index && styles.avatarItemSelected]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedAvatar(index);
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={avatar} style={[styles.avatarImage, { borderRadius: 32 }]} />
                  {selectedAvatar === index && (
                    <View style={styles.avatarCheck}>
                      <Check size={12} color="#000" strokeWidth={4} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Avatar Selected Card */}
            <View style={styles.selectedCard}>
               <Sparkles size={16} color={Colors.accent.primary} style={{ position: 'absolute', top: 12, left: 12, opacity: 0.8 }} />
               <View style={styles.selectedCardAvatarBox}>
                 <Image source={AVATARS[selectedAvatar]} style={{ width: '100%', height: '100%', borderRadius: 25 }} />
               </View>
               <View style={{ flex: 1 }}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                   <Text style={{ color: Colors.accent.primary, fontSize: 12, fontWeight: '700' }}>Avatar Selected</Text>
                   <CheckCircle size={12} color={Colors.accent.primary} />
                 </View>
                 <Text style={{ color: Colors.text.primary, fontSize: 18, fontWeight: '800', marginBottom: 6 }} numberOfLines={1}>
                   {name || 'CodeMaster_07'}
                 </Text>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                   <Briefcase size={12} color={Colors.text.secondary} />
                   <Text style={{ color: Colors.text.secondary, fontSize: 12, fontWeight: '500' }} numberOfLines={1}>{bio ? bio : 'Developer'}</Text>
                 </View>
               </View>
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
          {step === 1 ? (
            <View style={styles.nextBtnInner}>
              <Text style={styles.nextText}>Create Profile</Text>
              <ArrowRight size={20} color="#000" strokeWidth={2.5} style={styles.nextBtnIcon} />
            </View>
          ) : step === 2 ? (
            <View style={styles.nextBtnInner}>
              <Text style={styles.nextText}>Next</Text>
              <ArrowRight size={20} color="#000" strokeWidth={2.5} style={styles.nextBtnIcon} />
            </View>
          ) : (
            <View style={styles.nextBtnInner}>
              <Text style={styles.nextText}>🎉 Start My Journey</Text>
              <ArrowRight size={20} color="#000" strokeWidth={2.5} style={styles.nextBtnIcon} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.laterBtn}>
          <Text style={styles.laterText}>{step === 3 ? 'Go to Dashboard >' : "I'll do this later"}</Text>
          <View style={styles.dashedUnderline} />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border.primary
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  progressNode: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.text.tertiary,
    backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  progressNodeCurrent: { borderColor: Colors.accent.primary, backgroundColor: Colors.accent.glow },
  progressNodeActive: { borderColor: Colors.accent.primary, backgroundColor: Colors.accent.primary },
  progressNodeText: { color: Colors.text.tertiary, fontSize: 10, fontWeight: '700' },
  progressNodeTextCurrent: { color: Colors.accent.primary },
  progressNodeTextActive: { color: '#000' },
  progressLine: { width: 20, height: 1, backgroundColor: Colors.border.primary },
  progressLineActive: { backgroundColor: Colors.text.tertiary },

  pillIndicator: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border.primary,
  },
  pillTextActive: { color: Colors.accent.primary, fontSize: 13, fontWeight: '800' },
  pillTextInactive: { color: Colors.text.tertiary, fontSize: 13, fontWeight: '700' },

  body: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20 },
  stepContent: { alignItems: 'center', paddingBottom: 20 },
  stepContent1: { flex: 1, paddingTop: 10 },
  stepContent2: { flex: 1, paddingTop: 10 },
  stepContent3: { flex: 1, paddingTop: 10 },
  
  headlineLeft: {
    fontSize: 34, fontWeight: '900', color: Colors.text.primary,
    lineHeight: 42, marginBottom: 12, letterSpacing: -1,
  },
  subtitleLeft: {
    fontSize: 14, color: Colors.text.secondary,
    lineHeight: 20, marginBottom: 0, paddingRight: 0, fontWeight: '500'
  },
  
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, zIndex: 10, minHeight: 320 },
  textColumn: { width: '65%', paddingTop: 10 },
  imageColumn: { position: 'absolute', right: -60, top: 0, width: 380, height: 430, zIndex: -1, alignItems: 'flex-end' },
  
  imageContainer: {
    flex: 1, minHeight: 550, width: width, marginLeft: -24,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, overflow: 'hidden'
  },
  heroImage: {
    width: '100%', height: '100%'
  },

  dotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.primary },
  dotActive: { backgroundColor: Colors.accent.primary, borderColor: Colors.accent.primary },

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

  inputLabel: { color: Colors.text.primary, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  fieldContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border.primary,
    paddingHorizontal: 14, paddingVertical: 10, gap: 10
  },
  fieldInput: { flex: 1, color: Colors.text.primary, fontSize: 14, fontWeight: '500' },
  fieldFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  fieldHint: { color: Colors.text.tertiary, fontSize: 11, fontWeight: '500' },
  fieldCount: { color: Colors.text.tertiary, fontSize: 11, fontWeight: '500' },

  avatarGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 12,
    width: '100%',
  },
  avatarItem: {
    width: (width - 48 - 36) / 4, aspectRatio: 1,
    borderRadius: 16, backgroundColor: Colors.bg.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarItemSelected: {
    borderColor: Colors.accent.primary, borderWidth: 2,
  },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarCheck: {
    position: 'absolute', bottom: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  
  selectedCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.accent.primary + '40',
    padding: 16, marginTop: 24, gap: 16, position: 'relative'
  },
  selectedCardAvatarBox: {
    width: 72, height: 72, borderRadius: 36, overflow: 'hidden',
    borderWidth: 2, borderColor: Colors.accent.primary
  },

  bottomArea: {
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 16 : 24,
    paddingTop: 12, alignItems: 'center',
  },
  nextBtn: {
    width: '100%', backgroundColor: Colors.accent.primary,
    borderRadius: 20, height: 56, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnInner: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative'
  },
  nextBtnIcon: { position: 'absolute', right: 24 },
  nextBtnDisabled: { opacity: 0.5 },
  nextText: { fontSize: 17, fontWeight: '800', color: '#000000' },
  laterBtn: { marginTop: 20, paddingBottom: 2 },
  laterText: { color: Colors.text.secondary, fontSize: 14, fontWeight: '600' },
  dashedUnderline: { 
    height: 1, width: '100%', borderStyle: 'dashed', 
    borderWidth: 1, borderColor: Colors.border.primary, 
    marginTop: 4 
  },
});
