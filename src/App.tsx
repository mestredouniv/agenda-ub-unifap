
import { Toaster } from "@/components/ui/toaster";
import { Routes, Route } from "react-router-dom";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Display from "@/pages/Display";
import Consultas from "@/pages/Consultas";
import Hanseniase from "@/pages/Hanseniase";
import PreNatal from "@/pages/PreNatal";
import Puericultura from "@/pages/Puericultura";
import DoencasCronicas from "@/pages/DoencasCronicas";
import Tuberculose from "@/pages/Tuberculose";
import Prep from "@/pages/Prep";
import Reports from "@/pages/Reports";
import { AgendaProfissional } from "@/pages/AgendaProfissional";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/display" element={<Display />} />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/agenda/:professionalId" element={<AgendaProfissional />} />
        <Route path="/hanseniase" element={<Hanseniase />} />
        <Route path="/pre-natal" element={<PreNatal />} />
        <Route path="/puericultura" element={<Puericultura />} />
        <Route path="/doencas-cronicas" element={<DoencasCronicas />} />
        <Route path="/tuberculose" element={<Tuberculose />} />
        <Route path="/prep" element={<Prep />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
