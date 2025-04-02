
import { supabase, retryOperation } from "@/integrations/supabase/client";

const APPOINTMENTS_TABLE = 'appointments';

export const fetchDailyAppointments = async (professionalId: string) => {
  const today = new Date().toISOString().split('T')[0];
  console.log('[Agenda] Buscando agendamentos para:', { professionalId, today });
  
  try {
    // Using retry utility for better reliability
    const { data, error } = await retryOperation(async () => {
      let query = supabase
        .from(APPOINTMENTS_TABLE)
        .select(`
          *,
          professionals:professional_id(name)
        `)
        .eq('appointment_date', today)
        .is('deleted_at', null);

      if (professionalId !== "all") {
        query = query.eq('professional_id', professionalId);
      }

      return query
        .order('priority', { ascending: false })
        .order('appointment_time', { ascending: true });
    });

    if (error) {
      console.error('[Agenda] Erro na busca:', error);
      throw error;
    }

    console.log('[Agenda] Dados encontrados:', data);
    return data;
  } catch (error) {
    console.error('[Agenda] Erro crítico:', error);
    throw error;
  }
};
