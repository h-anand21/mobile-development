import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=Kevin&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Caleb&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Aria&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Alex&mouth=smile',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Vivian&mouth=smile',
];

export default function SetupProfileScreen({ onComplete }) {
  const { width } = useWindowDimensions();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleFinish = () => {
    if (name.trim()) {
      onComplete({ name: name.trim(), avatar: selectedAvatar });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Setup Profile</Text>
          <Text style={styles.subtitle}>Choose your avatar and enter your name.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Choose Avatar</Text>
          <View style={styles.avatarList}>
            {AVATARS.map((uri) => (
              <Pressable
                key={uri}
                onPress={() => setSelectedAvatar(uri)}
                style={[
                  styles.avatarWrapper,
                  selectedAvatar === uri && styles.selectedAvatarWrapper
                ]}
              >
                <Image source={{ uri }} style={styles.avatar} />
                {selectedAvatar === uri && (
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark-circle" size={24} color="#FF8C00" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor="#A1A1A1"
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={handleFinish}
          disabled={!name.trim()}
          style={({ pressed }) => [
            styles.buttonContainer,
            (!name.trim() || pressed) && { opacity: 0.8 }
          ]}
        >
          <LinearGradient
            colors={['#FF8C00', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F2',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  avatarList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'transparent',
    padding: 2,
    position: 'relative',
  },
  selectedAvatarWrapper: {
    borderColor: '#FF8C00',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
  },
  checkIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  input: {
    width: '100%',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    height: 64,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
