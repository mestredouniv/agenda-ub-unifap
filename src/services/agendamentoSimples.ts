
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";

type AppointmentStatus = 'waiting' | 'triage' | 'in_progress' | 'completed' | 'missed' | 'rescheduled';
type AppointmentPriority = 'normal' | 'priority';

/**
 * Serviço simplificado para criação de agendamentos
 * Abordagem mais direta com menos verificações complexas
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
  
  try {
    // Validação básica
    if (!dados.patient_name?.trim()) throw new Error('Nome do paciente é obrigatório');
    if (!dados.birth_date) throw new Error('Data de nascimento é obrigatória');
    if (!dados.phone?.trim()) throw new Error('Telefone é obrigatório');
    if (!dados.appointment_date) throw new Error('Data da consulta é obrigatória');
    if (!dados.appointment_time) throw new Error('Horário é obrigatório');
    if (dados.is_minor && !dados.responsible_name?.trim()) {
      throw new Error('Nome do responsável é obrigatório para pacientes menores de idade');
    }

    // Verificamos se o dia está bloqueado para o profissional
    const { data: diaIndisponivel, error: erroDia } = await supabase
      .from('professional_unavailable_days')
      .select('date')
      .eq('professional_id', dados.professional_id)
      .eq('date', dados.appointment_date)
      .maybeSingle();

    if (erroDia) {
      console.error('[AgendamentoSimples] Erro ao verificar disponibilidade do dia:', erroDia);
    } else if (diaIndisponivel) {
      throw new Error('Profissional não disponível nesta data');
    }

    // Preparar dados para inserção com tipagem correta
    const dadosCompletos = {
      professional_id: dados.professional_id,
      patient_name: dados.patient_name.trim(),
      birth_date: dados.birth_date,
      appointment_date: dados.appointment_date,
      appointment_time: dados.appointment_time,
      phone: dados.phone.trim(),
      is_minor: dados.is_minor,
      responsible_name: dados.responsible_name?.trim() || null,
      has_record: dados.has_record || null,
      display_status: 'waiting' as AppointmentStatus,
      priority: 'normal' as AppointmentPriority
    };

    console.log('[AgendamentoSimples] Enviando dados para inserção:', dadosCompletos);

    // Tentar inserir o agendamento
    const { data, error } = await supabase
      .from('appointments')
      .insert(dadosCompletos)
      .select()
      .single();

    if (error) {
      console.error('[AgendamentoSimples] Erro na inserção:', error);
      throw new Error(`Não foi possível criar o agendamento: ${error.message}`);
    }

    if (!data) {
      throw new Error('Não foi possível criar o agendamento: nenhum dado retornado');
    }

    // Busca informações do profissional
    const { data: profissional } = await supabase
      .from('professionals')
      .select('name')
      .eq('id', dados.professional_id)
      .single();

    // Combina os dados para retornar um objeto completo
    const agendamentoCompleto: Appointment = {
      ...data,
      professional_name: profissional?.name || 'Profissional'
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
