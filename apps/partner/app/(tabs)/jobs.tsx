import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, FlatList, RefreshControl, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { usePartnerJobs, OpenRequest, ActiveJob } from '../../hooks/usePartnerJobs';

export default function JobsScreen() {
  const { openRequests, activeJobs, isLoading, submitBid, completeJobWithPin, refetch } = usePartnerJobs();
  const [activeTab, setActiveTab] = useState<'open' | 'active'>('open');
  
  // Bid Modal State
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OpenRequest | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidEta, setBidEta] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pin Modal State
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ActiveJob | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const handleOpenBidModal = (req: OpenRequest) => {
    setSelectedRequest(req);
    setBidAmount('300');
    setBidEta(30);
    setBidModalVisible(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedRequest || !bidAmount) return;
    setIsSubmitting(true);
    try {
      await submitBid(selectedRequest.id, parseInt(bidAmount), bidEta);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Your quote has been sent to the customer.');
      setBidModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit quote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPinModal = (job: ActiveJob) => {
    setSelectedJob(job);
    setPinInput('');
    setPinModalVisible(true);
  };

  const handleCompleteJob = async () => {
    if (!selectedJob || pinInput.length !== 4) {
      Alert.alert('Error', 'Please enter the 4-digit PIN.');
      return;
    }
    
    setIsCompleting(true);
    try {
      const result = await completeJobWithPin(selectedJob.id, pinInput);
      if (result.success) {
        setPinModalVisible(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Speech.speak(`काम पूरा हुआ! ग्राहक से ${result.amount} रुपये प्राप्त करें`, { language: 'hi-IN' });
        Alert.alert('Job Completed', `Collect ₹${result.amount} from the customer.`);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', result.error || 'Verification failed.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone?: string) => {
    if (phone) {
      const msg = 'नमस्ते, पहचान वाले से आपका मिस्त्री पहुंच रहा है।';
      Linking.openURL(`whatsapp://send?phone=+91${phone}&text=${encodeURIComponent(msg)}`).catch(() => {
        Alert.alert('Error', 'WhatsApp not installed');
      });
    }
  };

  const renderOpenRequest = ({ item }: { item: OpenRequest }) => {
    // Determine if urgent based on description or some other mock flag (for demo we use a dummy logic)
    const isUrgent = item.description?.toLowerCase().includes('urgent');

    return (
      <View style={[styles.jobCard, isUrgent && styles.jobCardUrgent]}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobCategory}>{item.ai_category || 'General Repair'}</Text>
          {isUrgent ? (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>🚨 Urgent SOS / तुरंत आवश्यकता</Text>
            </View>
          ) : (
            <Text style={styles.jobDistance}>📍 ~800m away</Text>
          )}
        </View>
        <Text style={styles.jobDescription}>"{item.description}"</Text>
        
        <View style={styles.jobFooter}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.profiles?.name || 'Customer'}</Text>
            <Text style={styles.timePosted}>Just now</Text>
          </View>
          <TouchableOpacity style={styles.bidButton} onPress={() => handleOpenBidModal(item)}>
            <Text style={styles.bidButtonText}>Send Quote / भाव बताएं</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderActiveJob = ({ item }: { item: ActiveJob }) => (
    <View style={styles.activeCard}>
      <View style={styles.activeHeader}>
        <Text style={styles.activeCustomer}>{item.profiles?.name || 'Customer'}</Text>
        <View style={styles.agreedPriceBadge}>
          <Text style={styles.agreedPriceText}>₹{item.agreed_price}</Text>
        </View>
      </View>
      <Text style={styles.activeDesc}>{item.problem_description}</Text>

      <View style={styles.activeActions}>
        <TouchableOpacity style={styles.iconBtnCall} onPress={() => handleCall(item.profiles?.phone)}>
          <Ionicons name="call" size={18} color="#2563eb" />
          <Text style={styles.iconBtnTextCall}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtnWa} onPress={() => handleWhatsApp(item.profiles?.phone)}>
          <Ionicons name="logo-whatsapp" size={18} color="#16a34a" />
          <Text style={styles.iconBtnTextWa}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.completeBtn} onPress={() => handleOpenPinModal(item)}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text style={styles.completeBtnText}>Complete Job / काम पूरा हुआ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Service & Bids</Text>
        <Text style={styles.pageSubtitle}>काम और भाव</Text>
        
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === 'open' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('open')}
          >
            <Text style={[styles.segmentText, activeTab === 'open' && styles.segmentTextActive]}>
              Open Requests ({openRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === 'active' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}>
              Active Jobs ({activeJobs.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={activeTab === 'open' ? openRequests : activeJobs}
        keyExtractor={(item) => item.id}
        renderItem={activeTab === 'open' ? renderOpenRequest : (renderActiveJob as any)}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#3b82f6']} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No {activeTab} jobs right now.</Text>
          </View>
        }
      />

      {/* Bid Modal */}
      <Modal visible={bidModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Quote</Text>
              <TouchableOpacity onPress={() => setBidModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Estimated Cost (₹)</Text>
            <View style={styles.presetRow}>
              {['150', '300', '500'].map(amt => (
                <TouchableOpacity 
                  key={amt} 
                  style={[styles.presetBtn, bidAmount === amt && styles.presetBtnActive]}
                  onPress={() => setBidAmount(amt)}
                >
                  <Text style={[styles.presetText, bidAmount === amt && styles.presetTextActive]}>₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput 
              style={styles.customInput}
              keyboardType="number-pad"
              value={bidAmount}
              onChangeText={setBidAmount}
              placeholder="Custom Amount (₹)"
            />

            <Text style={styles.modalLabel}>ETA (Time to reach)</Text>
            <View style={styles.presetRow}>
              {[15, 30, 45].map(eta => (
                <TouchableOpacity 
                  key={eta} 
                  style={[styles.presetBtn, bidEta === eta && styles.presetBtnActive]}
                  onPress={() => setBidEta(eta)}
                >
                  <Text style={[styles.presetText, bidEta === eta && styles.presetTextActive]}>{eta}m</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmitBid}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>{isSubmitting ? 'Sending...' : 'Submit Quote'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Pin Modal */}
      <Modal visible={pinModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.pinModalContent}>
            <Text style={styles.pinModalTitle}>Verify Job Completion</Text>
            <Text style={styles.pinModalSubtitle}>Enter the 4-digit PIN provided by {selectedJob?.profiles?.name}</Text>
            
            <TextInput 
              style={styles.pinLargeInput}
              keyboardType="number-pad"
              maxLength={4}
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="••••"
              secureTextEntry
              autoFocus
            />

            <View style={styles.pinModalActions}>
              <TouchableOpacity style={styles.pinCancelBtn} onPress={() => setPinModalVisible(false)}>
                <Text style={styles.pinCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pinConfirmBtn, isCompleting && { opacity: 0.7 }]}
                onPress={handleCompleteJob}
                disabled={isCompleting}
              >
                <Text style={styles.pinConfirmText}>{isCompleting ? 'Verifying...' : 'Complete'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  pageSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentBtnActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 2 },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#0f172a' },
  content: { padding: 16 },
  jobCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  jobCardUrgent: { borderColor: '#fcd34d', backgroundColor: '#fffbeb' },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobCategory: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  jobDistance: { fontSize: 12, color: '#0ea5e9', fontWeight: '600' },
  urgentBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#fde68a' },
  urgentBadgeText: { fontSize: 11, color: '#b45309', fontWeight: '700' },
  jobDescription: { fontSize: 15, color: '#334155', fontStyle: 'italic', marginBottom: 16, lineHeight: 22 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  timePosted: { fontSize: 12, color: '#94a3b8' },
  bidButton: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  bidButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  activeCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  activeCustomer: { fontSize: 16, fontWeight: '700', color: '#1e3a8a' },
  agreedPriceBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  agreedPriceText: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  activeDesc: { fontSize: 14, color: '#475569', marginBottom: 16 },
  activeActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  iconBtnCall: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', paddingVertical: 10, borderRadius: 8, gap: 6 },
  iconBtnTextCall: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  iconBtnWa: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', paddingVertical: 10, borderRadius: 8, gap: 6 },
  iconBtnTextWa: { color: '#16a34a', fontWeight: '600', fontSize: 14 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, gap: 8 },
  completeBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 15, color: '#94a3b8', marginTop: 12, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 12 },
  presetRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  presetBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  presetBtnActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  presetText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  presetTextActive: { color: '#2563eb' },
  customInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 24, color: '#0f172a' },
  submitBtn: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  pinModalContent: { backgroundColor: '#ffffff', margin: 24, borderRadius: 20, padding: 24, alignItems: 'center' },
  pinModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  pinModalSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  pinLargeInput: { fontSize: 32, fontWeight: 'bold', letterSpacing: 16, borderBottomWidth: 2, borderBottomColor: '#cbd5e1', paddingBottom: 8, width: 120, textAlign: 'center', color: '#0f172a', marginBottom: 32 },
  pinModalActions: { flexDirection: 'row', width: '100%', gap: 12 },
  pinCancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12 },
  pinCancelText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  pinConfirmBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#10b981', borderRadius: 12 },
  pinConfirmText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
});
