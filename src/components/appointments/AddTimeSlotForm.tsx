
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddTimeSlotFormProps {
  onAddTimeSlot: (timeSlot: string) => Promise<void>;
  newTimeSlot: string;
  setNewTimeSlot: (value: string) => void;
}

export const AddTimeSlotForm = ({
  onAddTimeSlot,
  newTimeSlot,
  setNewTimeSlot,
}: AddTimeSlotFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTimeSlot(newTimeSlot);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Adicionar horário (HH:MM)"
        value={newTimeSlot}
        onChange={(e) => setNewTimeSlot(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={!newTimeSlot}>
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
};
