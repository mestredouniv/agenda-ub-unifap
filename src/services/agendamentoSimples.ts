
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";

/**
 * Serviço reescrito para criação de agendamentos
 * Abordagem mais simplificada e robusta
 */
export const criarAgendamento = async (dados: {
  professional_id: string;
  patient_name: string;
  birth_date: string;
  appointment_date: string;
  appointment_time: string;
  phone: string;
  is_minor: boolean;
  responsible_name?: string | null;
  has_record?: string | null;
}): Promise<Appointment> => {
  console.log('[AgendamentoSimples] Iniciando criação de agendamento:', dados);
  
  // Validação básica
  if (!dados.patient_name?.trim()) throw new Error('Nome do paciente é obrigatório');
  if (!dados.birth_date) throw new Error('Data de nascimento é obrigatória');
  if (!dados.phone?.trim()) throw new Error('Telefone é obrigatório');
  if (!dados.appointment_date) throw new Error('Data da consulta é obrigatória');
  if (!dados.appointment_time) throw new Error('Horário é obrigatório');
  if (dados.is_minor && !dados.responsible_name?.trim()) {
    throw new Error('Nome do responsável é obrigatório para pacientes menores de idade');
  }

  if (!dados.professional_id) {
    throw new Error('ID do profissional é obrigatório');
  }

  try {
    // 1. Verificar se o slot de horário existe para o profissional
    const { data: slot, error: slotError } = await supabase
      .from('professional_available_slots')
      .select('*')
      .eq('professional_id', dados.professional_id)
      .eq('time_slot', dados.appointment_time)
      .single();

    if (slotError || !slot) {
      console.error('[AgendamentoSimples] Erro ao verificar slot:', slotError);
      throw new Error('Horário não disponível para agendamento');
    }

    // 2. Verificar se o dia está bloqueado para o profissional
    const { data: diaIndisponivel, error: erroDia } = await supabase
      .from('professional_unavailable_days')
      .select('date')
      .eq('professional_id', dados.professional_id)
      .eq('date', dados.appointment_date)
      .maybeSingle();

    if (erroDia) {
      console.error('[AgendamentoSimples] Erro ao verificar disponibilidade do dia:', erroDia);
      throw new Error('Erro ao verificar disponibilidade do profissional');
    } 
    
    if (diaIndisponivel) {
      throw new Error('Profissional não disponível nesta data');
    }

    // 3. Verificar número de agendamentos existentes para este horário
    const { data: agendamentosExistentes, error: erroContagem } = await supabase
      .from('appointments')
      .select('id')
      .eq('professional_id', dados.professional_id)
      .eq('appointment_date', dados.appointment_date)
      .eq('appointment_time', dados.appointment_time)
      .is('deleted_at', null);

    if (erroContagem) {
      console.error('[AgendamentoSimples] Erro ao contar agendamentos:', erroContagem);
      throw new Error('Erro ao verificar disponibilidade do horário');
    }

    if ((agendamentosExistentes?.length || 0) >= slot.max_appointments) {
      throw new Error('Horário não possui mais vagas disponíveis');
    }

    // Preparar dados para inserção com valores específicos para os campos enumerados
    const dadosCompletos = {
      professional_id: dados.professional_id,
      patient_name: dados.patient_name.trim(),
      birth_date: dados.birth_date,
      appointment_date: dados.appointment_date,
      appointment_time: dados.appointment_time,
      phone: dados.phone.trim(),
      is_minor: dados.is_minor,
      responsible_name: dados.is_minor ? dados.responsible_name?.trim() || null : null,
      has_record: dados.has_record || null,
      display_status: 'waiting' as const,
      priority: 'normal' as const,
      created_at: new Date().toISOString()
    };

    console.log('[AgendamentoSimples] Enviando dados para inserção:', dadosCompletos);

    // Tentar inserir o agendamento
    const { data, error } = await supabase
      .from('appointments')
      .insert(dadosCompletos)
      .select('*, professionals(name)')
      .single();

    if (error) {
      console.error('[AgendamentoSimples] Erro na inserção:', error);
      if (error.code === '23505') {
        throw new Error('Já existe um agendamento para este horário');
      }
      throw new Error(`Não foi possível criar o agendamento: ${error.message}`);
    }

    if (!data) {
      throw new Error('Não foi possível criar o agendamento: nenhum dado retornado');
    }

    // Formatar o objeto de retorno
    const agendamentoCompleto: Appointment = {
      ...data,
      professional_name: data.professionals?.name || 'Profissional'
    };

    console.log('[AgendamentoSimples] Agendamento criado com sucesso:', agendamentoCompleto);
    return agendamentoCompleto;
  } catch (error) {
    console.error('[AgendamentoSimples] Erro na criação:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Erro ao criar agendamento');
  }
};
