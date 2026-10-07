import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CatalogScreen() {
  const [inStock, setInStock] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>My Dukaan Stock</Text>
          <Text style={styles.pageSubtitle}>दुकान का सामान</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add New Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>Aashirvaad Shudh Chakki Atta (5kg)</Text>
          <Text style={styles.itemPrice}>₹240 <Text style={styles.itemMrp}>MRP ₹260</Text></Text>
        </View>
        
        <View style={styles.stockRow}>
          <Text style={[styles.stockText, inStock ? styles.stockTextIn : styles.stockTextOut]}>
            {inStock ? 'In Stock (उपलब्ध)' : 'Out of Stock (खत्म)'}
          </Text>
          <Switch 
            value={inStock} 
            onValueChange={setInStock}
            trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
            thumbColor={inStock ? '#10b981' : '#f1f5f9'}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  pageSubtitle: { fontSize: 14, color: '#64748b' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '600', marginLeft: 4 },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemInfo: { marginBottom: 16 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#10b981' },
  itemMrp: { fontSize: 12, color: '#94a3b8', textDecorationLine: 'line-through', fontWeight: '400' },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  stockText: { fontSize: 14, fontWeight: '600' },
  stockTextIn: { color: '#10b981' },
  stockTextOut: { color: '#ef4444' },
});
