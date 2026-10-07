import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Shop } from '@pehchan-wale/shared-types';

export function useShops(selectedCategory?: string) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from('shops').select('*');

      if (selectedCategory && selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setShops(data as Shop[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shops');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return { shops, isLoading, error, refetch: fetchShops };
}
