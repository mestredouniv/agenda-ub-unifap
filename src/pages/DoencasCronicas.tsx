import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackToHomeButton } from "@/components/BackToHomeButton";

interface ChronicDiseaseEntry {
  date: Date;
  has: string;
  medication: string;
  comorbidities: string;
}

const DoencasCronicas = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<ChronicDiseaseEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState({
    has: "",
    medication: "",
    comorbidities: "",
  });

  const handleSaveEntry = () => {
    if (date) {
      setEntries([...entries, { ...currentEntry, date }]);
      setCurrentEntry({ has: "", medication: "", comorbidities: "" });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <BackToHomeButton />
      <h1 className="text-2xl font-bold mb-6">Doenças Crônicas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="has">HAS (Hipertensão Arterial Sistêmica)</Label>
              <Input
                id="has"
                value={currentEntry.has}
                onChange={(e) =>
                  setCurrentEntry({ ...currentEntry, has: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="medication">Medicação</Label>
              <Input
                id="medication"
                value={currentEntry.medication}
                onChange={(e) =>
                  setCurrentEntry({ ...currentEntry, medication: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="comorbidities">Comorbidades</Label>
              <Input
                id="comorbidities"
                value={currentEntry.comorbidities}
                onChange={(e) =>
                  setCurrentEntry({
                    ...currentEntry,
                    comorbidities: e.target.value,
                  })
                }
              />
            </div>
            <button
              onClick={handleSaveEntry}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              Salvar Registro
            </button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">HAS</th>
                    <th className="text-left p-2">Medicação</th>
                    <th className="text-left p-2">Comorbidades</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        {entry.date.toLocaleDateString()}
                      </td>
                      <td className="p-2">{entry.has}</td>
                      <td className="p-2">{entry.medication}</td>
                      <td className="p-2">{entry.comorbidities}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoencasCronicas;