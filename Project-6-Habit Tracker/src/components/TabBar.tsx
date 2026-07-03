import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

// ─── SVG Icon Components ───

function IconHome({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconActivity({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.5 5.5C13.5 6.605 12.605 7.5 11.5 7.5C10.395 7.5 9.5 6.605 9.5 5.5C9.5 4.395 10.395 3.5 11.5 3.5C12.605 3.5 13.5 4.395 13.5 5.5Z"
        fill={color}
      />
      <Path
        d="M7 14L9.5 9.5L12 12L14.5 8L17 11"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M7 17.5H17M7 20.5H14"
        stroke={color} strokeWidth={1.8} strokeLinecap="round"
      />
    </Svg>
  );
}

function IconPlus({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

function IconBarChart({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="12" width="4" height="9" rx="1" stroke={color} strokeWidth={1.8} />
      <Rect x="10" y="7" width="4" height="14" rx="1" stroke={color} strokeWidth={1.8} />
      <Rect x="17" y="3" width="4" height="18" rx="1" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function IconTrophy({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 21H16M12 17V21M6 3H18V12C18 15.31 15.31 18 12 18C8.69 18 6 15.31 6 12V3Z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round"
      />
      <Path
        d="M6 7H3C3 7 3 12 6 12M18 7H21C21 7 21 12 18 12"
        stroke={color} strokeWidth={1.8} strokeLinecap="round"
      />
    </Svg>
  );
}

function IconGear({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15C13.657 15 15 13.657 15 12C15 10.343 13.657 9 12 9C10.343 9 9 10.343 9 12C9 13.657 10.343 15 12 15Z"
        stroke={color} strokeWidth={1.8}
      />
      <Path
        d="M19.4 15C19.2 15.5 19.3 16.1 19.7 16.5L19.8 16.6C20.1 16.9 20.3 17.3 20.3 17.7C20.3 18.1 20.1 18.5 19.8 18.8L18.8 19.8C18.5 20.1 18.1 20.3 17.7 20.3C17.3 20.3 16.9 20.1 16.6 19.8L16.5 19.7C16.1 19.3 15.5 19.2 15 19.4L14.8 19.5C14.3 19.7 14 20.2 14 20.7V21C14 21.55 13.55 22 13 22H11C10.45 22 10 21.55 10 21V20.7C10 20.2 9.7 19.7 9.2 19.5L9 19.4C8.5 19.2 7.9 19.3 7.5 19.7L7.4 19.8C7.1 20.1 6.7 20.3 6.3 20.3C5.9 20.3 5.5 20.1 5.2 19.8L4.2 18.8C3.9 18.5 3.7 18.1 3.7 17.7C3.7 17.3 3.9 16.9 4.2 16.6L4.3 16.5C4.7 16.1 4.8 15.5 4.6 15L4.5 14.8C4.3 14.3 3.8 14 3.3 14H3C2.45 14 2 13.55 2 13V11C2 10.45 2.45 10 3 10H3.3C3.8 10 4.3 9.7 4.5 9.2L4.6 9C4.8 8.5 4.7 7.9 4.3 7.5L4.2 7.4C3.9 7.1 3.7 6.7 3.7 6.3C3.7 5.9 3.9 5.5 4.2 5.2L5.2 4.2C5.5 3.9 5.9 3.7 6.3 3.7C6.7 3.7 7.1 3.9 7.4 4.2L7.5 4.3C7.9 4.7 8.5 4.8 9 4.6L9.2 4.5C9.7 4.3 10 3.8 10 3.3V3C10 2.45 10.45 2 11 2H13C13.55 2 14 2.45 14 3V3.3C14 3.8 14.3 4.3 14.8 4.5L15 4.6C15.5 4.8 16.1 4.7 16.5 4.3L16.6 4.2C16.9 3.9 17.3 3.7 17.7 3.7C18.1 3.7 18.5 3.9 18.8 4.2L19.8 5.2C20.1 5.5 20.3 5.9 20.3 6.3C20.3 6.7 20.1 7.1 19.8 7.4L19.7 7.5C19.3 7.9 19.2 8.5 19.4 9L19.5 9.2C19.7 9.7 20.2 10 20.7 10H21C21.55 10 22 10.45 22 11V13C22 13.55 21.55 14 21 14H20.7C20.2 14 19.7 14.3 19.5 14.8L19.4 15Z"
        stroke={color} strokeWidth={1.8}
      />
    </Svg>
  );
}

// ─── Tab Definitions ───
export type TabId = 'home' | 'activity' | 'add' | 'analytics' | 'badges' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  route: string;
  icon: (color: string, size?: number) => React.ReactNode;
  isAdd?: boolean;
}

const TABS: Tab[] = [
  {
    id: 'home',
    label: 'Home',
    route: '/',
    icon: (c, s) => <IconHome color={c} size={s} />,
  },
  {
    id: 'activity',
    label: 'Activity',
    route: '/activity',
    icon: (c, s) => <IconActivity color={c} size={s} />,
  },
  {
    id: 'add',
    label: 'Add',
    route: '/new',
    icon: (c, s) => <IconPlus color={c} size={s} />,
    isAdd: true,
  },
  {
    id: 'analytics',
    label: 'Stats',
    route: '/analytics',
    icon: (c, s) => <IconBarChart color={c} size={s} />,
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: (c, s) => <IconGear color={c} size={s} />,
  },
];

interface TabBarProps {
  activeTab: TabId;
}

function TabItem({
  tab,
  isActive,
  T,
  onPress,
}: {
  tab: Tab;
  isActive: boolean;
  T: any;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.82, { damping: 10 }), withSpring(1, { damping: 12 }));
    onPress();
  };

  if (tab.isAdd) {
    return (
      <Pressable style={styles.tabItemWrap} onPress={handlePress}>
        <Animated.View style={[styles.addBubble, { backgroundColor: T.teal, shadowColor: T.teal }, aStyle]}>
          {tab.icon(T.bg, 20)}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.tabItemWrap} onPress={handlePress}>
      <Animated.View
        style={[
          styles.tabIconWrap,
          isActive && { backgroundColor: T.tealDim },
          aStyle,
        ]}
      >
        {tab.icon(isActive ? T.teal : T.textMuted, 20)}
      </Animated.View>
      <Text style={[styles.tabLabel, { color: isActive ? T.teal : T.textMuted }]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

export default function TabBar({ activeTab }: TabBarProps) {
  const { T } = useTheme();
  const router = useRouter();

  const handlePress = (tab: Tab) => {
    if (tab.id === activeTab && !tab.isAdd) return;
    if (tab.isAdd) {
      router.push('/new' as any);
    } else {
      router.replace(tab.route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: T.tabBg }, T.neo]}>
      {TABS.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          T={T}
          onPress={() => handlePress(tab)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 18,
    left: 14,
    right: 14,
    height: 68,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabItemWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabIconWrap: {
    width: 42,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 2,
  },
});
