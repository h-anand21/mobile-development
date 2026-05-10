
import React from 'react';


import { Stack } from 'expo-router';


export default function RootLayout() {
  // Return Stack navigation
  return (
    // screenOptions hides top header
    <Stack screenOptions={{ headerShown: false }} />
  );
}
