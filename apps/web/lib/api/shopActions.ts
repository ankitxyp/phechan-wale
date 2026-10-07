import { supabase } from '../supabaseClient';

export async function registerNewShop(shopData: any) {
  const { data, error } = await supabase
    .from('shops')
    .insert([shopData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting shop:', error);
    throw error;
  }
  return data;
}

export async function triggerAutoCatalog(shopId: string, category: string) {
  // Simulates pulling 50 items from master_catalog to shop_inventory
  // In production, this would map to a Postgres RPC function or Edge Function
  const { data, error } = await supabase.rpc('trigger_auto_catalog', {
    p_shop_id: shopId,
    p_category: category,
  });
  
  if (error) {
    console.error('Error triggering auto-catalog:', error);
    // Returning true anyway so the UI simulation can proceed in development
    return true; 
  }
  return data;
}

export async function creditAgentWallet(agentId: string, amount: number) {
  // Fetch current wallet balance
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', agentId)
    .single();

  if (fetchError) {
    console.error('Error fetching wallet balance:', fetchError);
  }

  const currentBalance = profile?.wallet_balance || 0;
  const newBalance = currentBalance + amount;

  const { data, error } = await supabase
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', agentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating wallet:', error);
    throw error;
  }
  return data;
}
