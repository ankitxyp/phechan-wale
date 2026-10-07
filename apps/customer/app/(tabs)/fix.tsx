import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PROBLEM_CATEGORIES = [
  { label: 'Bike Breakdown', icon: 'bicycle' as const, color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Electrician', icon: 'flash' as const, color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Plumbing', icon: 'water' as const, color: '#06b6d4', bg: '#ecfeff' },
  { label: 'Appliance Repair', icon: 'tv' as const, color: '#8b5cf6', bg: '#f5f3ff' },
];

export default function FixScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header CTA */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What problem do you need fixed today?</Text>
        <Text style={styles.headerSubtitle}>Post your request and local providers will bid to help you</Text>
      </View>

      {/* Category Selector Cards */}
      <Text style={styles.sectionTitle}>Select a Category</Text>
      <View style={styles.categoryGrid}>
        {PROBLEM_CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.label} style={[styles.categoryCard, { backgroundColor: cat.bg }]}>
            <View style={[styles.categoryIconCircle, { backgroundColor: cat.color + '20' }]}>
              <Ionicons name={cat.icon} size={28} color={cat.color} />
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Requests & Incoming Bids */}
      <Text style={styles.sectionTitle}>Active Requests & Incoming Bids</Text>
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="chatbubbles-outline" size={40} color="#d1d5db" />
        </View>
        <Text style={styles.emptyTitle}>No active requests</Text>
        <Text style={styles.emptySubtitle}>
          Post a problem above and local service providers will bid with their best offers.
        </Text>
      </View>

      {/* Bottom Spacer */}
      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  contentContainer: { padding: 16 },
  header: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#991b1b', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: '#b91c1c', lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  categoryCard: {
    width: '47%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryLabel: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
});
