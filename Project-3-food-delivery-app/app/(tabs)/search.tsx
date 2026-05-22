import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, ScrollView, Image, Dimensions,
} from 'react-native';
import { Theme } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const INITIAL_RECENT = ['Burger', 'Pizza', 'KFC', 'Chicken Biryani', "Domino's Pizza", 'Coke', 'Fries', 'Chocolate Cake'];

const CATEGORIES = [
  { id: '1', name: 'Burger',  icon: '🍔' },
  { id: '2', name: 'Pizza',   icon: '🍕' },
  { id: '3', name: 'Chicken', icon: '🍗' },
  { id: '4', name: 'Biryani', icon: '🍲' },
  { id: '5', name: 'Drinks',  icon: '🥤' },
  { id: '6', name: 'Desserts',icon: '🎂' },
  { id: '7', name: 'More',    icon: '⚡' },
];

const TRENDING = [
  { id: '1', name: 'Cheese Burger',    image: require('../../assets/images/dish_cheese_burger.png') },
  { id: '2', name: 'French Fries',     image: require('../../assets/images/dish_fried_chicken.png') },
  { id: '3', name: 'Chicken Biryani',  image: require('../../assets/images/dish_chicken_pizza.png') },
  { id: '4', name: 'Coca Cola',        image: require('../../assets/images/dish_cold_coffee.png') },
  { id: '5', name: 'Veg Pizza',        image: require('../../assets/images/dish_chicken_pizza.png') },
  { id: '6', name: 'Chocolate Cake',   image: require('../../assets/images/dish_lava_cake.png') },
];

