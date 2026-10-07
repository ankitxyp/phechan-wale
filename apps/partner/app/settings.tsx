import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="storefront-outline" size={20} color="#475569" style={styles.icon} />
            <View style={styles.info}>
              <Text style={styles.label}>Shop Details</Text>
              <Text style={styles.value}>Update address & info</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color="#475569" style={styles.icon} />
            <View style={styles.info}>
              <Text style={styles.label}>Operating Hours</Text>
              <Text style={styles.value}>9:00 AM - 9:00 PM</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" style={styles.icon} />
            <View style={styles.info}>
              <Text style={styles.label}>KYC Verification</Text>
              <Text style={styles.valueSuccess}>Verified Agent</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="language-outline" size={20} color="#475569" style={styles.icon} />
            <View style={styles.info}>
              <Text style={styles.label}>App Language</Text>
              <Text style={styles.value}>English / हिंदी</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out / लॉग आउट</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  icon: { marginRight: 16 },
  info: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  value: { fontSize: 13, color: '#64748b', marginTop: 2 },
  valueSuccess: { fontSize: 13, color: '#10b981', marginTop: 2, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 52 },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  signOutText: { color: '#ef4444', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
