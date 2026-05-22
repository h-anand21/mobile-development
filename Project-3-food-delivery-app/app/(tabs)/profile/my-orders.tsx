import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../../constants/Theme';

export default function MyOrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Past Orders History</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Theme.colors.textMuted,
    fontSize: 16,
  },
});
