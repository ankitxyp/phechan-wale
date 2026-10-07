import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Profile } from '@pehchan-wale/shared-types';
import { useAuth } from '../context/AuthContext';

export type TrustTier = 'verified_neighbor' | 'trusted_regular' | 'community_pillar';

export interface TrustInfo {
  tier: TrustTier;
  label: string;
  labelHindi: string;
  level: number;
  completedPickups: number;
  cancellations: number;
  avgRating: number;
  progressToNext: number; // 0-100
  nextTierRequirement: string;
}

function computeTrust(completedPickups: number, cancellations: number, avgRating: number): TrustInfo {
  if (completedPickups >= 10 && avgRating >= 4.5) {
    return {
      tier: 'community_pillar',
      label: 'Level 3: Community Pillar',
      labelHindi: 'समुदाय का स्तम्भ',
      level: 3,
      completedPickups,
      cancellations,
      avgRating,
      progressToNext: 100,
      nextTierRequirement: 'You have reached the highest trust tier!',
    };
  }

  if (completedPickups >= 3) {
    const progress = Math.min(100, Math.round(((completedPickups / 10) * 50) + ((Math.min(avgRating, 4.5) / 4.5) * 50)));
    return {
      tier: 'trusted_regular',
      label: 'Level 2: Trusted Regular',
      labelHindi: 'भरोसेमंद पड़ोसी',
      level: 2,
      completedPickups,
      cancellations,
      avgRating,
      progressToNext: progress,
      nextTierRequirement: `${10 - completedPickups} more pickups & 4.5+ rating for Community Pillar`,
    };
  }

  const progress = Math.min(100, Math.round((completedPickups / 3) * 100));
  return {
    tier: 'verified_neighbor',
    label: 'Level 1: Verified Neighbor',
    labelHindi: 'सत्यापित पड़ोसी',
    level: 1,
    completedPickups,
    cancellations,
    avgRating,
    progressToNext: progress,
    nextTierRequirement: `${3 - completedPickups} more successful pickups for Trusted Regular`,
  };
}

export function useCustomerProfile() {
  const { user, profile: authProfile, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trustInfo, setTrustInfo] = useState<TrustInfo>(computeTrust(0, 0, 0));
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Fetch full profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData as Profile);

      // 2. Count completed pickups (picked_up reservations)
      const { count: completedCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', profileData.id)
        .eq('status', 'picked_up');

      // 3. Count cancellations
      const { count: cancelCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', profileData.id)
        .eq('status', 'cancelled');

      // 4. Get average rating (from reviews targeting this user)
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('target_id', profileData.id);

      let avgRating = 0;
      if (reviews && reviews.length > 0) {
        avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      }

      setTrustInfo(computeTrust(completedCount || 0, cancelCount || 0, avgRating));
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: { name?: string }) => {
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) throw error;
    await fetchProfile();
  };

  return {
    profile,
    trustTier: trustInfo.tier,
    trustScore: profile?.pehchan_score ?? 0,
    trustInfo,
    isLoading,
    updateProfile,
    signOut,
    refetch: fetchProfile,
  };
}
