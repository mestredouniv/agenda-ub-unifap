
export interface Appointment {
  id: string;
  patient_name: string;
  birth_date: string;
  professional_id: string;
  appointment_date: string;
  appointment_time: string;
  display_status: 'waiting' | 'triage' | 'in_progress' | 'completed' | 'missed' | 'rescheduled';
  priority: 'priority' | 'normal';
  is_minor: boolean;
  responsible_name: string | null;
  has_record: string | null;
  notes?: string | null;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  phone: string;
  room?: string | null;
  block?: string | null;
  ticket_number?: string | null;
  professional_name?: string; // Nome do profissional vem como campo calculado
}
