import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { useNotifications } from '../hooks/useNotifications';

function RootLayoutNav() {
  const { user } = useAuth();
  useNotifications(); // Mounts push listener

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync(user.id).catch(console.error);
    }
  }, [user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="auth/otp" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
