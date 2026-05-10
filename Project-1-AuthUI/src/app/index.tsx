// src/app/index.jsx

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

// Components
import AuthInput from '../components/AuthInput';
import SocialButton from '../components/SocialButton';

// Main Screen
export default function SignInScreen() {
  // Email state
  const [email, setEmail] = useState('');

  // Password state
  const [password, setPassword] = useState('');

  // Sign In event
  const handleSignIn = () => {
    console.log('Email:', email);

    console.log('Password:', password);
  };

  // Social login event
  const handleSocialLogin = (provider) => {
    console.log(provider);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* Keyboard avoiding */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Scrollable screen */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Card */}
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoWrapper}>
              <View style={styles.logoShape}>
                <View style={styles.dotTop} />
                <View style={styles.dotBottom} />
                <View style={styles.dotLeft} />
                <View style={styles.dotRight} />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Sign In</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Let’s experience the joy of telecare AI.
            </Text>

            {/* Email Input */}
            <AuthInput
              label="Email Address"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="mail-outline"
            />

            {/* Password Input */}
            <AuthInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              icon="lock-closed-outline"
            />

            {/* Sign In Button */}
            <Pressable style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <SocialButton
                label="logo-facebook"
                onPress={() => handleSocialLogin('facebook')}
              />

              <SocialButton
                label="logo-google"
                onPress={() => handleSocialLogin('google')}
              />

              <SocialButton
                label="logo-instagram"
                onPress={() => handleSocialLogin('instagram')}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable onPress={() => console.log('Sign Up')}>
                <Text style={styles.footerText}>
                  Don’t have an account?
                  <Text style={styles.greenText}> Sign Up</Text>
                </Text>
              </Pressable>

              <Pressable onPress={() => console.log('Forgot Password')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Main Green Color
const GREEN = '#8CCB1F';

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
    paddingTop: 32,
    paddingBottom: 28,

    // Android shadow
    elevation: 5,

    // IOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
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
    fontSize: 32,
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

  signInButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  signInText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 24,
  },

  footer: {
    alignItems: 'center',
    marginTop: 26,
  },

  footerText: {
    fontSize: 14,
    color: '#555',
  },

  greenText: {
    color: GREEN,
    fontWeight: '700',
  },

  forgotText: {
    marginTop: 10,
    color: GREEN,
    fontWeight: '700',
  },
});
