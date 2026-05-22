import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrderStore, Order, OrderStatus } from '../../store/orderStore';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

type FilterTab = 'all' | OrderStatus;

const TABS: { key: FilterTab; label: string; icon: string }[] = [
  { key: 'all',       label: 'All Orders', icon: 'bag-outline' },
  { key: 'ongoing',   label: 'Ongoing',    icon: 'time-outline' },
  { key: 'completed', label: 'Completed',  icon: 'checkmark-circle-outline' },
  { key: 'cancelled', label: 'Cancelled',  icon: 'close-circle-outline' },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    ongoing:   { label: 'Preparing', color: '#FF9900', bg: 'rgba(255,153,0,0.12)', icon: 'time-outline' },
    completed: { label: 'Delivered', color: Theme.colors.primary, bg: 'rgba(30,215,96,0.1)', icon: 'checkmark-circle-outline' },
    cancelled: { label: 'Cancelled', color: '#FF4444', bg: 'rgba(255,68,68,0.1)', icon: 'close-circle-outline' },
  }[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon as any} size={13} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

function OrderCard({ order, onCancel }: { order: Order; onCancel: () => void }) {
  const leftBarColor =
    order.status === 'ongoing' ? '#FF9900' :
    order.status === 'cancelled' ? '#FF4444' :
    Theme.colors.primary;

  return (
    <View style={styles.orderCard}>
      {/* Left colored bar */}
      <View style={[styles.leftBar, { backgroundColor: leftBarColor }]} />

      {/* Food image */}
      <Image source={order.image} style={styles.orderImage} resizeMode="cover" />

      {/* Details */}
      <View style={styles.orderDetails}>
        {/* Row 1: order ID + status */}
        <View style={styles.orderTopRow}>
          <Text style={styles.orderIdLabel}>Order ID  </Text>
          <Text style={styles.orderId}>{order.orderId}</Text>
          <View style={{ flex: 1 }} />
          <StatusBadge status={order.status} />
        </View>

        {/* Product name */}
        <Text style={styles.productName} numberOfLines={1}>{order.productName}</Text>

        {/* Items */}
        {order.items.slice(0, 2).map((item, idx) => (
          <Text key={idx} style={styles.itemLine}>
            • {item.quantity} × {item.name}
          </Text>
        ))}
        {order.items.length > 2 && (
          <Text style={styles.moreItems}>+{order.items.length - 2} more</Text>
        )}

        {/* Date + Time */}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={Theme.colors.textMuted} />
          <Text style={styles.metaText}>{order.date}</Text>
          <Text style={styles.metaSep}>|</Text>
          <Ionicons name="time-outline" size={12} color={Theme.colors.textMuted} />
          <Text style={styles.metaText}>{order.time}</Text>
        </View>

        {/* Price + View Details */}
        <View style={styles.orderBottomRow}>
          <Text style={styles.orderPrice}>₹{order.totalPrice}</Text>
          <View style={{ flex: 1 }} />
          {order.status === 'ongoing' && (
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={13} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, cancelOrder } = useOrderStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const totalOrders = orders.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            My <Text style={styles.headerTitleGreen}>Orders</Text>
          </Text>
          <Text style={styles.headerSub}>Track, view and reorder your favorite food</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color={Theme.colors.text} />
          {totalOrders > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{totalOrders > 9 ? '9+' : totalOrders}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Filter Tabs ─────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={14}
              color={activeTab === tab.key ? '#000' : Theme.colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Orders List ─────────────────────────────────── */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={64} color={Theme.colors.border} />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySub}>
            {activeTab === 'all'
              ? 'Add items to your cart to place an order!'
              : `No ${activeTab} orders found.`}
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.browseBtnText}>Browse Food</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onCancel={() => cancelOrder(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListFooterComponent={
            filtered.length > 0 ? (
              <View style={styles.refreshCard}>
                <View style={styles.refreshIcon}>
                  <Ionicons name="refresh-outline" size={22} color={Theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.refreshTitle}>Can't find your order?</Text>
                  <Text style={styles.refreshSub}>Pull down to refresh your orders</Text>
                </View>
                <TouchableOpacity style={styles.refreshBtn}>
                  <Ionicons name="refresh" size={14} color="#000" />
                  <Text style={styles.refreshBtnText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: Theme.colors.text, marginBottom: 4 },
  headerTitleGreen: { color: Theme.colors.primary },
  headerSub: { color: Theme.colors.textMuted, fontSize: 13 },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  bellBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  bellBadgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },

  // Tabs
  tabsRow: { marginBottom: 8, flexGrow: 0 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Theme.colors.surface, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary,
  },
  tabText: { color: Theme.colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#000' },

  // Order Card
  orderCard: {
    backgroundColor: Theme.colors.surface, borderRadius: 16,
    flexDirection: 'row', overflow: 'hidden',
  },
  leftBar: { width: 4 },
  orderImage: { width: 90, height: '100%', minHeight: 120 },
  orderDetails: { flex: 1, padding: 12 },
  orderTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  orderIdLabel: { color: Theme.colors.textMuted, fontSize: 11 },
  orderId: { color: Theme.colors.primary, fontSize: 11, fontWeight: '700' },

  // Status Badge
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  productName: { color: Theme.colors.text, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  itemLine: { color: Theme.colors.textMuted, fontSize: 12, marginBottom: 1 },
  moreItems: { color: Theme.colors.textMuted, fontSize: 11, fontStyle: 'italic' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, marginBottom: 8 },
  metaText: { color: Theme.colors.textMuted, fontSize: 11 },
  metaSep: { color: Theme.colors.border, marginHorizontal: 2 },

  orderBottomRow: { flexDirection: 'row', alignItems: 'center' },
  orderPrice: { color: Theme.colors.text, fontSize: 16, fontWeight: '900' },
  cancelBtn: {
    marginRight: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: '#FF4444',
  },
  cancelBtnText: { color: '#FF4444', fontSize: 11, fontWeight: '700' },
  viewDetailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewDetailsText: { color: Theme.colors.primary, fontSize: 12, fontWeight: '600' },

  // Empty state
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  emptyTitle: { color: Theme.colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  emptySub: { color: Theme.colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  browseBtn: {
    backgroundColor: Theme.colors.primary, borderRadius: 24,
    paddingHorizontal: 28, paddingVertical: 13,
  },
  browseBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },

  // Refresh card
  refreshCard: {
    marginTop: 16, backgroundColor: Theme.colors.surface, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
  },
  refreshIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(30,215,96,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  refreshTitle: { color: Theme.colors.text, fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  refreshSub: { color: Theme.colors.textMuted, fontSize: 11 },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Theme.colors.primary, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  refreshBtnText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
});
