import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  { label: 'Kirana', icon: 'cart-outline' as const, color: '#f59e0b' },
  { label: 'Auto & Bike', icon: 'bicycle-outline' as const, color: '#3b82f6' },
  { label: 'Farm Produce', icon: 'leaf-outline' as const, color: '#22c55e' },
  { label: 'Hardware', icon: 'construct-outline' as const, color: '#8b5cf6' },
  { label: 'Tailor', icon: 'cut-outline' as const, color: '#ec4899' },
  { label: 'Services', icon: 'briefcase-outline' as const, color: '#f97316' },
];

const SAMPLE_PROVIDERS = [
  { name: 'Sharma Kirana Store', score: 92, category: 'Groceries', distance: '200m' },
  { name: 'Raju Auto Repair', score: 87, category: 'Mechanic', distance: '400m' },
  { name: 'Geeta Tailoring', score: 95, category: 'Tailor', distance: '350m' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Apne Logon Se</Text>
        <Text style={styles.heroSubtitle}>अपने पड़ोसियों से खरीदें</Text>
        <Text style={styles.heroDescription}>
          Discover trusted shops, services & mechanics in your neighborhood
        </Text>
      </View>

      {/* Quick SOS Pill */}
      <TouchableOpacity style={styles.sosPill} onPress={() => router.push('/(tabs)/fix')}>
        <Ionicons name="flash" size={18} color="#dc2626" />
        <Text style={styles.sosText}>Need a mechanic or electrician now?</Text>
        <Text style={styles.sosAction}>Post Request →</Text>
      </TouchableOpacity>

      {/* Category Horizontal Scroll */}
      <Text style={styles.sectionTitle}>Browse Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryScrollContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.label} style={styles.categoryCard}>
            <View style={[styles.categoryIconContainer, { backgroundColor: cat.color + '18' }]}>
              <Ionicons name={cat.icon} size={24} color={cat.color} />
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nearby Trusted Providers */}
      <Text style={styles.sectionTitle}>Nearby Trusted Providers</Text>
      {SAMPLE_PROVIDERS.map((provider, idx) => (
        <TouchableOpacity key={idx} style={styles.providerCard}>
          <View style={styles.providerAvatar}>
            <Ionicons name="storefront-outline" size={24} color="#d97706" />
          </View>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerCategory}>{provider.category} · {provider.distance}</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
            <Text style={styles.trustScore}>{provider.score}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Bottom Spacer for floating tab bar */}
      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  contentContainer: { padding: 16 },
  heroBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  heroTitle: { fontSize: 26, fontWeight: 'bold', color: '#92400e', marginBottom: 4 },
  heroSubtitle: { fontSize: 18, color: '#b45309', marginBottom: 8 },
  heroDescription: { fontSize: 14, color: '#78716c', lineHeight: 20 },
  sosPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  sosText: { flex: 1, fontSize: 13, color: '#991b1b', marginLeft: 8, fontWeight: '500' },
  sosAction: { fontSize: 13, color: '#dc2626', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  categoryScroll: { marginBottom: 24 },
  categoryScrollContent: { gap: 12 },
  categoryCard: { alignItems: 'center', width: 80 },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  providerCategory: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trustScore: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
});
