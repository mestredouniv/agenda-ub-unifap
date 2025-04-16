
import { ProfessionalHeaderProps } from "@/types/agenda";
import { NetworkStatus } from "@/components/NetworkStatus";

export const ProfessionalHeader = ({ professionalName }: ProfessionalHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Agenda: {professionalName}
        </h1>
      </div>
      <NetworkStatus showSuccessAlert={false} />
    </div>
  );
};
