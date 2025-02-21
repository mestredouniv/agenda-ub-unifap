
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";

export const fetchDailyAppointments = async (professionalId: string) => {
  const today = new Date().toISOString().split('T')[0];
  console.log('[Agenda] Data atual:', today);
  
  let query = supabase
    .from('appointments')
    .select(`
      id,
      patient_name,
      birth_date,
      professional_id,
      appointment_date,
      appointment_time,
      display_status,
      priority,
      notes,
      actual_start_time,
      actual_end_time,
      updated_at,
      deleted_at,
      professionals (
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

  if (error) throw error;
  return data;
};

export const createNewAppointment = async (appointmentData: Omit<Appointment, 'id' | 'professional'>) => {
  console.log('[appointmentService] Criando novo agendamento:', appointmentData);
  
  // Garantir que todos os campos necessários estejam presentes
  if (!appointmentData.patient_name || !appointmentData.appointment_date || !appointmentData.appointment_time) {
    throw new Error('Dados obrigatórios faltando');
  }

  // Validar formato da data e hora
  const appointmentDate = new Date(appointmentData.appointment_date);
  if (isNaN(appointmentDate.getTime())) {
    throw new Error('Data inválida');
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      ...appointmentData,
      display_status: 'waiting' as const,
      priority: appointmentData.priority || 'normal',
      deleted_at: null,
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('[appointmentService] Erro ao criar agendamento:', error);
    throw error;
  }

  console.log('[appointmentService] Agendamento criado com sucesso:', data);
  return data;
};

export const updateExistingAppointment = async (id: string, updateData: Partial<Appointment>) => {
  const { error } = await supabase
    .from('appointments')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
  return true;
};
