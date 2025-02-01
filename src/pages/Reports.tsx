import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { BackToHomeButton } from "@/components/BackToHomeButton";

const Reports = () => {
  const navigate = useNavigate();
  
  // Sample data - replace with real data later
  const monthlyData = [
    { month: "Jan", consultas: 120, faltas: 15 },
    { month: "Fev", consultas: 150, faltas: 20 },
    { month: "Mar", consultas: 180, faltas: 18 },
    { month: "Abr", consultas: 170, faltas: 22 },
    { month: "Mai", consultas: 190, faltas: 25 },
    { month: "Jun", consultas: 210, faltas: 30 },
  ];

  const professionalsData = [
    { name: "Psicólogo", atendimentos: 150 },
    { name: "Fisioterapeuta", atendimentos: 120 },
    { name: "Médico", atendimentos: 200 },
    { name: "Enfermeiro", atendimentos: 180 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <BackToHomeButton />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Relatórios e Estatísticas</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Menu Principal
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="consultas"
                    stroke="#8884d8"
                    name="Consultas"
                  />
                  <Line
                    type="monotone"
                    dataKey="faltas"
                    stroke="#82ca9d"
                    name="Faltas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atendimentos por Especialidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={professionalsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="atendimentos"
                    fill="#8884d8"
                    name="Atendimentos"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
