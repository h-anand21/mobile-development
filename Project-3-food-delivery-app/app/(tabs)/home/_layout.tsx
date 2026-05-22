import { Stack, usePathname } from 'expo-router';
import { Theme } from '../../../constants/Theme';

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.background,
        },
        headerTintColor: Theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="restaurant/[id]" 
        options={{
          headerShown: false,
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="product/[id]" 
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="cart" 
        options={{
          title: 'Cart',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }} 
      />
    </Stack>
  );
}
