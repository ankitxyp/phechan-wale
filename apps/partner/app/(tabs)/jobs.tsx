import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function JobsScreen() {
  const [filter, setFilter] = useState('All Requests');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Neighborhood Service Alerts</Text>
      <Text style={styles.pageSubtitle}>आसपास के काम</Text>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {['All Requests', 'Urgent SOS', 'My Active Jobs'].map((f) => (
          <TouchableOpacity 
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Job Card */}
      <View style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobCategory}>Electrician Needed</Text>
          <Text style={styles.jobDistance}>📍 600m away</Text>
        </View>
        <Text style={styles.jobDescription}>"My ceiling fan is making a weird noise and not spinning properly."</Text>
        
        <View style={styles.jobFooter}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>Amit S.</Text>
            <Text style={styles.timePosted}>10 mins ago</Text>
          </View>
          <TouchableOpacity style={styles.bidButton}>
            <Text style={styles.bidButtonText}>Send Bid / भाव बताएं</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 16 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  pageSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  filterScroll: { marginBottom: 20 },
  filterPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterPillActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  filterTextActive: { color: '#ffffff' },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobCategory: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  jobDistance: { fontSize: 13, color: '#0ea5e9', fontWeight: '600' },
  jobDescription: { fontSize: 14, color: '#334155', fontStyle: 'italic', marginBottom: 16, lineHeight: 20 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  timePosted: { fontSize: 12, color: '#94a3b8' },
  bidButton: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  bidButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
});
