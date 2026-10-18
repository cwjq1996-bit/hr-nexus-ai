import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import {
  candidates,
  departments,
  employees,
  jobOpenings,
  leaveRequests,
  recentActivity,
} from "../data/mockData";

const panelStyle = {
  flex: "1 1 360px",
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.1)",
  textAlign: "left",
} as const;

const panelTitleStyle = {
  fontSize: "18px",
  margin: "0 0 16px",
  color: "#0f172a",
} as const;

const mutedStyle = { fontSize: "13px", color: "#64748b" } as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function Dashboard() {
  const employeeById = new Map(employees.map((e) => [e.id, e] as const));

  const openRoleCount = jobOpenings.reduce((sum, job) => sum + job.openings, 0);
  const activeCandidates = candidates.filter(
    (c) => c.stage !== "Hired" && c.stage !== "Rejected",
  );
  const pendingLeave = leaveRequests.filter((r) => r.status === "Pending");

  const headcountByDepartment = departments.map((department) => ({
    department,
    count: employees.filter((e) => e.department === department).length,
  }));
  const largestDepartment = Math.max(
    ...headcountByDepartment.map((d) => d.count),
    1,
  );

  return (
    <MainLayout>
      <div style={{ textAlign: "left" }}>
        <h1
          style={{
            fontSize: "28px",
            letterSpacing: "normal",
            margin: "0 0 4px",
            color: "#0f172a",
          }}
        >
          Dashboard
        </h1>
        <p style={{ ...mutedStyle, marginBottom: "24px" }}>
          Welcome to the Agentic AI HR Management System. Showing sample data.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard
            label="Headcount"
            value={employees.length}
            hint={`${employees.filter((e) => e.status === "On leave").length} currently on leave`}
          />
          <StatCard
            label="Open roles"
            value={openRoleCount}
            hint={`${jobOpenings.length} job postings`}
          />
          <StatCard
            label="Candidates in pipeline"
            value={activeCandidates.length}
            hint="Excludes hired and rejected"
          />
          <StatCard
            label="Pending leave requests"
            value={pendingLeave.length}
            hint="Waiting for approval"
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Headcount by department</h2>
            {headcountByDepartment.map(({ department, count }) => (
              <div key={department} style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  <span>{department}</span>
                  <span>{count}</span>
                </div>
                <div
                  style={{
                    height: "8px",
                    borderRadius: "4px",
                    backgroundColor: "#e2e8f0",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(count / largestDepartment) * 100}%`,
                      borderRadius: "4px",
                      backgroundColor: "#3b82f6",
                    }}
                  />
                </div>
              </div>
            ))}
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Pending leave requests</h2>
            {pendingLeave.length === 0 ? (
              <p style={mutedStyle}>Nothing waiting for approval.</p>
            ) : (
              pendingLeave.map((request) => (
                <div
                  key={request.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontSize: "15px", color: "#0f172a" }}>
                    {employeeById.get(request.employeeId)?.name ?? "Unknown"}
                  </div>
                  <div style={mutedStyle}>
                    {request.type} leave, {formatDate(request.startDate)} to{" "}
                    {formatDate(request.endDate)} ({request.days}{" "}
                    {request.days === 1 ? "day" : "days"})
                  </div>
                </div>
              ))
            )}
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Recent activity</h2>
            {recentActivity.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "15px", color: "#0f172a" }}>
                  {item.message}
                </div>
                <div style={mutedStyle}>{formatDate(item.date)}</div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
