import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SAMPLE_PIN = [4, 8, 2, 1];

export default function OrdersScreen() {
  const hasPickups = false;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.pageTitle}>Pickups & Reservations</Text>
      <Text style={styles.pageSubtitle}>Your reserved items from local shops</Text>

      {hasPickups ? (
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <View style={styles.shopInfo}>
              <Ionicons name="storefront-outline" size={20} color="#d97706" />
              <Text style={styles.shopName}>Sharma Kirana Store</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Ready</Text>
            </View>
          </View>

          <View style={styles.ticketDivider} />

          <Text style={styles.itemLabel}>Reserved Items</Text>
          <Text style={styles.itemDescription}>2x Aashirvaad Atta, 1x Tata Salt, 1x Surf Excel</Text>

          <Text style={styles.pinLabel}>Your Pickup PIN</Text>
          <View style={styles.pinContainer}>
            {SAMPLE_PIN.map((digit, i) => (
              <View key={i} style={styles.pinBox}>
                <Text style={styles.pinDigit}>{digit}</Text>
              </View>
            ))}
          </View>

          <View style={styles.expiryContainer}>
            <Ionicons name="time-outline" size={14} color="#f59e0b" />
            <Text style={styles.expiryText}>Expires in 2h 45m</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="bag-check-outline" size={48} color="#d1d5db" />
          </View>
          <Text style={styles.emptyTitle}>No active pickups</Text>
          <Text style={styles.emptySubtitle}>
            Reserve items at neighborhood shops to collect in person. Your 4-digit pickup PIN will appear here.
          </Text>
        </View>
      )}

      {/* Bottom Spacer */}
      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  contentContainer: { padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shopName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  ticketDivider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16, borderStyle: 'dashed' },
  itemLabel: { fontSize: 12, fontWeight: '600', color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemDescription: { fontSize: 15, color: '#374151', marginBottom: 20, lineHeight: 22 },
  pinLabel: { fontSize: 12, fontWeight: '600', color: '#9ca3af', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  pinContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  pinBox: {
    width: 52,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 2,
    borderColor: '#fde68a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDigit: { fontSize: 28, fontWeight: 'bold', color: '#92400e' },
  expiryContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  expiryText: { fontSize: 13, color: '#f59e0b', fontWeight: '600' },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
});
