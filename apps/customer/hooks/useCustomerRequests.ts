import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { CustomerRequest, BidDeal, ServiceBooking } from '@pehchan-wale/shared-types';
import { useAuth } from '../context/AuthContext';

export interface EnrichedRequest extends CustomerRequest {
  bids: (BidDeal & { profiles: { name: string; pehchan_score: number } })[];
}

export function useCustomerRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<EnrichedRequest[]>([]);
  const [activeBookings, setActiveBookings] = useState<ServiceBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveRequests = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Fetch active requests with their bids
      const { data: reqs, error: reqsError } = await supabase
        .from('customer_requests')
        .select(`
          *,
          bids_and_deals (
            *,
            profiles:provider_id (
              name,
              pehchan_score
            )
          )
        `)
        .eq('customer_id', user.id)
        .in('status', ['open', 'bidding']);

      if (reqsError) throw reqsError;

      setRequests(
        (reqs || []).map((r: any) => ({
          ...r,
          bids: r.bids_and_deals || [],
        })) as EnrichedRequest[]
      );

      // 2. Fetch active bookings (assigned, in_progress)
      const { data: bookings, error: bookingsError } = await supabase
        .from('service_bookings')
        .select(`*, profiles:provider_id (name, phone)`)
        .eq('customer_id', user.id)
        .in('status', ['assigned', 'in_progress']);

      if (bookingsError) throw bookingsError;

      setActiveBookings((bookings || []) as ServiceBooking[]);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActiveRequests();
  }, [fetchActiveRequests]);

  const createRequest = async (data: { category: string; description: string; is_urgent?: boolean }) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('customer_requests').insert({
      customer_id: user.id,
      ai_category: data.category,
      description: data.description,
      status: 'open',
      // Store urgent flag if schema supports it, else in description or a jsonb field
    });

    if (error) throw error;
    await fetchActiveRequests();
  };

  const acceptBid = async (requestId: string, bidId: string, providerId: string, agreedPrice: number, description: string) => {
    if (!user) throw new Error('Not authenticated');
    
    // Generate random 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // Transaction-like approach using multiple calls (since we don't have an RPC for this specifically)
    // 1. Create service booking
    const { error: bookingError } = await supabase.from('service_bookings').insert({
      customer_id: user.id,
      provider_id: providerId,
      status: 'assigned',
      agreed_price: agreedPrice,
      verification_pin: pin,
      problem_description: description,
    });

    if (bookingError) throw bookingError;

    // 2. Update request status
    await supabase.from('customer_requests').update({ status: 'assigned' }).eq('id', requestId);
    
    // 3. Update bid status
    await supabase.from('bids_and_deals').update({ status: 'accepted' }).eq('id', bidId);

    await fetchActiveRequests();
  };

  return {
    requests,
    activeBookings,
    isLoading,
    createRequest,
    acceptBid,
    refetch: fetchActiveRequests,
  };
}
