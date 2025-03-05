
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
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${date.getHours()}${date.getMinutes()}${random}`;
};

export const getTriageButtonStyle = (status: string) => {
  switch (status) {
    case 'triage':
      return 'bg-orange-500 hover:bg-orange-600'; // Triagem em andamento
    case 'in_progress':
    case 'completed':
    case 'missed':
    case 'rescheduled':
      return 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'; // Desabilitado
    default:
      return 'bg-blue-500 hover:bg-blue-600'; // Pronto para iniciar
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
      return 'bg-green-600 hover:bg-green-700'; // Consulta em andamento
    case 'waiting':
      return 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'; // Aguardando triagem
    case 'triage':
      return 'bg-blue-500 hover:bg-blue-600'; // Pronto para consulta
    default:
      return 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'; // Outros estados
  }
};

export const getConsultButtonText = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'Em consulta';
    case 'triage':
      return 'Chamar paciente';
    case 'waiting':
      return 'Aguardando triagem';
    default:
      return 'Aguardando';
  }
};
