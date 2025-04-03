
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
import { NetworkProvider } from "./contexts/NetworkContext";
import { NetworkStatus } from "./components/ui/network-status";

// Service Worker para suporte offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        console.error('Erro no registro do Service Worker:', error);
      });
  });
}

const App = () => {
  return (
    <NetworkProvider showToasts={true}>
      <div className="min-h-screen bg-gray-50 relative">
        <div className="fixed top-0 left-0 right-0 z-50">
          <NetworkStatus hideWhenConnected={true} />
        </div>
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
      </div>
    </NetworkProvider>
  );
};

export default App;
