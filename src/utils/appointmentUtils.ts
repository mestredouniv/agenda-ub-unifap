
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
      return 'bg-red-500 hover:bg-red-600';
    case 'in_progress':
      return 'bg-green-500 hover:bg-green-600';
    default:
      return 'bg-blue-500 hover:bg-blue-600';
  }
};

export const getTriageButtonText = (status: string) => {
  switch (status) {
    case 'triage':
      return 'Triagem em andamento';
    case 'in_progress':
      return 'Triagem finalizada';
    default:
      return 'Iniciar triagem';
  }
};

export const getConsultButtonStyle = (status: string) => {
  if (status === 'in_progress') {
    return 'bg-orange-500 hover:bg-orange-600';
  }
  return 'bg-gray-500 hover:bg-gray-600';
};
