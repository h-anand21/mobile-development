import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../store/cartStore';

interface FoodCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: any;
  onAddToCart: (item: CartItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  id,
  name,
  description,
  price,
  image,
  onAddToCart,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.imagePlaceholder}>
           <Ionicons name="fast-food-outline" size={30} color={Theme.colors.border} />
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => onAddToCart({ id, name, price, quantity: 1, image })}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.soft,
  },
  infoContainer: {
    flex: 1,
    paddingRight: Theme.spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 8,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  rightContainer: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: Theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.primary,
  },
});
