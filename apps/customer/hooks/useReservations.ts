import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Reservation, Listing, Profile } from '@pehchan-wale/shared-types';
import { useAuth } from '../context/AuthContext';

export interface EnrichedReservation extends Reservation {
  listings: Pick<Listing, "id" | "title" | "price" | "image_url"> & {
    profiles?: Pick<Profile, "id" | "name" | "phone">;
    shops?: { name: string, location_lat: number, location_lng: number }[];
  };
}

export function useReservations() {
  const { user } = useAuth();
  const [activeReservations, setActiveReservations] = useState<EnrichedReservation[]>([]);
  const [pastReservations, setPastReservations] = useState<EnrichedReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          listings (
            id, title, price, image_url,
            profiles:seller_id (id, name, phone),
            shops:seller_id (name, location_lat, location_lng)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const active: EnrichedReservation[] = [];
      const past: EnrichedReservation[] = [];

      (data || []).forEach((res: any) => {
        if (res.status === 'active') {
          active.push(res);
        } else {
          past.push(res);
        }
      });

      setActiveReservations(active);
      setPastReservations(past);
    } catch (err) {
      console.error('Failed to fetch reservations', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const cancelReservation = async (reservationId: string) => {
    if (!user) return;
    
    // Only allow if active
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId)
      .eq('status', 'active');

    if (error) throw error;
    
    await fetchReservations();
  };

  return {
    activeReservations,
    pastReservations,
    isLoading,
    cancelReservation,
    refetch: fetchReservations,
  };
}
