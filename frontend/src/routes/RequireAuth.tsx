import { Link, Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import MainLayout from "../layouts/MainLayout";
import type { Role } from "../types/auth";

// Wrap routes in this to require a signed-in user, and optionally one role.
// This only decides what the browser shows. The API enforces the same rules
// on the server, so hiding a page here is never the only protection.
function RequireAuth({ role }: { role?: Role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return (
      <MainLayout>
        <div style={{ textAlign: "left" }}>
          <h1 style={{ fontSize: "28px", margin: "0 0 8px", color: "#0f172a" }}>
            No access
          </h1>
          <p style={{ color: "#475569", margin: "0 0 16px" }}>
            Your account does not have permission to view this page.
          </p>
          <Link to="/" style={{ color: "#1d4ed8" }}>
            Back to your home page
          </Link>
        </div>
      </MainLayout>
    );
  }

  return <Outlet />;
}

export default RequireAuth;
