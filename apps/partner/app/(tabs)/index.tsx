import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CounterScreen() {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handlePinChange = (text: string, index: number) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Verify Box */}
      <View style={styles.verifyBox}>
        <Text style={styles.verifyTitle}>Verify Customer Pickup</Text>
        <Text style={styles.verifySubtitle}>सामान उठाव सत्यापन</Text>

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
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity style={styles.verifyButton}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.verifyButtonText}>Verify & Complete</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Queue */}
      <Text style={styles.sectionTitle}>Pending Counter Pickups (2)</Text>
      
      <View style={styles.queueCard}>
        <View style={styles.queueHeader}>
          <Text style={styles.customerName}>Rahul Kumar</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>Due in 30m</Text>
          </View>
        </View>
        <Text style={styles.queueItems}>2x Aashirvaad Atta, 1x Surf Excel</Text>
        <Text style={styles.queueAmount}>To Collect: ₹1,240</Text>
      </View>

      <View style={styles.queueCard}>
        <View style={styles.queueHeader}>
          <Text style={styles.customerName}>Sunita Devi</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>Due in 2h</Text>
          </View>
        </View>
        <Text style={styles.queueItems}>1x 5L Fortune Oil, 5kg Rice</Text>
        <Text style={styles.queueAmount}>Paid Online</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 16 },
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
    marginBottom: 24,
  },
  verifyTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  verifySubtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
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
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  verifyButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  queueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  timeBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  timeBadgeText: { fontSize: 11, color: '#b45309', fontWeight: '600' },
  queueItems: { fontSize: 14, color: '#475569', marginBottom: 12 },
  queueAmount: { fontSize: 15, fontWeight: '700', color: '#10b981' },
});
