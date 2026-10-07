import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { phoneSchema } from '@pehchan-wale/shared-validation';

export default function PartnerLoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { sendOtp } = useAuth();

  const handleSendOtp = async () => {
    setError('');
    const validation = phoneSchema.safeParse(phone);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { success, message } = await sendOtp(phone);
    setLoading(false);

    if (success) {
      router.push(`/auth/otp?phone=${phone}`);
    } else {
      setError(message || 'Failed to send OTP');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Pehchan Wale Partner</Text>
            <Text style={styles.subtitle}>Dukaandaar, Mistri & Agent Portal</Text>
            <Text style={styles.subtitleHindi}>दुकानदार और सेवा प्रदाता</Text>
          </View>

          <View style={styles.badgesContainer}>
            <View style={styles.badge}><Text style={styles.badgeText}>Shopkeeper</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>Mechanic</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>Agent</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>Farmer</Text></View>
          </View>
          
          <View style={styles.form}>
            <Text style={styles.label}>Registered Mobile Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit number"
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </TouchableOpacity>

            <Text style={styles.hint}>Testing mode: Use 9999999999 with OTP 1234</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#166534', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#15803d', textAlign: 'center' },
  subtitleHindi: { fontSize: 14, color: '#16a34a', textAlign: 'center', marginTop: 4 },
  badgesContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32, gap: 8 },
  badge: { backgroundColor: '#dcfce7', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#bbf7d0' },
  badgeText: { color: '#166534', fontSize: 12, fontWeight: '600' },
  form: { backgroundColor: '#ffffff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, height: 50, marginBottom: 16 },
  prefix: { fontSize: 16, color: '#6b7280', marginRight: 8, fontWeight: '500' },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  button: { backgroundColor: '#16a34a', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#dc2626', fontSize: 14, marginBottom: 12 },
  hint: { marginTop: 16, fontSize: 12, color: '#9ca3af', textAlign: 'center' }
});
