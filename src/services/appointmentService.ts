
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";

const APPOINTMENTS_TABLE = 'appointments';

export const fetchDailyAppointments = async (professionalId: string) => {
  const today = new Date().toISOString().split('T')[0];
  console.log('[Agenda] Buscando agendamentos para:', { professionalId, today });
  
  try {
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

export const createNewAppointment = async (appointmentData: Omit<Appointment, 'id' | 'professional_name'>) => {
  console.log('[Agenda] Iniciando criação:', appointmentData);
  
  try {
    // Validações locais antes de enviar ao banco
    if (!appointmentData.patient_name?.trim()) {
      throw new Error('Nome do paciente é obrigatório');
    }
    if (!appointmentData.birth_date) {
      throw new Error('Data de nascimento é obrigatória');
    }
    if (!appointmentData.appointment_date) {
      throw new Error('Data da consulta é obrigatória');
    }
    if (!appointmentData.appointment_time) {
      throw new Error('Horário da consulta é obrigatório');
    }
    if (!appointmentData.phone?.trim()) {
      throw new Error('Telefone é obrigatório');
    }
    
    // Se for menor de idade, responsável é obrigatório
    if (appointmentData.is_minor && !appointmentData.responsible_name?.trim()) {
      throw new Error('Nome do responsável é obrigatório para pacientes menores de idade');
    }

    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .insert([{
        ...appointmentData,
        // Garantir que campos opcionais não sejam undefined
        notes: appointmentData.notes || null,
        has_record: appointmentData.has_record || null,
        responsible_name: appointmentData.responsible_name || null,
        room: appointmentData.room || null,
        block: appointmentData.block || null,
        ticket_number: appointmentData.ticket_number || null
      }])
      .select(`
        *,
        professional_name:professionals(name)
      `)
      .single();

    if (error) {
      console.error('[Agenda] Erro na criação:', error);
      if (error.message.includes('appointments_responsible_check')) {
        throw new Error('Nome do responsável é obrigatório para pacientes menores de idade');
      }
      if (error.message.includes('appointments_date_check')) {
        throw new Error('A data da consulta não pode ser anterior à data atual');
      }
      if (error.message.includes('Profissional não disponível')) {
        throw new Error('O profissional não está disponível nesta data');
      }
      if (error.message.includes('Horário não disponível')) {
        throw new Error('Este horário não está disponível para agendamento');
      }
      if (error.message.includes('Limite de agendamentos')) {
        throw new Error('O limite de agendamentos para este horário foi atingido');
      }
      throw new Error('Não foi possível criar o agendamento. Por favor, tente novamente.');
    }

    console.log('[Agenda] Criado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('[Agenda] Erro crítico na criação:', error);
    throw error;
  }
};

export const updateExistingAppointment = async (id: string, updateData: Partial<Appointment>) => {
  console.log('[Agenda] Iniciando atualização:', { id, updateData });
  
  try {
    if (!id) throw new Error('ID do agendamento é obrigatório');

    const { error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update(updateData)
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
