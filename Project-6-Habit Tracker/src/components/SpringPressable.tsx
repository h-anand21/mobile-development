import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SpringPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  scaleTo?: number;
}

export default function SpringPressable({
  children,
  style,
  scaleTo = 0.95,
  onPressIn,
  onPressOut,
  ...props
}: SpringPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: any) => {
    scale.value = withSpring(scaleTo, { damping: 10, stiffness: 300 });
    if (onPressIn) onPressIn(event);
  };

  const handlePressOut = (event: any) => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    if (onPressOut) onPressOut(event);
  };

  return (
    <AnimatedPressable
      style={(state) => {
        const baseStyle = typeof style === 'function' ? style(state) : style;
        return [baseStyle, animatedStyle];
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
