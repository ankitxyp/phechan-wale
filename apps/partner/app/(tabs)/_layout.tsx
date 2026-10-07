import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

function HeaderRight() {
  const router = useRouter();
  return (
    <View style={headerStyles.rightContainer}>
      <TouchableOpacity style={headerStyles.iconButton}>
        <Ionicons name="notifications-outline" size={22} color="#f8fafc" />
      </TouchableOpacity>
      <TouchableOpacity style={headerStyles.iconButton} onPress={() => router.push('/settings')}>
        <Ionicons name="settings-outline" size={22} color="#f8fafc" />
      </TouchableOpacity>
    </View>
  );
}

function HeaderLeft() {
  const { profile } = useAuth();
  
  return (
    <View style={headerStyles.leftContainer}>
      <View style={headerStyles.avatar}>
        <Text style={headerStyles.avatarText}>{profile?.name?.charAt(0) || 'P'}</Text>
      </View>
      <View>
        <Text style={headerStyles.shopName}>{profile?.name || 'Partner'}</Text>
        <View style={headerStyles.statusPill}>
          <View style={headerStyles.statusDot} />
          <Text style={headerStyles.statusText}>Open / दुकान खुली है</Text>
        </View>
      </View>
    </View>
  );
}

export default function PartnerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981', // emerald-500
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#0f172a', // slate-900
          borderTopWidth: 0,
          elevation: 12,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
        headerTitle: '',
        headerStyle: { backgroundColor: '#1e293b', elevation: 0, shadowOpacity: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Counter',
          tabBarIcon: ({ color, size }) => <Ionicons name="key-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'काम',
          tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'सामान',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'बटुआ',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const headerStyles = StyleSheet.create({
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#f8fafc', fontWeight: 'bold', fontSize: 16 },
  shopName: { fontSize: 15, fontWeight: '700', color: '#f8fafc', marginBottom: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34d399', marginRight: 4 },
  statusText: { fontSize: 10, fontWeight: '600', color: '#34d399' },
  rightContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});
