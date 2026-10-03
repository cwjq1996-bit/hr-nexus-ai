import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#1e293b",
        color: "white",
        height: "100vh",
        padding: "20px",
      }}
    >
      <h2>HR System</h2>

      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><Link to="/" style={linkStyle}>Dashboard</Link></li>
          <li><Link to="/employees" style={linkStyle}>Employees</Link></li>
          <li><Link to="/recruitment" style={linkStyle}>Recruitment</Link></li>
          <li><Link to="/leave" style={linkStyle}>Leave</Link></li>
          <li><Link to="/training" style={linkStyle}>Training</Link></li>
          <li><Link to="/performance" style={linkStyle}>Performance</Link></li>
          <li><Link to="/reports" style={linkStyle}>Reports</Link></li>
          <li><Link to="/login" style={linkStyle}>Login</Link></li>
        </ul>
      </nav>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  display: "block",
  padding: "10px 0",
};

export default Sidebar;