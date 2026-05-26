import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
export default function FilesScreen() {
  return (
    <SafeAreaView style={s.container}>
      <Text style={s.text}>📁 Files Screen — Coming up!</Text>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary, alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.accent.primary, fontSize: 18, fontWeight: '700' },
});
