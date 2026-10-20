import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Employees from "../pages/Employees";
import EmployeeDetail from "../pages/EmployeeDetail";
import Recruitment from "../pages/Recruitment";
import Leave from "../pages/Leave";
import Training from "../pages/Training";
import Performance from "../pages/Performance";
import Reports from "../pages/Reports";
import NotFound from "../pages/NotFound";
import RequireAuth from "./RequireAuth";

// An administrator lands on the dashboard. An employee lands on their own
// profile, because the dashboard needs the administrator-only employee list.
function Home() {
  const { user } = useAuth();
  if (user?.role === "Admin") return <Dashboard />;
  if (user) return <Navigate to={`/employees/${user.employeeId}`} replace />;
  return null; // RequireAuth guarantees a user before this renders.
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Any signed-in user. */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          {/* The API returns 404 for anyone else's record. */}
          <Route path="/employees/:id" element={<EmployeeDetail />} />

          {/* Administrators only. */}
          <Route element={<RequireAuth role="Admin" />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/training" element={<Training />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
