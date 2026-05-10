// src/app/signup.jsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import AuthInput from '../components/AuthInput';

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    console.log('Sign Up:', email, password, confirmPassword);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>←</Text>
            </Pressable>

            <View style={styles.logoWrapper}>
              <View style={styles.logoShape}>
                <View style={styles.dotTop} />
                <View style={styles.dotBottom} />
                <View style={styles.dotLeft} />
                <View style={styles.dotRight} />
              </View>
            </View>

            <Text style={styles.title}>Sign Up For Free</Text>
            <Text style={styles.subtitle}>Sign up in 1 minute for free!</Text>

            <AuthInput
              label="Email Address"
              placeholder="Enter your email..."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="mail-outline"
            />

            <AuthInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              icon="lock-closed-outline"
            />

            <AuthInput
              label="Password Confirmation"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              icon="lock-closed-outline"
            />

            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                ERROR: Password do not match!
              </Text>
            </View>

            <Pressable style={styles.signUpButton} onPress={handleSignUp}>
              <Text style={styles.signUpText}>Sign Up</Text>
              <Text style={styles.arrow}>→</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/')}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={styles.greenText}>Sign In.</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const GREEN = '#8CCB1F';
const RED = '#F15B6C';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  backText: {
    fontSize: 20,
    color: '#444',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoShape: {
    width: 56,
    height: 56,
    position: 'relative',
  },
  dotTop: {
    position: 'absolute',
    top: 0,
    left: 21,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GREEN,
  },
  dotBottom: {
    position: 'absolute',
    bottom: 0,
    left: 21,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GREEN,
  },
  dotLeft: {
    position: 'absolute',
    left: 0,
    top: 21,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GREEN,
  },
  dotRight: {
    position: 'absolute',
    right: 0,
    top: 21,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GREEN,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    color: '#2B2B2B',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
    marginBottom: 28,
  },
  errorBox: {
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: '#FDECEF',
    borderWidth: 1,
    borderColor: RED,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  errorText: {
    color: '#D94B5B',
    fontSize: 13,
    fontWeight: '700',
  },
  signUpButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  signUpText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
  arrow: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  footerText: {
    marginTop: 22,
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  greenText: {
    color: GREEN,
    fontWeight: '700',
  },
});
