import { useQuery } from "@tanstack/react-query";

interface TimeSlot {
  time: string;
  available: boolean;
}

export const useAvailableSlots = (professionalId: string, date: Date | undefined) => {
  return useQuery({
    queryKey: ['availableSlots', professionalId, date],
    queryFn: async () => {
      // Aqui você pode integrar com sua API real
      // Por enquanto, retornamos dados de exemplo
      const slots: TimeSlot[] = [
        { time: '08:00', available: true },
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: false },
      ];
      
      return slots;
    },
    enabled: !!professionalId && !!date,
  });
};