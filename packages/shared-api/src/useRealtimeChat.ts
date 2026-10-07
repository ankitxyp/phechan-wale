import { useState, useEffect, useCallback } from 'react';
import { Message } from '@pehchan-wale/shared-types';
import { SupabaseClient } from '@supabase/supabase-js';

export function useRealtimeChat(supabase: SupabaseClient, conversationId: string, currentUserId: string, recipientId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Avoid duplicate appends if we inserted it optimistically
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const sendMessage = async (content: string, mediaUrl?: string) => {
    if (!content.trim() && !mediaUrl) return;
    setIsSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          receiver_id: recipientId,
          content: content.trim(),
          media_url: mediaUrl || null,
          is_read: false
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to send message', err);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  const markAsRead = async () => {
    if (!conversationId || !currentUserId) return;
    
    // Unread messages where we are the receiver
    const unreadMessages = messages.filter(m => !m.is_read && m.receiver_id === currentUserId);
    if (unreadMessages.length === 0) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false);
        
      // Update local state optimistically
      setMessages(prev => prev.map(m => 
        (m.receiver_id === currentUserId && !m.is_read) ? { ...m, is_read: true } : m
      ));
    } catch (err) {
      console.error('Failed to mark messages as read', err);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    markAsRead
  };
}
