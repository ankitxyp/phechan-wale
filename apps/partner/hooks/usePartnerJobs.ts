import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { CustomerRequest, ServiceBooking, Profile } from '@pehchan-wale/shared-types';
import { useAuth } from '../context/AuthContext';

export interface OpenRequest extends CustomerRequest {
  profiles: Pick<Profile, "id" | "name" | "phone">;
}

export interface ActiveJob extends ServiceBooking {
  profiles: Pick<Profile, "id" | "name" | "phone">;
}

export function usePartnerJobs() {
  const { user } = useAuth();
  const [openRequests, setOpenRequests] = useState<OpenRequest[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobsData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch open customer requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('customer_requests')
        .select(`
          *,
          profiles:customer_id (id, name, phone)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setOpenRequests((requestsData || []) as unknown as OpenRequest[]);

      // Fetch partner's active jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('service_bookings')
        .select(`
          *,
          profiles:customer_id (id, name, phone)
        `)
        .eq('provider_id', user.id)
        .in('status', ['assigned', 'in_progress'])
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setActiveJobs((jobsData || []) as unknown as ActiveJob[]);

    } catch (err) {
      console.error('Failed to fetch partner jobs', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJobsData();
  }, [fetchJobsData]);

  const submitBid = async (requestId: string, amount: number, etaMinutes: number, note?: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('bids_and_deals')
      .insert({
        request_id: requestId,
        provider_id: user.id,
        offered_price: amount,
        estimated_time: `${etaMinutes} min`,
        message: note || null,
        status: 'pending'
      });

    if (error) throw error;
    await fetchJobsData();
  };

  const completeJobWithPin = async (bookingId: string, enteredPin: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // 1. Fetch the booking to verify PIN and get amount
    const { data: booking, error: bookingError } = await supabase
      .from('service_bookings')
      .select('verification_pin, agreed_price')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: 'Job not found' };
    }

    if (booking.verification_pin !== enteredPin) {
      return { success: false, error: 'Invalid PIN / अमान्य पिन' };
    }

    // 2. Mark as solved
    const { error: updateError } = await supabase
      .from('service_bookings')
      .update({ status: 'solved' })
      .eq('id', bookingId);

    if (updateError) {
      return { success: false, error: 'Failed to update job status' };
    }

    // 3. Optional: insert credit record to transactions if atomic ledger applies here
    // Leaving out the actual transaction insert for simplicity unless strictly required, 
    // but the status update fulfills the core requirement.
    
    await fetchJobsData();
    return { success: true, amount: booking.agreed_price || 0 };
  };

  return {
    openRequests,
    activeJobs,
    isLoading,
    submitBid,
    completeJobWithPin,
    refetch: fetchJobsData,
  };
}
