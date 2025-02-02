import { useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { initializeDataCleanup } from "./utils/dataCleanup";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/Home";
import AppointmentRequest from "@/pages/AppointmentRequest";
import CheckAppointment from "@/pages/CheckAppointment";
import Display from "@/pages/Display";
import ProfessionalSchedule from "@/pages/ProfessionalSchedule";
import Reports from "@/pages/Reports";
import Hanseniase from "@/pages/Hanseniase";
import PreNatal from "@/pages/PreNatal";
import Tuberculose from "@/pages/Tuberculose";
import Prep from "@/pages/Prep";
import DoencasCronicas from "@/pages/DoencasCronicas";
import Puericultura from "@/pages/Puericultura";
import SolicitarConsulta from "@/pages/SolicitarConsulta";

const App = () => {
  useEffect(() => {
    initializeDataCleanup();
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solicitar" element={<AppointmentRequest />} />
          <Route path="/consultar-agendamento" element={<CheckAppointment />} />
          <Route path="/display" element={<Display />} />
          <Route path="/agenda/:professionalId" element={<ProfessionalSchedule />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/hanseniase" element={<Hanseniase />} />
          <Route path="/pre-natal" element={<PreNatal />} />
          <Route path="/tuberculose" element={<Tuberculose />} />
          <Route path="/prep" element={<Prep />} />
          <Route path="/doencas-cronicas" element={<DoencasCronicas />} />
          <Route path="/puericultura" element={<Puericultura />} />
          <Route path="/consultas" element={<SolicitarConsulta />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;