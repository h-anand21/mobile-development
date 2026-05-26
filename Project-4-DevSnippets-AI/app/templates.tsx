import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/theme/colors';
export default function TemplatesScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.container}>
      <TouchableOpacity onPress={() => router.back()} style={s.back}>
        <ArrowLeft size={20} color={Colors.text.primary} />
      </TouchableOpacity>
      <Text style={s.text}>📋 Templates — Coming up!</Text>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary, alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: 20, padding: 8 },
  text: { color: Colors.accent.primary, fontSize: 18, fontWeight: '700' },
});
