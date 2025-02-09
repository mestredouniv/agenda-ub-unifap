
export interface Patient {
  id: string;
  full_name: string;
  address?: string;
  sus_number?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
}

export interface HanseniaseRecord {
  id: string;
  patient_id: string;
  pb: string;
  mb: string;
  classification: string;
  treatment_start_date: string;
}

export interface HanseniaseTreatment {
  id: string;
  record_id: string;
  treatment_month: number;
  treatment_date: string;
  treatment_status: string;
  notes?: string;
}
