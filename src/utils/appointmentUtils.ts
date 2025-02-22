
import { Appointment } from "@/types/appointment";

export const formatAppointmentData = (data: any[]): Appointment[] => {
  console.log('[appointmentUtils] Formatando dados:', data);
  
  return data.map(item => {
    const status = item.display_status as Appointment['display_status'] || 'waiting';
    const priority = item.priority as Appointment['priority'] || 'normal';
    
    const formattedAppointment = {
      id: item.id,
      patient_name: item.patient_name,
      birth_date: item.birth_date,
      professional_id: item.professional_id,
      professional: {
        name: item.professionals?.name || ''
      },
      appointment_date: item.appointment_date,
      appointment_time: item.appointment_time,
      display_status: status,
      priority: priority,
      notes: item.notes,
      actual_start_time: item.actual_start_time,
      actual_end_time: item.actual_end_time,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
      is_minor: item.is_minor || false,
      responsible_name: item.responsible_name || null,
      has_record: item.has_record || null,
      phone: item.phone || ''
    };

    console.log('[appointmentUtils] Appointment formatado:', formattedAppointment);
    return formattedAppointment;
  });
};
