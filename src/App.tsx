import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfessionalSchedule from "./pages/ProfessionalSchedule";
import Reports from "./pages/Reports";
import AppointmentRequest from "./pages/AppointmentRequest";
import Consultas from "./pages/Consultas";
import Display from "./pages/Display";

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
          <Route path="/solicitar-agendamento" element={<AppointmentRequest />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/display" element={<Display />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;