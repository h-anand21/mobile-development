import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { storage } from '../src/database/storage';
import { View, ActivityIndicator } from 'react-native';

export default function AppIndex() {
  const [loading, setLoading] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const checkOnboarding = () => {
      // Temporarily set to false to force onboarding screen for testing
      const completed = false; // storage.getString('has_completed_onboarding') === 'true';
      setHasCompleted(completed);
      setLoading(false);
    };

    if (storage.isLoaded()) {
      checkOnboarding();
    } else {
      const unsubscribe = storage.onLoad(() => {
        checkOnboarding();
      });
      // Fallback timeout in case loading state is already true
      const timer = setTimeout(() => {
        checkOnboarding();
      }, 600);
      return () => {
        unsubscribe();
        clearTimeout(timer);
      };
    }
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030712' }}>
        <ActivityIndicator size="large" color="#00f5ff" />
      </View>
    );
  }

  if (hasCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
