import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Theme } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

interface RestaurantCardProps {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  price: string;
  image: any;
  onPress: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  name,
  rating,
  deliveryTime,
  price,
  image,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={styles.card} 
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {/* Placeholder image rendering */}
        <View style={[styles.image, { backgroundColor: Theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }]}>
           <Ionicons name="restaurant" size={40} color={Theme.colors.border} />
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Theme.colors.textMuted} />
            <Text style={styles.metaText}>{deliveryTime}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="bicycle-outline" size={14} color={Theme.colors.textMuted} />
            <Text style={styles.metaText}>{price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
    ...Theme.shadows.soft,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.round,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  infoContainer: {
    padding: Theme.spacing.md,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    marginLeft: 4,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.textMuted,
    marginHorizontal: Theme.spacing.sm,
  },
});
