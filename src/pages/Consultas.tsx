import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useConsultas } from "@/hooks/useConsultas";
import { ConsultaFilters } from "@/components/consultas/ConsultaFilters";
import { ConsultasTable } from "@/components/consultas/ConsultasTable";
import { ConsultasMobileView } from "@/components/consultas/ConsultasMobileView";

const Consultas = () => {
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { 
    appointments, 
    professionals, 
    isLoading,
    fetchAppointments 
  } = useConsultas(selectedProfessional, selectedDate);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <BackToHomeButton />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Consultas</h1>
        <ConsultaFilters
          selectedProfessional={selectedProfessional}
          setSelectedProfessional={setSelectedProfessional}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          professionals={professionals}
        />
      </div>
      
      {/* Mobile view */}
      <div className="md:hidden">
        <ConsultasMobileView 
          appointments={appointments} 
          isLoading={isLoading}
          onSuccess={fetchAppointments}
        />
      </div>

      {/* Desktop view */}
      <div className="hidden md:block bg-white rounded-lg shadow">
        <ConsultasTable 
          appointments={appointments} 
          onSuccess={fetchAppointments}
        />
      </div>
    </div>
  );
};

export default Consultas;
