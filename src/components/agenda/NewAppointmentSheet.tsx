
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NovoAgendamento } from "@/components/NovoAgendamento";

interface NewAppointmentSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  onSuccess: () => void;
}

export const NewAppointmentSheet = ({
  isOpen,
  onOpenChange,
  professionalId,
  onSuccess
}: NewAppointmentSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Novo Agendamento</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <NovoAgendamento
            professionalId={professionalId}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
