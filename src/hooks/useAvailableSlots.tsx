import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TimeSlot {
  time: string;
  available: boolean;
}

const DEFAULT_TIME_SLOTS = [
  { time: "08:00", available: true },
  { time: "09:00", available: true },
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
];

export const useAvailableSlots = (professionalId: string, date: Date | undefined) => {
  const queryClient = useQueryClient();

  const slotsQuery = useQuery({
    queryKey: ['availableSlots', professionalId, date],
    queryFn: async () => {
      // Busca os slots do localStorage
      const storedSlots = localStorage.getItem(`slots-${professionalId}`);
      const slots = storedSlots ? JSON.parse(storedSlots) : DEFAULT_TIME_SLOTS;
      
      // Retorna apenas os slots disponíveis
      return slots.filter((slot: TimeSlot) => slot.available);
    },
    enabled: !!professionalId && !!date,
  });

  const updateSlotsMutation = useMutation({
    mutationFn: async (newSlots: TimeSlot[]) => {
      localStorage.setItem(`slots-${professionalId}`, JSON.stringify(newSlots));
      return newSlots;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSlots', professionalId] });
    },
  });

  return {
    slots: slotsQuery.data || DEFAULT_TIME_SLOTS,
    isLoading: slotsQuery.isLoading,
    updateSlots: updateSlotsMutation.mutate,
  };
};