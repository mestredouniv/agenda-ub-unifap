
export interface DisplayContent {
  id: string;
  type: 'text' | 'image' | 'youtube' | 'last_calls';
  content: string;
  display_order: number | null;
  display_time: number;
  active: boolean;
}

export interface DisplaySettings {
  id: string;
  rotation_mode: 'sequential' | 'random';
  is_edit_mode: boolean;
}
