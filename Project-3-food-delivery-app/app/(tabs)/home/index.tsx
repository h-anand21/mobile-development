import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TextInput, TouchableOpacity, Image, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent
} from 'react-native';
import { Theme } from '../../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const BANNER_GAP = 12;
const BANNER_W = width - 40; // 20px padding each side

const PROMOS = [
  {
    id: '1',
    badge: '🔥 Hot Deal',
    badgeColor: 'rgba(30,215,96,0.15)',
    bg: '#0d2818',
    title: 'Free Delivery',
    off: '70% OFF',
    sub: 'For first 3 orders',
    image: require('../../../assets/images/promo_banner.png'),
  },
  {
    id: '2',
    badge: '🍕 New',
    badgeColor: 'rgba(255,107,0,0.15)',
    bg: '#1a0d08',
    title: 'Pizza Fiesta',
    off: '50% OFF',
    sub: 'All pizzas this weekend',
    image: require('../../../assets/images/promo_pizza.png'),
  },
  {
    id: '3',
    badge: '⚡ Flash Sale',
    badgeColor: 'rgba(255,215,0,0.12)',
    bg: '#121208',
    title: 'Crispy Chicken',
    off: '₹99 OFF',
    sub: 'On orders above ₹499',
    image: require('../../../assets/images/promo_chicken.png'),
  },
];

const CATEGORIES = [
  { id: '1', name: 'Burger', icon: '🍔', active: true },
  { id: '2', name: 'Pizza', icon: '🍕', active: false },
  { id: '3', name: 'Chicken', icon: '🍗', active: false },
  { id: '4', name: 'Drinks', icon: '🥤', active: false },
  { id: '5', name: 'Dessert', icon: '🎂', active: false },
  { id: '6', name: 'More', icon: '⚡', active: false },
];

const RESTAURANTS = [
  {
    id: '1',
    name: 'Burger King',
    category: 'Burger • Fast Food',
    categoryTag: 'Burger',
    rating: 4.8,
    time: '30-40 min',
    delivery: '₹250.00',
    image: require('../../../assets/images/rest_burger_king.png'),
  },
  {
    id: '2',
    name: "Domino's Pizza",
    category: 'Pizza • Italian',
    categoryTag: 'Pizza',
    rating: 4.6,
    time: '25-35 min',
    delivery: '₹220.00',
    image: require('../../../assets/images/rest_dominos.png'),
  },
  {
    id: '3',
    name: 'KFC',
    category: 'Chicken • Fast Food',
    categoryTag: 'Chicken',
    rating: 4.7,
    time: '20-30 min',
    delivery: '₹180.00',
    image: require('../../../assets/images/rest_kfc.png'),
  },
  {
    id: '4',
    name: 'Pizza Hut',
    category: 'Pizza • Italian',
    categoryTag: 'Pizza',
    rating: 4.5,
    time: '20-35 min',
    delivery: '₹200.00',
    image: require('../../../assets/images/rest_dominos.png'),
  },
  {
    id: '5',
    name: 'Burger Street',
    category: 'Burger • Fast Food',
    categoryTag: 'Burger',
    rating: 4.3,
    time: '25-35 min',
    delivery: '₹150.00',
    image: require('../../../assets/images/rest_burger_king.png'),
  },
  {
    id: '6',
    name: 'Cold Brew Co.',
    category: 'Drinks • Cafe',
    categoryTag: 'Drinks',
    rating: 4.6,
    time: '15-25 min',
    delivery: '₹100.00',
    image: require('../../../assets/images/rest_kfc.png'),
  },
  {
    id: '7',
    name: 'Shake Shack',
    category: 'Drinks • Milkshakes',
    categoryTag: 'Drinks',
    rating: 4.7,
    time: '20-30 min',
    delivery: '₹120.00',
    image: require('../../../assets/images/rest_burger_king.png'),
  },
  {
    id: '8',
    name: 'Bakers Bliss',
    category: 'Dessert • Bakery',
    categoryTag: 'Dessert',
    rating: 4.8,
    time: '25-40 min',
    delivery: '₹130.00',
    image: require('../../../assets/images/rest_dominos.png'),
  },
  {
    id: '9',
    name: 'Sweet Tooth',
    category: 'Dessert • Ice Cream',
    categoryTag: 'Dessert',
    rating: 4.5,
    time: '15-30 min',
    delivery: '₹90.00',
    image: require('../../../assets/images/rest_kfc.png'),
  },
];

