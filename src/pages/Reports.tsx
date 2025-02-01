import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Scatter
} from "recharts";
import { BackToHomeButton } from "@/components/BackToHomeButton";

const Reports = () => {
  const navigate = useNavigate();
  
  const monthlyData = [
    { month: "Jan", consultas: 120, faltas: 15, idade_media: 35 },
    { month: "Fev", consultas: 150, faltas: 20, idade_media: 42 },
    { month: "Mar", consultas: 180, faltas: 18, idade_media: 38 },
    { month: "Abr", consultas: 170, faltas: 22, idade_media: 40 },
    { month: "Mai", consultas: 190, faltas: 25, idade_media: 37 },
    { month: "Jun", consultas: 210, faltas: 30, idade_media: 39 },
  ];

  const ageDistribution = [
    { faixa: "0-12", quantidade: 45 },
    { faixa: "13-17", quantidade: 30 },
    { faixa: "18-25", quantidade: 80 },
    { faixa: "26-35", quantidade: 120 },
    { faixa: "36-50", quantidade: 150 },
    { faixa: "51-65", quantidade: 90 },
    { faixa: "65+", quantidade: 60 },
  ];

  const specialtyData = [
    { name: "Psicologia", value: 150 },
    { name: "Fisioterapia", value: 120 },
    { name: "Clínica Médica", value: 200 },
    { name: "Enfermagem", value: 180 },
    { name: "Laboratório", value: 90 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const technicalMetrics = {
    mediaTempo: "28.5 minutos",
    desvioTempo: "±5.2 minutos",
    taxaRetorno: "22.3%",
    satisfacao: "4.8/5.0",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <BackToHomeButton />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Relatórios e Estatísticas</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tempo Médio de Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicalMetrics.mediaTempo}</div>
            <p className="text-xs text-muted-foreground">Desvio: {technicalMetrics.desvioTempo}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taxa de Retorno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicalMetrics.taxaRetorno}</div>
            <p className="text-xs text-muted-foreground">Pacientes que retornam em 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Índice de Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicalMetrics.satisfacao}</div>
            <p className="text-xs text-muted-foreground">Média das avaliações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,020</div>
            <p className="text-xs text-muted-foreground">Último semestre</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal de Atendimentos</CardTitle>
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
                  <Line type="monotone" dataKey="consultas" stroke="#8884d8" name="Consultas" />
                  <Line type="monotone" dataKey="faltas" stroke="#82ca9d" name="Faltas" />
                  <Line type="monotone" dataKey="idade_media" stroke="#ffc658" name="Idade Média" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Especialidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={specialtyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {specialtyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição Etária dos Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade de Pacientes" />
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
