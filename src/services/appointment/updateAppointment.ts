
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { Appointment, DisplayStatus } from "@/types/appointment";

const APPOINTMENTS_TABLE = 'appointments';

export const updateExistingAppointment = async (id: string, updateData: Partial<Appointment>) => {
  console.log('[Agenda] Iniciando atualização:', { id, updateData });
  
  try {
    if (!id) throw new Error('ID do agendamento é obrigatório');
    if (!navigator.onLine) throw new Error('Dispositivo está offline');

    // Garantir que o status seja válido para o banco de dados
    const formattedData = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    console.log('[Agenda] Dados para atualização:', formattedData);

    // Using retry utility for better reliability
    const { error } = await retryOperation(async () => {
      return supabase
        .from(APPOINTMENTS_TABLE)
        .update(formattedData)
        .eq('id', id);
    }, 5, 800); // 5 retries, starting with 800ms delay

    if (error) {
      console.error('[Agenda] Erro na atualização:', error);
      throw error;
    }

    console.log('[Agenda] Atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('[Agenda] Erro crítico na atualização:', error);
    throw error;
  }
};
