import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Switch, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCustomerRequests } from '../../hooks/useCustomerRequests';

const PROBLEM_CATEGORIES = [
  { label: 'Bike & Auto', icon: '🏍️' },
  { label: 'Electrician', icon: '⚡' },
  { label: 'Plumbing', icon: '🔧' },
  { label: 'AC & Appliances', icon: '❄️' },
  { label: 'Carpentry', icon: '🔨' },
];

export default function FixScreen() {
  const { requests, activeBookings, isLoading, createRequest, acceptBid, refetch } = useCustomerRequests();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBroadcast = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your problem.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({ category: selectedCategory, description, is_urgent: isUrgent });
      setDescription('');
      setSelectedCategory('');
      setIsUrgent(false);
      Alert.alert('Success', 'Your request has been broadcasted to local providers!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptBid = (requestId: string, bidId: string, providerId: string, price: number, description: string) => {
    Alert.alert(
      'Accept Bid',
      `Are you sure you want to accept this bid for ₹${price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: async () => {
            try {
              await acceptBid(requestId, bidId, providerId, price, description);
              Alert.alert('Success', 'Bid accepted! Check your active jobs.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to accept bid.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={isLoading && !isSubmitting} onRefresh={refetch} colors={['#dc2626']} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Community Assistance & Repairs</Text>
          <Text style={styles.headerSubtitle}>मदद और सेवा</Text>
        </View>
        <View style={styles.emergencyBadge}>
          <Ionicons name="alert-circle" size={14} color="#dc2626" />
          <Text style={styles.emergencyText}>SOS</Text>
        </View>
      </View>

      {/* Section 1: Post a Problem */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Post a Problem / समस्या बताएं</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {PROBLEM_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <TouchableOpacity 
                key={cat.label} 
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedCategory(cat.label)}
              >
                <Text style={styles.chipIcon}>{cat.icon}</Text>
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.urgentRow}>
          <View style={styles.urgentTextContainer}>
            <Text style={styles.urgentTitle}>Need help within 30 minutes</Text>
            <Text style={styles.urgentSubtitle}>तुरंत सहायता चाहिए</Text>
          </View>
          <Switch 
            value={isUrgent} 
            onValueChange={setIsUrgent}
            trackColor={{ false: '#d1d5db', true: '#fca5a5' }}
            thumbColor={isUrgent ? '#dc2626' : '#f3f4f6'}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe the issue... (e.g. My bike won't start)"
            multiline
            numberOfLines={3}
            maxLength={200}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        <TouchableOpacity style={styles.broadcastButton} onPress={handleBroadcast} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="megaphone-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.broadcastText}>Broadcast Request / मिस्त्री खोजें</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Section 3: Active Ongoing Jobs */}
      {activeBookings.length > 0 && (
        <View style={styles.activeJobsSection}>
          <Text style={styles.sectionTitleMain}>Active Ongoing Jobs / चालू काम</Text>
          {activeBookings.map((booking) => (
            <View key={booking.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.jobProvider}>Provider: {(booking as any).profiles?.name || 'Assigned'}</Text>
                  <Text style={styles.jobProblem}>{booking.problem_description}</Text>
                </View>
                <View style={styles.jobStatusBadge}>
                  <Text style={styles.jobStatusText}>En Route</Text>
                </View>
              </View>
              
              <View style={styles.pinSection}>
                <Text style={styles.pinLabel}>Verification PIN</Text>
                <View style={styles.pinBoxes}>
                  {booking.verification_pin?.split('').map((digit, i) => (
                    <View key={i} style={styles.pinBox}>
                      <Text style={styles.pinDigit}>{digit}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.pinNotice}>Share this PIN only when work is completed</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Section 2: Live Bids & Incoming Quotes */}
      <Text style={styles.sectionTitleMain}>Live Bids & Incoming Quotes</Text>
      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={40} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No active requests</Text>
          <Text style={styles.emptySubtitle}>Your open requests and incoming bids will appear here.</Text>
        </View>
      ) : (
        requests.map((req) => (
          <View key={req.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestCategory}>{req.ai_category || 'General'}</Text>
              <Text style={styles.requestStatus}>{req.status}</Text>
            </View>
            <Text style={styles.requestDesc}>{req.description}</Text>
            
            <View style={styles.bidsContainer}>
              <Text style={styles.bidsTitle}>Offers ({req.bids.length})</Text>
              {req.bids.length === 0 ? (
                <Text style={styles.noBidsText}>Waiting for local providers to bid...</Text>
              ) : (
                req.bids.map((bid) => (
                  <View key={bid.id} style={styles.bidRow}>
                    <View style={styles.bidInfo}>
                      <Text style={styles.bidProviderName}>{bid.profiles?.name || 'Unknown'}</Text>
                      <View style={styles.trustBadge}>
                        <Ionicons name="shield-checkmark" size={10} color="#16a34a" />
                        <Text style={styles.trustScore}>{bid.profiles?.pehchan_score || 0}</Text>
                      </View>
                    </View>
                    <View style={styles.bidActionGroup}>
                      <Text style={styles.bidPrice}>₹{bid.offered_price}</Text>
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleAcceptBid(req.id, bid.id, bid.provider_id, bid.offered_price, req.description)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        ))
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  contentContainer: { padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  emergencyText: { color: '#dc2626', fontSize: 12, fontWeight: '700' },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  sectionTitleMain: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16, marginTop: 8 },
  chipsScroll: { marginBottom: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  chipIcon: { fontSize: 14, marginRight: 6 },
  chipLabel: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
  chipLabelActive: { color: '#1d4ed8', fontWeight: '600' },
  urgentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  urgentTextContainer: { flex: 1 },
  urgentTitle: { fontSize: 14, fontWeight: '600', color: '#92400e' },
  urgentSubtitle: { fontSize: 12, color: '#b45309', marginTop: 2 },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 15,
    color: '#111827',
    minHeight: 70,
  },
  charCount: { textAlign: 'right', fontSize: 12, color: '#9ca3af', marginTop: 4 },
  broadcastButton: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  broadcastText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6b7280', marginTop: 12, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  requestCategory: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  requestStatus: { fontSize: 12, color: '#f59e0b', fontWeight: '600', textTransform: 'uppercase' },
  requestDesc: { fontSize: 15, color: '#374151', marginBottom: 16 },
  bidsContainer: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12 },
  bidsTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  noBidsText: { fontSize: 13, color: '#9ca3af', fontStyle: 'italic' },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bidInfo: { flex: 1 },
  bidProviderName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  trustScore: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
  bidActionGroup: { alignItems: 'flex-end' },
  bidPrice: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  acceptButton: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  acceptButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  activeJobsSection: { marginBottom: 24 },
  jobCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 12,
  },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  jobProvider: { fontSize: 15, fontWeight: '700', color: '#1e3a8a', marginBottom: 4 },
  jobProblem: { fontSize: 13, color: '#3b82f6' },
  jobStatusBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  jobStatusText: { color: '#2563eb', fontSize: 12, fontWeight: '700' },
  pinSection: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, alignItems: 'center' },
  pinLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' },
  pinBoxes: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  pinBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDigit: { fontSize: 24, fontWeight: 'bold', color: '#334155' },
  pinNotice: { fontSize: 12, color: '#ef4444', fontWeight: '500', textAlign: 'center' },
});
