
import { supabase, retryOperation } from "@/integrations/supabase/client";
import { AppointmentRequest, AppointmentRequestFormData } from "@/types/appointmentRequest";

export const createAppointmentRequest = async (data: AppointmentRequestFormData): Promise<{ success: boolean; error?: string; id?: string }> => {
  try {
    console.log("Creating appointment request with data:", data);
    const { data: result, error } = await retryOperation(async () => {
      return supabase
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
    });

    if (error) throw error;
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    return { success: false, error: 'Não foi possível criar a solicitação. Por favor, tente novamente.' };
  }
};

export const fetchAppointmentRequests = async (): Promise<AppointmentRequest[]> => {
  try {
    console.log("Fetching all appointment requests");
    const { data, error } = await retryOperation(async () => {
      return supabase
        .from('appointment_requests')
        .select(`
          *,
          professionals:professional_id (name)
        `)
        .order('created_at', { ascending: false });
    });

    if (error) throw error;
    
    // Map the response to our AppointmentRequest type with the correct status type
    return (data || []).map(item => ({
      id: item.id,
      beneficiary_name: item.beneficiary_name,
      cpf: item.cpf,
      sus_number: item.sus_number,
      phone: item.phone,
      address: item.address,
      birth_date: item.birth_date,
      age: item.age,
      status: item.status as 'pending' | 'approved' | 'rejected',
      created_at: item.created_at,
      approved_at: item.approved_at,
      appointment_date: item.appointment_date,
      appointment_time: item.appointment_time,
      professional_id: item.professional_id,
      professional_name: item.professionals?.name
    }));
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
    console.log("Approving request:", requestId, appointmentDate, appointmentTime, professionalId);
    const { error } = await retryOperation(async () => {
      return supabase
        .from('appointment_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          professional_id: professionalId
        })
        .eq('id', requestId);
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error);
    return false;
  }
};

export const rejectAppointmentRequest = async (requestId: string): Promise<boolean> => {
  try {
    console.log("Rejecting request:", requestId);
    const { error } = await retryOperation(async () => {
      return supabase
        .from('appointment_requests')
        .update({
          status: 'rejected'
        })
        .eq('id', requestId);
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error);
    return false;
  }
};

export const fetchPublicAppointmentRequests = async (): Promise<AppointmentRequest[]> => {
  try {
    console.log("Fetching public appointment requests");
    const { data, error } = await retryOperation(async () => {
      return supabase
        .from('appointment_requests')
        .select(`
          id,
          beneficiary_name,
          cpf,
          sus_number,
          status,
          phone,
          address,
          birth_date,
          age,
          created_at,
          appointment_date,
          appointment_time,
          professionals:professional_id (name)
        `)
        .order('created_at', { ascending: false });
    });

    if (error) throw error;
    
    // Map the response to our AppointmentRequest type with the correct status
    return (data || []).map(item => ({
      id: item.id,
      beneficiary_name: item.beneficiary_name,
      cpf: item.cpf,
      sus_number: item.sus_number,
      phone: item.phone || '',
      address: item.address || '',
      birth_date: item.birth_date || '',
      age: item.age || 0,
      status: item.status as 'pending' | 'approved' | 'rejected',
      created_at: item.created_at,
      appointment_date: item.appointment_date,
      appointment_time: item.appointment_time,
      professional_id: undefined,
      professional_name: item.professionals?.name
    }));
  } catch (error) {
    console.error('Erro ao buscar solicitações públicas:', error);
    return [];
  }
};
