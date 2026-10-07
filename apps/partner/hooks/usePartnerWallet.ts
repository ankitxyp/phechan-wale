import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Transaction } from '@pehchan-wale/shared-types';
import { useAuth } from '../context/AuthContext';

export function usePartnerWallet() {
  const { user, profile } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todayEarnings, setTodayEarnings] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [pendingSettlements, setPendingSettlements] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAgent = profile?.roles?.includes('agent') || false;

  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Fetch current profile balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', profile?.id)
        .single();

      if (profileError) throw profileError;
      setBalance(profileData?.wallet_balance || 0);

      // 2. Fetch transaction history
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (txError) throw txError;
      
      const txs = (txData || []) as Transaction[];
      setTransactions(txs);

      // 3. Compute Metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let calcTodayEarnings = 0;
      let calcTotalWithdrawn = 0;
      let calcPending = 0;

      txs.forEach(tx => {
        if (tx.type === 'credit' && tx.status === 'success') {
          const txDate = new Date(tx.created_at);
          if (txDate >= today) {
            calcTodayEarnings += tx.amount;
          }
        }
        
        if (tx.type === 'debit') {
          if (tx.status === 'success') {
            calcTotalWithdrawn += tx.amount;
          } else if (tx.status === 'pending') {
            calcPending += tx.amount;
          }
        }
      });

      setTodayEarnings(calcTodayEarnings);
      setTotalWithdrawn(calcTotalWithdrawn);
      setPendingSettlements(calcPending);

    } catch (err) {
      console.error('Failed to fetch wallet data', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const requestPayout = async (amount: number, upiId: string) => {
    if (!profile) throw new Error('Not authenticated');
    if (amount < 100) throw new Error('Minimum withdrawal amount is ₹100');
    if (amount > balance) throw new Error('Insufficient balance');

    setIsSubmitting(true);
    try {
      // Insert debit transaction
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          amount,
          type: 'debit',
          status: 'pending',
          reference_id: `UPI:${upiId}`
        });

      if (error) throw error;
      await fetchWalletData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateHisaabSummary = () => {
    const dateStr = new Date().toLocaleDateString('hi-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    // Count transactions from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTxCount = transactions.filter(tx => new Date(tx.created_at) >= today).length;

    return `📊 पहचान वाले - आज का दैनिक हिसाब (Daily Summary)
📅 दिनांक: ${dateStr}
💰 आज की कुल कमाई: ₹${todayEarnings}
📦 कुल लेन-देन: ${todayTxCount}
🔒 उपलब्ध बैलेंस: ₹${balance}`;
  };

  return {
    balance,
    transactions,
    todayEarnings,
    totalWithdrawn,
    pendingSettlements,
    isAgent,
    isLoading,
    isSubmitting,
    requestPayout,
    generateHisaabSummary,
    refetch: fetchWalletData,
  };
}
