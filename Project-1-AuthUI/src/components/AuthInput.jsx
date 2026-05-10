// src/components/AuthInput.jsx

// Import React
import React from 'react';

// Import React Native components
import { View, Text, TextInput, StyleSheet } from 'react-native';

// Create reusable input component
export default function AuthInput({
  // Text above input
  label,

  // Placeholder text
  placeholder,

  // Current input value
  value,

  // Function when typing happens
  onChangeText,

  // Password hide/show
  secureTextEntry = false,

  // Keyboard type
  keyboardType = 'default',
}) {
  return (
    // Main wrapper
    <View style={styles.wrapper}>
      {/* Input label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input box */}
      <View style={styles.inputContainer}>
        {/* Actual input */}
        <TextInput
          style={styles.input}
          // Placeholder text
          placeholder={placeholder}
          // Placeholder color
          placeholderTextColor="#999"
          // Current value
          value={value}
          // Event handling
          onChangeText={onChangeText}
          // Password hidden
          secureTextEntry={secureTextEntry}
          // Email keyboard etc
          keyboardType={keyboardType}
          // Prevent first letter uppercase
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  // Main wrapper
  wrapper: {
    marginBottom: 18,
  },

  // Label style
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 8,
  },

  // Input container
  inputContainer: {
    height: 56,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  // Input style
  input: {
    fontSize: 15,
    color: '#222',
  },
});
