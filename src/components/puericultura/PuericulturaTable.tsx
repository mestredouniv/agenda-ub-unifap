import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PuericulturaTableProps {
  records: any[];
  handleDeleteRecord: (id: string) => void;
}

export const PuericulturaTable = ({ records, handleDeleteRecord }: PuericulturaTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Nome da Mãe</TableHead>
            <TableHead>CNS/CPF</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Data de Nascimento</TableHead>
            <TableHead>Tipo de Parto</TableHead>
            <TableHead>AME</TableHead>
            <TableHead>PRED.</TableHead>
            <TableHead>COMP.</TableHead>
            <TableHead>FORM.</TableHead>
            <TableHead>Pezinho</TableHead>
            <TableHead>Olhinho</TableHead>
            <TableHead>Orelhinha</TableHead>
            <TableHead>1 Mês ENF</TableHead>
            <TableHead>1 Mês MÉDICO</TableHead>
            <TableHead>1 Mês MED/ENF</TableHead>
            <TableHead>2 Meses MÉDICO</TableHead>
            <TableHead>2 Meses MED/ENF</TableHead>
            <TableHead>4 Meses NUTRI</TableHead>
            <TableHead>6 Meses MÉDICO</TableHead>
            <TableHead>6 Meses MED/ENF</TableHead>
            <TableHead>9 Meses MED/ENF</TableHead>
            <TableHead>1 Ano MED/ENF</TableHead>
            <TableHead>2 Anos MED/ENF</TableHead>
            <TableHead>3 Anos MED/ENF</TableHead>
            <TableHead>4 Anos MED/ENF</TableHead>
            <TableHead>5 Anos MED/ENF</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.nome}</TableCell>
              <TableCell>{record.nomeMae}</TableCell>
              <TableCell>{record.cnsCpf}</TableCell>
              <TableCell>{record.telefone}</TableCell>
              <TableCell>{record.dataNascimento}</TableCell>
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
  );
};
