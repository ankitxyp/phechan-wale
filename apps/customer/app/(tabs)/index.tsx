import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useShops } from '../../hooks/useShops';
import { Shop } from '@pehchan-wale/shared-types';

const CATEGORIES = [
  { label: 'All', icon: 'apps-outline' as const, color: '#6366f1' },
  { label: 'Kirana & Ration', icon: 'cart-outline' as const, color: '#f59e0b' },
  { label: 'Auto & Bike Repair', icon: 'bicycle-outline' as const, color: '#3b82f6' },
  { label: 'Farm Direct', icon: 'leaf-outline' as const, color: '#22c55e' },
  { label: 'Hardware & Electric', icon: 'construct-outline' as const, color: '#8b5cf6' },
  { label: 'Services', icon: 'briefcase-outline' as const, color: '#ec4899' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { shops, isLoading, refetch } = useShops(selectedCategory);

  const renderHeader = () => (
    <>
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
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item.label;
          return (
            <TouchableOpacity 
              style={styles.categoryCard} 
              onPress={() => setSelectedCategory(item.label)}
            >
              <View style={[
                styles.categoryIconContainer, 
                { backgroundColor: isActive ? item.color : item.color + '18' },
                isActive && styles.categoryIconContainerActive
              ]}>
                <Ionicons name={item.icon} size={24} color={isActive ? '#fff' : item.color} />
              </View>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {item.label.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.categoryScrollContent}
        style={styles.categoryScroll}
      />

      <Text style={styles.sectionTitle}>Nearby Trusted Providers</Text>
    </>
  );

  const renderShopCard = ({ item }: { item: Shop }) => (
    <TouchableOpacity 
      style={styles.providerCard} 
      onPress={() => router.push(`/shop/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.providerHeader}>
        {item.logo_url ? (
          <Image source={{ uri: item.logo_url }} style={styles.providerAvatarImage} />
        ) : (
          <View style={styles.providerAvatar}>
            <Ionicons name="storefront-outline" size={24} color="#d97706" />
          </View>
        )}
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.name}</Text>
          <View style={styles.badgesRow}>
            <Text style={styles.providerCategoryBadge}>{item.category}</Text>
            {item.is_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#16a34a" />
                <Text style={styles.verifiedText}>Verified Neighbor</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.providerFooter}>
        <View style={styles.footerRow}>
          <Text style={styles.trustScore}>⭐ 4.8 • 42 Local Reviews</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.openIndicator}>Open Now / खुला है</Text>
          <Text style={styles.distanceBadge}>📍 400m away</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="storefront-outline" size={48} color="#d1d5db" />
        <Text style={styles.emptyTitle}>No local shops found</Text>
        <Text style={styles.emptySubtitle}>
          No local shops found in this category yet. Invite your neighborhood dukaandar!
        </Text>
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonInfo}>
          <View style={styles.skeletonLineLong} />
          <View style={styles.skeletonLineShort} />
        </View>
      </View>
      <View style={styles.skeletonFooter} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={isLoading ? [] : shops}
        keyExtractor={(item) => item.id}
        renderItem={renderShopCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={isLoading ? renderSkeleton : renderEmptyState}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#d97706']} />
        }
        ListFooterComponent={<View style={{ height: 90 }} />}
      />
    </View>
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
  categoryScrollContent: { gap: 12, paddingRight: 16 },
  categoryCard: { alignItems: 'center', width: 72 },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIconContainerActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: '#6b7280', textAlign: 'center' },
  categoryLabelActive: { color: '#111827', fontWeight: '700' },
  providerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  providerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  providerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerAvatarImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
    marginRight: 12,
  },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  badgesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  providerCategoryBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
  providerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    gap: 6,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trustScore: { fontSize: 13, fontWeight: '600', color: '#4b5563' },
  openIndicator: { fontSize: 12, fontWeight: '600', color: '#16a34a' },
  distanceBadge: { fontSize: 12, fontWeight: '500', color: '#6b7280' },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginTop: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  skeletonHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  skeletonAvatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#f3f4f6', marginRight: 12 },
  skeletonInfo: { flex: 1, gap: 8 },
  skeletonLineLong: { height: 16, backgroundColor: '#f3f4f6', borderRadius: 4, width: '70%' },
  skeletonLineShort: { height: 12, backgroundColor: '#f3f4f6', borderRadius: 4, width: '40%' },
  skeletonFooter: { height: 24, backgroundColor: '#f3f4f6', borderRadius: 4, marginTop: 12 },
});
