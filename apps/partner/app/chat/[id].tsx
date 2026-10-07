import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRealtimeChat } from '@pehchan-wale/shared-api';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Message } from '@pehchan-wale/shared-types';

const QUICK_REPLIES = ["✅ Item is packed & ready", "📍 On my way to your location", "Please share landmark", "Call received"];

export default function PartnerChatScreen() {
  const { id: conversationId, recipientId, customerName, customerPhone, contextTitle, amountToCollect } = useLocalSearchParams<{
    id: string;
    recipientId: string;
    customerName: string;
    customerPhone: string;
    contextTitle?: string;
    amountToCollect?: string;
  }>();

  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const [inputText, setInputText] = useState('');

  const { messages, isLoading, isSending, sendMessage, markAsRead } = useRealtimeChat(
    supabase, 
    conversationId as string, 
    user?.id as string, 
    recipientId as string
  );

  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages, markAsRead]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    try {
      await sendMessage(text);
      setInputText('');
    } catch (err) {
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  const handleWhatsApp = () => {
    if (customerPhone) {
      const msg = `नमस्ते ${customerName || ''}, Pehchan Wale shop updates regarding ${contextTitle || 'your order'}.`;
      Linking.openURL(`whatsapp://send?phone=+91${customerPhone}&text=${encodeURIComponent(msg)}`).catch(() => {
        Alert.alert('Error', 'WhatsApp not installed');
      });
    } else {
      Alert.alert('Not Available', 'Phone number not available');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user?.id;
    const timeStr = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperThem]}>
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleThem]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeThem]}>
              {timeStr}
            </Text>
            {isMe && (
              <Ionicons 
                name={item.is_read ? "checkmark-done" : "checkmark"} 
                size={14} 
                color={item.is_read ? "#60a5fa" : "#bfdbfe"} 
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Context Banner */}
      <View style={styles.banner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerName} numberOfLines={1}>{customerName || 'Customer'}</Text>
          <Text style={styles.bannerContext} numberOfLines={1}>{contextTitle || 'Active Order'}</Text>
        </View>
        
        {amountToCollect ? (
          <View style={styles.collectBadge}>
            <Text style={styles.collectBadgeLabel}>Collect</Text>
            <Text style={styles.collectBadgeAmount}>₹{amountToCollect}</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleWhatsApp} style={styles.waBtn}>
            <Ionicons name="logo-whatsapp" size={20} color="#f0fdf4" />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Send a message to start chatting</Text>
            </View>
          ) : null
        }
      />

      {/* Quick Replies */}
      <View style={styles.quickRepliesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_REPLIES}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.quickReplyChip} onPress={() => handleSend(item)}>
              <Text style={styles.quickReplyText}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        />
      </View>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, (!inputText.trim() || isSending) && styles.sendBtnDisabled]}
          onPress={() => handleSend(inputText)}
          disabled={!inputText.trim() || isSending}
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16 },
  backBtn: { marginRight: 12 },
  bannerInfo: { flex: 1 },
  bannerName: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  bannerContext: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  collectBadge: { backgroundColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  collectBadgeLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  collectBadgeAmount: { fontSize: 14, color: '#10b981', fontWeight: 'bold' },
  waBtn: { backgroundColor: '#16a34a', padding: 10, borderRadius: 20 },
  messageList: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
  messageWrapper: { marginBottom: 12, width: '100%' },
  messageWrapperMe: { alignItems: 'flex-end' },
  messageWrapperThem: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  messageBubbleMe: { backgroundColor: '#1e3a8a', borderBottomRightRadius: 4 },
  messageBubbleThem: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 1 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTextMe: { color: '#ffffff' },
  messageTextThem: { color: '#1e293b' },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  messageTime: { fontSize: 11 },
  messageTimeMe: { color: '#bfdbfe' },
  messageTimeThem: { color: '#94a3b8' },
  quickRepliesContainer: { backgroundColor: '#ffffff', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  quickReplyChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  quickReplyText: { fontSize: 13, color: '#334155', fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  input: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 15, maxHeight: 100, color: '#0f172a' },
  sendBtn: { backgroundColor: '#1e3a8a', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  sendBtnDisabled: { backgroundColor: '#94a3b8' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 14, color: '#94a3b8', marginTop: 12 },
});
