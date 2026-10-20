import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

type NavItem = { to: string; label: string };

const ADMIN_LINKS: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/employees", label: "Employees" },
  { to: "/recruitment", label: "Recruitment" },
  { to: "/leave", label: "Leave" },
  { to: "/training", label: "Training" },
  { to: "/performance", label: "Performance" },
  { to: "/reports", label: "Reports" },
];

const linkStyle = {
  color: "white",
  textDecoration: "none",
  display: "block",
  padding: "10px 0",
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Only links the user may open. The server enforces this independently.
  const links: NavItem[] =
    user?.role === "Admin"
      ? ADMIN_LINKS
      : user
        ? [{ to: `/employees/${user.employeeId}`, label: "My profile" }]
        : [];

  function handleSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#1e293b",
        color: "white",
        height: "100vh",
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2>HR System</h2>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to} style={linkStyle}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {user ? (
        <div
          style={{
            borderTop: "1px solid #334155",
            paddingTop: "16px",
            fontSize: "14px",
          }}
        >
          <div style={{ fontWeight: 600 }}>{user.name}</div>
          <div style={{ color: "#94a3b8", marginBottom: "12px" }}>
            {user.role}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "14px",
              color: "white",
              backgroundColor: "transparent",
              border: "1px solid #475569",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default Sidebar;
