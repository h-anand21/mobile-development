// src/app/index.jsx

// Import React
import React, { useState } from 'react';

// Import React Native components
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

// Import reusable components
import AuthInput from '../components/AuthInput';
import SocialButton from '../components/SocialButton';

// Main screen
export default function SignInScreen() {
  // Store email
  const [email, setEmail] = useState('');

  // Store password
  const [password, setPassword] = useState('');

  // Sign in button event
  const handleSignIn = () => {
    console.log('Email:', email);

    console.log('Password:', password);
  };

  // Social login event
  const handleSocialLogin = (provider) => {
    console.log(provider);
  };

  // Return UI
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Mobile status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ScrollView */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main card */}
          <View style={styles.card}>
            {/* Logo section */}
            <View style={styles.logoWrapper}>
              {/* Custom logo */}
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

            {/* Email input */}
            <AuthInput
              label="Email Address"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {/* Password input */}
            <AuthInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

            {/* Sign in button */}
            <Pressable style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>

            {/* Social row */}
            <View style={styles.socialRow}>
              <SocialButton
                label="F"
                onPress={() => handleSocialLogin('facebook')}
              />

              <SocialButton
                label="G"
                onPress={() => handleSocialLogin('google')}
              />

              <SocialButton
                label="I"
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

// Green color
const GREEN = '#8CCB1F';

// Styles
const styles = StyleSheet.create({
  // Safe area
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Full height
  flex: {
    flex: 1,
  },

  // Scroll content
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // Main card
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

  // Logo wrapper
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },

  // Logo shape
  logoShape: {
    width: 56,
    height: 56,
    position: 'relative',
  },

  // Top dot
  dotTop: {
    position: 'absolute',
    top: 0,
    left: 21,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GREEN,
  },

  // Bottom dot
  dotBottom: {
    position: 'absolute',
    bottom: 0,
    left: 21,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GREEN,
  },

  // Left dot
  dotLeft: {
    position: 'absolute',
    left: 0,
    top: 21,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GREEN,
  },

  // Right dot
  dotRight: {
    position: 'absolute',
    right: 0,
    top: 21,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GREEN,
  },

  // Title
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#2B2B2B',
  },

  // Subtitle
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
    marginBottom: 28,
  },

  // Sign in button
  signInButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  // Button text
  signInText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // Social row
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 24,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 26,
  },

  // Footer text
  footerText: {
    fontSize: 14,
    color: '#555',
  },

  // Green text
  greenText: {
    color: GREEN,
    fontWeight: '700',
  },

  // Forgot text
  forgotText: {
    marginTop: 10,
    color: GREEN,
    fontWeight: '700',
  },
});
