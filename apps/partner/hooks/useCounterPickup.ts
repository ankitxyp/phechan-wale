import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Reservation, Listing, Profile } from '@pehchan-wale/shared-types';
import { useAuth } from '../context/AuthContext';

export interface PendingPickup extends Reservation {
  listings: Pick<Listing, "id" | "title" | "price" | "image_url">;
  profiles: Pick<Profile, "id" | "name" | "phone">;
}

export function useCounterPickup() {
  const { user } = useAuth();
  const [pendingPickups, setPendingPickups] = useState<PendingPickup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchPickups = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Use !inner on listings to filter reservations where the linked listing belongs to the user
      const { data, error } = await supabase
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

      if (error) throw error;
      setPendingPickups((data || []) as unknown as PendingPickup[]);
    } catch (err) {
      console.error('Failed to fetch pending pickups', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  const verifyPin = async (enteredPin: string) => {
    if (!user) throw new Error('Not authenticated');
    if (!/^\d{4}$/.test(enteredPin)) {
      throw new Error('PIN must be exactly 4 digits');
    }

    setIsVerifying(true);
    try {
      // For this mockup, PIN is derived from reservation ID:
      // item.id.replace(/[^0-9]/g, '0').substring(0, 4).padEnd(4, '0')
      const matchedPickup = pendingPickups.find(pickup => {
        const expectedPin = pickup.id.replace(/[^0-9]/g, '0').substring(0, 4).padEnd(4, '0');
        return expectedPin === enteredPin;
      });

      if (!matchedPickup) {
        throw new Error('Invalid or expired PIN / अमान्य या समाप्त पिन');
      }

      // Update reservation status to picked_up
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'picked_up' })
        .eq('id', matchedPickup.id)
        .eq('status', 'active'); // ensure it's still active

      if (error) throw error;

      await fetchPickups();
      return matchedPickup;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    pendingPickups,
    isLoading,
    isVerifying,
    verifyPin,
    refetch: fetchPickups,
  };
}
