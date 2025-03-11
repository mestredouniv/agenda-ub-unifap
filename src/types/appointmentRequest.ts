
export interface AppointmentRequest {
  id: string;
  beneficiary_name: string;
  cpf: string;
  sus_number: string;
  phone: string;
  address: string;
  birth_date: string;
  age: number;
  status: string; // Changed from enum to string to match database
  created_at: string;
  approved_at?: string;
  appointment_date?: string;
  appointment_time?: string;
  professional_id?: string;
  professional_name?: string;
}

export interface AppointmentRequestFormData {
  beneficiary_name: string;
  cpf: string;
  sus_number: string;
  phone: string;
  address: string;
  birth_date: string;
  age: number;
}
