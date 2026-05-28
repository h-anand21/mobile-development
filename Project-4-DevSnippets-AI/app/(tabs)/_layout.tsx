import { Tabs } from 'expo-router';
import { Home, Search, Folder, Settings, Plus } from 'lucide-react-native';
import { View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/theme/colors';
import { useSettingsStore } from '@/store/settingsStore';

export default function TabLayout() {
  const colors = useThemeColors();
  const theme = useSettingsStore(s => s.theme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.secondary,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 24,
          right: 24,
          height: 64,
          borderRadius: 32,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          borderWidth: 1,
          borderColor: colors.border.primary,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarItemStyle: {
          paddingTop: 12,
        },
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fab"
        options={{
          title: '',
          tabBarIcon: () => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.accent.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -30,
                borderWidth: 4,
                borderColor: colors.bg.primary,
              }}>
              <Plus size={30} color={theme === 'dark' ? '#000' : '#fff'} strokeWidth={3} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            navigation.navigate('snippet/create');
          },
        })}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: 'Files',
          tabBarIcon: ({ color }) => <Folder size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
