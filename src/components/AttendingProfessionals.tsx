import { Card } from "@/components/ui/card";
import { UserRound } from "lucide-react";
import { format, addDays } from "date-fns";

interface Professional {
  id: number;
  name: string;
  profession: string;
  schedules?: {
    date: Date;
    appointments: number;
  }[];
}

interface AttendingProfessionalsProps {
  professionals: Professional[];
}

export const AttendingProfessionals = ({ professionals }: AttendingProfessionalsProps) => {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  const todaysProfessionals = professionals.filter(prof => 
    prof.schedules?.some(schedule => 
      format(schedule.date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
    )
  );

  const tomorrowsProfessionals = professionals.filter(prof => 
    prof.schedules?.some(schedule => 
      format(schedule.date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")
    )
  );

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profissionais em Atendimento</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              Hoje ({format(today, "dd/MM")})
            </h3>
            <div className="space-y-2">
              {todaysProfessionals.map((prof) => (
                <div key={prof.id} className="flex items-center gap-2 text-sm">
                  <UserRound className="h-4 w-4 text-primary" />
                  <span>{prof.name}</span>
                  <span className="text-gray-500">({prof.profession})</span>
                  {prof.schedules && (
                    <span className="text-gray-500 ml-auto">
                      {prof.schedules.find(s => 
                        format(s.date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
                      )?.appointments || 0} consultas
                    </span>
                  )}
                </div>
              ))}
              {todaysProfessionals.length === 0 && (
                <div className="text-sm text-gray-500">
                  Nenhum profissional agendado para hoje
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              Amanhã ({format(tomorrow, "dd/MM")})
            </h3>
            <div className="space-y-2">
              {tomorrowsProfessionals.map((prof) => (
                <div key={prof.id} className="flex items-center gap-2 text-sm">
                  <UserRound className="h-4 w-4 text-primary" />
                  <span>{prof.name}</span>
                  <span className="text-gray-500">({prof.profession})</span>
                  {prof.schedules && (
                    <span className="text-gray-500 ml-auto">
                      {prof.schedules.find(s => 
                        format(s.date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")
                      )?.appointments || 0} consultas
                    </span>
                  )}
                </div>
              ))}
              {tomorrowsProfessionals.length === 0 && (
                <div className="text-sm text-gray-500">
                  Nenhum profissional agendado para amanhã
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};