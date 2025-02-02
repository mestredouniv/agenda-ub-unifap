import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import { Download, Printer, Share2 } from "lucide-react";
import { PuericulturaForm } from "@/components/puericultura/PuericulturaForm";
import { PuericulturaTable } from "@/components/puericultura/PuericulturaTable";

interface PuericulturaRecord {
  id: string;
  nome: string;
  nomeMae: string;
  cnsCpf: string;
  telefone: string;
  dataNascimento: string;
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
  const [records, setRecords] = useState<PuericulturaRecord[]>([]);
  const [formData, setFormData] = useState<Omit<PuericulturaRecord, 'id'>>({
    nome: "",
    nomeMae: "",
    cnsCpf: "",
    telefone: "",
    dataNascimento: "",
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
            [period]: { 
              ...prev.consultas[period as keyof typeof prev.consultas], 
              [type]: value 
            }
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
    // Reset form data
    setFormData({
      nome: "",
      nomeMae: "",
      cnsCpf: "",
      telefone: "",
      dataNascimento: "",
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
    link.download = "puericultura-dados.json";
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

      <PuericulturaForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleAddRecord={handleAddRecord}
      />

      <Card>
        <CardHeader>
          <CardTitle>Relatório de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <PuericulturaTable
            records={records}
            handleDeleteRecord={handleDeleteRecord}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Puericultura;