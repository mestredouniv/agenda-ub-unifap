
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { UnavailableDaysSelector } from "@/components/UnavailableDaysSelector";

interface UnavailableDaysDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  onSuccess: () => void;
}

export const UnavailableDaysDialog = ({
  isOpen,
  onOpenChange,
  professionalId,
  onSuccess
}: UnavailableDaysDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Organizar Meus Horários</DialogTitle>
          <DialogDescription>
            Selecione os dias em que você não estará disponível para atendimento
          </DialogDescription>
        </DialogHeader>
        <UnavailableDaysSelector
          professionalId={professionalId}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
