import { useQuery } from "@tanstack/react-query";

interface TimeSlot {
  time: string;
  available: boolean;
}

export const DEFAULT_TIME_SLOTS = [
  { time: "08:00", available: true },
  { time: "09:00", available: true },
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
];

export const useAvailableSlots = (professionalId: string, date: Date | undefined) => {
  return useQuery({
    queryKey: ['availableSlots', professionalId, date],
    queryFn: async () => {
      // In a real application, this would fetch from an API
      // For now, we return the default time slots
      return DEFAULT_TIME_SLOTS;
    },
    enabled: !!professionalId && !!date,
  });
};