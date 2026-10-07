import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Listing } from '@pehchan-wale/shared-types';
import { useAuth } from '../context/AuthContext';

export function usePartnerCatalog() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchListings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings((data || []) as Listing[]);
    } catch (err) {
      console.error('Failed to fetch listings', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const toggleAvailability = async (listingId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setListings(prev => 
      prev.map(l => l.id === listingId ? { ...l, is_available: !currentStatus } : l)
    );

    const { error } = await supabase
      .from('listings')
      .update({ is_available: !currentStatus })
      .eq('id', listingId);

    if (error) {
      // Revert on error
      setListings(prev => 
        prev.map(l => l.id === listingId ? { ...l, is_available: currentStatus } : l)
      );
      throw error;
    }
  };

  const toggleSpotlightOffer = async (listingId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setListings(prev => 
      prev.map(l => l.id === listingId ? { ...l, is_promoted_ad: !currentStatus } : l)
    );

    const { error } = await supabase
      .from('listings')
      .update({ is_promoted_ad: !currentStatus })
      .eq('id', listingId);

    if (error) {
      // Revert on error
      setListings(prev => 
        prev.map(l => l.id === listingId ? { ...l, is_promoted_ad: currentStatus } : l)
      );
      throw error;
    }
  };

  const updatePrice = async (listingId: string, newPrice: number) => {
    const { error } = await supabase
      .from('listings')
      .update({ price: newPrice })
      .eq('id', listingId);

    if (error) throw error;
    await fetchListings();
  };

  const createListing = async (data: { title: string; price: number; category: string; description?: string; is_featured?: boolean }) => {
    if (!user) throw new Error('Not authenticated');
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          item_type: 'product',
          title: data.title,
          price: data.price,
          category: data.category,
          description: data.description || null,
          is_promoted_ad: data.is_featured || false,
          is_available: true,
        });

      if (error) throw error;
      await fetchListings();
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteListing = async (listingId: string) => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) throw error;
    
    // Optimistic remove
    setListings(prev => prev.filter(l => l.id !== listingId));
  };

  return {
    listings,
    isLoading,
    isSubmitting,
    toggleAvailability,
    toggleSpotlightOffer,
    updatePrice,
    createListing,
    deleteListing,
    refetch: fetchListings,
  };
}
