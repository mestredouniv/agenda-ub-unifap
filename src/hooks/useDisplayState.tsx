import { create } from 'zustand';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DisplayState {
  currentPatient: {
    name: string;
    status: 'waiting' | 'triage' | 'in_progress' | null;
    professional: string;
  } | null;
  setCurrentPatient: (patient: DisplayState['currentPatient']) => void;
}

export const useDisplayState = create<DisplayState>((set) => ({
  currentPatient: null,
  setCurrentPatient: (patient) => set({ currentPatient: patient }),
}));

// Hook to subscribe to last_calls changes
export const useDisplayStateSubscription = () => {
  const setCurrentPatient = useDisplayState((state) => state.setCurrentPatient);

  useEffect(() => {
    console.log('[useDisplayState] Setting up subscription to last_calls');
    
    // Fetch the most recent call
    const fetchLastCall = async () => {
      const { data, error } = await supabase
        .from('last_calls')
        .select('*')
        .order('called_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!error && data) {
        console.log('[useDisplayState] Initial last call:', data);
        setCurrentPatient({
          name: data.patient_name,
          status: data.status as 'waiting' | 'triage' | 'in_progress',
          professional: data.professional_name,
        });
      }
    };

    fetchLastCall();

    // Subscribe to changes in the last_calls table
    const channel = supabase
      .channel('display_last_calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'last_calls'
        },
        (payload) => {
          console.log('[useDisplayState] New last call:', payload.new);
          const newCall = payload.new as any;
          setCurrentPatient({
            name: newCall.patient_name,
            status: newCall.status as 'waiting' | 'triage' | 'in_progress',
            professional: newCall.professional_name,
          });
        }
      )
      .subscribe((status) => {
        console.log('[useDisplayState] Subscription status:', status);
      });

    return () => {
      console.log('[useDisplayState] Removing subscription');
      supabase.removeChannel(channel);
    };
  }, [setCurrentPatient]);
};