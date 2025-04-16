
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";
import { Database } from "@/integrations/supabase/types";
import { validateAppointmentData } from "./validateAppointment";

const APPOINTMENTS_TABLE = 'appointments';

type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

export const createNewAppointment = async (appointmentData: Omit<Appointment, 'id' | 'professionals'>) => {
  console.log('[Agenda] Iniciando criação:', appointmentData);
  
  try {
    // Validate appointment data
    validateAppointmentData(appointmentData);

    // Verificar se o profissional está disponível naquele dia
    const { data: unavailableDay, error: unavailableError } = await retryOperation(async () => {
      return supabase
        .from('professional_unavailable_days')
        .select('id')
        .eq('professional_id', appointmentData.professional_id)
        .eq('date', appointmentData.appointment_date)
        .single();
    });

    if (unavailableError && unavailableError.code !== 'PGRST116') { // PGRST116 é "No rows returned"
      console.error('[Agenda] Erro ao verificar disponibilidade do dia:', unavailableError);
      throw new Error('Erro ao verificar disponibilidade');
    }
    
    if (unavailableDay) {
      throw new Error('Profissional não disponível nesta data');
    }

    // Verificar se existe o slot disponível
    const { data: availableSlot, error: slotError } = await retryOperation(async () => {
      return supabase
        .from('professional_available_slots')
        .select('max_appointments')
        .eq('professional_id', appointmentData.professional_id)
        .eq('time_slot', appointmentData.appointment_time)
        .single();
    });

    if (slotError) {
      console.error('[Agenda] Erro ao verificar slot disponível:', slotError);
      if (slotError.code === 'PGRST116') { // No rows returned
        throw new Error('Horário não disponível para este profissional');
      }
      throw new Error('Erro ao verificar disponibilidade de horário');
    }

    // Verificar se o número de agendamentos não excede o máximo permitido
    const { count, error: countError } = await retryOperation(async () => {
      return supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('professional_id', appointmentData.professional_id)
        .eq('appointment_date', appointmentData.appointment_date)
        .eq('appointment_time', appointmentData.appointment_time)
        .is('deleted_at', null);
    });

    if (countError) {
      console.error('[Agenda] Erro ao contar agendamentos:', countError);
      throw new Error('Erro ao verificar disponibilidade');
    }

    const maxAppointments = availableSlot.max_appointments || 10;

    if (count != null && count >= maxAppointments) {
      throw new Error('Limite de agendamentos excedido para este horário');
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

    const { data, error } = await retryOperation(async () => {
      return supabase
        .from(APPOINTMENTS_TABLE)
        .insert([appointment])
        .select('*, professionals:professional_id(name)')
        .single();
    });

    if (error) {
      console.error('[Agenda] Erro na criação:', error);
      
      // Traduzir erros do banco de dados
      if (error.message.includes('Data do agendamento não pode ser no passado')) {
        throw new Error('Data do agendamento não pode ser no passado');
      } else if (error.message.includes('Nome do paciente é obrigatório')) {
        throw new Error('Nome do paciente é obrigatório');
      } else if (error.message.includes('Telefone é obrigatório')) {
        throw new Error('Telefone é obrigatório');
      } else if (error.message.includes('Profissional não disponível nesta data')) {
        throw new Error('Profissional não disponível nesta data');
      } else if (error.message.includes('Horário não disponível')) {
        throw new Error('Horário não disponível para este profissional');
      } else if (error.message.includes('Limite de agendamentos excedido')) {
        throw new Error('Limite de agendamentos excedido para este horário');
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
