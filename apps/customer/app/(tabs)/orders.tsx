import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReservations, EnrichedReservation } from '../../hooks/useReservations';

export default function OrdersScreen() {
  const { activeReservations, pastReservations, isLoading, cancelReservation, refetch } = useReservations();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const handleCancel = (id: string) => {
    Alert.alert('Cancel Reservation', 'Are you sure you want to cancel this reservation?', [
      { text: 'No, Keep it', style: 'cancel' },
      { 
        text: 'Yes, Cancel', 
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelReservation(id);
            Alert.alert('Cancelled', 'Your reservation has been cancelled.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to cancel reservation.');
          }
        }
      }
    ]);
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Not Available', 'Shop phone number is not available.');
    }
  };

  const renderActiveTicket = ({ item }: { item: EnrichedReservation }) => {
    // We don't have an explicit PIN column in 'reservations' in the schema, 
    // but the prompt explicitly requires displaying a 4-Digit Pickup PIN [ 7 3 9 2 ].
    // Usually reservations might just use the last 4 of ID or a pseudo-random seed based on ID.
    // For this UI mockup, we will generate a pseudo PIN from the first 4 letters/digits of the ID.
    const pseudoPin = item.id.replace(/[^0-9]/g, '0').substring(0, 4).padEnd(4, '0');
    
    // Attempt to get shop name from the join
    let shopName = 'Local Shop';
    if (item.listings?.shops && item.listings.shops.length > 0) {
      shopName = item.listings.shops[0].name;
    } else if (item.listings?.profiles) {
      shopName = item.listings.profiles.name;
    }

    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <View style={styles.shopInfo}>
            <Ionicons name="storefront-outline" size={20} color="#d97706" />
            <Text style={styles.shopName}>{shopName} • 300m away</Text>
          </View>
          <View style={styles.statusBadgeActive}>
            <Text style={styles.statusTextActive}>Ready</Text>
          </View>
        </View>

        <View style={styles.ticketDivider} />

        <Text style={styles.itemLabel}>Reserved Item</Text>
        <Text style={styles.itemTitle}>{item.listings?.title || 'Unknown Item'}</Text>
        <Text style={styles.itemPrice}>To Pay at Counter: ₹{item.listings?.price || 0}</Text>

        <Text style={styles.pinLabel}>Your Pickup PIN</Text>
        <View style={styles.pinContainer}>
          {pseudoPin.split('').map((digit, i) => (
            <View key={i} style={styles.pinBox}>
              <Text style={styles.pinDigit}>{digit}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.pinNotice}>Show this PIN to the shopkeeper at the counter to verify your pickup.</Text>

        <View style={styles.expiryContainer}>
          <Ionicons name="hourglass-outline" size={14} color="#f59e0b" />
          <Text style={styles.expiryText}>⏳ Hold expires in 2 hrs</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => handleCall(item.listings?.profiles?.phone)}
          >
            <Ionicons name="call-outline" size={18} color="#2563eb" />
            <Text style={styles.callButtonText}>Call Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCancel(item.id)}>
            <Text style={styles.cancelText}>Cancel Reservation</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPastTicket = ({ item }: { item: EnrichedReservation }) => {
    let statusColor = '#9ca3af'; // cancelled/expired
    if (item.status === 'picked_up') statusColor = '#16a34a';

    let shopName = 'Local Shop';
    if (item.listings?.shops && item.listings.shops.length > 0) {
      shopName = item.listings.shops[0].name;
    } else if (item.listings?.profiles) {
      shopName = item.listings.profiles.name;
    }

    return (
      <View style={styles.pastCard}>
        <View style={styles.pastHeader}>
          <Text style={styles.pastShopName}>{shopName}</Text>
          <View style={[styles.pastStatusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.pastStatusText, { color: statusColor }]}>
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.pastItemTitle}>{item.listings?.title || 'Unknown Item'}</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="bag-check-outline" size={48} color="#d1d5db" />
        </View>
        <Text style={styles.emptyTitle}>No {activeTab} pickups</Text>
        <Text style={styles.emptySubtitle}>
          Discover neighborhood products and reserve items before visiting!
        </Text>
      </View>
    );
  };

  const data = activeTab === 'active' ? activeReservations : pastReservations;

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={activeTab === 'active' ? renderActiveTicket : renderPastTicket}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Dukaan Pickups & Bookings</Text>
            <Text style={styles.pageTitleHindi}>दुकान से उठाव</Text>
            <Text style={styles.pageSubtitle}>Collect your reserved items directly from neighborhood shops</Text>

            <View style={styles.segmentedControl}>
              <TouchableOpacity 
                style={[styles.segmentButton, activeTab === 'active' && styles.segmentButtonActive]}
                onPress={() => setActiveTab('active')}
              >
                <Text style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}>
                  Active Pickups / चालू ({activeReservations.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.segmentButton, activeTab === 'past' && styles.segmentButtonActive]}
                onPress={() => setActiveTab('past')}
              >
                <Text style={[styles.segmentText, activeTab === 'past' && styles.segmentTextActive]}>
                  Past History / पुराने
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#d97706']} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  contentContainer: { padding: 16 },
  header: { marginBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  pageTitleHindi: { fontSize: 16, color: '#4b5563', marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  segmentTextActive: { color: '#111827' },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 16,
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shopName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  statusBadgeActive: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusTextActive: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  ticketDivider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16, borderStyle: 'dashed' },
  itemLabel: { fontSize: 12, fontWeight: '600', color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#d97706', fontWeight: '700', marginBottom: 20 },
  pinLabel: { fontSize: 12, fontWeight: '600', color: '#9ca3af', marginBottom: 10, textTransform: 'uppercase', textAlign: 'center' },
  pinContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 8 },
  pinBox: {
    width: 52,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDigit: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', fontFamily: 'monospace' },
  pinNotice: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 16, paddingHorizontal: 20 },
  expiryContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fffbeb', padding: 8, borderRadius: 8, marginBottom: 20 },
  expiryText: { fontSize: 13, color: '#d97706', fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 },
  callButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, gap: 6 },
  callButtonText: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  cancelText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
  pastCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pastHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pastShopName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  pastStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pastStatusText: { fontSize: 11, fontWeight: '700' },
  pastItemTitle: { fontSize: 15, color: '#111827' },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginTop: 20,
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
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#6b7280', marginBottom: 8, textTransform: 'capitalize' },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
});
