import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const Reports = () => {
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
      <h1 className="text-2xl font-bold mb-6">Relatórios e Estatísticas</h1>
      
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