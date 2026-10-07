import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Modal, TextInput, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePartnerWallet } from '../../hooks/usePartnerWallet';
import { Transaction } from '@pehchan-wale/shared-types';

export default function WalletScreen() {
  const { balance, transactions, todayEarnings, pendingSettlements, isAgent, isLoading, isSubmitting, requestPayout, generateHisaabSummary, refetch } = usePartnerWallet();
  
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  
  // Payout Modal State
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [upiId, setUpiId] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const handleWithdrawRequest = async () => {
    const amount = parseInt(payoutAmount || '0');
    if (!upiId) {
      Alert.alert('Error', 'Please enter a valid UPI ID');
      return;
    }
    try {
      await requestPayout(amount, upiId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Withdrawal request submitted successfully.');
      setPayoutModalVisible(false);
      setPayoutAmount('');
      setUpiId('');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err.message);
    }
  };

  const handleShareWhatsApp = () => {
    const text = generateHisaabSummary();
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(text)}`).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on this device.');
    });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Hero Balance Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Available Dukaan Balance</Text>
            <Text style={styles.heroLabelHi}>उपलब्ध बैलेंस</Text>
          </View>
          <View style={styles.badgeSecure}>
            <Ionicons name="lock-closed" size={10} color="#f59e0b" />
            <Text style={styles.badgeSecureText}>Atomic Ledger Protected</Text>
          </View>
        </View>

        <Text style={styles.balanceAmount}>₹{balance}</Text>

        <View style={styles.heroStatsRow}>
          <Text style={styles.heroStatText}>Today's Inflow: <Text style={styles.heroStatValue}>+₹{todayEarnings}</Text></Text>
          <Text style={styles.heroStatDivider}>|</Text>
          <Text style={styles.heroStatText}>Pending: <Text style={styles.heroStatValueAlert}>₹{pendingSettlements}</Text></Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => setPayoutModalVisible(true)}>
          <Ionicons name="card" size={20} color="#ffffff" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.actionBtnTextPrimary}>Withdraw via UPI</Text>
            <Text style={styles.actionBtnTextHiPrimary}>निकासी करें</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleShareWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#16a34a" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.actionBtnTextSecondary}>Share Hisaab</Text>
            <Text style={styles.actionBtnTextHiSecondary}>हिसाब भेजें</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity style={[styles.segmentBtn, filter === 'all' && styles.segmentBtnActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.segmentText, filter === 'all' && styles.segmentTextActive]}>All / सभी</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentBtn, filter === 'credit' && styles.segmentBtnActive]} onPress={() => setFilter('credit')}>
          <Text style={[styles.segmentText, filter === 'credit' && styles.segmentTextActive]}>Earnings (+)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentBtn, filter === 'debit' && styles.segmentBtnActive]} onPress={() => setFilter('debit')}>
          <Text style={[styles.segmentText, filter === 'debit' && styles.segmentTextActive]}>Withdrawals (-)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === 'credit';
    const isPending = item.status === 'pending';
    
    // Check for agent onboarding commission tag
    const isCommission = isAgent && item.reference_id?.includes('commission');
    const title = isCommission ? 'Dukaan Onboarding Commission' : 
                 (isCredit ? 'Payment Received' : 'UPI Withdrawal');
    const dateStr = new Date(item.created_at).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={styles.txCard}>
        <View style={styles.txIconContainer}>
          <Ionicons name={isCredit ? "arrow-down" : "arrow-up"} size={20} color={isCredit ? "#10b981" : "#64748b"} />
        </View>
        <View style={styles.txDetails}>
          <Text style={styles.txTitle}>{title}</Text>
          <Text style={styles.txDate}>{dateStr}</Text>
          {isCommission && (
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>Agent Bonus</Text>
            </View>
          )}
        </View>
        <View style={styles.txAmountCol}>
          <Text style={[styles.txAmount, isCredit ? styles.txAmountCredit : styles.txAmountDebit]}>
            {isCredit ? '+' : '-'}₹{item.amount}
          </Text>
          <View style={[styles.statusPill, isPending ? styles.statusPillPending : styles.statusPillSuccess]}>
            <Text style={[styles.statusText, isPending ? styles.statusTextPending : styles.statusTextSuccess]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#1e3a8a']} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No transactions yet.</Text>
            <Text style={styles.emptySubtitle}>Completed customer pickups and service bookings will show up here.</Text>
          </View>
        }
      />

      {/* Payout Modal */}
      <Modal visible={payoutModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setPayoutModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBalanceBox}>
              <Text style={styles.modalBalanceLabel}>Available Balance</Text>
              <Text style={styles.modalBalanceAmount}>₹{balance}</Text>
            </View>

            <Text style={styles.inputLabel}>Withdrawal Amount (₹)</Text>
            <TextInput 
              style={styles.input}
              placeholder="Minimum ₹100"
              keyboardType="number-pad"
              value={payoutAmount}
              onChangeText={setPayoutAmount}
            />

            <Text style={styles.inputLabel}>Your UPI ID</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. 9876543210@paytm"
              keyboardType="email-address"
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
            />

            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleWithdrawRequest}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>{isSubmitting ? 'Processing...' : 'Submit Request'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 16 },
  headerContainer: { marginBottom: 20 },
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 6,
    borderLeftColor: '#f59e0b',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  heroLabel: { fontSize: 14, color: '#cbd5e1', fontWeight: '600' },
  heroLabelHi: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  badgeSecure: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeSecureText: { fontSize: 10, color: '#f59e0b', fontWeight: '700' },
  balanceAmount: { fontSize: 48, fontWeight: 'bold', color: '#ffffff', marginBottom: 16 },
  heroStatsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 12, borderRadius: 12 },
  heroStatText: { fontSize: 12, color: '#94a3b8' },
  heroStatValue: { color: '#10b981', fontWeight: 'bold' },
  heroStatValueAlert: { color: '#f59e0b', fontWeight: 'bold' },
  heroStatDivider: { marginHorizontal: 12, color: '#475569' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12 },
  actionBtnTextPrimary: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  actionBtnTextHiPrimary: { color: '#bfdbfe', fontSize: 11 },
  actionBtnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' },
  actionBtnTextSecondary: { color: '#16a34a', fontSize: 13, fontWeight: '700' },
  actionBtnTextHiSecondary: { color: '#22c55e', fontSize: 11 },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 10, padding: 4, marginBottom: 8 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentBtnActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 2 },
  segmentText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#0f172a' },
  txCard: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  txIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  txDetails: { flex: 1 },
  txTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  txDate: { fontSize: 12, color: '#64748b' },
  tagBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  tagBadgeText: { fontSize: 10, color: '#d97706', fontWeight: '600' },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  txAmountCredit: { color: '#10b981' },
  txAmountDebit: { color: '#475569' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusPillSuccess: { backgroundColor: '#dcfce7' },
  statusPillPending: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  statusTextSuccess: { color: '#16a34a' },
  statusTextPending: { color: '#d97706' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#64748b', marginTop: 12, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  modalBalanceBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  modalBalanceLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 4 },
  modalBalanceAmount: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20, color: '#0f172a' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
