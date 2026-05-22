import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Theme } from '../../../constants/Theme';
import { useCartStore } from '../../../store/cartStore';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/Button';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { items, getTotalPrice, updateQuantity } = useCartStore();
  const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price.toFixed(0)}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={20} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={20} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Order</Text>
        <View style={{ width: 28 }} />
      </View>
      
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <View style={styles.cartContainer}>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{getTotalPrice().toFixed(0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={[styles.summaryValue, { color: '#1ed760' }]}>FREE</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{getTotalPrice().toFixed(0)}</Text>
            </View>
            <Button 
              title="Place Order" 
              onPress={() => {
                alert('Order placed successfully!');
                useCartStore.getState().clearCart();
                router.dismissAll();
                router.replace('/(tabs)/orders');
              }} 
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  closeButton: {
    padding: Theme.spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 18,
  },
  cartContainer: {
    flex: 1,
  },
  listContent: {
    padding: Theme.spacing.lg,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.round,
    padding: 4,
  },
  iconButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 14,
  },
  quantityText: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: Theme.spacing.md,
  },
  footer: {
    padding: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  summaryLabel: {
    fontSize: 16,
    color: Theme.colors.textMuted,
  },
  summaryValue: {
    fontSize: 16,
    color: Theme.colors.text,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    marginBottom: Theme.spacing.xl,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
});
