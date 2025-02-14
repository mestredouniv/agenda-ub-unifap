
export interface Appointment {
  id: string;
  patient_name: string;
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
  deleted_at?: string | null;
  updated_at?: string;
}
