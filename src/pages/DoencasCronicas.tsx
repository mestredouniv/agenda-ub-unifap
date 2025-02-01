// Same structure as PreNatal.tsx, just change the title to "Doenças Crônicas" and the download filename to "doencas-cronicas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { Download, Printer, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PatientRecord {
  id: string;
  nome: string;
  cns: string;
  tel: string;
  dn: string;
  dm: string;
  has: string;
  medication: string;
  comorbidities: string;
  notes: string;
}

const DoencasCronicas = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [formData, setFormData] = useState<Omit<PatientRecord, 'id'>>({
    nome: "",
    cns: "",
    tel: "",
    dn: "",
    dm: "",
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

  const handleAddRecord = () => {
    const newRecord: PatientRecord = {
      id: crypto.randomUUID(),
      ...formData,
    };
    setRecords(prev => [...prev, newRecord]);
    setFormData({
      nome: "",
      cns: "",
      tel: "",
      dn: "",
      dm: "",
      has: "",
      medication: "",
      comorbidities: "",
      notes: "",
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const data = JSON.stringify(formData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `doencas-cronicas-${selectedDate ? selectedDate.toISOString().split('T')[0] : 'dados'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dados Doenças Crônicas',
          text: JSON.stringify(formData, null, 2),
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackToHomeButton />
      <ConsultaHeader />
      
      <div className="flex gap-2 mb-4">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2" />
          Imprimir
        </Button>
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2" />
          Baixar
        </Button>
        <Button onClick={handleShare} variant="outline">
          <Share2 className="mr-2" />
          Compartilhar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doenças Crônicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cns">CNS</Label>
                  <Input
                    id="cns"
                    value={formData.cns}
                    onChange={(e) => handleInputChange("cns", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tel">Telefone</Label>
                  <Input
                    id="tel"
                    value={formData.tel}
                    onChange={(e) => handleInputChange("tel", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dn">Data de Nascimento</Label>
                  <Input
                    id="dn"
                    value={formData.dn}
                    onChange={(e) => handleInputChange("dn", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dm">DM</Label>
                <Input
                  id="dm"
                  value={formData.dm}
                  onChange={(e) => handleInputChange("dm", e.target.value)}
                />
              </div>

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

              <Button onClick={handleAddRecord} className="w-full">
                Adicionar Registro
              </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNS</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data Nasc.</TableHead>
                  <TableHead>DM</TableHead>
                  <TableHead>HAS</TableHead>
                  <TableHead>Medicação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.nome}</TableCell>
                    <TableCell>{record.cns}</TableCell>
                    <TableCell>{record.tel}</TableCell>
                    <TableCell>{record.dn}</TableCell>
                    <TableCell>{record.dm}</TableCell>
                    <TableCell>{record.has}</TableCell>
                    <TableCell>{record.medication}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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

export default DoencasCronicas;
