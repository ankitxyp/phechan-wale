import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();

  const displayName = profile?.name || 'Guest User';
  const displayPhone = profile?.phone || '—';
  const trustScore = profile?.pehchan_score ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={14} color="#6b7280" />
          <Text style={styles.phone}>{displayPhone}</Text>
          {profile?.is_agent_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
      </View>

      {/* Trust Meter Card */}
      <View style={styles.trustCard}>
        <View style={styles.trustHeader}>
          <Ionicons name="shield-checkmark" size={22} color="#d97706" />
          <Text style={styles.trustTitle}>Pehchan Trust Score</Text>
        </View>
        <View style={styles.trustScoreContainer}>
          <Text style={styles.trustScoreValue}>{trustScore}</Text>
          <Text style={styles.trustScoreMax}>/ 100</Text>
        </View>
        <View style={styles.trustMeterTrack}>
          <View style={[styles.trustMeterFill, { width: `${Math.min(trustScore, 100)}%` }]} />
        </View>
        <Text style={styles.trustLevel}>
          {trustScore < 30 ? '🌱 Level 1 — New Neighbor' :
           trustScore < 60 ? '🤝 Level 2 — Trusted Local' :
           trustScore < 85 ? '⭐ Level 3 — Community Pillar' :
           '🏆 Level 4 — Pehchan Elite'}
        </Text>
      </View>

      {/* Saved Locations */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={20} color="#374151" />
          <Text style={styles.sectionTitle}>Saved Locations</Text>
        </View>
        <TouchableOpacity style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <Ionicons name="home-outline" size={18} color="#d97706" />
          </View>
          <View>
            <Text style={styles.locationLabel}>Home</Text>
            <Text style={styles.locationAddress}>Sector 14, Patna, Bihar</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addLocationButton}>
          <Ionicons name="add-circle-outline" size={18} color="#2563eb" />
          <Text style={styles.addLocationText}>Add Pickup Location</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Bottom Spacer */}
      <View style={{ height: 90 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  contentContainer: { padding: 16 },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fffbeb',
    borderWidth: 3,
    borderColor: '#fde68a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#d97706' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phone: { fontSize: 14, color: '#6b7280' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 8 },
  verifiedText: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
  trustCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  trustHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  trustTitle: { fontSize: 16, fontWeight: '700', color: '#92400e' },
  trustScoreContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  trustScoreValue: { fontSize: 40, fontWeight: 'bold', color: '#d97706' },
  trustScoreMax: { fontSize: 16, color: '#b45309', marginLeft: 4 },
  trustMeterTrack: { height: 8, backgroundColor: '#fde68a', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  trustMeterFill: { height: '100%', backgroundColor: '#d97706', borderRadius: 4 },
  trustLevel: { fontSize: 14, fontWeight: '600', color: '#92400e' },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  locationAddress: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  addLocationText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: { fontSize: 15, fontWeight: '600', color: '#dc2626' },
});
