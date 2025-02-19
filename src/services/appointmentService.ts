
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointments";

export const fetchTodayAppointments = async (professionalId: string) => {
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

  return query
    .order('priority', { ascending: false })
    .order('appointment_time', { ascending: true });
};

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'professional'>) => {
  return supabase
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
};

export const updateAppointment = async (id: string, updateData: Partial<Appointment>) => {
  return supabase
    .from('appointments')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
};
