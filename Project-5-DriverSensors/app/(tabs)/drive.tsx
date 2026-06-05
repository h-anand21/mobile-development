import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DriveScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Drive Screen (Coming Soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050B14' },
  text: { color: '#fff', fontSize: 20 },
});
