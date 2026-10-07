import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Reservation, Listing, Profile } from '@pehchan-wale/shared-types';
import { useAuth } from '../context/AuthContext';

export interface PendingPickup extends Reservation {
  listings: Pick<Listing, "id" | "title" | "price" | "image_url">;
  profiles: Pick<Profile, "id" | "name" | "phone">;
}

export interface DailyHisaab {
  count: number;
  totalCash: number;
}

export function useCounterPickup() {
  const { user } = useAuth();
  const [pendingPickups, setPendingPickups] = useState<PendingPickup[]>([]);
  const [dailyHisaab, setDailyHisaab] = useState<DailyHisaab>({ count: 0, totalCash: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchPickupsAndHisaab = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch active reservations
      const { data: pendingData, error: pendingError } = await supabase
        .from('reservations')
        .select(`
          *,
          listings!inner (
            id, title, price, image_url, seller_id
          ),
          profiles:customer_id (
            id, name, phone
          )
        `)
        .eq('listings.seller_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (pendingError) throw pendingError;
      setPendingPickups((pendingData || []) as unknown as PendingPickup[]);

      // Fetch today's completed reservations for Hisaab
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayData, error: todayError } = await supabase
        .from('reservations')
        .select(`
          *,
          listings!inner (price, seller_id)
        `)
        .eq('listings.seller_id', user.id)
        .eq('status', 'picked_up')
        .gte('updated_at', today.toISOString());

      if (todayError) throw todayError;

      let totalCash = 0;
      todayData?.forEach((res: any) => {
        totalCash += res.listings?.price || 0;
      });

      setDailyHisaab({
        count: todayData?.length || 0,
        totalCash
      });

    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPickupsAndHisaab();
  }, [fetchPickupsAndHisaab]);

  const verifyPin = async (enteredPin: string) => {
    if (!user) throw new Error('Not authenticated');
    if (!/^\d{4}$/.test(enteredPin)) {
      throw new Error('PIN must be exactly 4 digits');
    }

    setIsVerifying(true);
    try {
      const matchedPickup = pendingPickups.find(pickup => {
        const expectedPin = pickup.id.replace(/[^0-9]/g, '0').substring(0, 4).padEnd(4, '0');
        return expectedPin === enteredPin;
      });

      if (!matchedPickup) {
        throw new Error('Invalid or expired PIN / अमान्य या समाप्त पिन');
      }

      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: 'picked_up',
          updated_at: new Date().toISOString()
        })
        .eq('id', matchedPickup.id)
        .eq('status', 'active');

      if (error) throw error;

      await fetchPickupsAndHisaab();
      return matchedPickup;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    pendingPickups,
    dailyHisaab,
    isLoading,
    isVerifying,
    verifyPin,
    refetch: fetchPickupsAndHisaab,
  };
}
