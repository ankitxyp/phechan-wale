import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, RefreshControl, Alert, Linking, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { useCounterPickup, PendingPickup } from '../../hooks/useCounterPickup';

export default function CounterScreen() {
  const { pendingPickups, dailyHisaab, isLoading, isVerifying, verifyPin, refetch } = useCounterPickup();
  const [pin, setPin] = useState(['', '', '', '']);
  const [verifiedPickup, setVerifiedPickup] = useState<PendingPickup | null>(null);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handlePinChange = (text: string, index: number) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    // Auto-advance
    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredPin = pin.join('');
    if (enteredPin.length !== 4) {
      Alert.alert('Incomplete PIN', 'Please enter the full 4-digit PIN.');
      return;
    }

    Keyboard.dismiss();

    try {
      const result = await verifyPin(enteredPin);
      setVerifiedPickup(result);
      setPin(['', '', '', '']); // clear inputs
      
      // Native Feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Speech.speak(`सामान उठाव सफल! ग्राहक से ${result.listings.price} रुपये प्राप्त करें`, { language: 'hi-IN' });
      
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Verification Failed', err.message);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Not Available', 'Customer phone number is not available.');
    }
  };

  const handleWhatsApp = (pickup: PendingPickup) => {
    if (pickup.profiles?.phone) {
      const msg = `नमस्ते ${pickup.profiles.name}, पहचान वाले पर आपका ऑर्डर ${pickup.listings.title} तैयार है। कृपया दुकान से उठा लें।`;
      Linking.openURL(`whatsapp://send?phone=+91${pickup.profiles.phone}&text=${encodeURIComponent(msg)}`).catch(() => {
        Alert.alert('Error', 'Make sure WhatsApp is installed on your device.');
      });
    } else {
      Alert.alert('Not Available', 'Customer phone number is not available.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Aaj Ka Hisaab</Text>
      <Text style={styles.headerSubtitle}>आज का हिसाब</Text>
      
      <View style={styles.hisaabRow}>
        <View style={styles.hisaabStat}>
          <Text style={styles.hisaabValue}>📦 {dailyHisaab.count}</Text>
          <Text style={styles.hisaabLabel}>Today's Pickups</Text>
        </View>
        <View style={styles.hisaabDivider} />
        <View style={styles.hisaabStat}>
          <Text style={styles.hisaabValue}>💰 ₹{dailyHisaab.totalCash}</Text>
          <Text style={styles.hisaabLabel}>Cash Handled</Text>
        </View>
      </View>
    </View>
  );

  const renderVerifyBox = () => {
    if (verifiedPickup) {
      return (
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={56} color="#10b981" style={{ marginBottom: 12 }} />
          <Text style={styles.successTitle}>Pickup Verified!</Text>
          <Text style={styles.successSubtitle}>सामान उठाव सफल!</Text>
          
          <View style={styles.cashBox}>
            <Text style={styles.cashLabel}>Collect from customer:</Text>
            <Text style={styles.cashAmount}>₹{verifiedPickup.listings.price}</Text>
          </View>

          <View style={styles.successDetails}>
            <Text style={styles.successDetailText}><Text style={{ fontWeight: 'bold' }}>Customer:</Text> {verifiedPickup.profiles?.name}</Text>
            <Text style={styles.successDetailText}><Text style={{ fontWeight: 'bold' }}>Item:</Text> {verifiedPickup.listings.title}</Text>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={() => setVerifiedPickup(null)}>
            <Text style={styles.doneButtonText}>Done / अगला ग्राहक</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.verifyBox}>
        <Text style={styles.verifyTitle}>Enter Customer 4-Digit PIN</Text>
        <Text style={styles.verifySubtitle}>ग्राहक का 4-अंकों का पिन दर्ज करें</Text>

        <View style={styles.pinContainer}>
          {pin.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => inputs.current[i] = el}
              style={styles.pinInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handlePinChange(text, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]} 
          onPress={handleVerify}
          disabled={isVerifying}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.verifyButtonText}>
            {isVerifying ? 'Verifying...' : 'Verify & Deliver / सामान दिया गया'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQueueItem = ({ item }: { item: PendingPickup }) => {
    const isExpired = new Date() > new Date(item.expires_at);
    const statusText = isExpired ? 'Expired' : 'Awaiting Pickup';
    
    return (
      <View style={styles.queueCard}>
        <View style={styles.queueHeader}>
          <Text style={styles.customerName}>{item.profiles?.name || 'Customer'}</Text>
          <View style={[styles.timeBadge, isExpired && styles.timeBadgeExpired]}>
            <Text style={[styles.timeBadgeText, isExpired && styles.timeBadgeTextExpired]}>
              {statusText}
            </Text>
          </View>
        </View>
        <Text style={styles.queueItems}>{item.listings.title}</Text>
        
        <View style={styles.queueFooter}>
          <Text style={styles.queueAmount}>To Collect: ₹{item.listings.price}</Text>
          
          <View style={styles.queueActions}>
            <TouchableOpacity onPress={() => handleCall(item.profiles?.phone)} style={styles.actionIconBtn}>
              <Ionicons name="call" size={18} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleWhatsApp(item)} style={styles.actionIconBtn}>
              <Ionicons name="logo-whatsapp" size={18} color="#16a34a" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="bag-handle-outline" size={48} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>No pending pickups right now.</Text>
        <Text style={styles.emptySubtitle}>Orders reserved by neighborhood customers will appear here.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={pendingPickups}
        keyExtractor={(item) => item.id}
        renderItem={renderQueueItem}
        ListHeaderComponent={
          <>
            {renderVerifyBox()}
            <Text style={styles.sectionTitle}>Pending Pickups Queue</Text>
            <Text style={styles.sectionSubtitle}>दुकान से सामान उठाव सूची</Text>
          </>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading && !isVerifying} onRefresh={refetch} colors={['#10b981']} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f8fafc' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2, marginBottom: 16 },
  hisaabRow: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  hisaabStat: { alignItems: 'center' },
  hisaabValue: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 4 },
  hisaabLabel: { fontSize: 12, color: '#94a3b8' },
  hisaabDivider: { width: 1, height: 30, backgroundColor: '#475569' },
  content: { padding: 16, paddingTop: 0 },
  verifyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 28,
  },
  verifyTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  verifySubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  pinContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  pinInput: {
    width: 56,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  verifyButtonDisabled: { backgroundColor: '#64748b' },
  verifyButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  successCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 28,
  },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#065f46', marginBottom: 2 },
  successSubtitle: { fontSize: 14, color: '#047857', marginBottom: 20 },
  cashBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 16,
  },
  cashLabel: { fontSize: 13, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  cashAmount: { fontSize: 32, fontWeight: 'bold', color: '#10b981' },
  successDetails: { width: '100%', backgroundColor: '#ffffff', padding: 12, borderRadius: 8, marginBottom: 24 },
  successDetailText: { fontSize: 14, color: '#334155', marginBottom: 4 },
  doneButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  doneButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  sectionSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  queueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftStyle: 'solid',
  },
  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  timeBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  timeBadgeText: { fontSize: 11, color: '#b45309', fontWeight: '600' },
  timeBadgeExpired: { backgroundColor: '#fee2e2' },
  timeBadgeTextExpired: { color: '#ef4444' },
  queueItems: { fontSize: 14, color: '#475569', marginBottom: 12 },
  queueFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  queueAmount: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  queueActions: { flexDirection: 'row', gap: 12 },
  actionIconBtn: {
    backgroundColor: '#f8fafc',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#64748b', marginTop: 12, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20 },
});
