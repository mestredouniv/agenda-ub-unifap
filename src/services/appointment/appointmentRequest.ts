
import { supabase } from "@/integrations/supabase/client";
import { AppointmentRequest, AppointmentRequestFormData } from "@/types/appointmentRequest";

export const createAppointmentRequest = async (data: AppointmentRequestFormData): Promise<{ success: boolean; error?: string; id?: string }> => {
  try {
    const { data: result, error } = await supabase
      .from('appointment_requests')
      .insert([
        {
          beneficiary_name: data.beneficiary_name,
          cpf: data.cpf,
          sus_number: data.sus_number,
          phone: data.phone,
          address: data.address,
          birth_date: data.birth_date,
          age: data.age,
          status: 'pending'
        }
      ])
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    return { success: false, error: 'Não foi possível criar a solicitação. Por favor, tente novamente.' };
  }
};

export const fetchAppointmentRequests = async (): Promise<AppointmentRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('appointment_requests')
      .select(`
        *,
        professionals:professional_id (name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    return [];
  }
};

export const approveAppointmentRequest = async (
  requestId: string, 
  appointmentDate: string, 
  appointmentTime: string, 
  professionalId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointment_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        professional_id: professionalId
      })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error);
    return false;
  }
};

export const rejectAppointmentRequest = async (requestId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('appointment_requests')
      .update({
        status: 'rejected'
      })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error);
    return false;
  }
};

export const fetchPublicAppointmentRequests = async (): Promise<AppointmentRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('appointment_requests')
      .select(`
        id,
        beneficiary_name,
        cpf,
        sus_number,
        status,
        appointment_date,
        appointment_time,
        professionals:professional_id (name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar solicitações públicas:', error);
    return [];
  }
};
