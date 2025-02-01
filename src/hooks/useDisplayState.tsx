import { create } from 'zustand';

interface DisplayState {
  currentPatient: {
    name: string;
    status: 'waiting' | 'triage' | 'in_progress' | null;
    professional: string;
  } | null;
  setCurrentPatient: (patient: DisplayState['currentPatient']) => void;
}

export const useDisplayState = create<DisplayState>((set) => ({
  currentPatient: null,
  setCurrentPatient: (patient) => set({ currentPatient: patient }),
}));