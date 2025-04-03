
import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { NetworkStatusProvider } from "@/contexts/NetworkStatusContext"
import { OfflineBanner } from "@/components/OfflineBanner"

// Pages
import Index from './pages/Index'
import Consultas from './pages/Consultas'
import AgendaProfissional from './pages/AgendaProfissional'
import NotFound from './pages/NotFound'
import CheckAppointment from './pages/CheckAppointment'
import ProfessionalSchedule from './pages/ProfessionalSchedule'
import AppointmentRequest from './pages/AppointmentRequest'
import RequestsManager from './pages/RequestsManager'
import Display from './pages/Display'
import Hanseniase from './pages/Hanseniase'
import Tuberculose from './pages/Tuberculose'
import DoencasCronicas from './pages/DoencasCronicas'
import PreNatal from './pages/PreNatal'
import Prep from './pages/Prep'
import Puericultura from './pages/Puericultura'
import Reports from './pages/Reports'

function App() {
  // Register the service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  }, []);

  return (
    <NetworkStatusProvider>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/agenda/:professionalId" element={<AgendaProfissional />} />
        <Route path="/consulta/:appointmentId" element={<CheckAppointment />} />
        <Route path="/profissional/:professionalId/disponibilidade" element={<ProfessionalSchedule />} />
        <Route path="/solicitar-consulta" element={<AppointmentRequest />} />
        <Route path="/gerenciar-solicitacoes" element={<RequestsManager />} />
        <Route path="/display" element={<Display />} />
        <Route path="/hanseniase" element={<Hanseniase />} />
        <Route path="/tuberculose" element={<Tuberculose />} />
        <Route path="/doencas-cronicas" element={<DoencasCronicas />} />
        <Route path="/pre-natal" element={<PreNatal />} />
        <Route path="/prep" element={<Prep />} />
        <Route path="/puericultura" element={<Puericultura />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </NetworkStatusProvider>
  )
}

export default App
