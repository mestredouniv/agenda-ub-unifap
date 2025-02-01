import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TimeSlot {
  time: string;
  available: boolean;
  maxAppointments?: number;
  currentAppointments?: number;
}

const DEFAULT_TIME_SLOTS = [
  { time: "08:00", available: true, maxAppointments: 3, currentAppointments: 0 },
  { time: "09:00", available: true, maxAppointments: 3, currentAppointments: 0 },
  { time: "10:00", available: true, maxAppointments: 3, currentAppointments: 0 },
  { time: "11:00", available: true, maxAppointments: 3, currentAppointments: 0 },
  { time: "14:00", available: true, maxAppointments: 3, currentAppointments: 0 },
  { time: "15:00", available: true, maxAppointments: 3, currentAppointments: 0 },
];

export const useAvailableSlots = (professionalId: string, date: Date | undefined) => {
  const queryClient = useQueryClient();

  const slotsQuery = useQuery({
    queryKey: ['availableSlots', professionalId, date?.toISOString()],
    queryFn: async () => {
      if (!professionalId || !date) return DEFAULT_TIME_SLOTS;

      // Busca os slots do localStorage
      const storedSlots = localStorage.getItem(`slots-${professionalId}`);
      const slots = storedSlots ? JSON.parse(storedSlots) : DEFAULT_TIME_SLOTS;
      
      // Busca os dias indisponíveis do profissional
      const unavailableDays = JSON.parse(localStorage.getItem(`unavailableDays-${professionalId}`) || '[]');
      
      // Verifica se a data selecionada está nos dias indisponíveis
      const isDateUnavailable = unavailableDays.some((unavailableDate: string) => 
        new Date(unavailableDate).toDateString() === date.toDateString()
      );

      // Se a data estiver indisponível, retorna todos os slots como indisponíveis
      if (isDateUnavailable) {
        return slots.map((slot: TimeSlot) => ({ ...slot, available: false }));
      }

      // Busca os agendamentos existentes para atualizar o contador
      const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
      const dateStr = date.toISOString().split('T')[0];
      
      return slots.map((slot: TimeSlot) => {
        const slotAppointments = appointments.filter((app: any) => 
          app.professionalId === professionalId &&
          app.preferredDate.split('T')[0] === dateStr &&
          app.preferredTime === slot.time
        ).length;

        return {
          ...slot,
          currentAppointments: slotAppointments,
          available: slot.available && (slotAppointments < (slot.maxAppointments || 3))
        };
      });
    },
    enabled: !!professionalId,
  });

  const updateSlotsMutation = useMutation({
    mutationFn: async (newSlots: TimeSlot[]) => {
      if (!professionalId) return;
      localStorage.setItem(`slots-${professionalId}`, JSON.stringify(newSlots));
      return newSlots;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSlots', professionalId] });
    },
  });

  const updateUnavailableDays = useMutation({
    mutationFn: async (days: Date[]) => {
      if (!professionalId) return;
      localStorage.setItem(`unavailableDays-${professionalId}`, JSON.stringify(days.map(d => d.toISOString())));
      return days;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSlots', professionalId] });
    },
  });

  return {
    slots: slotsQuery.data || DEFAULT_TIME_SLOTS,
    isLoading: slotsQuery.isLoading,
    updateSlots: updateSlotsMutation.mutate,
    updateUnavailableDays: updateUnavailableDays.mutate,
  };
};