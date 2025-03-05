export interface AgendaSidebarProps {
  appointments: number;
  nextAppointmentTime: string;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  onNewAppointmentClick: () => void;
  onUnavailableDaysClick: () => void;
  availableMonths: { month: number; year: number }[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export interface AppointmentListProps {
  appointments: Appointment[];
  viewMode: 'list' | 'grid';
  onSuccess: () => void;
  isLoading: boolean;
}

export interface ProfessionalHeaderProps {
  professionalName: string;
}

export interface AgendaState {
  viewMode: 'list' | 'grid';
  isNewAppointmentOpen: boolean;
  isUnavailableDaysOpen: boolean;
  professionalName: string;
  availableMonths: { month: number; year: number }[];
  selectedMonth: string;
}

import { Appointment } from "./appointment";
