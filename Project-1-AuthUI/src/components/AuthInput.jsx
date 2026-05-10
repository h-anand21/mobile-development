// src/components/AuthInput.jsx

import React from 'react';

import { View, Text, TextInput, StyleSheet } from 'react-native';

// Import Ionicons
import { Ionicons } from '@expo/vector-icons';

export default function AuthInput({
  // Input label
  label,

  // Placeholder
  placeholder,

  // Input state value
  value,

  // Function when typing
  onChangeText,

  // Password hide/show
  secureTextEntry = false,

  // Keyboard type
  keyboardType = 'default',

  // Icon name
  icon,
}) {
  return (
    <View style={styles.wrapper}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input container */}
      <View style={styles.inputContainer}>
        {/* Input icon */}
        <Ionicons name={icon} size={20} color="#777" style={styles.icon} />

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },

  inputContainer: {
    height: 56,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',

    // IMPORTANT
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 14,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
});
