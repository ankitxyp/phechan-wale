import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ShopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.shopName}>Shop {id}</Text>
          <Text style={styles.shopCategory}>Category</Text>
        </View>
        <View style={{ width: 40 }} /> {/* Spacer to balance header */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Placeholder Layout */}
        <View style={styles.placeholderBox}>
          <Ionicons name="storefront-outline" size={48} color="#d1d5db" />
          <Text style={styles.placeholderTitle}>Storefront Inventory</Text>
          <Text style={styles.placeholderSubtitle}>Items will appear here...</Text>
        </View>

        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Reserve & Pick Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50, // SafeArea approximation
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  shopName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  shopCategory: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  content: { padding: 16 },
  placeholderBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  placeholderTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 12 },
  placeholderSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  reserveButton: {
    backgroundColor: '#d97706',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reserveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
