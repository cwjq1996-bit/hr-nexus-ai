function App() {
  const cardStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f7fc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          backgroundColor: "#1e3a8a",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1>Agentic AI HR Management System</h1>
        <p>Final Year Software Engineering Project</p>
      </header>

      <main
        style={{
          padding: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h2>Employees</h2>
          <p>Manage employee records and profiles.</p>
        </div>

        <div style={cardStyle}>
          <h2>Recruitment</h2>
          <p>Track vacancies and applications.</p>
        </div>

        <div style={cardStyle}>
          <h2>Leave Management</h2>
          <p>Approve and monitor leave requests.</p>
        </div>

        <div style={cardStyle}>
          <h2>Training</h2>
          <p>Assign and monitor learning programmes.</p>
        </div>

        <div style={cardStyle}>
          <h2>Performance</h2>
          <p>Review KPIs and staff evaluations.</p>
        </div>

        <div style={cardStyle}>
          <h2>AI Assistant</h2>
          <p>Future agentic AI integration module.</p>
        </div>
      </main>
    </div>
  );
}

export default App;