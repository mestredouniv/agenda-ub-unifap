import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { Download, Plus, Printer, Share2, Trash2 } from "lucide-react";
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

interface HanseniaseRecord {
  id: string;
  nome: string;
  cnes: string;
  tel: string;
  dn: string;
  pb: string;
  mb: string;
  classificacao: string;
  inicio: string;
}

const Hanseniase = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [records, setRecords] = useState<HanseniaseRecord[]>([]);
  const [formData, setFormData] = useState<Omit<HanseniaseRecord, 'id'>>({
    nome: "",
    cnes: "",
    tel: "",
    dn: "",
    pb: "",
    mb: "",
    classificacao: "",
    inicio: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddRecord = () => {
    const newRecord: HanseniaseRecord = {
      id: crypto.randomUUID(),
      ...formData,
    };
    setRecords((prev) => [...prev, newRecord]);
    setFormData({
      nome: "",
      cnes: "",
      tel: "",
      dn: "",
      pb: "",
      mb: "",
      classificacao: "",
      inicio: "",
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter(record => record.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hanseniase-${selectedDate ? selectedDate.toISOString().split('T')[0] : 'dados'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dados Hanseníase',
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
          <CardTitle>Hanseníase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="cnes">CNES</Label>
                <Input
                  id="cnes"
                  value={formData.cnes}
                  onChange={(e) => handleInputChange("cnes", e.target.value)}
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
                <Label htmlFor="dn">Data de Nascimento</Label>
                <Input
                  id="dn"
                  value={formData.dn}
                  onChange={(e) => handleInputChange("dn", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pb">PB</Label>
                <Input
                  id="pb"
                  value={formData.pb}
                  onChange={(e) => handleInputChange("pb", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="mb">MB</Label>
                <Input
                  id="mb"
                  value={formData.mb}
                  onChange={(e) => handleInputChange("mb", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="classificacao">Classificação</Label>
                <Input
                  id="classificacao"
                  value={formData.classificacao}
                  onChange={(e) => handleInputChange("classificacao", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="inicio">Início</Label>
                <Input
                  id="inicio"
                  value={formData.inicio}
                  onChange={(e) => handleInputChange("inicio", e.target.value)}
                />
              </div>

              <Button onClick={handleAddRecord} className="w-full">
                <Plus className="mr-2" />
                Adicionar Informação
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
          <CardTitle>Relatório de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NOME</TableHead>
                <TableHead>CNES</TableHead>
                <TableHead>TEL</TableHead>
                <TableHead>DN</TableHead>
                <TableHead>PB</TableHead>
                <TableHead>MB</TableHead>
                <TableHead>CLASSIFICAÇÃO</TableHead>
                <TableHead>INÍCIO</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.nome}</TableCell>
                  <TableCell>{record.cnes}</TableCell>
                  <TableCell>{record.tel}</TableCell>
                  <TableCell>{record.dn}</TableCell>
                  <TableCell>{record.pb}</TableCell>
                  <TableCell>{record.mb}</TableCell>
                  <TableCell>{record.classificacao}</TableCell>
                  <TableCell>{record.inicio}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Hanseniase;