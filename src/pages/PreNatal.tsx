import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { Download, Printer, Share2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HealthRecord {
  id: string;
  date: string;
  name: string;
  cns: string;
  phone: string;
  birthDate: string;
  ig: string;
  dum: string;
  dpp: string;
  gpa: string;
  enf: string;
  medEnf1: string;
  medEnf2: string;
  medEnf3: string;
  medEnf4: string;
  medEnf5: string;
  medEnf6: string;
  medEnf7: string;
  medEnf8: string;
  medEnf9: string;
  medEnf10: string;
  medEnf11: string;
  medEnf12: string;
  puerperio: string;
  notes: string;
}

const PreNatal = () => {
  const [formData, setFormData] = useState({
    name: "",
    cns: "",
    phone: "",
    birthDate: "",
    ig: "",
    dum: "",
    dpp: "",
    gpa: "",
    enf: "",
    medEnf1: "",
    medEnf2: "",
    medEnf3: "",
    medEnf4: "",
    medEnf5: "",
    medEnf6: "",
    medEnf7: "",
    medEnf8: "",
    medEnf9: "",
    medEnf10: "",
    medEnf11: "",
    medEnf12: "",
    puerperio: "",
    notes: "",
  });
  const [records, setRecords] = useState<HealthRecord[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddRecord = () => {
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      ...formData,
    };

    setRecords((prev) => [...prev, newRecord]);
    setFormData({
      name: "",
      cns: "",
      phone: "",
      birthDate: "",
      ig: "",
      dum: "",
      dpp: "",
      gpa: "",
      enf: "",
      medEnf1: "",
      medEnf2: "",
      medEnf3: "",
      medEnf4: "",
      medEnf5: "",
      medEnf6: "",
      medEnf7: "",
      medEnf8: "",
      medEnf9: "",
      medEnf10: "",
      medEnf11: "",
      medEnf12: "",
      puerperio: "",
      notes: "",
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
    link.download = "pre-natal-dados.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dados Pré-Natal',
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
          <CardTitle>Pré-Natal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cns">CNS</Label>
                  <Input
                    id="cns"
                    value={formData.cns}
                    onChange={(e) => handleInputChange("cns", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ig">IG</Label>
                  <Input
                    id="ig"
                    value={formData.ig}
                    onChange={(e) => handleInputChange("ig", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dum">DUM</Label>
                  <Input
                    id="dum"
                    type="date"
                    value={formData.dum}
                    onChange={(e) => handleInputChange("dum", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dpp">DPP</Label>
                  <Input
                    id="dpp"
                    type="date"
                    value={formData.dpp}
                    onChange={(e) => handleInputChange("dpp", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gpa">G/P/A</Label>
                <Input
                  id="gpa"
                  value={formData.gpa}
                  onChange={(e) => handleInputChange("gpa", e.target.value)}
                />
              </div>

              <Button onClick={handleAddRecord} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Informação
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="enf">ENF</Label>
                <Input
                  id="enf"
                  value={formData.enf}
                  onChange={(e) => handleInputChange("enf", e.target.value)}
                />
              </div>

              {[...Array(12)].map((_, index) => (
                <div key={index}>
                  <Label htmlFor={`medEnf${index + 1}`}>{`MED/ENF ${index + 1}`}</Label>
                  <Input
                    id={`medEnf${index + 1}`}
                    value={formData[`medEnf${index + 1}` as keyof typeof formData]}
                    onChange={(e) => handleInputChange(`medEnf${index + 1}`, e.target.value)}
                  />
                </div>
              ))}

              <div>
                <Label htmlFor="puerperio">PUERPÉRIO</Label>
                <Input
                  id="puerperio"
                  value={formData.puerperio}
                  onChange={(e) => handleInputChange("puerperio", e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatório de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNS</TableHead>
                  <TableHead>TEL</TableHead>
                  <TableHead>DN</TableHead>
                  <TableHead>IG</TableHead>
                  <TableHead>DUM</TableHead>
                  <TableHead>DPP</TableHead>
                  <TableHead>G/P/A</TableHead>
                  <TableHead>ENF</TableHead>
                  {[...Array(12)].map((_, index) => (
                    <TableHead key={index}>MED/ENF</TableHead>
                  ))}
                  <TableHead>PUERPÉRIO</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.cns}</TableCell>
                    <TableCell>{record.phone}</TableCell>
                    <TableCell>{record.birthDate}</TableCell>
                    <TableCell>{record.ig}</TableCell>
                    <TableCell>{record.dum}</TableCell>
                    <TableCell>{record.dpp}</TableCell>
                    <TableCell>{record.gpa}</TableCell>
                    <TableCell>{record.enf}</TableCell>
                    {[...Array(12)].map((_, index) => (
                      <TableCell key={index}>{record[`medEnf${index + 1}` as keyof typeof record]}</TableCell>
                    ))}
                    <TableCell>{record.puerperio}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-500 hover:text-red-700"
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

export default PreNatal;