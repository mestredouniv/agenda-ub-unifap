
export interface AppointmentRequest {
  id: string;
  beneficiary_name: string;
  cpf: string;
  sus_number: string;
  phone: string;
  address: string;
  birth_date: string;
  age: number;
  status: 'pending' | 'approved' | 'rejected';
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
