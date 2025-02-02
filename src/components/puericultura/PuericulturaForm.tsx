import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PuericulturaFormProps {
  formData: any;
  handleInputChange: (category: string, field: string, value: string) => void;
  handleAddRecord: () => void;
}

export const PuericulturaForm = ({ formData, handleInputChange, handleAddRecord }: PuericulturaFormProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("dados", "nome", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nomeMae">Nome da Mãe</Label>
                <Input
                  id="nomeMae"
                  value={formData.nomeMae}
                  onChange={(e) => handleInputChange("dados", "nomeMae", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cnsCpf">CNS/CPF</Label>
                <Input
                  id="cnsCpf"
                  value={formData.cnsCpf}
                  onChange={(e) => handleInputChange("dados", "cnsCpf", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("dados", "telefone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange("dados", "dataNascimento", e.target.value)}
                  type="date"
                />
              </div>
              <div>
                <Label htmlFor="tipoParto">Tipo de Parto</Label>
                <Input
                  id="tipoParto"
                  value={formData.tipoParto}
                  onChange={(e) => handleInputChange("dados", "tipoParto", e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Triagens e Consultas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pezinho">Pezinho</Label>
                <Input
                  id="pezinho"
                  value={formData.triagens.pezinho}
                  onChange={(e) => handleInputChange("triagens", "pezinho", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="olhinho">Olhinho</Label>
                <Input
                  id="olhinho"
                  value={formData.triagens.olhinho}
                  onChange={(e) => handleInputChange("triagens", "olhinho", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="orelhinha">Orelhinha</Label>
                <Input
                  id="orelhinha"
                  value={formData.triagens.orelhinha}
                  onChange={(e) => handleInputChange("triagens", "orelhinha", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>1 Mês</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="ENF"
                    value={formData.consultas.mes1.enf}
                    onChange={(e) => handleInputChange("consultas", "mes1.enf", e.target.value)}
                  />
                  <Input
                    placeholder="MÉDICO"
                    value={formData.consultas.mes1.medico}
                    onChange={(e) => handleInputChange("consultas", "mes1.medico", e.target.value)}
                  />
                  <Input
                    placeholder="MED/ENF"
                    value={formData.consultas.mes1.medEnf}
                    onChange={(e) => handleInputChange("consultas", "mes1.medEnf", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>2 Meses</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="MÉDICO"
                    value={formData.consultas.mes2.medico}
                    onChange={(e) => handleInputChange("consultas", "mes2.medico", e.target.value)}
                  />
                  <Input
                    placeholder="MED/ENF"
                    value={formData.consultas.mes2.medEnf}
                    onChange={(e) => handleInputChange("consultas", "mes2.medEnf", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleAddRecord} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Informação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
