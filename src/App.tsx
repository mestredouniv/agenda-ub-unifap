
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgendaProfissional from "./pages/AgendaProfissional";
import Consultas from "./pages/Consultas";
import Reports from "./pages/Reports";
import RequestsManager from "./pages/RequestsManager";
import AppointmentRequest from "./pages/AppointmentRequest";
import CheckAppointment from "./pages/CheckAppointment";
import Display from "./pages/Display";
import ProfessionalSchedule from "./pages/ProfessionalSchedule";
import DoencasCronicas from "./pages/DoencasCronicas";
import PreNatal from "./pages/PreNatal";
import Puericultura from "./pages/Puericultura";
import Tuberculose from "./pages/Tuberculose";
import Hanseniase from "./pages/Hanseniase";
import Prep from "./pages/Prep";
import { Toaster } from "@/components/ui/toaster";
import { NetworkStatusProvider } from "./contexts/NetworkStatusContext";

const App = () => {
  return (
    <NetworkStatusProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/agenda/:professionalId" element={<AgendaProfissional />} />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route path="/solicitacoes" element={<RequestsManager />} />
        <Route path="/solicitar-consulta" element={<AppointmentRequest />} />
        <Route path="/consultar-agendamento" element={<CheckAppointment />} />
        <Route path="/display" element={<Display />} />
        <Route path="/agenda-profissional" element={<ProfessionalSchedule />} />
        <Route path="/doencas-cronicas" element={<DoencasCronicas />} />
        <Route path="/pre-natal" element={<PreNatal />} />
        <Route path="/puericultura" element={<Puericultura />} />
        <Route path="/tuberculose" element={<Tuberculose />} />
        <Route path="/hanseniase" element={<Hanseniase />} />
        <Route path="/prep" element={<Prep />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </NetworkStatusProvider>
  );
};

export default App;
