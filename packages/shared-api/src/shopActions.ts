import { SupabaseClient } from '@supabase/supabase-js';

export async function registerNewShop(supabase: SupabaseClient, shopData: any) {
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

export async function triggerAutoCatalog(supabase: SupabaseClient, shopId: string, category: string) {
  const { data, error } = await supabase.rpc('trigger_auto_catalog', {
    p_shop_id: shopId,
    p_category: category,
  });
  
  if (error) {
    console.error('Error triggering auto-catalog:', error);
    return true; 
  }
  return data;
}

export async function creditAgentWallet(supabase: SupabaseClient, agentId: string, amount: number) {
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
