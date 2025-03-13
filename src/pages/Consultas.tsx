
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
<<<<<<< HEAD
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

const handleDateChange = (date: Date | undefined) => {
  try {
    if (!date) {
      throw new Error('Data inválida');
    }
    setSelectedDate(date);
  } catch (error) {
    console.error('Erro ao alterar a data:', error);
    toast({
      title: 'Erro',
      description: 'Não foi possível alterar a data',
      variant: 'destructive',
    });
  }
};

  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar profissionais:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de profissionais",
          variant: "destructive",
        });
        return;
      }

      setProfessionals(data || []);
    };

    fetchProfessionals();
  }, [toast]);

  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
      }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProfessional, selectedDate]);
=======
  
  const { 
    appointments, 
    professionals, 
    isLoading,
    fetchAppointments 
  } = useConsultas(selectedProfessional, selectedDate);
>>>>>>> 3b55d426a400db89c431bf2ad80f68f921a3fcab

  return (
    <div className="container mx-auto p-4 md:p-8">
      <BackToHomeButton />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Consultas</h1>
<<<<<<< HEAD
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <Select
            value={selectedProfessional}
            onValueChange={setSelectedProfessional}
          >
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Filtrar por profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Profissionais</SelectItem>
              {professionals.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.name} - {prof.profession}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
=======
        <ConsultaFilters
          selectedProfessional={selectedProfessional}
          setSelectedProfessional={setSelectedProfessional}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          professionals={professionals}
        />
>>>>>>> 3b55d426a400db89c431bf2ad80f68f921a3fcab
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
