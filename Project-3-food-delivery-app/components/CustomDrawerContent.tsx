import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Theme } from '../constants/Theme';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { useRouter } from 'expo-router';

export function CustomDrawerContent(props: any) {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={Theme.colors.surface} />
          </View>
          <Text style={styles.username}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>
        <View style={styles.drawerItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={styles.footer}>
        <Button 
          title="Logout" 
          variant="outline" 
          onPress={handleLogout} 
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  header: {
    padding: Theme.spacing.xl,
    paddingTop: Theme.spacing.xxl * 1.5,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.primary,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },
  drawerItems: {
    paddingHorizontal: Theme.spacing.sm,
  },
  footer: {
    padding: Theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  logoutButton: {
    width: '100%',
  },
});
