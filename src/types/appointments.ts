
export interface Appointment {
  id: string;
  patient_name: string;
  birth_date: string;
  professional_id: string;
  professional: {
    name: string;
  };
  appointment_date: string;
  appointment_time: string;
  display_status: 'waiting' | 'triage' | 'in_progress' | 'completed';
  priority: 'priority' | 'normal';
  notes?: string;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface AppointmentResponse {
  data: Appointment[] | null;
  error: Error | null;
}
