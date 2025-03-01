
import { Supabase } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const setupSlotSubscriptions = (
  professionalId: string, 
  selectedDate: string | undefined,
  onDataChange: () => void
) => {
  if (!professionalId || !selectedDate) {
    return { removeSubscription: () => {} };
  }

  const channelName = `slots-${professionalId}-${selectedDate}`;
  console.log('[slotSubscription] Subscription configurada:', channelName);
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'professional_available_slots',
        filter: `professional_id=eq.${professionalId}`
      },
      () => onDataChange()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'professional_unavailable_days',
        filter: `professional_id=eq.${professionalId}`
      },
      () => onDataChange()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `professional_id=eq.${professionalId}`
      },
      () => onDataChange()
    )
    .subscribe((status) => {
      console.log('[slotSubscription] Status da subscription:', status);
    });
    
  return {
    removeSubscription: () => {
      console.log('[slotSubscription] Limpando subscription');
      supabase.removeChannel(channel);
    }
  };
};
