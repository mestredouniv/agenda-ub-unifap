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

interface TuberculoseRecord {
  id: string;
  nome: string;
  cns: string;
  tel: string;
  dn: string;
  trmSensivel: string;
  trmResistente: string;
  baar1: string;
  baar2: string;
  culturaEscarro: string;
  culturaOutros: string;
  ppd: string;
  histo: string;
  raioX: string;
  outros: string;
  hiv: string;
  formaClinica: string;
  tipoDe: string;
  esquema: string;
  dataInicio: string;
  forma: string;
  baciloscopias: {
    [key: string]: string;
  };
  encerramento: {
    motivo: string;
    data: string;
  };
  contatos: {
    reg: string;
    exam: string;
  };
  obs: string;
}

const Tuberculose = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [records, setRecords] = useState<TuberculoseRecord[]>([]);
  const [formData, setFormData] = useState<Omit<TuberculoseRecord, 'id'>>({
    nome: "",
    cns: "",
    tel: "",
    dn: "",
    trmSensivel: "",
    trmResistente: "",
    baar1: "",
    baar2: "",
    culturaEscarro: "",
    culturaOutros: "",
    ppd: "",
    histo: "",
    raioX: "",
    outros: "",
    hiv: "",
    formaClinica: "",
    tipoDe: "",
    esquema: "",
    dataInicio: "",
    forma: "",
    baciloscopias: {
      "1": "", "2": "", "3": "", "4": "", "5": "", "6": "",
      "7": "", "8": "", "9": "", "10": "", "11": "", "12": ""
    },
    encerramento: {
      motivo: "",
      data: ""
    },
    contatos: {
      reg: "",
      exam: ""
    },
    obs: ""
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("baciloscopias.")) {
      const month = field.split(".")[1];
      setFormData(prev => ({
        ...prev,
        baciloscopias: {
          ...prev.baciloscopias,
          [month]: value
        }
      }));
    } else if (field.startsWith("encerramento.")) {
      const subField = field.split(".")[1];
      setFormData(prev => ({
        ...prev,
        encerramento: {
          ...prev.encerramento,
          [subField]: value
        }
      }));
    } else if (field.startsWith("contatos.")) {
      const subField = field.split(".")[1];
      setFormData(prev => ({
        ...prev,
        contatos: {
          ...prev.contatos,
          [subField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddRecord = () => {
    const newRecord: TuberculoseRecord = {
      id: crypto.randomUUID(),
      ...formData,
    };
    setRecords(prev => [...prev, newRecord]);
    setFormData({
      nome: "",
      cns: "",
      tel: "",
      dn: "",
      trmSensivel: "",
      trmResistente: "",
      baar1: "",
      baar2: "",
      culturaEscarro: "",
      culturaOutros: "",
      ppd: "",
      histo: "",
      raioX: "",
      outros: "",
      hiv: "",
      formaClinica: "",
      tipoDe: "",
      esquema: "",
      dataInicio: "",
      forma: "",
      baciloscopias: {
        "1": "", "2": "", "3": "", "4": "", "5": "", "6": "",
        "7": "", "8": "", "9": "", "10": "", "11": "", "12": ""
      },
      encerramento: {
        motivo: "",
        data: ""
      },
      contatos: {
        reg: "",
        exam: ""
      },
      obs: ""
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  const handlePrint = () => {
    const printContent = document.getElementById('report-table');
    if (printContent) {
      const printWindow = window.open('', '', 'height=500,width=800');
      printWindow?.document.write('<html><head><title>Relatório Tuberculose</title>');
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
    link.download = `tuberculose-${selectedDate ? selectedDate.toISOString().split('T')[0] : 'dados'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dados Tuberculose',
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
          <CardTitle>Tuberculose</CardTitle>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trmSensivel">TRM Sensível</Label>
                  <Input
                    id="trmSensivel"
                    value={formData.trmSensivel}
                    onChange={(e) => handleInputChange("trmSensivel", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="trmResistente">TRM Resistente</Label>
                  <Input
                    id="trmResistente"
                    value={formData.trmResistente}
                    onChange={(e) => handleInputChange("trmResistente", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baar1">BAAR 1</Label>
                  <Input
                    id="baar1"
                    value={formData.baar1}
                    onChange={(e) => handleInputChange("baar1", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="baar2">BAAR 2</Label>
                  <Input
                    id="baar2"
                    value={formData.baar2}
                    onChange={(e) => handleInputChange("baar2", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="culturaEscarro">Cultura Escarro</Label>
                  <Input
                    id="culturaEscarro"
                    value={formData.culturaEscarro}
                    onChange={(e) => handleInputChange("culturaEscarro", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="culturaOutros">Cultura Outros</Label>
                  <Input
                    id="culturaOutros"
                    value={formData.culturaOutros}
                    onChange={(e) => handleInputChange("culturaOutros", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ppd">PPD</Label>
                  <Input
                    id="ppd"
                    value={formData.ppd}
                    onChange={(e) => handleInputChange("ppd", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="histo">Histopatológico</Label>
                  <Input
                    id="histo"
                    value={formData.histo}
                    onChange={(e) => handleInputChange("histo", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="raioX">Raio X</Label>
                  <Input
                    id="raioX"
                    value={formData.raioX}
                    onChange={(e) => handleInputChange("raioX", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="outros">Outros</Label>
                  <Input
                    id="outros"
                    value={formData.outros}
                    onChange={(e) => handleInputChange("outros", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hiv">HIV</Label>
                  <Input
                    id="hiv"
                    value={formData.hiv}
                    onChange={(e) => handleInputChange("hiv", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="formaClinica">Forma Clínica</Label>
                  <Input
                    id="formaClinica"
                    value={formData.formaClinica}
                    onChange={(e) => handleInputChange("formaClinica", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipoDe">Tipo de</Label>
                  <Input
                    id="tipoDe"
                    value={formData.tipoDe}
                    onChange={(e) => handleInputChange("tipoDe", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="esquema">Esquema</Label>
                  <Input
                    id="esquema"
                    value={formData.esquema}
                    onChange={(e) => handleInputChange("esquema", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    value={formData.dataInicio}
                    onChange={(e) => handleInputChange("dataInicio", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="forma">Forma</Label>
                  <Input
                    id="forma"
                    value={formData.forma}
                    onChange={(e) => handleInputChange("forma", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Baciloscopias de Controle (Meses)</Label>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <div key={month}>
                      <Label htmlFor={`baciloscopia${month}`}>{month}</Label>
                      <Input
                        id={`baciloscopia${month}`}
                        value={formData.baciloscopias[month.toString()]}
                        onChange={(e) => handleInputChange(`baciloscopias.${month}`, e.target.value)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="encerramento.motivo">Motivo do Encerramento</Label>
                  <Input
                    id="encerramento.motivo"
                    value={formData.encerramento.motivo}
                    onChange={(e) => handleInputChange("encerramento.motivo", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="encerramento.data">Data do Encerramento</Label>
                  <Input
                    id="encerramento.data"
                    value={formData.encerramento.data}
                    onChange={(e) => handleInputChange("encerramento.data", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contatos.reg">Reg. Contatos</Label>
                  <Input
                    id="contatos.reg"
                    value={formData.contatos.reg}
                    onChange={(e) => handleInputChange("contatos.reg", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contatos.exam">Exam. Contatos</Label>
                  <Input
                    id="contatos.exam"
                    value={formData.contatos.exam}
                    onChange={(e) => handleInputChange("contatos.exam", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="obs">Observações</Label>
                <Input
                  id="obs"
                  value={formData.obs}
                  onChange={(e) => handleInputChange("obs", e.target.value)}
                />
              </div>

              <Button onClick={handleAddRecord} className="w-full">
                <Plus className="mr-2" />
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
        <CardContent className="overflow-x-auto">
          <div id="report-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNS</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>DN</TableHead>
                  <TableHead>TRM Sensível</TableHead>
                  <TableHead>TRM Resistente</TableHead>
                  <TableHead>BAAR 1</TableHead>
                  <TableHead>BAAR 2</TableHead>
                  <TableHead>Cultura Escarro</TableHead>
                  <TableHead>Cultura Outros</TableHead>
                  <TableHead>PPD</TableHead>
                  <TableHead>Histopatológico</TableHead>
                  <TableHead>Raio X</TableHead>
                  <TableHead>Outros</TableHead>
                  <TableHead>HIV</TableHead>
                  <TableHead>Forma Clínica</TableHead>
                  <TableHead>Tipo de</TableHead>
                  <TableHead>Esquema</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Baciloscopias</TableHead>
                  <TableHead>Encerramento</TableHead>
                  <TableHead>Contatos</TableHead>
                  <TableHead>Observações</TableHead>
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
                    <TableCell>{record.trmSensivel}</TableCell>
                    <TableCell>{record.trmResistente}</TableCell>
                    <TableCell>{record.baar1}</TableCell>
                    <TableCell>{record.baar2}</TableCell>
                    <TableCell>{record.culturaEscarro}</TableCell>
                    <TableCell>{record.culturaOutros}</TableCell>
                    <TableCell>{record.ppd}</TableCell>
                    <TableCell>{record.histo}</TableCell>
                    <TableCell>{record.raioX}</TableCell>
                    <TableCell>{record.outros}</TableCell>
                    <TableCell>{record.hiv}</TableCell>
                    <TableCell>{record.formaClinica}</TableCell>
                    <TableCell>{record.tipoDe}</TableCell>
                    <TableCell>{record.esquema}</TableCell>
                    <TableCell>{record.dataInicio}</TableCell>
                    <TableCell>{record.forma}</TableCell>
                    <TableCell>
                      {Object.entries(record.baciloscopias).map(([month, value]) => (
                        `${month}: ${value}, `
                      ))}
                    </TableCell>
                    <TableCell>
                      {`Motivo: ${record.encerramento.motivo}, Data: ${record.encerramento.data}`}
                    </TableCell>
                    <TableCell>
                      {`Reg: ${record.contatos.reg}, Exam: ${record.contatos.exam}`}
                    </TableCell>
                    <TableCell>{record.obs}</TableCell>
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

export default Tuberculose;
