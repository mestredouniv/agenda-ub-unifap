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
      // Aqui você pode integrar com sua API real
      // Por enquanto, retornamos dados de exemplo
      const storedSlots = localStorage.getItem(`slots-${professionalId}`);
      return storedSlots ? JSON.parse(storedSlots) : DEFAULT_TIME_SLOTS;
    },
    enabled: !!professionalId && !!date,
  });

  const updateSlotsMutation = useMutation({
    mutationFn: async (newSlots: TimeSlot[]) => {
      // Aqui você pode integrar com sua API real
      localStorage.setItem(`slots-${professionalId}`, JSON.stringify(newSlots));
      return newSlots;
    },
    onSuccess: (newSlots) => {
      queryClient.setQueryData(['availableSlots', professionalId, date], newSlots);
    },
  });

  return {
    slots: slotsQuery.data,
    isLoading: slotsQuery.isLoading,
    updateSlots: updateSlotsMutation.mutate,
  };
};