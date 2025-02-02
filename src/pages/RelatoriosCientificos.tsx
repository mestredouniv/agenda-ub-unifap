import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { ConsultaHeader } from "@/components/ConsultaHeader";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterPlot,
  ScatterChart, Scatter, ZAxis
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2 } from "lucide-react";

const RelatoriosCientificos = () => {
  // Sample data - in a real app, this would come from your actual health records
  const ageDistribution = [
    { age: "0-12", count: 45 },
    { age: "13-17", count: 30 },
    { age: "18-25", count: 80 },
    { age: "26-35", count: 120 },
    { age: "36-50", count: 150 },
    { age: "51-65", count: 90 },
    { age: "65+", count: 60 }
  ];

  const diseaseCorrelation = [
    { disease: "Tuberculose", prevalence: 25, mortality: 5 },
    { disease: "Hanseníase", prevalence: 15, mortality: 2 },
    { disease: "HIV/AIDS", prevalence: 30, mortality: 8 },
    { disease: "Diabetes", prevalence: 45, mortality: 12 },
    { disease: "Hipertensão", prevalence: 55, mortality: 15 }
  ];

  const treatmentOutcomes = [
    { treatment: "Medicação Regular", success: 75, failure: 25 },
    { treatment: "Acompanhamento", success: 85, failure: 15 },
    { treatment: "Prevenção", success: 90, failure: 10 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const data = {
      ageDistribution,
      diseaseCorrelation,
      treatmentOutcomes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-cientifico.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Relatório Científico',
          text: JSON.stringify({
            ageDistribution,
            diseaseCorrelation,
            treatmentOutcomes
          }, null, 2),
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
          <CardTitle>Distribuição Etária dos Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Quantidade de Pacientes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Correlação entre Prevalência e Mortalidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid />
                <XAxis dataKey="prevalence" name="Prevalência" />
                <YAxis dataKey="mortality" name="Mortalidade" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Doenças" data={diseaseCorrelation} fill="#8884d8">
                  {diseaseCorrelation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados dos Tratamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={treatmentOutcomes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="treatment" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#82ca9d" name="Sucesso" />
                <Bar dataKey="failure" fill="#ff8042" name="Falha" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosCientificos;