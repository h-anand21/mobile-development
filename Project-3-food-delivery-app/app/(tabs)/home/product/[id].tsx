import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../../constants/Theme';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrderStore } from '../../../../store/orderStore';
import { Alert } from 'react-native';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.38;

const PRODUCTS: Record<string, any> = {
  '1': {
    name: 'Classic Cheese Burger', badge: 'Bestseller', rating: 4.8, reviews: '2.3K+',
    description: 'Juicy grilled beef patty with melted cheese, fresh lettuce, tomato, onion, pickles and our special sauce.',
    price: 220, calories: 520, deliveryTime: '20-30 min', deliveryFee: '₹25', freeAbove: '₹299',
    image: require('../../../../assets/images/dish_cheese_burger.png'),
    customizations: [
      { id: 'c1', name: 'Extra Cheese', emoji: '🧀', price: 40 },
      { id: 'c2', name: 'Bacon',        emoji: '🥓', price: 60 },
      { id: 'c3', name: 'Extra Patty',  emoji: '🍔', price: 70 },
      { id: 'c4', name: 'Jalapeños',    emoji: '🌶', price: 20 },
    ],
    related: [
      { id: 'r1', name: 'Spicy Chicken Burger', price: 210, image: require('../../../../assets/images/dish_cheese_burger.png') },
      { id: 'r2', name: 'BBQ Chicken Burger',   price: 230, image: require('../../../../assets/images/dish_cheese_burger.png') },
      { id: 'r3', name: 'Double Cheese Burger', price: 280, image: require('../../../../assets/images/dish_cheese_burger.png') },
      { id: 'r4', name: 'Veggie Burger',        price: 190, image: require('../../../../assets/images/dish_cheese_burger.png') },
    ],
  },
  '2': {
    name: 'Spicy Chicken Pizza', badge: 'Popular', rating: 4.6, reviews: '1.8K+',
    description: 'Hand-tossed pizza topped with spicy chicken, bell peppers, onions and our signature tomato sauce.',
    price: 420, calories: 680, deliveryTime: '25-35 min', deliveryFee: '₹20', freeAbove: '₹399',
    image: require('../../../../assets/images/dish_chicken_pizza.png'),
    customizations: [
      { id: 'c1', name: 'Extra Cheese',  emoji: '🧀', price: 50 },
      { id: 'c2', name: 'Extra Chicken', emoji: '🍗', price: 80 },
      { id: 'c3', name: 'Jalapeños',     emoji: '🌶', price: 20 },
      { id: 'c4', name: 'Olives',        emoji: '🫒', price: 30 },
    ],
    related: [
      { id: 'r1', name: 'BBQ Chicken Pizza',  price: 450, image: require('../../../../assets/images/dish_chicken_pizza.png') },
      { id: 'r2', name: 'Margherita Pizza',   price: 320, image: require('../../../../assets/images/dish_chicken_pizza.png') },
      { id: 'r3', name: 'Pepperoni Pizza',    price: 400, image: require('../../../../assets/images/dish_chicken_pizza.png') },
      { id: 'r4', name: 'Veggie Pizza',       price: 350, image: require('../../../../assets/images/dish_chicken_pizza.png') },
    ],
  },
  '3': {
    name: 'Crispy Fried Chicken', badge: 'Hot 🔥', rating: 4.7, reviews: '3.1K+',
    description: 'Golden crispy fried chicken with our secret 11-herb-and-spice blend, served hot and fresh.',
    price: 350, calories: 590, deliveryTime: '20-30 min', deliveryFee: 'Free', freeAbove: '',
    image: require('../../../../assets/images/dish_fried_chicken.png'),
    customizations: [
      { id: 'c1', name: 'Extra Piece',   emoji: '🍗', price: 90 },
      { id: 'c2', name: 'Coleslaw',      emoji: '🥗', price: 40 },
      { id: 'c3', name: 'Garlic Dip',    emoji: '🧄', price: 25 },
      { id: 'c4', name: 'Extra Crispy',  emoji: '✨', price: 20 },
    ],
    related: [
      { id: 'r1', name: 'Grilled Chicken',  price: 320, image: require('../../../../assets/images/dish_fried_chicken.png') },
      { id: 'r2', name: 'Chicken Strips',   price: 270, image: require('../../../../assets/images/dish_fried_chicken.png') },
      { id: 'r3', name: 'Chicken Wings',    price: 300, image: require('../../../../assets/images/dish_fried_chicken.png') },
      { id: 'r4', name: 'Spicy Drumsticks', price: 290, image: require('../../../../assets/images/dish_fried_chicken.png') },
    ],
  },
  '4': {
    name: 'Chocolate Lava Cake', badge: '⭐ Sweet', rating: 4.9, reviews: '5.6K+',
    description: 'Warm molten chocolate cake with a gooey chocolate center, served with vanilla ice cream.',
    price: 250, calories: 420, deliveryTime: '15-25 min', deliveryFee: '₹15', freeAbove: '₹249',
    image: require('../../../../assets/images/dish_lava_cake.png'),
    customizations: [
      { id: 'c1', name: 'Extra Ice Cream',    emoji: '🍨', price: 60 },
      { id: 'c2', name: 'Chocolate Drizzle',  emoji: '🍫', price: 20 },
      { id: 'c3', name: 'Strawberry Sauce',   emoji: '🍓', price: 30 },
    ],
    related: [
      { id: 'r1', name: 'Brownie Sundae',  price: 220, image: require('../../../../assets/images/dish_lava_cake.png') },
      { id: 'r2', name: 'Cheesecake',      price: 290, image: require('../../../../assets/images/dish_lava_cake.png') },
      { id: 'r3', name: 'Gulab Jamun',     price: 150, image: require('../../../../assets/images/dish_lava_cake.png') },
      { id: 'r4', name: 'Belgian Waffle',  price: 280, image: require('../../../../assets/images/dish_lava_cake.png') },
    ],
  },
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const product = PRODUCTS[id ?? '1'] ?? { ...PRODUCTS['1'], name: name ?? PRODUCTS['1'].name };

  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [checkedExtras, setCheckedExtras] = useState<Record<string, boolean>>({});
  const placeOrder = useOrderStore((s) => s.placeOrder);

  const handleAddToCart = () => {
    // Build extras list
    const selectedExtras = (product.customizations ?? []).filter((c: any) => checkedExtras[c.id]);
    const itemsList = [
      { name: product.name, quantity },
      ...selectedExtras.map((c: any) => ({ name: c.name, quantity: 1 })),
    ];

    placeOrder({
      productName: product.name,
      items: itemsList,
      totalPrice,
      image: product.image,
      restaurantName: 'Foodie Delivery',
    });

    Alert.alert(
      '✅ Order Placed!',
      `${product.name} has been added to your orders.`,
      [
        { text: 'View Orders', onPress: () => router.push('/(tabs)/orders') },
        { text: 'Continue', style: 'cancel' },
      ]
    );
  };

  const toggleExtra = (extraId: string) =>
    setCheckedExtras(prev => ({ ...prev, [extraId]: !prev[extraId] }));

  const extrasTotal = (product.customizations ?? []).reduce(
    (sum: number, c: any) => checkedExtras[c.id] ? sum + c.price : sum, 0
  );
  const totalPrice = (product.price + extrasTotal) * quantity;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* ── Floating top bar ────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.topBtn}>
            <Ionicons name="share-social-outline" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.topBtn, liked && styles.topBtnLiked]}
            onPress={() => setLiked(v => !v)}
          >
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#fff' : Theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* ── Hero Image (full width, fixed height) ───────── */}
        <View style={styles.heroContainer}>
          <Image source={product.image} style={styles.heroImage} resizeMode="cover" />
          {/* bottom fade so card blends in */}
          <View style={styles.heroBottomFade} />
          {/* Dot indicators */}
          <View style={styles.heroDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
          </View>
        </View>

        {/* ── Info Card (overlaps image) ───────────────────── */}
        <View style={styles.infoCard}>
          {/* Badge + name row */}
          <View style={styles.badgeRow}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingNum}>{product.rating}</Text>
            <Text style={styles.ratingReviews}>({product.reviews} reviews)</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Price + Qty row */}
          <View style={styles.priceQtyRow}>
            <Text style={styles.priceText}>₹{product.price}.00</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                <Ionicons name="remove" size={18} color={Theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnAdd]} onPress={() => setQuantity(q => q + 1)}>
                <Ionicons name="add" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Customizations ──────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customizations</Text>
          <Text style={styles.cardSub}>Choose your extras</Text>
          {(product.customizations ?? []).map((c: any) => (
            <TouchableOpacity key={c.id} style={styles.extraRow} onPress={() => toggleExtra(c.id)}>
              <Text style={styles.extraEmoji}>{c.emoji}</Text>
              <Text style={styles.extraName}>{c.name}</Text>
              <Text style={styles.extraPrice}>₹{c.price}.00</Text>
              <View style={[styles.checkbox, checkedExtras[c.id] && styles.checkboxChecked]}>
                {checkedExtras[c.id] && <Ionicons name="checkmark" size={14} color="#000" />}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color={Theme.colors.primary} />
            <Text style={styles.infoRowText}>Product Information</Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── Stats Grid ──────────────────────────────────── */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={22} color="#FF6B35" />
            <Text style={styles.statValue}>{product.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={22} color="#FFD700" />
            <Text style={styles.statValue}>{product.deliveryTime}</Text>
            <Text style={styles.statLabel}>Delivery Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="bag-outline" size={22} color={Theme.colors.primary} />
            <Text style={styles.statValue}>{product.deliveryFee}</Text>
            <Text style={styles.statLabel}>Delivery Fee</Text>
          </View>
          {!!product.freeAbove && (<>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="pricetag-outline" size={22} color="#A78BFA" />
              <Text style={styles.statValue}>Free</Text>
              <Text style={styles.statLabel}>above {product.freeAbove}</Text>
            </View>
          </>)}
        </View>

        {/* ── You may also like ───────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>You may also like</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}>
          {(product.related ?? []).map((r: any) => (
            <View key={r.id} style={styles.relatedCard}>
              <View style={styles.relatedImgWrap}>
                <Image source={r.image} style={styles.relatedImg} resizeMode="cover" />
                <TouchableOpacity style={styles.relatedHeart}>
                  <Ionicons name="heart-outline" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.relatedName} numberOfLines={2}>{r.name}</Text>
              <View style={styles.relatedFooter}>
                <Text style={styles.relatedPrice}>₹{r.price}.00</Text>
                <TouchableOpacity style={styles.relatedAdd}>
                  <Ionicons name="add" size={16} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

      </ScrollView>

      {/* ── Bottom Bar ──────────────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.bottomLeft}>
          <Text style={styles.bottomPrice}>₹{totalPrice}.00</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/home/cart')}>
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomDivider} />
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
          <Ionicons name="cart-outline" size={18} color="#000" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },

  // Top bar (floats above image)
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  topRight: { flexDirection: 'row', gap: 10 },
  topBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center',
  },
  topBtnLiked: { backgroundColor: '#ff4444' },

  // Hero image – full width, fixed height
  heroContainer: { width, height: HERO_HEIGHT, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroBottomFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: Theme.colors.background, opacity: 0.6,
  },
  heroDots: {
    position: 'absolute', bottom: 16, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 18, backgroundColor: Theme.colors.primary },

  // Info card sits directly below hero
  infoCard: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,215,0,0.12)', alignSelf: 'flex-start',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
  },
  badgeText: { color: '#FFD700', fontSize: 12, fontWeight: '700' },
  productName: { fontSize: 26, fontWeight: '900', color: Theme.colors.text, marginBottom: 10, lineHeight: 32 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  ratingNum: { color: Theme.colors.text, fontSize: 14, fontWeight: 'bold' },
  ratingReviews: { color: Theme.colors.textMuted, fontSize: 13 },
  description: { color: Theme.colors.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  priceQtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceText: { fontSize: 28, fontWeight: '900', color: Theme.colors.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Theme.colors.surface, justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnAdd: { backgroundColor: Theme.colors.primary },
  qtyText: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.text, minWidth: 20, textAlign: 'center' },

  // Customizations card
  card: {
    backgroundColor: Theme.colors.surface, borderRadius: 20,
    marginHorizontal: 16, marginBottom: 16, paddingVertical: 20, paddingHorizontal: 18,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 2 },
  cardSub: { fontSize: 12, color: Theme.colors.textMuted, marginBottom: 16 },
  extraRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
  },
  extraEmoji: { fontSize: 20, marginRight: 12 },
  extraName: { flex: 1, color: Theme.colors.text, fontSize: 14 },
  extraPrice: { color: Theme.colors.primary, fontSize: 13, fontWeight: '600', marginRight: 14 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: Theme.colors.border, justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, gap: 10 },
  infoRowText: { color: Theme.colors.text, fontSize: 14, fontWeight: '600' },

  // Stats
  statsGrid: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: Theme.colors.surface, borderRadius: 20,
    marginHorizontal: 16, marginBottom: 24, paddingVertical: 20,
  },
  statDivider: { width: 1, height: 40, backgroundColor: Theme.colors.border },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 13, fontWeight: 'bold', color: Theme.colors.text, marginTop: 4 },
  statLabel: { fontSize: 10, color: Theme.colors.textMuted, textAlign: 'center' },

  // Related
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: Theme.colors.text },
  viewAll: { color: Theme.colors.primary, fontSize: 13, fontWeight: '600' },
  relatedCard: {
    width: 140, backgroundColor: Theme.colors.surface,
    borderRadius: 16, marginRight: 12, overflow: 'hidden',
  },
  relatedImgWrap: { height: 100, position: 'relative' },
  relatedImg: { width: '100%', height: '100%' },
  relatedHeart: {
    position: 'absolute', top: 6, right: 6, width: 26, height: 26,
    borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  relatedName: { color: Theme.colors.text, fontSize: 12, fontWeight: '600', margin: 8, marginBottom: 4 },
  relatedFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8,
  },
  relatedPrice: { color: Theme.colors.primary, fontSize: 13, fontWeight: 'bold' },
  relatedAdd: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  // Bottom
  bottomBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: Theme.colors.border,
  },
  bottomLeft: { flex: 1 },
  bottomPrice: { fontSize: 20, fontWeight: '900', color: Theme.colors.primary },
  viewCartText: { color: Theme.colors.textMuted, fontSize: 13, marginTop: 2 },
  bottomDivider: { width: 1, height: 40, backgroundColor: Theme.colors.border, marginHorizontal: 16 },
  addToCartBtn: {
    flex: 1.2, backgroundColor: Theme.colors.primary, borderRadius: 28,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15,
  },
  addToCartText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
});
