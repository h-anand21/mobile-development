import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Rect } from 'react-native-svg';

interface GlassFolderProps {
  color: string;
  size?: number;
}

// Utility to darken a hex color
const shadeColor = (color: string, percent: number) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.floor((R * (100 + percent)) / 100);
  G = Math.floor((G * (100 + percent)) / 100);
  B = Math.floor((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  R = Math.max(0, R);
  G = G < 255 ? G : 255;
  G = Math.max(0, G);
  B = B < 255 ? B : 255;
  B = Math.max(0, B);

  const RR = R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);

  return '#' + RR + GG + BB;
};

export function GlassFolder({ color, size = 80 }: GlassFolderProps) {
  // We'll create a 3D effect by using a darker shade for the back flap
  const darkColor = shadeColor(color, -30);
  const darkerColor = shadeColor(color, -40);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          {/* Glass front flap gradient */}
          <LinearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.85" />
            <Stop offset="40%" stopColor={color} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </LinearGradient>

          {/* Glossy reflection on the top edge */}
          <LinearGradient id="glossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </LinearGradient>
          
          <LinearGradient id="paperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#F0F0F0" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* 1. Back Flap (Opaque & Darker) */}
        {/* Adds depth behind the paper */}
        <Path
          d="M 12 30 L 12 18 Q 12 12 18 12 L 35 12 Q 40 12 43 18 L 48 30 L 88 30 Q 94 30 94 36 L 94 80 Q 94 86 88 86 L 18 86 Q 12 86 12 80 Z"
          fill={darkColor}
        />
        
        {/* Subtle shadow inside back flap */}
        <Path
          d="M 12 30 L 48 30 L 43 18 L 18 12"
          fill={darkerColor}
          opacity="0.3"
        />

        {/* 2. Documents (White Papers inside) */}
        <Rect x="20" y="22" width="60" height="50" rx="3" fill="url(#paperGradient)" />
        <Rect x="28" y="32" width="30" height="3" rx="1.5" fill="#E0E0E0" />
        <Rect x="28" y="42" width="45" height="3" rx="1.5" fill="#E0E0E0" />
        <Rect x="28" y="52" width="38" height="3" rx="1.5" fill="#E0E0E0" />

        <Rect x="24" y="26" width="56" height="50" rx="3" fill="#FFFFFF" opacity="0.9" />
        <Rect x="32" y="36" width="25" height="3" rx="1.5" fill="#E0E0E0" />
        <Rect x="32" y="46" width="40" height="3" rx="1.5" fill="#E0E0E0" />

        {/* 3. Front Flap (Translucent Glass) */}
        {/* We slope the left side slightly for a 3D perspective */}
        <Path
          d="M 8 45 L 94 45 L 94 82 Q 94 88 88 88 L 14 88 Q 8 88 8 82 Z"
          fill="url(#glassGradient)"
        />

        {/* 4. Glossy Highlight (Reflection Edge) */}
        <Path
          d="M 8.5 46.5 L 93.5 46.5"
          fill="none"
          stroke="url(#glossGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Right edge reflection */}
        <Path
          d="M 93 47 L 93 80"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Drop shadow for the whole icon
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
