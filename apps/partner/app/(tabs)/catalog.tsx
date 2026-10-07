import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Switch, Modal, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePartnerCatalog } from '../../hooks/usePartnerCatalog';
import { Listing } from '@pehchan-wale/shared-types';

const CATEGORIES = ['Kirana', 'Auto Parts', 'Hardware', 'Farm Produce', 'Services'];

export default function CatalogScreen() {
  const { listings, isLoading, isSubmitting, toggleAvailability, toggleSpotlightOffer, updatePrice, createListing, deleteListing, refetch } = usePartnerCatalog();
  const [filter, setFilter] = useState('All');
  
  // Add Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Kirana');
  const [newItemSpotlight, setNewItemSpotlight] = useState(false);

  const inStockCount = listings.filter(l => l.is_available).length;
  const outStockCount = listings.length - inStockCount;

  const filteredListings = listings.filter(l => {
    if (filter === 'In Stock') return l.is_available;
    if (filter === 'Out of Stock') return !l.is_available;
    if (filter === 'Offers') return l.is_promoted_ad;
    return true;
  });

  const handleToggleStock = async (item: Listing) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await toggleAvailability(item.id, item.is_available);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update stock status.');
    }
  };

  const handleToggleSpotlight = async (item: Listing) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await toggleSpotlightOffer(item.id, item.is_promoted_ad);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update spotlight status.');
    }
  };

  const handleEditPrice = (item: Listing) => {
    Alert.prompt(
      'Update Price',
      `Enter new price for ${item.title}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: async (text) => {
            const price = parseInt(text || '0');
            if (price > 0) {
              try {
                await updatePrice(item.id, price);
              } catch (err) {
                Alert.alert('Error', 'Failed to update price.');
              }
            }
          } 
        }
      ],
      'plain-text',
      item.price.toString(),
      'number-pad'
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteListing(id) }
    ]);
  };

  const handleSaveNewItem = async () => {
    if (!newItemName || !newItemPrice) {
      Alert.alert('Error', 'Please enter name and price.');
      return;
    }
    
    try {
      await createListing({
        title: newItemName,
        price: parseInt(newItemPrice),
        category: newItemCategory,
        is_featured: newItemSpotlight
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAddModalVisible(false);
      // Reset form
      setNewItemName('');
      setNewItemPrice('');
      setNewItemSpotlight(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Dukaan Catalog</Text>
          <Text style={styles.pageSubtitle}>दुकान का सामान</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statText}>🟢 In Stock: {inStockCount}</Text>
        <Text style={styles.statDivider}>|</Text>
        <Text style={styles.statText}>🔴 Out of Stock: {outStockCount}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {['All', 'In Stock', 'Out of Stock', 'Offers'].map(f => (
          <TouchableOpacity 
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'Offers' ? '⭐ Offers & Spotlight' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }: { item: Listing }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.priceContainer} onPress={() => handleEditPrice(item)}>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          <Ionicons name="pencil" size={12} color="#64748b" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.stockToggle}>
          <Switch 
            value={item.is_available} 
            onValueChange={() => handleToggleStock(item)}
            trackColor={{ false: '#cbd5e1', true: '#a7f3d0' }}
            thumbColor={item.is_available ? '#10b981' : '#f1f5f9'}
          />
          <Text style={[styles.stockToggleText, item.is_available ? styles.stockTextIn : styles.stockTextOut]}>
            {item.is_available ? 'उपलब्ध (In Stock)' : 'खत्म (Out)'}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.spotlightBtn, item.is_promoted_ad && styles.spotlightBtnActive]}
          onPress={() => handleToggleSpotlight(item)}
        >
          <Ionicons name={item.is_promoted_ad ? "star" : "star-outline"} size={14} color={item.is_promoted_ad ? "#d97706" : "#64748b"} />
          <Text style={[styles.spotlightText, item.is_promoted_ad && styles.spotlightTextActive]}>
            {item.is_promoted_ad ? 'Featured Offer' : 'Boost Offer'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={14} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredListings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#0f172a']} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No items found.</Text>
            <Text style={styles.emptySubtitle}>Add your popular products to start receiving customer pickups!</Text>
          </View>
        }
      />

      {/* Add Item Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Item</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <TextInput 
              style={styles.input}
              placeholder="Item Name (e.g., Aashirvaad Atta 5kg)"
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <TextInput 
              style={styles.input}
              placeholder="Price (₹)"
              keyboardType="number-pad"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
            />

            <Text style={styles.modalLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat}
                  style={[styles.catPill, newItemCategory === cat && styles.catPillActive]}
                  onPress={() => setNewItemCategory(cat)}
                >
                  <Text style={[styles.catText, newItemCategory === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.spotlightRow}>
              <View>
                <Text style={styles.spotlightRowTitle}>Feature in Aaj Ka Offer</Text>
                <Text style={styles.spotlightRowDesc}>Highlight this item to neighborhood customers</Text>
              </View>
              <Switch 
                value={newItemSpotlight}
                onValueChange={setNewItemSpotlight}
                trackColor={{ false: '#cbd5e1', true: '#fde68a' }}
                thumbColor={newItemSpotlight ? '#d97706' : '#f1f5f9'}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSaveNewItem}
              disabled={isSubmitting}
            >
              <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save & List / दुकान में जोड़ें'}</Text>
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
  headerContainer: { marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  pageSubtitle: { fontSize: 14, color: '#64748b' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  addButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginLeft: 6 },
  statsBar: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  statText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  statDivider: { marginHorizontal: 12, color: '#cbd5e1' },
  filterScroll: { marginBottom: 8 },
  filterPill: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  filterPillActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  filterTextActive: { color: '#ffffff' },
  itemCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  itemInfo: { flex: 1, paddingRight: 12 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  categoryBadge: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  categoryText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#16a34a' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  stockToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stockToggleText: { fontSize: 13, fontWeight: '600' },
  stockTextIn: { color: '#10b981' },
  stockTextOut: { color: '#94a3b8' },
  spotlightBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', gap: 6 },
  spotlightBtnActive: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  spotlightText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  spotlightTextActive: { color: '#d97706' },
  deleteBtn: { position: 'absolute', bottom: 12, right: 16, padding: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#64748b', marginTop: 12, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, color: '#0f172a' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 10 },
  catScroll: { marginBottom: 20, flexGrow: 0 },
  catPill: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  catPillActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  catText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  catTextActive: { color: '#2563eb' },
  spotlightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fffbeb', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#fde68a' },
  spotlightRowTitle: { fontSize: 15, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  spotlightRowDesc: { fontSize: 12, color: '#b45309' },
  saveBtn: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
