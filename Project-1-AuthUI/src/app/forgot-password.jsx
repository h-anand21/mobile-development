// src/app/forgot-password.jsx
import React from 'react';
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

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>←</Text>
            </Pressable>

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Select which methods you’d like to reset.
            </Text>

            <View style={styles.option}>
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>✉</Text>
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Email Address</Text>
                <Text style={styles.optionSub}>
                  Send via email address securely.
                </Text>
              </View>
            </View>

            <View style={[styles.option, styles.selectedOption]}>
              <View style={[styles.optionIcon, styles.selectedIcon]}>
                <Text style={styles.optionIconText}>🔐</Text>
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>2 Factor Authentication</Text>
                <Text style={styles.optionSub}>Send via 2FA securely.</Text>
              </View>
            </View>

            <View style={styles.option}>
              <View style={styles.optionIcon}>
                <Text style={styles.optionIconText}>🔒</Text>
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Google Authenticator</Text>
                <Text style={styles.optionSub}>
                  Send via authenticator securely.
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.resetButton}
              onPress={() => console.log('Reset Password')}
            >
              <Text style={styles.resetText}>Reset Password</Text>
              <Text style={styles.arrow}>→</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2B2B2B',
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
    marginTop: 8,
    marginBottom: 22,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  selectedOption: {
    borderColor: GREEN,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIcon: {
    backgroundColor: '#EAF6C2',
  },
  optionIconText: {
    fontSize: 18,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E2E2E',
  },
  optionSub: {
    marginTop: 3,
    fontSize: 12.5,
    color: '#7B7B7B',
  },
  resetButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 16,
  },
  resetText: {
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
});
