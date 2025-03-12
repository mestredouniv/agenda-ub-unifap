
import { Appointment } from "@/types/appointment";

export const formatAppointmentData = (appointments: any[]): Appointment[] => {
  return appointments.map(appointment => ({
    ...appointment,
    room: appointment.room || null,
    block: appointment.block || null,
    ticket_number: appointment.ticket_number || null
  }));
};

export const generateTicketNumber = () => {
  const date = new Date();
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${randomLetter}${randomNumber}`;
};

export const getTriageButtonStyle = (status: string) => {
  switch (status) {
    case 'triage':
      return 'bg-orange-500 hover:bg-orange-600'; // Triagem em andamento (laranja)
    case 'in_progress':
    case 'completed':
    case 'missed':
    case 'rescheduled':
      return 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'; // Desabilitado
    default:
      return 'bg-blue-500 hover:bg-blue-600'; // Pronto para iniciar (azul)
  }
};

export const getTriageButtonText = (status: string) => {
  switch (status) {
    case 'triage':
      return 'Finalizar triagem';
    case 'in_progress':
      return 'Em consulta';
    case 'completed':
      return 'Consulta finalizada';
    case 'missed':
      return 'Paciente faltou';
    case 'rescheduled':
      return 'Reagendado';
    default:
      return 'Iniciar triagem';
  }
};

export const getConsultButtonStyle = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'bg-red-600 hover:bg-red-700'; // Em consulta (vermelho)
    case 'waiting':
      return 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'; // Desabilitado (aguardando triagem)
    case 'triage':
      return 'bg-green-500 hover:bg-green-600'; // Pronto para chamar paciente (verde - updated)
    case 'completed':
    case 'missed':
    case 'rescheduled':
      return 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'; // Desabilitado (finalizado/faltou/reagendado)
    default:
      return 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'; // Desabilitado (outros estados)
  }
};

export const getConsultButtonText = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'Finalizar consulta';
    case 'triage':
      return 'Chamar paciente';
    case 'waiting':
      return 'Aguardando triagem';
    default:
      return 'Aguardando';
  }
};

// New function to get default max appointments
export const getDefaultMaxAppointments = () => {
  return 10; // Allow up to 10 appointments per time slot
};
