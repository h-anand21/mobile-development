import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Dimensions, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../../../store/cartStore';

const { width } = Dimensions.get('window');
const GREEN = '#1ed760';

// ─── Per-restaurant data ─────────────────────────────────────────────────────
const RESTAURANT_DATA: Record<string, {
  name: string; tagline: string; tags: string;
  rating: number; ratingCount: string; time: string; deliveryFee: string;
  offer: string; offerSub: string;
  heroImage: any; logoImage: any;
  categories: string[];
  menu: Record<string, { id: string; name: string; desc: string; price: number; rating: number; orders: string; image: any; badge?: string }[]>;
}> = {
  '1': {
    name: 'Burger King',
    tagline: 'Burgers • Fast Food • Beverages',
    tags: 'Burgers • Fast Food • Beverages',
    rating: 4.8, ratingCount: '12.6K+', time: '25–30 min', deliveryFee: 'Free',
    offer: 'FLAT ₹100 OFF', offerSub: 'on orders above ₹499',
    heroImage: require('../../../../assets/images/rest_burger_king.png'),
    logoImage: require('../../../../assets/images/rest_burger_king.png'),
    categories: ['Burgers', 'Combos', 'Sides', 'Beverages', 'Desserts'],
    menu: {
      Burgers: [
        { id: 'bk1', name: 'Whopper Burger',    desc: 'Our signature burger with flame-grilled patty, fresh veggies & sauces.',  price: 249, rating: 4.7, orders: '8.2K+', image: require('../../../../assets/images/dish_cheese_burger.png'), badge: 'Bestseller' },
        { id: 'bk2', name: 'Chicken Royale',    desc: 'Crispy chicken patty with lettuce, mayo & premium sauces.',               price: 219, rating: 4.6, orders: '6.1K+', image: require('../../../../assets/images/dish_cheese_burger.png'), badge: 'Bestseller' },
        { id: 'bk3', name: 'Veggie Burger',     desc: 'Veg patty with crunchy veggies and delicious sauces.',                    price: 149, rating: 4.5, orders: '4.3K+', image: require('../../../../assets/images/dish_cheese_burger.png') },
        { id: 'bk4', name: 'Double Whopper',    desc: 'Double flame-grilled beef patties with all the classics.',                 price: 329, rating: 4.8, orders: '5.5K+', image: require('../../../../assets/images/dish_cheese_burger.png') },
      ],
      Combos: [
        { id: 'bkc1', name: 'Whopper Combo',    desc: 'Whopper + Large Fries + Medium Coke', price: 399, rating: 4.7, orders: '9K+',  image: require('../../../../assets/images/dish_cheese_burger.png'), badge: 'Popular' },
        { id: 'bkc2', name: 'Chicken Combo',    desc: 'Chicken Royale + Fries + Pepsi',      price: 349, rating: 4.6, orders: '7K+',  image: require('../../../../assets/images/dish_cheese_burger.png') },
      ],
      Sides: [
        { id: 'bks1', name: 'French Fries',     desc: 'Crispy golden fries with salt',        price: 99,  rating: 4.5, orders: '15K+', image: require('../../../../assets/images/dish_lava_cake.png') },
        { id: 'bks2', name: 'Onion Rings',      desc: 'Crispy golden onion rings',            price: 129, rating: 4.4, orders: '5K+',  image: require('../../../../assets/images/dish_lava_cake.png') },
      ],
      Beverages: [
        { id: 'bkb1', name: 'Cold Coffee',      desc: 'Chilled coffee with milk & cream',     price: 149, rating: 4.6, orders: '8K+',  image: require('../../../../assets/images/dish_cold_coffee.png') },
        { id: 'bkb2', name: 'Pepsi Large',      desc: 'Ice cold Pepsi 500ml',                 price: 79,  rating: 4.3, orders: '12K+', image: require('../../../../assets/images/dish_cold_coffee.png') },
      ],
      Desserts: [
        { id: 'bkd1', name: 'Choco Lava Cake',  desc: 'Warm molten chocolate lava cake',       price: 99,  rating: 4.8, orders: '6K+',  image: require('../../../../assets/images/dish_lava_cake.png'), badge: 'Must Try' },
      ],
    },
  },
  '2': {
    name: "Domino's Pizza",
    tagline: 'Pizza • Italian • Fast Food',
    tags: 'Pizza • Italian • Fast Food',
    rating: 4.6, ratingCount: '9.8K+', time: '25–35 min', deliveryFee: '₹30',
    offer: 'BUY 1 GET 1 FREE', offerSub: 'On medium pizzas every Tuesday',
    heroImage: require('../../../../assets/images/rest_dominos.png'),
    logoImage: require('../../../../assets/images/rest_dominos.png'),
    categories: ['Pizzas', 'Pasta', 'Sides', 'Beverages', 'Desserts'],
    menu: {
      Pizzas: [
        { id: 'dm1', name: 'Farmhouse Pizza',      desc: 'Loaded with capsicum, mushroom, onion & fresh tomato.', price: 349, rating: 4.7, orders: '11K+', image: require('../../../../assets/images/dish_chicken_pizza.png'), badge: 'Bestseller' },
        { id: 'dm2', name: 'Peppy Paneer Pizza',   desc: 'Chunky paneer with capsicum & spicy sauce.',            price: 329, rating: 4.6, orders: '8K+',  image: require('../../../../assets/images/dish_chicken_pizza.png'), badge: 'Bestseller' },
        { id: 'dm3', name: 'Chicken Dominator',    desc: 'Double chicken, extra cheese, smoky BBQ sauce.',        price: 399, rating: 4.8, orders: '7K+',  image: require('../../../../assets/images/dish_chicken_pizza.png') },
        { id: 'dm4', name: 'Margherita',           desc: 'Classic tomato sauce with mozzarella cheese.',          price: 199, rating: 4.4, orders: '6K+',  image: require('../../../../assets/images/dish_chicken_pizza.png') },
      ],
      Pasta: [
        { id: 'dmp1', name: 'Penne Arrabbiata',   desc: 'Spicy tomato sauce pasta with herbs.',  price: 179, rating: 4.4, orders: '3K+', image: require('../../../../assets/images/dish_lava_cake.png') },
        { id: 'dmp2', name: 'Mac & Cheese',        desc: 'Creamy cheese pasta with veggies.',     price: 199, rating: 4.5, orders: '4K+', image: require('../../../../assets/images/dish_lava_cake.png') },
      ],
      Sides: [
        { id: 'dms1', name: 'Garlic Bread',       desc: '8 slices of garlic flavoured bread.', price: 99,  rating: 4.6, orders: '14K+', image: require('../../../../assets/images/dish_lava_cake.png'), badge: 'Popular' },
        { id: 'dms2', name: 'Stuffed Garlic Bread', desc: 'Garlic bread stuffed with cheese.',  price: 149, rating: 4.7, orders: '9K+',  image: require('../../../../assets/images/dish_lava_cake.png') },
      ],
      Beverages: [
        { id: 'dmb1', name: 'Pepsi 500ml',        desc: 'Chilled Pepsi',         price: 60,  rating: 4.3, orders: '10K+', image: require('../../../../assets/images/dish_cold_coffee.png') },
        { id: 'dmb2', name: '7UP 500ml',          desc: 'Refreshing lemon drink', price: 60,  rating: 4.3, orders: '7K+',  image: require('../../../../assets/images/dish_cold_coffee.png') },
      ],
      Desserts: [
        { id: 'dmd1', name: 'Choco Lava Cake',    desc: 'Hot molten chocolate cake.', price: 89, rating: 4.9, orders: '12K+', image: require('../../../../assets/images/dish_lava_cake.png'), badge: 'Must Try' },
      ],
    },
  },
  '3': {
    name: 'KFC',
    tagline: 'Chicken • Fast Food • Snacks',
    tags: 'Chicken • Fast Food • Snacks',
    rating: 4.7, ratingCount: '15.2K+', time: '20–30 min', deliveryFee: 'Free',
    offer: 'FLAT ₹150 OFF', offerSub: 'on orders above ₹699',
    heroImage: require('../../../../assets/images/rest_kfc.png'),
    logoImage: require('../../../../assets/images/rest_kfc.png'),
    categories: ['Chicken', 'Burgers', 'Combos', 'Snacks', 'Beverages'],
    menu: {
      Chicken: [
        { id: 'kfc1', name: 'Original Recipe Chicken', desc: '2 pcs of KFC signature crispy fried chicken.',           price: 249, rating: 4.8, orders: '18K+', image: require('../../../../assets/images/dish_fried_chicken.png'), badge: 'Bestseller' },
        { id: 'kfc2', name: 'Hot & Crispy Chicken',    desc: 'Extra spicy and crunchy chicken pieces.',                price: 269, rating: 4.7, orders: '14K+', image: require('../../../../assets/images/dish_fried_chicken.png'), badge: 'Spicy' },
        { id: 'kfc3', name: 'Chicken Bucket (6 pcs)',  desc: '6 pieces of our iconic crispy chicken.',                  price: 699, rating: 4.9, orders: '9K+',  image: require('../../../../assets/images/dish_fried_chicken.png'), badge: 'Value' },
        { id: 'kfc4', name: 'Popcorn Chicken',         desc: 'Bite-sized crunchy chicken bites with dipping sauce.',   price: 149, rating: 4.6, orders: '11K+', image: require('../../../../assets/images/dish_fried_chicken.png') },
      ],
      Burgers: [
        { id: 'kfcb1', name: 'Zinger Burger',     desc: 'Crispy chicken fillet with zesty mayo.',         price: 199, rating: 4.7, orders: '12K+', image: require('../../../../assets/images/dish_cheese_burger.png'), badge: 'Bestseller' },
        { id: 'kfcb2', name: 'Tower Burger',       desc: 'Stacked chicken with extra crunch and sauce.',   price: 249, rating: 4.6, orders: '8K+',  image: require('../../../../assets/images/dish_cheese_burger.png') },
      ],
      Combos: [
        { id: 'kfcc1', name: 'Zinger Combo',       desc: 'Zinger Burger + Fries + Pepsi',  price: 349, rating: 4.8, orders: '10K+', image: require('../../../../assets/images/dish_fried_chicken.png'), badge: 'Popular' },
        { id: 'kfcc2', name: 'Chicken Meal',       desc: '2 pc Chicken + Fries + Coleslaw + Pepsi', price: 449, rating: 4.7, orders: '7K+',  image: require('../../../../assets/images/dish_fried_chicken.png') },
      ],
      Snacks: [
        { id: 'kfcs1', name: 'Fries (Large)',      desc: 'Golden crispy fries with spicy seasoning.', price: 129, rating: 4.5, orders: '16K+', image: require('../../../../assets/images/dish_lava_cake.png') },
        { id: 'kfcs2', name: 'Coleslaw',           desc: 'Fresh creamy coleslaw salad.',              price: 79,  rating: 4.4, orders: '6K+',  image: require('../../../../assets/images/dish_lava_cake.png') },
      ],
      Beverages: [
        { id: 'kfcbv1', name: 'Pepsi 500ml',       desc: 'Ice cold Pepsi',   price: 60,  rating: 4.3, orders: '20K+', image: require('../../../../assets/images/dish_cold_coffee.png') },
        { id: 'kfcbv2', name: 'Iced Lemon Tea',    desc: 'Refreshing iced lemon tea.', price: 99, rating: 4.5, orders: '5K+', image: require('../../../../assets/images/dish_cold_coffee.png') },
      ],
    },
  },
  '4': {
    name: 'Pizza Hut',
    tagline: 'Pizza • Italian • Fast Food',
    tags: 'Pizza • Italian • Desserts',
    rating: 4.5, ratingCount: '7.3K+', time: '20–35 min', deliveryFee: '₹40',
    offer: '50% OFF on 2nd Pizza', offerSub: 'Valid on medium & large sizes',
    heroImage: require('../../../../assets/images/rest_dominos.png'),
    logoImage: require('../../../../assets/images/rest_dominos.png'),
    categories: ['Pizzas', 'Pasta', 'Sides', 'Beverages'],
    menu: {
      Pizzas: [
        { id: 'ph1', name: 'Veggie Supreme',  desc: 'Garden fresh veggies on creamy sauce.', price: 319, rating: 4.5, orders: '5K+', image: require('../../../../assets/images/dish_chicken_pizza.png'), badge: 'Bestseller' },
        { id: 'ph2', name: 'Chicken Tikka',   desc: 'Spicy chicken tikka with tangy sauce.', price: 369, rating: 4.6, orders: '7K+', image: require('../../../../assets/images/dish_chicken_pizza.png') },
        { id: 'ph3', name: 'BBQ Chicken',     desc: 'Smoky BBQ chicken with cheese.',        price: 379, rating: 4.7, orders: '6K+', image: require('../../../../assets/images/dish_chicken_pizza.png') },
      ],
      Pasta: [
        { id: 'php1', name: 'Creamy Alfredo', desc: 'Rich white sauce pasta.',               price: 199, rating: 4.5, orders: '3K+', image: require('../../../../assets/images/dish_lava_cake.png') },
      ],
      Sides: [
        { id: 'phs1', name: 'Garlic Bread',   desc: 'Crispy garlic bread sticks.',           price: 99,  rating: 4.4, orders: '8K+', image: require('../../../../assets/images/dish_lava_cake.png') },
      ],
      Beverages: [
        { id: 'phb1', name: 'Pepsi 500ml',    desc: 'Ice cold Pepsi',                        price: 60,  rating: 4.2, orders: '9K+', image: require('../../../../assets/images/dish_cold_coffee.png') },
      ],
    },
  },
};

