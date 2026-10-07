import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function HeaderRight() {
  return (
    <TouchableOpacity style={headerStyles.bellButton}>
      <Ionicons name="notifications-outline" size={22} color="#374151" />
    </TouchableOpacity>
  );
}

function HeaderLeft() {
  return (
    <TouchableOpacity style={headerStyles.locationPill}>
      <Text style={headerStyles.locationIcon}>📍</Text>
      <Text style={headerStyles.locationText}>Sector 14, Patna</Text>
      <Ionicons name="chevron-down" size={14} color="#6b7280" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#d97706',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          borderRadius: 20,
          marginHorizontal: 12,
          marginBottom: 10,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
        headerTitle: '',
        headerStyle: { backgroundColor: '#f9fafb', elevation: 0, shadowOpacity: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pehchan',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fix"
        options={{
          title: 'समस्या',
          tabBarIcon: ({ color, size }) => <Ionicons name="hammer-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'बुकिंग',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'प्रोफाइल',
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const headerStyles = StyleSheet.create({
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationIcon: { fontSize: 14, marginRight: 4 },
  locationText: { fontSize: 13, fontWeight: '600', color: '#374151', marginRight: 4 },
  bellButton: {
    marginRight: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
