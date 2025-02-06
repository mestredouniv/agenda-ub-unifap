
export interface Professional {
  id: string;
  name: string;
  profession: string;
  created_at?: string;
  updated_at?: string;
  schedules?: {
    date: Date;
    appointments: number;
  }[];
}
