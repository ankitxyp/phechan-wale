import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  data: any;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []) as AppNotification[]);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listener for tap events
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const payload = response.notification.request.content.data;
      if (!payload) return;

      if (payload.type === 'chat' && payload.conversationId) {
        router.push(`/chat/${payload.conversationId}?recipientId=${payload.senderId}&recipientName=${payload.senderName}`);
      } else if (payload.type === 'order' && payload.orderId) {
        router.push('/(tabs)/orders');
      } else if (payload.type === 'service' && payload.requestId) {
        router.push('/(tabs)/fix');
      }
    });

    return () => subscription.remove();
  }, [router]);

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  };

  return {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}
