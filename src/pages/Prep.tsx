import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { Download, Printer, Share2 } from "lucide-react";
import { useState } from "react";
import { ptBR } from "date-fns/locale";

const Prep = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
    cns: "",
    tel: "",
    birthDate: "",
    creatinina: "",
    comorbidades: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrint = () => {
    const printContent = document.getElementById('report-table');
    if (printContent) {
      const printWindow = window.open('', '', 'height=500,width=800');
      printWindow?.document.write('<html><head><title>Relatório PREP</title>');
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(printContent.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  const handleDownload = () => {
    const data = JSON.stringify(formData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prep-${selectedDate ? selectedDate.toISOString().split('T')[0] : 'dados'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dados PREP',
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
          <CardTitle>PREP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
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

              <div>
                <Label htmlFor="tel">Telefone</Label>
                <Input
                  id="tel"
                  value={formData.tel}
                  onChange={(e) => handleInputChange("tel", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  type="date"
                />
              </div>

              <div>
                <Label htmlFor="creatinina">Creatinina Anual</Label>
                <Input
                  id="creatinina"
                  value={formData.creatinina}
                  onChange={(e) => handleInputChange("creatinina", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="comorbidades">Comorbidades</Label>
                <Textarea
                  id="comorbidades"
                  value={formData.comorbidades}
                  onChange={(e) => handleInputChange("comorbidades", e.target.value)}
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

      <Card>
        <CardHeader>
          <CardTitle>Relatório de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="report-table">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Nome:</h4>
                  <p className="text-gray-600">{formData.name || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">CNS:</h4>
                  <p className="text-gray-600">{formData.cns || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Telefone:</h4>
                  <p className="text-gray-600">{formData.tel || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data de Nascimento:</h4>
                  <p className="text-gray-600">{formData.birthDate || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Creatinina Anual:</h4>
                  <p className="text-gray-600">{formData.creatinina || 'Não informado'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Comorbidades:</h4>
                <p className="text-gray-600">{formData.comorbidades || 'Não informado'}</p>
              </div>
              {selectedDate && (
                <div>
                  <h4 className="font-medium mb-2">Data do Registro:</h4>
                  <p className="text-gray-600">{selectedDate.toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prep;
