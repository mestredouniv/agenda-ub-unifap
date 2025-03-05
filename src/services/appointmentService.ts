
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";

const APPOINTMENTS_TABLE = 'appointments';

export const fetchDailyAppointments = async (professionalId: string) => {
  try {
    console.log('[Agenda] Iniciando busca de agendamentos:', { professionalId });
    
    if (!professionalId) {
      console.error('[Agenda] ID do profissional não fornecido');
      throw new Error('ID do profissional é obrigatório');
    }

    const today = new Date().toISOString().split('T')[0];
    let query = supabase
      .from(APPOINTMENTS_TABLE)
      .select(`
        *,
        professional_name:professionals(name)
      `)
      .eq('appointment_date', today)
      .is('deleted_at', null);

    if (professionalId !== "all") {
      query = query.eq('professional_id', professionalId);
    }

    console.log('[Agenda] Executando query');
    const { data, error } = await query
      .order('priority', { ascending: false })
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error('[Agenda] Erro ao buscar agendamentos:', error);
      throw new Error('Não foi possível carregar os agendamentos. Por favor, tente novamente.');
    }

    console.log('[Agenda] Agendamentos encontrados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Agenda] Erro crítico:', error);
    throw new Error('Erro ao carregar agenda. Por favor, tente novamente.');
  }
};

export const createNewAppointment = async (appointmentData: Omit<Appointment, 'id' | 'professional_name'>) => {
  try {
    console.log('[Agenda] Iniciando criação de agendamento:', appointmentData);

    if (!appointmentData.professional_id) {
      throw new Error('Profissional não selecionado');
    }

    if (!appointmentData.patient_name?.trim()) {
      throw new Error('Nome do paciente é obrigatório');
    }

    if (!appointmentData.birth_date) {
      throw new Error('Data de nascimento é obrigatória');
    }

    if (!appointmentData.phone?.trim()) {
      throw new Error('Telefone é obrigatório');
    }

    if (!appointmentData.appointment_date) {
      throw new Error('Data da consulta é obrigatória');
    }

    if (!appointmentData.appointment_time) {
      throw new Error('Horário é obrigatório');
    }

    // Se for menor de idade, responsável é obrigatório
    if (appointmentData.is_minor && !appointmentData.responsible_name?.trim()) {
      throw new Error('Nome do responsável é obrigatório para pacientes menores de idade');
    }

    // Verifica disponibilidade do horário
    const { data: existingSlot, error: slotError } = await supabase
      .from('professional_available_slots')
      .select('*')
      .eq('professional_id', appointmentData.professional_id)
      .eq('time_slot', appointmentData.appointment_time)
      .single();

    if (slotError || !existingSlot) {
      console.error('[Agenda] Erro ao verificar slot:', slotError);
      throw new Error('Horário não disponível para agendamento');
    }

    // Verifica se o profissional está disponível nesta data
    const { data: unavailableDay, error: dayError } = await supabase
      .from('professional_unavailable_days')
      .select('*')
      .eq('professional_id', appointmentData.professional_id)
      .eq('date', appointmentData.appointment_date)
      .maybeSingle();

    if (dayError) {
      console.error('[Agenda] Erro ao verificar disponibilidade:', dayError);
      throw new Error('Erro ao verificar disponibilidade do profissional');
    }

    if (unavailableDay) {
      throw new Error('Profissional não disponível nesta data');
    }

    // Conta agendamentos existentes para este horário
    const { data: existingAppointments, error: countError } = await supabase
      .from(APPOINTMENTS_TABLE)
      .select('id')
      .eq('professional_id', appointmentData.professional_id)
      .eq('appointment_date', appointmentData.appointment_date)
      .eq('appointment_time', appointmentData.appointment_time)
      .is('deleted_at', null);

    if (countError) {
      console.error('[Agenda] Erro ao contar agendamentos:', countError);
      throw new Error('Erro ao verificar disponibilidade do horário');
    }

    if ((existingAppointments?.length || 0) >= existingSlot.max_appointments) {
      throw new Error('Horário não possui mais vagas disponíveis');
    }

    // Cria o agendamento
    console.log('[Agenda] Criando agendamento');
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .insert([{
        ...appointmentData,
        notes: appointmentData.notes || null,
        responsible_name: appointmentData.responsible_name || null,
        room: appointmentData.room || null,
        block: appointmentData.block || null,
        ticket_number: appointmentData.ticket_number || null,
        has_record: appointmentData.has_record || null
      }])
      .select(`
        *,
        professional_name:professionals(name)
      `)
      .single();

    if (error) {
      console.error('[Agenda] Erro na criação:', error);
      
      if (error.message.includes('appointments_date_check')) {
        throw new Error('A data da consulta não pode ser anterior à data atual');
      }
      
      throw new Error('Não foi possível criar o agendamento. Por favor, tente novamente.');
    }

    console.log('[Agenda] Agendamento criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('[Agenda] Erro crítico na criação:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Erro inesperado ao criar agendamento. Por favor, tente novamente.');
  }
};

export const updateExistingAppointment = async (id: string, updateData: Partial<Appointment>) => {
  try {
    console.log('[Agenda] Iniciando atualização:', { id, updateData });

    if (!id) throw new Error('ID do agendamento é obrigatório');

    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Agenda] Erro na atualização:', error);
      throw new Error('Não foi possível atualizar o agendamento. Por favor, tente novamente.');
    }

    console.log('[Agenda] Atualização realizada com sucesso');
    return data;
  } catch (error) {
    console.error('[Agenda] Erro crítico na atualização:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Erro inesperado ao atualizar agendamento. Por favor, tente novamente.');
  }
};
