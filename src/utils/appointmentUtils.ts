
import { Appointment } from "@/types/appointment";

export const formatAppointmentData = (data: any[]): Appointment[] => {
  if (!Array.isArray(data)) {
    console.error('[Agenda] Dados inválidos recebidos:', data);
    return [];
  }

  return data.map(item => {
    try {
      const appointment: Appointment = {
        id: item.id,
        patient_name: item.patient_name || '',
        birth_date: item.birth_date || '',
        professional_id: item.professional_id || '',
        professional: {
          name: item.professionals?.name || ''
        },
        appointment_date: item.appointment_date || '',
        appointment_time: item.appointment_time || '',
        display_status: item.display_status || 'waiting',
        priority: item.priority || 'normal',
        notes: item.notes || null,
        actual_start_time: item.actual_start_time || null,
        actual_end_time: item.actual_end_time || null,
        updated_at: item.updated_at || null,
        deleted_at: item.deleted_at || null,
        is_minor: Boolean(item.is_minor),
        responsible_name: item.responsible_name || null,
        has_record: item.has_record || null,
        phone: item.phone || ''
      };

      console.log('[Agenda] Appointment formatado:', appointment);
      return appointment;
    } catch (error) {
      console.error('[Agenda] Erro ao formatar appointment:', { error, item });
      throw error;
    }
  });
};