const POPULAR_DISHES = [
  {
    id: '1',
    name: 'Classic Cheese Burger',
    price: '₹320.00',
    categoryTag: 'Burger',
    image: require('../../../assets/images/dish_cheese_burger.png'),
  },
  {
    id: '2',
    name: 'Spicy Chicken Pizza',
    price: '₹420.00',
    categoryTag: 'Pizza',
    image: require('../../../assets/images/dish_chicken_pizza.png'),
  },
  {
    id: '3',
    name: 'Crispy Fried Chicken',
    price: '₹350.00',
    categoryTag: 'Chicken',
    image: require('../../../assets/images/dish_fried_chicken.png'),
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    price: '₹250.00',
    categoryTag: 'Dessert',
    image: require('../../../assets/images/dish_lava_cake.png'),
  },
  {
    id: '5',
    name: 'BBQ Burger',
    price: '₹380.00',
    categoryTag: 'Burger',
    image: require('../../../assets/images/dish_cheese_burger.png'),
  },
  {
    id: '6',
    name: 'Mango Smoothie',
    price: '₹180.00',
    categoryTag: 'Drinks',
    image: require('../../../assets/images/dish_cold_coffee.png'),
  },
  {
    id: '7',
    name: 'Cold Brew Coffee',
    price: '₹220.00',
    categoryTag: 'Drinks',
    image: require('../../../assets/images/dish_cold_coffee.png'),
  },
  {
    id: '8',
    name: 'Oreo Milkshake',
    price: '₹260.00',
    categoryTag: 'Drinks',
    image: require('../../../assets/images/dish_cold_coffee.png'),
  },
  {
    id: '9',
    name: 'Fresh Lime Soda',
    price: '₹120.00',
    categoryTag: 'Drinks',
    image: require('../../../assets/images/dish_cold_coffee.png'),
  },
  {
    id: '10',
    name: 'Gulab Jamun',
    price: '₹150.00',
    categoryTag: 'Dessert',
    image: require('../../../assets/images/dish_lava_cake.png'),
  },
  {
    id: '11',
    name: 'Cheesecake Slice',
    price: '₹290.00',
    categoryTag: 'Dessert',
    image: require('../../../assets/images/dish_lava_cake.png'),
  },
  {
    id: '12',
    name: 'Belgian Waffle',
    price: '₹280.00',
    categoryTag: 'Dessert',
    image: require('../../../assets/images/dish_lava_cake.png'),
  },
  {
    id: '13',
    name: 'Ice Cream Sundae',
    price: '₹200.00',
    categoryTag: 'Dessert',
    image: require('../../../assets/images/dish_lava_cake.png'),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('1');
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef<FlatList>(null);

  const onBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_W);
    setActiveBanner(idx);
  };
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  // Get active category name for filtering
  const activeCatObj = CATEGORIES.find(c => c.id === activeCategory);
  const activeCatName = activeCatObj?.name ?? 'All';

  // Filter restaurants & dishes; 'More' shows all
  const filteredRestaurants = (activeCatName === 'More')
    ? RESTAURANTS
    : RESTAURANTS.filter(r => r.categoryTag === activeCatName);

  const filteredDishes = (activeCatName === 'More')
    ? POPULAR_DISHES
    : POPULAR_DISHES.filter(d => d.categoryTag === activeCatName);

  const toggleLike = (id: string) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}>

        {/* ── Header ─────────────────────────────────────────── */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, Himu 👋</Text>
            <Text style={styles.headerTitle}>
              What do you want{'\n'}to <Text style={styles.headerTitleGreen}>eat</Text> today?
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={16} color={Theme.colors.primary} />
              <Text style={styles.locationText}>Kolkata, India</Text>
              <Ionicons name="chevron-down" size={14} color={Theme.colors.textMuted} />
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={22} color={Theme.colors.text} />
              <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>3</Text></View>
            </View>
            <Image
              source={{ uri: 'https://i.pravatar.cc/100?img=12' }}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* ── Search Bar ─────────────────────────────────────── */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food, restaurants..."
            placeholderTextColor={Theme.colors.textMuted}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Promo Carousel ─────────────────────────────────── */}
        <FlatList
          ref={bannerRef}
          data={PROMOS}
          keyExtractor={(item) => item.id}
          horizontal
          snapToInterval={BANNER_W + BANNER_GAP}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, gap: BANNER_GAP }}
          onMomentumScrollEnd={onBannerScroll}
          style={styles.bannerList}
          renderItem={({ item }) => (
            <View style={[styles.promoBanner, { backgroundColor: item.bg }]}>
              {/* Left Content */}
              <View style={styles.promoLeft}>
                <View style={[styles.hotDealBadge, { backgroundColor: item.badgeColor }]}>
                  <Text style={styles.hotDealText}>{item.badge}</Text>
                </View>
                <Text style={styles.promoTitle}>{item.title}</Text>
                <Text style={styles.promoOff}>{item.off}</Text>
                <Text style={styles.promoSub}>{item.sub}</Text>
                <TouchableOpacity style={styles.orderNowBtn}>
                  <Text style={styles.orderNowText}>Order Now</Text>
                  <Ionicons name="arrow-forward" size={14} color="#000" />
                </TouchableOpacity>
              </View>
              {/* Right Image — clipped within the card */}
              <View style={styles.promoImageWrapper}>
                <Image source={item.image} style={styles.promoImage} resizeMode="cover" />
              </View>
            </View>
          )}
        />
        {/* Carousel Dots */}
        <View style={styles.promoDots}>
          {PROMOS.map((_, i) => (
            <View key={i} style={[styles.promoDot, activeBanner === i && styles.promoDotActive]} />
          ))}
        </View>

        {/* ── Categories ─────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryItem, activeCategory === cat.id && styles.categoryItemActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryLabel, activeCategory === cat.id && styles.categoryLabelActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Popular Restaurants ────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCatName === 'More' ? 'All Restaurants' : `${activeCatName} Restaurants`}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView key={`rest-${activeCategory}`} horizontal showsHorizontalScrollIndicator={false} style={styles.restaurantsRow}>
          {filteredRestaurants.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No restaurants in this category yet</Text>
            </View>
          ) : (
            filteredRestaurants.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.restaurantCard}
              onPress={() => router.push({ pathname: '/(tabs)/home/restaurant/[id]', params: { id: r.id, name: r.name } })}
            >
              <View style={styles.restaurantImageWrapper}>
                <Image source={r.image} style={styles.restaurantImage} resizeMode="cover" />
                <TouchableOpacity style={styles.heartBtn} onPress={() => toggleLike(r.id)}>
                  <Ionicons
                    name={liked[r.id] ? 'heart' : 'heart-outline'}
                    size={18}
                    color={liked[r.id] ? '#ff4444' : Theme.colors.text}
                  />
                </TouchableOpacity>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={10} color="#FFD700" />
                  <Text style={styles.ratingText}>{r.rating}</Text>
                </View>
              </View>
              <Text style={styles.restaurantName}>{r.name}</Text>
              <Text style={styles.restaurantCategory}>{r.category}</Text>
              <View style={styles.restaurantMeta}>
                <Ionicons name="time-outline" size={12} color={Theme.colors.textMuted} />
                <Text style={styles.restaurantMetaText}>{r.time}</Text>
                <Ionicons name="bicycle-outline" size={12} color={Theme.colors.textMuted} style={{ marginLeft: 8 }} />
                <Text style={styles.restaurantMetaText}>{r.delivery}</Text>
              </View>
            </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* ── Popular Dishes ─────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCatName === 'More' ? 'All Dishes' : `${activeCatName} Dishes`}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View key={`dishes-${activeCategory}`} style={styles.dishesGrid}>
          {filteredDishes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No dishes in this category yet</Text>
            </View>
          ) : (
            filteredDishes.map((dish) => (
            <TouchableOpacity key={dish.id} style={styles.dishCard}
              onPress={() => router.push({ pathname: '/(tabs)/home/product/[id]', params: { id: dish.id, name: dish.name, price: dish.price } })}
            >
              <View style={styles.dishImageWrapper}>
                <Image source={dish.image} style={styles.dishImage} resizeMode="cover" />
                <TouchableOpacity style={styles.dishHeart} onPress={() => toggleLike('dish_' + dish.id)}>
                  <Ionicons
                    name={liked['dish_' + dish.id] ? 'heart' : 'heart-outline'}
                    size={16}
                    color={liked['dish_' + dish.id] ? '#ff4444' : Theme.colors.text}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.dishName}>{dish.name}</Text>
              <View style={styles.dishFooter}>
                <Text style={styles.dishPrice}>{dish.price}</Text>
                <TouchableOpacity style={styles.addBtn}>
                  <Ionicons name="add" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = width * 0.52;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingBottom: 30, paddingHorizontal: 0 },
  emptyState: { paddingHorizontal: 20, paddingVertical: 30, alignItems: 'center' },
  emptyText: { color: Theme.colors.textMuted, fontSize: 14, textAlign: 'center' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 0, marginBottom: 20,
  },
  greeting: { fontSize: 14, color: Theme.colors.textMuted, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: Theme.colors.text, lineHeight: 32, marginBottom: 8 },
  headerTitleGreen: { color: Theme.colors.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: Theme.colors.text, fontSize: 13, fontWeight: '600', marginHorizontal: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notificationBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Theme.colors.surface, justifyContent: 'center', alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute', top: 4, right: 4, width: 16, height: 16,
    borderRadius: 8, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  notifBadgeText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: Theme.colors.primary },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface,
    borderRadius: 14, paddingHorizontal: 16, height: 54, marginHorizontal: 20, marginBottom: 20,
  },
  searchInput: { flex: 1, color: Theme.colors.text, marginLeft: 10, fontSize: 14 },
  filterBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Theme.colors.surfaceLight,
    justifyContent: 'center', alignItems: 'center',
  },

  // Promo Banner Carousel
  bannerList: { marginBottom: 10 },
  promoBanner: {
    width: BANNER_W, height: 185, borderRadius: 20,
    overflow: 'hidden', flexDirection: 'row',
  },
  promoLeft: { width: '52%', padding: 18, justifyContent: 'center', zIndex: 2 },
  promoImageWrapper: { width: '48%', overflow: 'hidden', borderRadius: 0 },
  promoImage: { width: '100%', height: '100%' },
  hotDealBadge: {
    borderRadius: 20, paddingHorizontal: 10,
    paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8,
  },
  hotDealText: { color: Theme.colors.primary, fontSize: 11, fontWeight: '700' },
  promoTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  promoOff: { color: Theme.colors.primary, fontSize: 26, fontWeight: '900' },
  promoSub: { color: '#aaa', fontSize: 11, marginBottom: 14 },
  orderNowBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.primary,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, gap: 5, alignSelf: 'flex-start',
  },
  orderNowText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  promoDots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginBottom: 22 },
  promoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#333' },
  promoDotActive: { width: 20, backgroundColor: Theme.colors.primary },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.text },
  seeAll: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600' },

  // Categories
  categoriesRow: { paddingLeft: 20, marginBottom: 28 },
  categoryItem: {
    alignItems: 'center', backgroundColor: Theme.colors.surface,
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, marginRight: 12, minWidth: 70,
  },
  categoryItemActive: {
    backgroundColor: 'rgba(30,215,96,0.12)', borderWidth: 2, borderColor: Theme.colors.primary,
  },
  categoryIcon: { fontSize: 22, marginBottom: 6 },
  categoryLabel: { color: Theme.colors.textMuted, fontSize: 12, fontWeight: '600' },
  categoryLabelActive: { color: Theme.colors.primary },

  // Restaurants
  restaurantsRow: { paddingLeft: 20, marginBottom: 28 },
  restaurantCard: {
    backgroundColor: Theme.colors.surface, borderRadius: 16, width: CARD_W,
    marginRight: 14, overflow: 'hidden',
  },
  restaurantImageWrapper: { height: 130, position: 'relative' },
  restaurantImage: { width: '100%', height: '100%' },
  heartBtn: {
    position: 'absolute', top: 10, right: 10, width: 32, height: 32,
    borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, gap: 3,
  },
  ratingText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
  restaurantName: { color: Theme.colors.text, fontSize: 14, fontWeight: 'bold', marginTop: 10, marginHorizontal: 12 },
  restaurantCategory: { color: Theme.colors.textMuted, fontSize: 12, marginHorizontal: 12, marginBottom: 6 },
  restaurantMeta: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, gap: 4,
  },
  restaurantMetaText: { color: Theme.colors.textMuted, fontSize: 11 },

  // Dishes
  dishesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 14, marginBottom: 10,
  },
  dishCard: {
    backgroundColor: Theme.colors.surface, borderRadius: 16,
    width: (width - 54) / 2, overflow: 'hidden',
  },
  dishImageWrapper: { height: 120, position: 'relative' },
  dishImage: { width: '100%', height: '100%' },
  dishHeart: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28,
    borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  dishName: {
    color: Theme.colors.text, fontSize: 12, fontWeight: '600',
    marginHorizontal: 10, marginTop: 10, marginBottom: 8,
  },
  dishFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 10, marginBottom: 10,
  },
  dishPrice: { color: Theme.colors.primary, fontSize: 13, fontWeight: 'bold' },
  addBtn: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
});
