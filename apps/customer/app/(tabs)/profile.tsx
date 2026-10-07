import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCustomerProfile } from '../../hooks/useCustomerProfile';

export default function ProfileScreen() {
  const { profile, trustInfo, trustScore, isLoading, signOut, refetch } = useCustomerProfile();

  const displayName = profile?.name || 'Guest User';
  const displayPhone = profile?.phone || '—';
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out / लॉग आउट',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={['#d97706']} />}
    >
      {/* Page Header */}
      <Text style={styles.pageTitle}>My Pehchan Profile</Text>
      <Text style={styles.pageTitleHindi}>मेरी प्रोफाइल</Text>

      {/* Section 1: User Identity Card */}
      <View style={styles.identityCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            <View style={styles.avatarBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userPhone}>+91 {displayPhone}</Text>
            <Text style={styles.memberSince}>Member since {memberSince}</Text>
          </View>
        </View>
      </View>

      {/* Section 2: Pehchan Trust Meter */}
      <View style={styles.trustCard}>
        <View style={styles.trustHeader}>
          <View style={styles.trustIconCircle}>
            <Ionicons name="shield-checkmark" size={24} color="#d97706" />
          </View>
          <View style={styles.trustHeaderText}>
            <Text style={styles.trustTitle}>Pehchan Trust Score</Text>
            <Text style={styles.trustScoreNumber}>{trustScore}</Text>
          </View>
        </View>

        <View style={styles.trustLevelBadge}>
          <Text style={styles.trustLevelText}>{trustInfo.label}</Text>
          <Text style={styles.trustLevelHindi}>{trustInfo.labelHindi}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${trustInfo.progressToNext}%` }]} />
        </View>

        <View style={styles.trustStatsRow}>
          <Text style={styles.trustStat}>{trustInfo.completedPickups} Completed Pickups</Text>
          <Text style={styles.trustStatSeparator}>•</Text>
          <Text style={styles.trustStat}>{trustInfo.cancellations} Cancellations</Text>
        </View>

        <Text style={styles.nextTierHint}>{trustInfo.nextTierRequirement}</Text>

        <View style={styles.trustExplainer}>
          <Ionicons name="information-circle-outline" size={16} color="#92400e" />
          <Text style={styles.trustExplainerText}>
            Build your Pehchan score with every honest offline transaction.
          </Text>
        </View>
      </View>

      {/* Section 3: Settings & Options */}
      <View style={styles.settingsCard}>
        <TouchableOpacity style={styles.settingsRow}>
          <View style={[styles.settingsIcon, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="location-outline" size={20} color="#2563eb" />
          </View>
          <View style={styles.settingsInfo}>
            <Text style={styles.settingsLabel}>Saved Localities / पते</Text>
            <Text style={styles.settingsValue}>Sector 14, Patna</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <View style={styles.settingsDivider} />

        <TouchableOpacity style={styles.settingsRow}>
          <View style={[styles.settingsIcon, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="language-outline" size={20} color="#16a34a" />
          </View>
          <View style={styles.settingsInfo}>
            <Text style={styles.settingsLabel}>App Language / भाषा बदलें</Text>
            <Text style={styles.settingsValue}>Hindi / English</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <View style={styles.settingsDivider} />

        <TouchableOpacity style={styles.settingsRow}>
          <View style={[styles.settingsIcon, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="flag-outline" size={20} color="#dc2626" />
          </View>
          <View style={styles.settingsInfo}>
            <Text style={styles.settingsLabel}>Community Help & Report</Text>
            <Text style={styles.settingsValue}>शिकायत या मदद</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <View style={styles.settingsDivider} />

        <TouchableOpacity style={styles.settingsRow}>
          <View style={[styles.settingsIcon, { backgroundColor: '#f5f3ff' }]}>
            <Ionicons name="document-text-outline" size={20} color="#7c3aed" />
          </View>
          <View style={styles.settingsInfo}>
            <Text style={styles.settingsLabel}>Privacy & Terms</Text>
            <Text style={styles.settingsValue}>नियम और शर्तें</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Section 4: Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.signOutText}>Sign Out / लॉग आउट</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  contentContainer: { padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  pageTitleHindi: { fontSize: 15, color: '#6b7280', marginBottom: 20 },

  // Identity Card
  identityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fffbeb',
    borderWidth: 3,
    borderColor: '#fde68a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#d97706' },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 2 },
  userPhone: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  memberSince: { fontSize: 12, color: '#9ca3af' },

  // Trust Meter
  trustCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  trustHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  trustIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trustHeaderText: { flex: 1 },
  trustTitle: { fontSize: 14, fontWeight: '600', color: '#92400e' },
  trustScoreNumber: { fontSize: 32, fontWeight: 'bold', color: '#d97706' },
  trustLevelBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  trustLevelText: { fontSize: 16, fontWeight: '700', color: '#92400e' },
  trustLevelHindi: { fontSize: 13, color: '#b45309', marginTop: 2 },
  progressTrack: {
    height: 10,
    backgroundColor: '#fde68a',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d97706',
    borderRadius: 5,
  },
  trustStatsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8, gap: 6 },
  trustStat: { fontSize: 13, fontWeight: '600', color: '#78716c' },
  trustStatSeparator: { color: '#d1d5db' },
  nextTierHint: { fontSize: 12, color: '#92400e', textAlign: 'center', marginBottom: 16 },
  trustExplainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  trustExplainerText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 16 },

  // Settings
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsInfo: { flex: 1 },
  settingsLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  settingsValue: { fontSize: 13, color: '#6b7280', marginTop: 1 },
  settingsDivider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 68 },

  // Sign Out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: '#dc2626' },
});
