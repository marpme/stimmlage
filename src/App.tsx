import { Route, Routes } from "react-router-dom";

import DashboardPage from "@/pages/DashboardPage";
import ParliamentDetailPage from "@/pages/ParliamentDetailPage";
import ImpressumPage from "@/pages/ImpressumPage";
import DatenschutzPage from "@/pages/DatenschutzPage";
import MethodologyPage from "@/pages/MethodologyPage";

function App() {
  return (
    <Routes>
      <Route element={<DashboardPage />} path="/" />
      <Route element={<ParliamentDetailPage />} path="/parliament/:id" />
      <Route element={<ImpressumPage />} path="/impressum" />
      <Route element={<DatenschutzPage />} path="/datenschutz" />
      <Route element={<MethodologyPage />} path="/methodik" />
    </Routes>
  );
}

export default App;