const RESTAURANTS = [
  { id: '1', name: 'Burger King',    category: 'Burger • Fast Food', rating: 4.6, time: '30-40 min', delivery: '₹250 for two', image: require('../../assets/images/rest_burger_king.png') },
  { id: '2', name: "Domino's Pizza", category: 'Pizza • Italian',    rating: 4.5, time: '25-35 min', delivery: '₹220 for two', image: require('../../assets/images/rest_dominos.png') },
  { id: '3', name: 'KFC',           category: 'Chicken • Fast Food', rating: 4.4, time: '20-30 min', delivery: '₹180 for two', image: require('../../assets/images/rest_kfc.png') },
  { id: '4', name: 'Pizza Hut',     category: 'Pizza • Italian',     rating: 4.3, time: '20-35 min', delivery: '₹200 for two', image: require('../../assets/images/rest_dominos.png') },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('1');
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT);

  const removeRecent = (item: string) => {
    setRecentSearches(prev => prev.filter(r => r !== item));
  };

  const clearAll = () => setRecentSearches([]);

  // If user is typing, show filtered results
  const isSearching = query.trim().length > 0;
  const filteredRestaurants = isSearching
    ? RESTAURANTS.filter(r => r.name.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase()))
    : RESTAURANTS;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.headerContainer}>
          {/* Left text side */}
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Theme.colors.text} />
            </TouchableOpacity>
            <View style={{ marginTop: 14 }}>
              <Text style={styles.headerTitle}>Search 🍕</Text>
              <Text style={styles.headerSubtitle}>
                Find your <Text style={styles.headerSubtitleGreen}>favorite food</Text>
              </Text>
            </View>
          </View>

          {/* Right image side — clipped by container overflow:hidden */}
          <View style={styles.heroWrapper}>
            <Image
              source={require('../../assets/images/login_hero.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* ── Search Bar ─────────────────────────────────── */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color={Theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food, restaurants, cuisines..."
            placeholderTextColor={Theme.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          )}
          <TouchableOpacity>
            <Ionicons name="options-outline" size={22} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── Recent Searches ────────────────────────────── */}
        {!isSearching && recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearAll}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentChipsContainer}>
              {recentSearches.map((item) => (
                <TouchableOpacity key={item} style={styles.recentChip} onPress={() => setQuery(item)}>
                  <Ionicons name="time-outline" size={13} color={Theme.colors.textMuted} />
                  <Text style={styles.recentChipText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeRecent(item)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                    <Ionicons name="close" size={13} color={Theme.colors.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Browse Categories ──────────────────────────── */}
        {!isSearching && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
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
          </View>
        )}

        {/* ── Trending Searches ──────────────────────────── */}
        {!isSearching && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Searches</Text>
            <View style={styles.trendingGrid}>
              {TRENDING.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.trendingItem}
                  onPress={() => setQuery(item.name)}
                >
                  <View style={styles.trendingLeft}>
                    <Ionicons name="trending-up-outline" size={16} color={Theme.colors.primary} />
                    <Text style={styles.trendingText}>{item.name}</Text>
                  </View>
                  <Image source={item.image} style={styles.trendingImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Popular Restaurants / Search Results ────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isSearching ? `Results for "${query}"` : 'Popular Restaurants'}
            </Text>
            {!isSearching && (
              <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.restaurantsRow}>
            {filteredRestaurants.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No restaurants found for "{query}"</Text>
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
        </View>

        {/* ── Can't find card ────────────────────────────── */}
        <View style={styles.cantFindCard}>
          <View style={styles.cantFindIcon}>
            <Ionicons name="search-outline" size={22} color={Theme.colors.primary} />
          </View>
          <View style={styles.cantFindText}>
            <Text style={styles.cantFindTitle}>Can't find what you're looking for?</Text>
            <Text style={styles.cantFindSub}>Tell us what you want, we'll find it for you!</Text>
          </View>
          <TouchableOpacity style={styles.searchAnywayBtn}>
            <Text style={styles.searchAnywayText}>Search Anyway</Text>
            <Ionicons name="chevron-forward" size={14} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = width * 0.52;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingBottom: 30 },

  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 150,
    marginBottom: 16,
    overflow: 'hidden',
    paddingLeft: 20,
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 10,
    zIndex: 2,
  },
  heroWrapper: {
    width: width * 0.45,
    height: '100%',
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFadeOverlay: {},       // kept empty so no crash on old references
  headerContent: {},         // kept empty so no crash on old references
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Theme.colors.surface, justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: Theme.colors.text, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: Theme.colors.textMuted },
  headerSubtitleGreen: { color: Theme.colors.primary, fontWeight: '600', textDecorationLine: 'underline' },

  // Search Bar
  searchBarContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface,
    borderRadius: 14, paddingHorizontal: 16, height: 54, marginHorizontal: 20, marginBottom: 24,
    gap: 8,
  },
  searchInput: { flex: 1, color: Theme.colors.text, fontSize: 14 },
  filterIconBtn: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(30,215,96,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Sections
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.text },
  seeAll: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600' },
  clearAll: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600' },

  // Recent Searches
  recentChipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, gap: 6,
  },
  recentChipText: { color: Theme.colors.text, fontSize: 13 },

  // Categories
  categoriesRow: { marginLeft: -20 },
  categoryItem: {
    alignItems: 'center', backgroundColor: Theme.colors.surface,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    marginRight: 10, marginLeft: 20, minWidth: 68, borderWidth: 2, borderColor: 'transparent',
  },
  categoryItemActive: { borderColor: Theme.colors.primary, backgroundColor: 'rgba(30,215,96,0.08)' },
  categoryIcon: { fontSize: 20, marginBottom: 4 },
  categoryLabel: { color: Theme.colors.textMuted, fontSize: 11, fontWeight: '600' },
  categoryLabelActive: { color: Theme.colors.primary },

  // Trending
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trendingItem: {
    width: (width - 50) / 2, backgroundColor: Theme.colors.surface, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: 12, overflow: 'hidden',
  },
  trendingLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  trendingText: { color: Theme.colors.text, fontSize: 13, fontWeight: '600', flex: 1 },
  trendingImage: { width: 56, height: 56, borderRadius: 8 },

  // Restaurants
  restaurantsRow: { marginLeft: -20 },
  restaurantCard: {
    backgroundColor: Theme.colors.surface, borderRadius: 16, width: CARD_W,
    marginLeft: 20, marginRight: 4, overflow: 'hidden', marginBottom: 4,
  },
  restaurantImageWrapper: { height: 130, position: 'relative' },
  restaurantImage: { width: '100%', height: '100%' },
  ratingBadge: {
    position: 'absolute', bottom: 8, left: 10, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, gap: 3,
  },
  ratingText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
  restaurantName: { color: Theme.colors.text, fontSize: 14, fontWeight: 'bold', marginTop: 10, marginHorizontal: 12 },
  restaurantCategory: { color: Theme.colors.textMuted, fontSize: 12, marginHorizontal: 12, marginBottom: 6 },
  restaurantMeta: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, gap: 4 },
  restaurantMetaText: { color: Theme.colors.textMuted, fontSize: 11 },

  // No Results
  noResults: { paddingVertical: 30, paddingHorizontal: 20, alignItems: 'center' },
  noResultsText: { color: Theme.colors.textMuted, fontSize: 14, textAlign: 'center' },

  // Can't find card
  cantFindCard: {
    marginHorizontal: 20, backgroundColor: Theme.colors.surface, borderRadius: 20,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4,
  },
  cantFindIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(30,215,96,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  cantFindText: { flex: 1 },
  cantFindTitle: { color: Theme.colors.text, fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  cantFindSub: { color: Theme.colors.textMuted, fontSize: 11 },
  searchAnywayBtn: {
    backgroundColor: 'rgba(30,215,96,0.1)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  searchAnywayText: { color: Theme.colors.primary, fontSize: 12, fontWeight: 'bold' },
});
