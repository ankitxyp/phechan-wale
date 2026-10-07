import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@pehchan-wale/shared-types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleSession(session);
      setIsLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSession = async (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();
      
      const allowedRoles = ['seller', 'mechanic', 'farmer', 'agent'];
      const hasRole = profile?.roles?.some((role: any) => allowedRoles.includes(role));
      
      if (profile && !hasRole) {
        console.warn('User does not have partner/agent roles');
      }
      setProfile(profile);
    } else {
      setProfile(null);
    }
  };

  const sendOtp = async (phone: string) => {
    if (phone === '9999999999') {
      return { success: true, message: 'Test OTP sent' };
    }
    
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'OTP Sent successfully' };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token,
      type: 'sms',
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, sendOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
