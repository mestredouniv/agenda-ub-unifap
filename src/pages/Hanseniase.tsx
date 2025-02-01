import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ptBR } from "date-fns/locale";

const Hanseniase = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    has: "",
    medication: "",
    comorbidities: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hanseníase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="has">HAS (Hipertensão Arterial Sistêmica)</Label>
                <Input
                  id="has"
                  value={formData.has}
                  onChange={(e) => handleInputChange("has", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="medication">Medicação</Label>
                <Input
                  id="medication"
                  value={formData.medication}
                  onChange={(e) => handleInputChange("medication", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="comorbidities">Comorbidades</Label>
                <Textarea
                  id="comorbidities"
                  value={formData.comorbidities}
                  onChange={(e) => handleInputChange("comorbidities", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Anotações para a data selecionada</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Calendário de Acompanhamento</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="rounded-md border"
                fromDate={new Date()}
                toDate={new Date(new Date().getFullYear(), 11, 31)}
              />
              {selectedDate && (
                <p className="text-sm text-muted-foreground">
                  Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Hanseniase;