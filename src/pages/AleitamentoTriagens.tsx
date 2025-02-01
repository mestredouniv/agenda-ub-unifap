import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BackToHomeButton } from "@/components/BackToHomeButton";

interface ScreeningRecord {
  id: number;
  name: string;
  motherName: string;
  identification: string;
  phone: string;
  birthDate: string;
  birthType: string;
  exclusiveBreastfeeding: string;
  predisposition: string;
  complications: string;
  form: string;
  heelPrick: string;
  eyeTest: string;
  hearingTest: string;
  nurse: string;
  doctor1: string;
  nurseDoctor1: string;
  doctor2: string;
  nurseDoctor2: string;
  nutritionist: string;
  doctor3: string;
  nurseDoctor3: string;
  nurseDoctor4: string;
  nurseDoctor5: string;
  nurseDoctor6: string;
  month1: string;
  month2: string;
  month4: string;
  month6: string;
  month9: string;
  year1: string;
  year2: string;
  year3: string;
  year4: string;
  year5: string;
}

const AleitamentoTriagens = () => {
  const [records, setRecords] = useState<ScreeningRecord[]>([]);
  const [newRecord, setNewRecord] = useState<Partial<ScreeningRecord>>({});

  const handleInputChange = (field: keyof ScreeningRecord, value: string) => {
    setNewRecord((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRecord = () => {
    if (newRecord.name && newRecord.motherName) {
      setRecords([
        ...records,
        { ...newRecord, id: records.length + 1 } as ScreeningRecord,
      ]);
      setNewRecord({});
    }
  };

  return (
    <div className="container mx-auto p-6">
      <BackToHomeButton />
      <h1 className="text-2xl font-bold mb-6">Aleitamento e Triagens</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Novo Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newRecord.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="motherName">Nome da Mãe</Label>
              <Input
                id="motherName"
                value={newRecord.motherName || ""}
                onChange={(e) => handleInputChange("motherName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="identification">CNS/CPF</Label>
              <Input
                id="identification"
                value={newRecord.identification || ""}
                onChange={(e) => handleInputChange("identification", e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleAddRecord}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Adicionar Registro
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ORD.</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nome da Mãe</TableHead>
                  <TableHead>CNS/CPF</TableHead>
                  <TableHead>TEL</TableHead>
                  <TableHead>DN</TableHead>
                  <TableHead>Tipo de Parto</TableHead>
                  <TableHead>AME</TableHead>
                  <TableHead>PRED.</TableHead>
                  <TableHead>COMP.</TableHead>
                  <TableHead>FORM.</TableHead>
                  <TableHead>Pezinho</TableHead>
                  <TableHead>Olhinho</TableHead>
                  <TableHead>Orelhinha</TableHead>
                  <TableHead>ENF.</TableHead>
                  <TableHead>MÉDICO (1)</TableHead>
                  <TableHead>MED/ENF (1)</TableHead>
                  <TableHead>MÉDICO (2)</TableHead>
                  <TableHead>MED/ENF (2)</TableHead>
                  <TableHead>NUTRI.</TableHead>
                  <TableHead>MÉDICO (3)</TableHead>
                  <TableHead>MED/ENF (3)</TableHead>
                  <TableHead>MED/ENF (4)</TableHead>
                  <TableHead>MED/ENF (5)</TableHead>
                  <TableHead>MED/ENF (6)</TableHead>
                  <TableHead>1 MÊS</TableHead>
                  <TableHead>2 MESES</TableHead>
                  <TableHead>4 MESES</TableHead>
                  <TableHead>6 MESES</TableHead>
                  <TableHead>9 MESES</TableHead>
                  <TableHead>1 ANO</TableHead>
                  <TableHead>2 ANOS</TableHead>
                  <TableHead>3 ANOS</TableHead>
                  <TableHead>4 ANOS</TableHead>
                  <TableHead>5 ANOS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.motherName}</TableCell>
                    <TableCell>{record.identification}</TableCell>
                    <TableCell>{record.phone}</TableCell>
                    <TableCell>{record.birthDate}</TableCell>
                    <TableCell>{record.birthType}</TableCell>
                    <TableCell>{record.exclusiveBreastfeeding}</TableCell>
                    <TableCell>{record.predisposition}</TableCell>
                    <TableCell>{record.complications}</TableCell>
                    <TableCell>{record.form}</TableCell>
                    <TableCell>{record.heelPrick}</TableCell>
                    <TableCell>{record.eyeTest}</TableCell>
                    <TableCell>{record.hearingTest}</TableCell>
                    <TableCell>{record.nurse}</TableCell>
                    <TableCell>{record.doctor1}</TableCell>
                    <TableCell>{record.nurseDoctor1}</TableCell>
                    <TableCell>{record.doctor2}</TableCell>
                    <TableCell>{record.nurseDoctor2}</TableCell>
                    <TableCell>{record.nutritionist}</TableCell>
                    <TableCell>{record.doctor3}</TableCell>
                    <TableCell>{record.nurseDoctor3}</TableCell>
                    <TableCell>{record.nurseDoctor4}</TableCell>
                    <TableCell>{record.nurseDoctor5}</TableCell>
                    <TableCell>{record.nurseDoctor6}</TableCell>
                    <TableCell>{record.month1}</TableCell>
                    <TableCell>{record.month2}</TableCell>
                    <TableCell>{record.month4}</TableCell>
                    <TableCell>{record.month6}</TableCell>
                    <TableCell>{record.month9}</TableCell>
                    <TableCell>{record.year1}</TableCell>
                    <TableCell>{record.year2}</TableCell>
                    <TableCell>{record.year3}</TableCell>
                    <TableCell>{record.year4}</TableCell>
                    <TableCell>{record.year5}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AleitamentoTriagens;