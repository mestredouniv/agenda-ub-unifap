
interface ProfessionalHeaderProps {
  professionalName: string;
}

export const ProfessionalHeader = ({ professionalName }: ProfessionalHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">
        Agenda: {professionalName}
      </h1>
    </div>
  );
};
