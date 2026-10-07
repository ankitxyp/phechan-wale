import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

export default function PartnerOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const router = useRouter();
  const { verifyOtp, sendOtp } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    setError('');
    if (otp.length < 4) {
      setError('Enter a valid OTP');
      return;
    }

    setLoading(true);
    const { success, error: verifyError } = await verifyOtp(phone as string, otp);

    if (success) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('roles')
          .eq('auth_id', sessionData.session.user.id)
          .single();
        
        setLoading(false);
        const roles = profile?.roles || [];
        const allowedRoles = ['seller', 'mechanic', 'farmer', 'agent'];
        const hasRole = roles.some((r: string) => allowedRoles.includes(r));
        
        if (hasRole) {
          if (roles.includes('agent')) {
            router.replace('/(agent-tabs)');
          } else {
            router.replace('/(vendor-tabs)');
          }
        } else {
          Alert.alert(
            'Access Denied', 
            'This app is for Partners and Agents. Please download the Pehchan Wale Customer App to continue as a buyer.', 
            [{ text: 'OK', onPress: () => { supabase.auth.signOut(); router.replace('/auth/login'); } }]
          );
        }
      } else {
        setLoading(false);
        router.replace('/auth/login');
      }
    } else {
      setLoading(false);
      setError(verifyError || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setTimer(30);
    await sendOtp(phone as string);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Sent to +91 {phone}</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.changeNumber}>
              <Text style={styles.changeNumberText}>Change Number</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP (e.g. 1234)"
              keyboardType="numeric"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendContainer} onPress={handleResend} disabled={timer > 0}>
              <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#166534', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#15803d' },
  changeNumber: { marginTop: 8, padding: 4 },
  changeNumberText: { color: '#16a34a', fontSize: 14, fontWeight: '500' },
  form: { backgroundColor: '#ffffff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 16, height: 50, fontSize: 20, textAlign: 'center', marginBottom: 16, letterSpacing: 4 },
  button: { backgroundColor: '#16a34a', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#dc2626', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  resendContainer: { marginTop: 24, alignItems: 'center' },
  resendText: { color: '#16a34a', fontSize: 14, fontWeight: '600' },
  resendTextDisabled: { color: '#9ca3af' }
});
