
import { Routes as RouterRoutes, Route } from "react-router-dom";
import { AgendaProfissional } from "@/pages/AgendaProfissional";

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/agenda/:professionalId" element={<AgendaProfissional />} />
    </RouterRoutes>
  );
};

export default Routes;
