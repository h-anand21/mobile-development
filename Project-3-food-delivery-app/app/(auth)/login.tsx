import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput,
  TouchableOpacity, Dimensions, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const GREEN = '#1ed760';

export default function LoginScreen() {
  const router  = useRouter();
  const login   = useAuthStore((s) => s.login);
  const insets  = useSafeAreaInsets();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [focused,  setFocused]  = useState<'email'|'pass'|null>(null);

  const handleLogin = () => {
    login();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── Top hero ───────────────────────────────────────── */}
        <View style={s.hero}>
          {/* Logo centered */}
          <Image
            source={require('../../assets/images/img2.png')}
            style={s.logo}
            resizeMode="contain"
          />

          {/* Tagline */}
          <Text style={s.tagline}>
            Welcome to{' '}
            <Text style={s.taglineGreen}>Foodie</Text>
          </Text>
          <Text style={s.heroSub}>Sign in to order your favorite food</Text>
        </View>

        {/* ── Form card ──────────────────────────────────────── */}
        <View style={[s.card, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={s.cardTitle}>Login</Text>
          <Text style={s.cardSub}>Good to see you back! 👋</Text>

          {/* Email */}
          <View style={[s.inputBox, focused === 'email' && s.inputBoxFocused]}>
            <Ionicons name="mail-outline" size={20}
              color={focused === 'email' ? GREEN : '#666'} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="Email address"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Password */}
          <View style={[s.inputBox, focused === 'pass' && s.inputBoxFocused]}>
            <Ionicons name="lock-closed-outline" size={20}
              color={focused === 'pass' ? GREEN : '#666'} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              onFocus={() => setFocused('pass')}
              onBlur={() => setFocused(null)}
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={s.eyeBtn}>
              <Ionicons name={showPw ? 'eye-outline' : 'eye-off-outline'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={s.forgotRow}>
            <Text style={s.forgotTxt}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity style={s.loginBtn} onPress={handleLogin} activeOpacity={0.88}>
            <Text style={s.loginBtnTxt}>Login</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divTxt}>or continue with</Text>
            <View style={s.divLine} />
          </View>

          {/* Social buttons */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn}>
              <Ionicons name="logo-google"   size={22} color="#DB4437" />
              <Text style={s.socialTxt}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}>
              <Ionicons name="logo-apple"    size={22} color="#fff" />
              <Text style={s.socialTxt}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}>
              <Ionicons name="logo-facebook" size={22} color="#4267B2" />
              <Text style={s.socialTxt}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up */}
          <View style={s.signupRow}>
            <Text style={s.signupTxt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
              <Text style={s.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  // ── Hero ───────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  logo: {
    width: width * 0.52,
    height: height * 0.14,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginTop: -8,
  },
  taglineGreen: { color: GREEN },
  heroSub: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },

  // ── Card ───────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  cardSub: {
    color: '#666',
    fontSize: 14,
    marginBottom: 22,
  },

  // ── Inputs ─────────────────────────────────────────────
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputBoxFocused: {
    borderColor: GREEN,
    backgroundColor: '#0a1a0f',
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  eyeBtn: { padding: 6 },

  // ── Forgot ─────────────────────────────────────────────
  forgotRow: { alignItems: 'flex-end', marginBottom: 22 },
  forgotTxt: { color: GREEN, fontSize: 13, fontWeight: '600' },

  // ── Login button ───────────────────────────────────────
  loginBtn: {
    height: 54,
    backgroundColor: GREEN,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginBtnTxt: { color: '#000', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  // ── Divider ────────────────────────────────────────────
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  divLine:  { flex: 1, height: 1, backgroundColor: '#222' },
  divTxt:   { color: '#555', fontSize: 13, paddingHorizontal: 14 },

  // ── Social ─────────────────────────────────────────────
  socialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  socialBtn: {
    flex: 1,
    backgroundColor: '#161616',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#222',
  },
  socialTxt: { color: '#ccc', fontSize: 11, fontWeight: '600', marginTop: 6 },

  // ── Sign up ────────────────────────────────────────────
  signupRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupTxt:  { color: '#555', fontSize: 14 },
  signupLink: { color: GREEN, fontSize: 14, fontWeight: '700' },
});
