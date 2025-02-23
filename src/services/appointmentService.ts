
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";
import { Database } from "@/integrations/supabase/types";

const APPOINTMENTS_TABLE = 'appointments';

type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

export const fetchDailyAppointments = async (professionalId: string) => {
  const today = new Date().toISOString().split('T')[0];
  console.log('[Agenda] Buscando agendamentos para:', { professionalId, today });
  
  try {
    let query = supabase
      .from(APPOINTMENTS_TABLE)
      .select(`
        *,
        professionals!fk_professional (
          name
        )
      `)
      .eq('appointment_date', today)
      .is('deleted_at', null);

    if (professionalId !== "all") {
      query = query.eq('professional_id', professionalId);
    }

    const { data, error } = await query
      .order('priority', { ascending: false })
      .order('appointment_time', { ascending: true });

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

export const createNewAppointment = async (appointmentData: Omit<Appointment, 'id' | 'professional'>) => {
  console.log('[Agenda] Iniciando criação:', appointmentData);
  
  try {
    // Validações básicas
    if (!appointmentData.patient_name?.trim() || 
        !appointmentData.appointment_date || 
        !appointmentData.appointment_time || 
        !appointmentData.phone?.trim()) {
      throw new Error('Campos obrigatórios incompletos');
    }

    // Validar data do agendamento
    const appointmentDate = new Date(appointmentData.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      throw new Error('Data do agendamento não pode ser no passado');
    }

    // Validar formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentData.appointment_date)) {
      throw new Error('Formato de data inválido');
    }

    // Validar formato do horário
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(appointmentData.appointment_time)) {
      throw new Error('Formato de horário inválido');
    }

    // Preparar dados
    const appointment: AppointmentInsert = {
      patient_name: appointmentData.patient_name.trim(),
      birth_date: appointmentData.birth_date,
      professional_id: appointmentData.professional_id,
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      display_status: 'waiting',
      priority: appointmentData.priority || 'normal',
      is_minor: Boolean(appointmentData.is_minor),
      phone: appointmentData.phone.trim(),
      responsible_name: appointmentData.responsible_name?.trim() || null,
      has_record: appointmentData.has_record || null,
      deleted_at: null,
      updated_at: new Date().toISOString()
    };

    console.log('[Agenda] Dados preparados:', appointment);

    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .insert([appointment])
      .select('*, professionals!fk_professional(name)')
      .single();

    if (error) {
      console.error('[Agenda] Erro na criação:', error);
      
      // Traduzir erros do banco de dados
      if (error.message.includes('Data do agendamento não pode ser no passado')) {
        throw new Error('Data do agendamento não pode ser no passado');
      } else if (error.message.includes('Nome do paciente é obrigatório')) {
        throw new Error('Nome do paciente é obrigatório');
      } else if (error.message.includes('Telefone é obrigatório')) {
        throw new Error('Telefone é obrigatório');
      } else {
        throw new Error('Não foi possível realizar o agendamento. Tente novamente.');
      }
    }

    console.log('[Agenda] Criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('[Agenda] Erro crítico na criação:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro inesperado ao criar agendamento');
  }
};

export const updateExistingAppointment = async (id: string, updateData: Partial<Appointment>) => {
  console.log('[Agenda] Iniciando atualização:', { id, updateData });
  
  try {
    if (!id) throw new Error('ID do agendamento é obrigatório');

    const { error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
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
