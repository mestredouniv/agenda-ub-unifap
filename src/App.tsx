import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfessionalSchedule from "./pages/ProfessionalSchedule";
import Reports from "./pages/Reports";
import Consultas from "./pages/Consultas";
import Display from "./pages/Display";
import SolicitarConsulta from "./pages/SolicitarConsulta";
import Hanseniase from "./pages/Hanseniase";
import PreNatal from "./pages/PreNatal";
import Tuberculose from "./pages/Tuberculose";
import Prep from "./pages/Prep";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/agenda/:id" element={<ProfessionalSchedule />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/display" element={<Display />} />
          <Route path="/solicitar" element={<SolicitarConsulta />} />
          <Route path="/hanseniase" element={<Hanseniase />} />
          <Route path="/pre-natal" element={<PreNatal />} />
          <Route path="/tuberculose" element={<Tuberculose />} />
          <Route path="/prep" element={<Prep />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;