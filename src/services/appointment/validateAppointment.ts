
import { Appointment } from "@/types/appointment";

export const validateAppointmentData = (appointmentData: Omit<Appointment, 'id' | 'professionals'>) => {
  // Validações básicas
  if (!appointmentData.patient_name?.trim() || 
      !appointmentData.appointment_date || 
      !appointmentData.appointment_time || 
      !appointmentData.phone?.trim()) {
    throw new Error('Campos obrigatórios incompletos');
  }

  // Validar data do agendamento
  const appointmentDate = new Date(appointmentData.appointment_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (appointmentDate < today) {
    throw new Error('Data do agendamento não pode ser no passado');
  }

  // Validar formato da data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentData.appointment_date)) {
    throw new Error('Formato de data inválido');
  }

  // Validar formato do horário
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(appointmentData.appointment_time)) {
    throw new Error('Formato de horário inválido');
  }
};
