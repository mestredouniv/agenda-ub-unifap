export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          active: boolean | null
          content: string
          created_at: string | null
          expires_at: string
          id: string
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string | null
          expires_at: string
          id?: string
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string | null
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      appointment_requests: {
        Row: {
          address: string
          age: number
          appointment_date: string | null
          appointment_time: string | null
          approved_at: string | null
          beneficiary_name: string
          birth_date: string
          cpf: string
          created_at: string
          id: string
          phone: string
          professional_id: string | null
          status: string
          sus_number: string
        }
        Insert: {
          address: string
          age: number
          appointment_date?: string | null
          appointment_time?: string | null
          approved_at?: string | null
          beneficiary_name: string
          birth_date: string
          cpf: string
          created_at?: string
          id?: string
          phone: string
          professional_id?: string | null
          status?: string
          sus_number: string
        }
        Update: {
          address?: string
          age?: number
          appointment_date?: string | null
          appointment_time?: string | null
          approved_at?: string | null
          beneficiary_name?: string
          birth_date?: string
          cpf?: string
          created_at?: string
          id?: string
          phone?: string
          professional_id?: string | null
          status?: string
          sus_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          appointment_date: string
          appointment_time: string
          birth_date: string
          block: string | null
          deleted_at: string | null
          display_status: Database["public"]["Enums"]["appointment_status"]
          has_record: string | null
          id: string
          is_minor: boolean
          notes: string | null
          patient_name: string
          phone: string
          priority: Database["public"]["Enums"]["appointment_priority"]
          professional_id: string
          responsible_name: string | null
          room: string | null
          ticket_number: string | null
          updated_at: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          appointment_date: string
          appointment_time: string
          birth_date: string
          block?: string | null
          deleted_at?: string | null
          display_status?: Database["public"]["Enums"]["appointment_status"]
          has_record?: string | null
          id?: string
          is_minor?: boolean
          notes?: string | null
          patient_name: string
          phone: string
          priority?: Database["public"]["Enums"]["appointment_priority"]
          professional_id: string
          responsible_name?: string | null
          room?: string | null
          ticket_number?: string | null
          updated_at?: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          appointment_date?: string
          appointment_time?: string
          birth_date?: string
          block?: string | null
          deleted_at?: string | null
          display_status?: Database["public"]["Enums"]["appointment_status"]
          has_record?: string | null
          id?: string
          is_minor?: boolean
          notes?: string | null
          patient_name?: string
          phone?: string
          priority?: Database["public"]["Enums"]["appointment_priority"]
          professional_id?: string
          responsible_name?: string | null
          room?: string | null
          ticket_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      childcare_consultations: {
        Row: {
          consultation_date: string | null
          created_at: string | null
          id: string
          notes: string | null
          professional_type: string | null
          record_id: string | null
          updated_at: string | null
        }
        Insert: {
          consultation_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          professional_type?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Update: {
          consultation_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          professional_type?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "childcare_consultations_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "childcare_records"
            referencedColumns: ["id"]
          },
        ]
      }
      childcare_records: {
        Row: {
          birth_type: string | null
          breastfeeding_type: string | null
          created_at: string | null
          ear_test: string | null
          eye_test: string | null
          heel_prick_test: string | null
          id: string
          mother_name: string | null
          patient_id: string | null
          updated_at: string | null
        }
        Insert: {
          birth_type?: string | null
          breastfeeding_type?: string | null
          created_at?: string | null
          ear_test?: string | null
          eye_test?: string | null
          heel_prick_test?: string | null
          id?: string
          mother_name?: string | null
          patient_id?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_type?: string | null
          breastfeeding_type?: string | null
          created_at?: string | null
          ear_test?: string | null
          eye_test?: string | null
          heel_prick_test?: string | null
          id?: string
          mother_name?: string | null
          patient_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "childcare_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      chronic_disease_followups: {
        Row: {
          created_at: string | null
          followup_date: string | null
          id: string
          notes: string | null
          record_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          followup_date?: string | null
          id?: string
          notes?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          followup_date?: string | null
          id?: string
          notes?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chronic_disease_followups_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "chronic_disease_records"
            referencedColumns: ["id"]
          },
        ]
      }
      chronic_disease_records: {
        Row: {
          comorbidities: string | null
          created_at: string | null
          has: string | null
          id: string
          medication: string | null
          patient_id: string | null
          updated_at: string | null
        }
        Insert: {
          comorbidities?: string | null
          created_at?: string | null
          has?: string | null
          id?: string
          medication?: string | null
          patient_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comorbidities?: string | null
          created_at?: string | null
          has?: string | null
          id?: string
          medication?: string | null
          patient_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chronic_disease_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      display_content: {
        Row: {
          active: boolean | null
          content: string
          created_at: string | null
          display_order: number | null
          display_time: number
          id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string | null
          display_order?: number | null
          display_time?: number
          id?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string | null
          display_order?: number | null
          display_time?: number
          id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      display_settings: {
        Row: {
          id: string
          is_edit_mode: boolean | null
          rotation_mode: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          is_edit_mode?: boolean | null
          rotation_mode?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          is_edit_mode?: boolean | null
          rotation_mode?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hanseniase_records: {
        Row: {
          classification: string | null
          created_at: string | null
          id: string
          mb: string | null
          patient_id: string | null
          pb: string | null
          treatment_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          classification?: string | null
          created_at?: string | null
          id?: string
          mb?: string | null
          patient_id?: string | null
          pb?: string | null
          treatment_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          classification?: string | null
          created_at?: string | null
          id?: string
          mb?: string | null
          patient_id?: string | null
          pb?: string | null
          treatment_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hanseniase_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hanseniase_treatments: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          record_id: string | null
          treatment_date: string | null
          treatment_month: number | null
          treatment_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          record_id?: string | null
          treatment_date?: string | null
          treatment_month?: number | null
          treatment_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          record_id?: string | null
          treatment_date?: string | null
          treatment_month?: number | null
          treatment_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hanseniase_treatments_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "hanseniase_records"
            referencedColumns: ["id"]
          },
        ]
      }
      last_calls: {
        Row: {
          called_at: string | null
          id: string
          patient_name: string
          professional_name: string
          status: string
        }
        Insert: {
          called_at?: string | null
          id?: string
          patient_name: string
          professional_name: string
          status: string
        }
        Update: {
          called_at?: string | null
          id?: string
          patient_name?: string
          professional_name?: string
          status?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string
          birth_date: string
          cep: string
          city: string
          cpf: string | null
          created_at: string | null
          full_name: string
          id: string
          neighborhood: string
          phone: string | null
          sus_number: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          birth_date: string
          cep?: string
          city?: string
          cpf?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          neighborhood?: string
          phone?: string | null
          sus_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          birth_date?: string
          cep?: string
          city?: string
          cpf?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          neighborhood?: string
          phone?: string | null
          sus_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prenatal_consultations: {
        Row: {
          consultation_date: string | null
          created_at: string | null
          id: string
          notes: string | null
          professional_type: string | null
          record_id: string | null
          updated_at: string | null
        }
        Insert: {
          consultation_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          professional_type?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Update: {
          consultation_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          professional_type?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prenatal_consultations_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "prenatal_records"
            referencedColumns: ["id"]
          },
        ]
      }
      prenatal_records: {
        Row: {
          created_at: string | null
          dpp: string | null
          dum: string | null
          enf: string | null
          gpa: string | null
          id: string
          ig: string | null
          patient_id: string | null
          puerperio: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dpp?: string | null
          dum?: string | null
          enf?: string | null
          gpa?: string | null
          id?: string
          ig?: string | null
          patient_id?: string | null
          puerperio?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dpp?: string | null
          dum?: string | null
          enf?: string | null
          gpa?: string | null
          id?: string
          ig?: string | null
          patient_id?: string | null
          puerperio?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prenatal_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_followups: {
        Row: {
          created_at: string | null
          followup_date: string | null
          id: string
          notes: string | null
          record_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          followup_date?: string | null
          id?: string
          notes?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          followup_date?: string | null
          id?: string
          notes?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prep_followups_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "prep_records"
            referencedColumns: ["id"]
          },
        ]
      }
      prep_records: {
        Row: {
          annual_creatinine: string | null
          comorbidities: string | null
          created_at: string | null
          id: string
          patient_id: string | null
          updated_at: string | null
        }
        Insert: {
          annual_creatinine?: string | null
          comorbidities?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_creatinine?: string | null
          comorbidities?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prep_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_available_months: {
        Row: {
          created_at: string | null
          id: string
          month: number
          professional_id: string
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: number
          professional_id: string
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: number
          professional_id?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "professional_available_months_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_available_slots: {
        Row: {
          created_at: string
          id: string
          max_appointments: number
          professional_id: string
          time_slot: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_appointments?: number
          professional_id: string
          time_slot: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_appointments?: number
          professional_id?: string
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_available_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_unavailable_days: {
        Row: {
          created_at: string
          date: string
          id: string
          professional_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          professional_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_unavailable_days_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          created_at: string | null
          id: string
          name: string
          profession: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          profession: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          profession?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tuberculosis_followups: {
        Row: {
          bacilloscopy_result: string | null
          created_at: string | null
          followup_month: number | null
          id: string
          notes: string | null
          record_id: string | null
          updated_at: string | null
        }
        Insert: {
          bacilloscopy_result?: string | null
          created_at?: string | null
          followup_month?: number | null
          id?: string
          notes?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bacilloscopy_result?: string | null
          created_at?: string | null
          followup_month?: number | null
          id?: string
          notes?: string | null
          record_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tuberculosis_followups_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "tuberculosis_records"
            referencedColumns: ["id"]
          },
        ]
      }
      tuberculosis_records: {
        Row: {
          baar_diag_1: string | null
          baar_diag_2: string | null
          clinical_form: string | null
          closing_date: string | null
          closing_reason: string | null
          contacts_examined: number | null
          contacts_registered: number | null
          created_at: string | null
          histopathology: string | null
          hiv_status: string | null
          id: string
          observations: string | null
          other_culture: string | null
          other_exams: string | null
          patient_id: string | null
          ppd: string | null
          rifampicin_sensitive: boolean | null
          sputum_culture: string | null
          treatment_scheme: string | null
          treatment_start_date: string | null
          treatment_type: string | null
          updated_at: string | null
          xray: string | null
        }
        Insert: {
          baar_diag_1?: string | null
          baar_diag_2?: string | null
          clinical_form?: string | null
          closing_date?: string | null
          closing_reason?: string | null
          contacts_examined?: number | null
          contacts_registered?: number | null
          created_at?: string | null
          histopathology?: string | null
          hiv_status?: string | null
          id?: string
          observations?: string | null
          other_culture?: string | null
          other_exams?: string | null
          patient_id?: string | null
          ppd?: string | null
          rifampicin_sensitive?: boolean | null
          sputum_culture?: string | null
          treatment_scheme?: string | null
          treatment_start_date?: string | null
          treatment_type?: string | null
          updated_at?: string | null
          xray?: string | null
        }
        Update: {
          baar_diag_1?: string | null
          baar_diag_2?: string | null
          clinical_form?: string | null
          closing_date?: string | null
          closing_reason?: string | null
          contacts_examined?: number | null
          contacts_registered?: number | null
          created_at?: string | null
          histopathology?: string | null
          hiv_status?: string | null
          id?: string
          observations?: string | null
          other_culture?: string | null
          other_exams?: string | null
          patient_id?: string | null
          ppd?: string | null
          rifampicin_sensitive?: boolean | null
          sputum_culture?: string | null
          treatment_scheme?: string | null
          treatment_start_date?: string | null
          treatment_type?: string | null
          updated_at?: string | null
          xray?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tuberculosis_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_priority: "normal" | "priority"
      appointment_status:
        | "waiting"
        | "triage"
        | "in_progress"
        | "completed"
        | "missed"
        | "rescheduled"
        | "triage_completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
