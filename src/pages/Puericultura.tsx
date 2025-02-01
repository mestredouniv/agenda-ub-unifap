import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { Download, Printer, Share2, Plus } from "lucide-react";
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

interface PuericulturaRecord {
  id: string;
  tipoParto: string;
  aleitamento: {
    ame: string;
    pred: string;
    comp: string;
    form: string;
  };
  triagens: {
    pezinho: string;
    olhinho: string;
    orelhinha: string;
  };
  consultas: {
    mes1: { enf: string; medico: string; medEnf: string };
    mes2: { medico: string; medEnf: string };
    mes4: { nutri: string };
    mes6: { medico: string; medEnf: string };
    mes9: { medEnf: string };
    ano1: { medEnf: string };
    ano2: { medEnf: string };
    ano3: { medEnf: string };
    ano4: { medEnf: string };
    ano5: { medEnf: string };
  };
}

const Puericultura = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [records, setRecords] = useState<PuericulturaRecord[]>([]);
  const [formData, setFormData] = useState<Omit<PuericulturaRecord, 'id'>>({
    tipoParto: "",
    aleitamento: { ame: "", pred: "", comp: "", form: "" },
    triagens: { pezinho: "", olhinho: "", orelhinha: "" },
    consultas: {
      mes1: { enf: "", medico: "", medEnf: "" },
      mes2: { medico: "", medEnf: "" },
      mes4: { nutri: "" },
      mes6: { medico: "", medEnf: "" },
      mes9: { medEnf: "" },
      ano1: { medEnf: "" },
      ano2: { medEnf: "" },
      ano3: { medEnf: "" },
      ano4: { medEnf: "" },
      ano5: { medEnf: "" }
    }
  });

  const handleInputChange = (category: string, field: string, value: string) => {
    setFormData((prev) => {
      if (category === 'aleitamento') {
        return { ...prev, aleitamento: { ...prev.aleitamento, [field]: value } };
      } else if (category === 'triagens') {
        return { ...prev, triagens: { ...prev.triagens, [field]: value } };
      } else if (category === 'consultas') {
        const [period, type] = field.split('.');
        return {
          ...prev,
          consultas: {
            ...prev.consultas,
            [period]: { ...prev.consultas[period as keyof typeof prev.consultas], [type]: value }
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleAddRecord = () => {
    const newRecord: PuericulturaRecord = {
      id: crypto.randomUUID(),
      ...formData,
    };
    setRecords((prev) => [...prev, newRecord]);
    // Reset form
    setFormData({
      tipoParto: "",
      aleitamento: { ame: "", pred: "", comp: "", form: "" },
      triagens: { pezinho: "", olhinho: "", orelhinha: "" },
      consultas: {
        mes1: { enf: "", medico: "", medEnf: "" },
        mes2: { medico: "", medEnf: "" },
        mes4: { nutri: "" },
        mes6: { medico: "", medEnf: "" },
        mes9: { medEnf: "" },
        ano1: { medEnf: "" },
        ano2: { medEnf: "" },
        ano3: { medEnf: "" },
        ano4: { medEnf: "" },
        ano5: { medEnf: "" }
      }
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('report-table');
    if (printContent) {
      const printWindow = window.open('', '', 'height=500,width=800');
      printWindow?.document.write('<html><head><title>Relatório Puericultura</title>');
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(printContent.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  const handleDownload = () => {
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `puericultura-${selectedDate ? selectedDate.toISOString().split('T')[0] : 'dados'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dados Puericultura',
          text: JSON.stringify(records, null, 2),
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
          Imprimir Relatório
        </Button>
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2" />
          Baixar Relatório
        </Button>
        <Button onClick={handleShare} variant="outline">
          <Share2 className="mr-2" />
          Compartilhar Relatório
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Puericultura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="tipoParto">Tipo de Parto</Label>
              <Input
                id="tipoParto"
                value={formData.tipoParto}
                onChange={(e) => handleInputChange("", "tipoParto", e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Aleitamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ame">AME</Label>
                  <Input
                    id="ame"
                    value={formData.aleitamento.ame}
                    onChange={(e) => handleInputChange("aleitamento", "ame", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pred">PRED</Label>
                  <Input
                    id="pred"
                    value={formData.aleitamento.pred}
                    onChange={(e) => handleInputChange("aleitamento", "pred", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="comp">COMP</Label>
                  <Input
                    id="comp"
                    value={formData.aleitamento.comp}
                    onChange={(e) => handleInputChange("aleitamento", "comp", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="form">FORM</Label>
                  <Input
                    id="form"
                    value={formData.aleitamento.form}
                    onChange={(e) => handleInputChange("aleitamento", "form", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleAddRecord} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Informação
            </Button>
          </CardContent>
        </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Relatório de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="report-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Parto</TableHead>
                  <TableHead colSpan={4}>Aleitamento</TableHead>
                  <TableHead colSpan={3}>Triagens</TableHead>
                  <TableHead colSpan={19}>Consultas</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>AME</TableHead>
                  <TableHead>PRED</TableHead>
                  <TableHead>COMP</TableHead>
                  <TableHead>FORM</TableHead>
                  <TableHead>Pezinho</TableHead>
                  <TableHead>Olhinho</TableHead>
                  <TableHead>Orelhinha</TableHead>
                  <TableHead>1M ENF</TableHead>
                  <TableHead>1M MED</TableHead>
                  <TableHead>1M MED/ENF</TableHead>
                  <TableHead>2M MED</TableHead>
                  <TableHead>2M MED/ENF</TableHead>
                  <TableHead>4M NUTRI</TableHead>
                  <TableHead>6M MED</TableHead>
                  <TableHead>6M MED/ENF</TableHead>
                  <TableHead>9M MED/ENF</TableHead>
                  <TableHead>1A MED/ENF</TableHead>
                  <TableHead>2A MED/ENF</TableHead>
                  <TableHead>3A MED/ENF</TableHead>
                  <TableHead>4A MED/ENF</TableHead>
                  <TableHead>5A MED/ENF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.tipoParto}</TableCell>
                    <TableCell>{record.aleitamento.ame}</TableCell>
                    <TableCell>{record.aleitamento.pred}</TableCell>
                    <TableCell>{record.aleitamento.comp}</TableCell>
                    <TableCell>{record.aleitamento.form}</TableCell>
                    <TableCell>{record.triagens.pezinho}</TableCell>
                    <TableCell>{record.triagens.olhinho}</TableCell>
                    <TableCell>{record.triagens.orelhinha}</TableCell>
                    <TableCell>{record.consultas.mes1.enf}</TableCell>
                    <TableCell>{record.consultas.mes1.medico}</TableCell>
                    <TableCell>{record.consultas.mes1.medEnf}</TableCell>
                    <TableCell>{record.consultas.mes2.medico}</TableCell>
                    <TableCell>{record.consultas.mes2.medEnf}</TableCell>
                    <TableCell>{record.consultas.mes4.nutri}</TableCell>
                    <TableCell>{record.consultas.mes6.medico}</TableCell>
                    <TableCell>{record.consultas.mes6.medEnf}</TableCell>
                    <TableCell>{record.consultas.mes9.medEnf}</TableCell>
                    <TableCell>{record.consultas.ano1.medEnf}</TableCell>
                    <TableCell>{record.consultas.ano2.medEnf}</TableCell>
                    <TableCell>{record.consultas.ano3.medEnf}</TableCell>
                    <TableCell>{record.consultas.ano4.medEnf}</TableCell>
                    <TableCell>{record.consultas.ano5.medEnf}</TableCell>
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

export default Puericultura;