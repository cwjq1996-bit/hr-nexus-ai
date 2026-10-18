import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Employees from "../pages/Employees";
import Recruitment from "../pages/Recruitment";
import Leave from "../pages/Leave";
import Training from "../pages/Training";
import Performance from "../pages/Performance";
import Reports from "../pages/Reports";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/recruitment" element={<Recruitment />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/training" element={<Training />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
