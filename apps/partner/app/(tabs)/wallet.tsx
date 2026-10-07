import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState('Sales & Pickups');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance / कुल कमाई</Text>
        <Text style={styles.balanceAmount}>₹12,450</Text>
        <View style={styles.atomicBadge}>
          <Ionicons name="lock-closed" size={12} color="#059669" />
          <Text style={styles.atomicText}>Sec-Definer Ledger Verified</Text>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        {['Sales & Pickups', 'Agent Commissions'].map(tab => (
          <TouchableOpacity 
            key={tab}
            style={[styles.segmentBtn, activeTab === tab && styles.segmentBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.segmentText, activeTab === tab && styles.segmentTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      
      <View style={styles.txCard}>
        <View style={styles.txIconCredit}>
          <Ionicons name="arrow-down-outline" size={16} color="#10b981" />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle}>Pickup: Order #8921</Text>
          <Text style={styles.txDate}>Today, 2:30 PM</Text>
        </View>
        <Text style={styles.txAmountCredit}>+₹450</Text>
      </View>

      <View style={styles.txCard}>
        <View style={styles.txIconDebit}>
          <Ionicons name="arrow-up-outline" size={16} color="#ef4444" />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle}>Withdrawal to Bank</Text>
          <Text style={styles.txDate}>Yesterday, 9:00 AM</Text>
        </View>
        <Text style={styles.txAmountDebit}>-₹5,000</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 16 },
  balanceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 8 },
  balanceAmount: { fontSize: 40, fontWeight: 'bold', color: '#f8fafc', marginBottom: 16 },
  atomicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  atomicText: { color: '#34d399', fontSize: 12, fontWeight: '600' },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentBtnActive: { backgroundColor: '#ffffff', elevation: 1 },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#0f172a' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  txIconCredit: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txIconDebit: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  txDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  txAmountCredit: { fontSize: 15, fontWeight: '700', color: '#10b981' },
  txAmountDebit: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
});
