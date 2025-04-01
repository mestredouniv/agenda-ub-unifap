
import { supabase } from "@/integrations/supabase/client";
import { Appointment, DisplayStatus } from "@/types/appointment";

const APPOINTMENTS_TABLE = 'appointments';

export const updateExistingAppointment = async (id: string, updateData: Partial<Appointment>) => {
  console.log('[Agenda] Iniciando atualização:', { id, updateData });
  
  try {
    if (!id) throw new Error('ID do agendamento é obrigatório');

    // Convert display_status to string to ensure compatibility with database
    const formattedData = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update(formattedData)
      .eq('id', id);

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
