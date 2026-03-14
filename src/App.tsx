import { Route, Routes } from "react-router-dom";

import DashboardPage from "@/pages/DashboardPage";
import ParliamentDetailPage from "@/pages/ParliamentDetailPage";

function App() {
  return (
    <Routes>
      <Route element={<DashboardPage />} path="/" />
      <Route element={<ParliamentDetailPage />} path="/parliament/:id" />
    </Routes>
  );
}

export default App;