// Fallback for restaurants 5+
const FALLBACK = RESTAURANT_DATA['1'];

export default function RestaurantDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const data = RESTAURANT_DATA[id ?? '1'] ?? { ...FALLBACK, name: name ?? FALLBACK.name };
  const cats = data.categories;

  const [activeTab, setActiveTab]   = useState(cats[0]);
  const [searchQ,   setSearchQ]     = useState('');
  const [liked,     setLiked]       = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { addItem, getTotalItems, getTotalPrice } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const currentMenu = data.menu[activeTab] ?? [];
  const displayMenu = searchQ
    ? currentMenu.filter(i => i.name.toLowerCase().includes(searchQ.toLowerCase()))
    : currentMenu;

  const addOne = (item: typeof currentMenu[0]) => {
    const qty = (quantities[item.id] ?? 0) + 1;
    setQuantities(prev => ({ ...prev, [item.id]: qty }));
    addItem({ id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image });
  };

  const removeOne = (itemId: string) => {
    const qty = Math.max(0, (quantities[itemId] ?? 0) - 1);
    setQuantities(prev => ({ ...prev, [itemId]: qty }));
  };

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>

        {/* ── Hero ──────────────────────────────────────────── */}
        <View style={s.hero}>
          <Image source={data.heroImage} style={s.heroImg} resizeMode="cover" />
          <View style={s.heroOverlay} />

          {/* Back + action buttons */}
          <View style={[s.heroNav, { top: insets.top + 10 }]}>
            <TouchableOpacity style={s.heroBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={s.heroRight}>
              <TouchableOpacity style={[s.heroBtn, liked && { backgroundColor: 'rgba(255,68,68,0.3)' }]}
                onPress={() => setLiked(!liked)}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#FF4444' : '#fff'} />
              </TouchableOpacity>
              <TouchableOpacity style={s.heroBtn}>
                <Ionicons name="share-social-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Sticky header (info + tabs) ────────────────────── */}
        <View style={s.stickyHeader}>
          {/* Restaurant info card */}
          <View style={s.infoCard}>
            <View style={s.infoTop}>
              {/* Logo */}
              <View style={s.logoBox}>
                <Image source={data.logoImage} style={s.logoImg} resizeMode="contain" />
              </View>

              <View style={s.infoMid}>
                <View style={s.nameRow}>
                  <Text style={s.restName}>{data.name}</Text>
                  <Ionicons name="checkmark-circle" size={16} color={GREEN} style={{ marginLeft: 6 }} />
                </View>
                <Text style={s.restTags}>{data.tags}</Text>
                <View style={s.infoStats}>
                  <Ionicons name="star" size={13} color="#FFD700" />
                  <Text style={s.statTxt}>{data.rating}</Text>
                  <Text style={s.statMuted}> ({data.ratingCount})</Text>
                  <View style={s.statDot} />
                  <Ionicons name="time-outline" size={13} color="#888" />
                  <Text style={s.statTxt}> {data.time}</Text>
                  <View style={s.statDot} />
                  <Ionicons name="bicycle-outline" size={13} color="#888" />
                  <Text style={s.statTxt}> {data.deliveryFee}</Text>
                </View>
              </View>

              <View style={s.openBadge}>
                <Text style={s.openTxt}>Open</Text>
              </View>
            </View>

            {/* Offer banner */}
            <TouchableOpacity style={s.offerBar}>
              <View style={s.offerLeft}>
                <Ionicons name="pricetag-outline" size={16} color={GREEN} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={s.offerTitle}>{data.offer}</Text>
                  <Text style={s.offerSub}>{data.offerSub}</Text>
                </View>
              </View>
              <TouchableOpacity style={s.applyBtn}>
                <Text style={s.applyTxt}>APPLY</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={16} color="#666" />
            <TextInput
              style={s.searchInput}
              placeholder="Search dishes..."
              placeholderTextColor="#555"
              value={searchQ}
              onChangeText={setSearchQ}
            />
            {searchQ ? (
              <TouchableOpacity onPress={() => setSearchQ('')}>
                <Ionicons name="close-circle" size={16} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Category tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={s.tabsRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {cats.map((cat) => (
              <TouchableOpacity key={cat}
                style={[s.tab, activeTab === cat && s.tabActive]}
                onPress={() => setActiveTab(cat)}>
                <Text style={[s.tabTxt, activeTab === cat && s.tabTxtActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Menu list ─────────────────────────────────────── */}
        <View style={s.menuSection}>
          <View style={s.menuHeader}>
            <Text style={s.menuTitle}>{activeTab}</Text>
            <TouchableOpacity>
              <Text style={s.seeAll}>See all {'>'}</Text>
            </TouchableOpacity>
          </View>

          {displayMenu.map((item) => {
            const qty = quantities[item.id] ?? 0;
            return (
              <View key={item.id} style={s.menuItem}>
                {/* Left colored bar */}
                <View style={[s.menuBar, { backgroundColor: qty > 0 ? GREEN : '#222' }]} />

                <Image source={item.image} style={s.menuImg} resizeMode="cover" />

                <View style={s.menuInfo}>
                  <View style={s.menuTopRow}>
                    <Text style={s.menuName} numberOfLines={1}>{item.name}</Text>
                    {item.badge && (
                      <View style={s.badge}>
                        <Ionicons name="flame-outline" size={10} color={GREEN} />
                        <Text style={s.badgeTxt}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.menuDesc} numberOfLines={2}>{item.desc}</Text>
                  <View style={s.menuMeta}>
                    <Ionicons name="star" size={11} color="#FFD700" />
                    <Text style={s.metaTxt}>{item.rating}</Text>
                    <Text style={s.metaMuted}> | {item.orders} orders</Text>
                  </View>
                  <View style={s.menuBottom}>
                    <Text style={s.menuPrice}>₹{item.price}</Text>
                    {qty === 0 ? (
                      <TouchableOpacity style={s.addBtn} onPress={() => addOne(item)}>
                        <Ionicons name="add" size={14} color={GREEN} />
                        <Text style={s.addBtnTxt}> Add</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={s.qtyControl}>
                        <TouchableOpacity style={s.qtyBtn} onPress={() => removeOne(item.id)}>
                          <Ionicons name="remove" size={14} color="#fff" />
                        </TouchableOpacity>
                        <Text style={s.qtyTxt}>{qty}</Text>
                        <TouchableOpacity style={[s.qtyBtn, { backgroundColor: GREEN }]} onPress={() => addOne(item)}>
                          <Ionicons name="add" size={14} color="#000" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ── Floating cart bar ─────────────────────────────── */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={[s.cartBar, { bottom: insets.bottom + 16 }]}
          onPress={() => router.push('/(tabs)/home/cart')}
          activeOpacity={0.92}
        >
          <View style={s.cartLeft}>
            <View style={s.cartBadge}>
              <Text style={s.cartBadgeTxt}>{totalItems}</Text>
            </View>
            <Text style={s.cartItemsTxt}>{totalItems} Item{totalItems > 1 ? 's' : ''}</Text>
            <Text style={s.cartSep}>  |  </Text>
            <Text style={s.cartPriceTxt}>₹{totalPrice}</Text>
          </View>
          <View style={s.cartRight}>
            <Text style={s.viewCartTxt}>View Cart</Text>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  // Hero
  hero:        { height: 260, position: 'relative' },
  heroImg:     { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  heroNav:     { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroRight:   { flexDirection: 'row', gap: 10 },
  heroBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },

  // Sticky header
  stickyHeader: { backgroundColor: '#050505' },

  // Info card
  infoCard: { backgroundColor: '#111', marginHorizontal: 14, marginTop: 12, borderRadius: 18, padding: 14, marginBottom: 10 },
  infoTop:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  logoBox:  { width: 62, height: 62, borderRadius: 14, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  logoImg:  { width: 58, height: 58 },
  infoMid:  { flex: 1 },
  nameRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  restName: { color: '#fff', fontSize: 17, fontWeight: '800' },
  restTags: { color: '#666', fontSize: 12, marginBottom: 6 },
  infoStats:{ flexDirection: 'row', alignItems: 'center' },
  statTxt:  { color: '#ccc', fontSize: 11, fontWeight: '600' },
  statMuted:{ color: '#666', fontSize: 11 },
  statDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: '#444', marginHorizontal: 6 },
  openBadge:{ backgroundColor: 'rgba(30,215,96,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(30,215,96,0.3)' },
  openTxt:  { color: GREEN, fontSize: 11, fontWeight: '700' },

  // Offer
  offerBar:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(30,215,96,0.06)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(30,215,96,0.15)', borderStyle: 'dashed' },
  offerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  offerTitle:{ color: GREEN, fontSize: 13, fontWeight: '800' },
  offerSub:  { color: '#666', fontSize: 11, marginTop: 1 },
  applyBtn:  { borderWidth: 1.5, borderColor: GREEN, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  applyTxt:  { color: GREEN, fontSize: 11, fontWeight: '800' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', marginHorizontal: 14, borderRadius: 12, paddingHorizontal: 14, height: 42, marginBottom: 8, gap: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },

  // Tabs
  tabsRow: { flexGrow: 0, marginBottom: 6 },
  tab:     { backgroundColor: '#111', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  tabActive: { backgroundColor: GREEN },
  tabTxt:    { color: '#666', fontSize: 13, fontWeight: '600' },
  tabTxtActive: { color: '#000' },

  // Menu
  menuSection: { paddingHorizontal: 14 },
  menuHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  menuTitle:   { color: '#fff', fontSize: 16, fontWeight: '800' },
  seeAll:      { color: GREEN, fontSize: 13, fontWeight: '600' },

  menuItem: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 16, marginBottom: 10, overflow: 'hidden', minHeight: 105 },
  menuBar:  { width: 4 },
  menuImg:  { width: 105, height: 105 },
  menuInfo: { flex: 1, padding: 10 },
  menuTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  menuName: { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  badge:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30,215,96,0.12)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, gap: 3 },
  badgeTxt: { color: GREEN, fontSize: 10, fontWeight: '700' },
  menuDesc: { color: '#666', fontSize: 11, lineHeight: 16, marginBottom: 4 },
  menuMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metaTxt:  { color: '#ccc', fontSize: 11, fontWeight: '600', marginLeft: 3 },
  metaMuted:{ color: '#555', fontSize: 11 },
  menuBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuPrice:  { color: '#fff', fontSize: 15, fontWeight: '900' },

  // Add / qty
  addBtn:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: GREEN, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  addBtnTxt: { color: GREEN, fontSize: 13, fontWeight: '700' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn:  { width: 28, height: 28, borderRadius: 8, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  qtyTxt:  { color: '#fff', fontSize: 14, fontWeight: '800', minWidth: 16, textAlign: 'center' },

  // Cart bar
  cartBar:   { position: 'absolute', left: 16, right: 16, backgroundColor: GREEN, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  cartLeft:  { flexDirection: 'row', alignItems: 'center' },
  cartBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  cartBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cartItemsTxt: { color: '#000', fontSize: 14, fontWeight: '700' },
  cartSep:   { color: 'rgba(0,0,0,0.4)', fontSize: 14 },
  cartPriceTxt: { color: '#000', fontSize: 14, fontWeight: '800' },
  cartRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewCartTxt: { color: '#000', fontSize: 14, fontWeight: '800' },
});
