// FAB is handled by the tab bar layout's tabBarButton
// This file is required by Expo Router but never renders
import { Redirect } from 'expo-router';
export default function FAB() {
  return <Redirect href="/(tabs)" />;
}
