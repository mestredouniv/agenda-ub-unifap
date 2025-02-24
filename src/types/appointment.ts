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
  display_status: 'waiting' | 'triage' | 'in_progress' | 'completed' | 'missed' | 'rescheduled';
  priority: 'priority' | 'normal';
  notes?: string | null;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  is_minor: boolean;
  responsible_name: string | null;
  has_record: string | null;
  phone: string;
  room?: string | null;
  block?: string | null;
  ticket_number?: string | null;
}

export interface PersonalDataFormProps {
  formData: {
    patientName: string;
    cpf: string;
    sus: string;
    age: string;
    phone: string;
    birth_date?: string;
    responsible?: string;
  };
  onChange: (field: string, value: any) => void;
  errors?: Record<string, boolean>;
}

export interface BasicPersonalData {
  patientName: string;
  birthDate: string;
  cpf: string;
  sus: string;
  age: string;
  phone: string;
  responsible?: string;
}
