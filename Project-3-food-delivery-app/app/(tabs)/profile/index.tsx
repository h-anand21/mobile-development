import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GREEN = '#1ed760';

// ── Static user data ─────────────────────────────────────────────────
const USER = {
  name: 'Rohit Sharma',
  badge: 'Foodie Pro',
  phone: '+91 98765 43210',
  email: 'rohitsharma@example.com',
  location: 'New Delhi, India',
  orders: 128,
  rating: 4.8,
  offers: 12,
  tier: 'Pro',
  wallet: '₹246.50',
  avatar: require('../../../assets/images/img2.png'), // placeholder until real avatar
};

const MENU = [
  { icon: 'location-outline',     label: 'Saved Addresses',       color: GREEN },
  { icon: 'heart-outline',        label: 'Favourite Restaurants', color: GREEN },
  { icon: 'card-outline',         label: 'Payment Methods',       color: GREEN },
  { icon: 'time-outline',         label: 'Order History',         color: GREEN },
  { icon: 'headset-outline',      label: 'Help & Support',        color: GREEN },
  { icon: 'shield-checkmark-outline', label: 'Privacy Policy',    color: GREEN },
];

export default function ProfileScreen() {
  const insets  = useSafeAreaInsets();
  const logout  = useAuthStore((s) => s.logout);
  const router  = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>
            My <Text style={s.headerGreen}>Profile</Text>
          </Text>
          <Text style={s.headerSub}>Manage your account and{'\n'}personal information.</Text>
        </View>
        <View style={s.headerIcons}>
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <View style={s.notifBadge}><Text style={s.notifBadgeTxt}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="settings-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

        {/* ── Profile Card ───────────────────────────────────── */}
        <View style={s.profileCard}>
          {/* Avatar + info */}
          <View style={s.profileTop}>
            <View style={s.avatarWrap}>
              <View style={s.avatarCircle}>
                <Ionicons name="person" size={42} color={GREEN} />
              </View>
              <TouchableOpacity style={s.editAvatarBtn}>
                <Ionicons name="pencil" size={12} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={s.profileInfo}>
              <View style={s.nameRow}>
                <Text style={s.profileName}>{USER.name}</Text>
                <Ionicons name="checkmark-circle" size={18} color={GREEN} style={{ marginLeft: 6 }} />
              </View>

              <View style={s.badgeRow}>
                <Ionicons name="star-outline" size={12} color={GREEN} />
                <Text style={s.badgeTxt}>{USER.badge}</Text>
              </View>

              <View style={s.infoLine}>
                <Ionicons name="call-outline" size={13} color="#aaa" />
                <Text style={s.infoTxt}>{USER.phone}</Text>
              </View>
              <View style={s.infoLine}>
                <Ionicons name="mail-outline" size={13} color="#aaa" />
                <Text style={s.infoTxt}>{USER.email}</Text>
              </View>
              <View style={s.infoLine}>
                <Ionicons name="location-outline" size={13} color="#aaa" />
                <Text style={s.infoTxt}>{USER.location}</Text>
              </View>
            </View>

            <TouchableOpacity style={s.editBtn}>
              <Text style={s.editBtnTxt}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={s.cardDivider} />

          {/* Stats row */}
          <View style={s.statsRow}>
            {[
              { icon: 'bag-outline',    value: USER.orders,  label: 'Orders' },
              { icon: 'star-outline',   value: USER.rating,  label: 'Rating' },
              { icon: 'pricetag-outline',value: USER.offers, label: 'Offers Used' },
              { icon: 'trophy-outline', value: USER.tier,    label: 'Member' },
            ].map((stat, i) => (
              <View key={i} style={s.statItem}>
                <View style={s.statIconWrap}>
                  <Ionicons name={stat.icon as any} size={18} color={GREEN} />
                </View>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Wallet Card ────────────────────────────────────── */}
        <TouchableOpacity style={s.walletCard} activeOpacity={0.85}>
          <View style={s.walletLeft}>
            <View style={s.walletIconWrap}>
              <Ionicons name="wallet-outline" size={22} color={GREEN} />
            </View>
            <View>
              <Text style={s.walletTitle}>Foodie Wallet</Text>
              <Text style={s.walletSub}>Available Balance</Text>
            </View>
          </View>
          <View style={s.walletRight}>
            <Text style={s.walletBalance}>{USER.wallet}</Text>
            <Ionicons name="chevron-forward" size={18} color={GREEN} />
          </View>
        </TouchableOpacity>

        {/* ── Account & Preferences ──────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Account & Preferences</Text>
          <View style={s.sectionAccent} />
        </View>

        <View style={s.menuCard}>
          {MENU.map((item, i) => (
            <TouchableOpacity key={i} style={[s.menuRow, i === MENU.length - 1 && { borderBottomWidth: 0 }]}
              activeOpacity={0.7}>
              <View style={s.menuIconWrap}>
                <Ionicons name={item.icon as any} size={18} color={GREEN} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#555" />
            </TouchableOpacity>
          ))}

          {/* Log Out */}
          <TouchableOpacity style={[s.menuRow, s.logoutRow]} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[s.menuIconWrap, { backgroundColor: 'rgba(255,68,68,0.12)' }]}>
              <Ionicons name="log-out-outline" size={18} color="#FF4444" />
            </View>
            <Text style={[s.menuLabel, { color: '#FF4444' }]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={16} color="#FF4444" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  // ── Header ────────────────────────────────────────────
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerGreen: { color: GREEN },
  headerSub:   { color: '#555', fontSize: 13, lineHeight: 18 },
  headerIcons: { flexDirection: 'row', gap: 10 },
  headerBtn:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifBadge:  { position: 'absolute', top: 6, right: 6, width: 17, height: 17, borderRadius: 9, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  notifBadgeTxt: { color: '#000', fontSize: 9, fontWeight: 'bold' },

  // ── Profile Card ──────────────────────────────────────
  profileCard: {
    marginHorizontal: 16, backgroundColor: '#111',
    borderRadius: 20, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#222',
  },
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },

  avatarWrap:   { position: 'relative', marginRight: 12 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1a1a1a',
    borderWidth: 2, borderColor: GREEN,
    justifyContent: 'center', alignItems: 'center',
  },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#050505',
  },

  profileInfo: { flex: 1 },
  nameRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  profileName: { color: '#fff', fontSize: 16, fontWeight: '800' },

  badgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(30,215,96,0.12)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 7,
  },
  badgeTxt: { color: GREEN, fontSize: 11, fontWeight: '700' },

  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  infoTxt:  { color: '#888', fontSize: 11 },

  editBtn:    { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: GREEN, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginTop: 4 },
  editBtnTxt: { color: GREEN, fontSize: 12, fontWeight: '700' },

  cardDivider: { height: 1, backgroundColor: 'rgba(30,215,96,0.1)', marginBottom: 14 },

  // Stats
  statsRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  statItem:    { flex: 1, alignItems: 'center' },
  statIconWrap:{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statValue:   { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 2 },
  statLabel:   { color: '#666', fontSize: 10, textAlign: 'center' },

  // ── Wallet ────────────────────────────────────────────
  walletCard: {
    marginHorizontal: 16, backgroundColor: '#111',
    borderRadius: 18, padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24, borderWidth: 1, borderColor: '#222',
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  walletIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  walletTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  walletSub:   { color: '#666', fontSize: 12, marginTop: 2 },
  walletRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletBalance: { color: GREEN, fontSize: 20, fontWeight: '900' },

  // ── Section ───────────────────────────────────────────
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle:  { color: GREEN, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  sectionAccent: { width: 36, height: 2.5, backgroundColor: GREEN, borderRadius: 2 },

  // ── Menu ──────────────────────────────────────────────
  menuCard: {
    marginHorizontal: 16, backgroundColor: '#111',
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#1e1e1e',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 15,
    paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
    gap: 14,
  },
  menuIconWrap:{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  menuLabel:   { flex: 1, color: '#ddd', fontSize: 14, fontWeight: '600' },

  logoutRow: { borderBottomWidth: 0 },
});
