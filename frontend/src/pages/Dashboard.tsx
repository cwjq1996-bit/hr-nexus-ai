import { useEffect, useState } from "react";

import { errorMessage, fetchEmployees } from "../api/employees";
import type { EmployeeFilters } from "../api/employees";
import StatCard from "../components/StatCard";
import {
  candidates,
  departments,
  employees as sampleEmployees,
  jobOpenings,
  leaveRequests,
  recentActivity,
} from "../data/mockData";
import MainLayout from "../layouts/MainLayout";
import type { Employee } from "../types/hr";

const NO_FILTERS: EmployeeFilters = { search: "", department: "", status: "" };

type Result = {
  attempt: number;
  employees: Employee[] | null;
  error: string | null;
};

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
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchEmployees(NO_FILTERS, controller.signal)
      .then((employees) => setResult({ attempt, employees, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ attempt, employees: null, error: errorMessage(error) });
      });

    return () => controller.abort();
  }, [attempt]);

  // Loading is derived: the stored result belongs to an earlier attempt.
  const loading = result === null || result.attempt !== attempt;
  const employees = loading ? null : result.employees;
  const error = loading ? null : result.error;

  // Leave requests are still sample data and refer to sample employee ids.
  const sampleEmployeeById = new Map(sampleEmployees.map((e) => [e.id, e] as const));

  const openRoleCount = jobOpenings.reduce((sum, job) => sum + job.openings, 0);
  const activeCandidates = candidates.filter(
    (c) => c.stage !== "Hired" && c.stage !== "Rejected",
  );
  const pendingLeave = leaveRequests.filter((r) => r.status === "Pending");

  const placeholder = loading ? "…" : "–";
  const unavailableHint = loading ? "Loading…" : "Unavailable";

  const onLeaveCount = employees?.filter((e) => e.status === "On leave").length;
  const headcountByDepartment = employees
    ? departments.map((department) => ({
        department,
        count: employees.filter((e) => e.department === department).length,
      }))
    : null;
  const largestDepartment = Math.max(
    ...(headcountByDepartment ?? []).map((d) => d.count),
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
          Welcome to the Agentic AI HR Management System. Headcount comes from
          the API. Leave, recruitment and activity are still sample data.
        </p>

        {error ? (
          <div
            role="alert"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            {error}{" "}
            <button
              type="button"
              onClick={() => setAttempt((count) => count + 1)}
              style={{
                marginLeft: "8px",
                padding: "4px 12px",
                border: "1px solid #fca5a5",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#b91c1c",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        ) : null}

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
            value={employees ? employees.length : placeholder}
            hint={
              onLeaveCount !== undefined
                ? `${onLeaveCount} currently on leave`
                : unavailableHint
            }
          />
          <StatCard
            label="Open roles"
            value={openRoleCount}
            hint={`${jobOpenings.length} job postings (sample)`}
          />
          <StatCard
            label="Candidates in pipeline"
            value={activeCandidates.length}
            hint="Excludes hired and rejected (sample)"
          />
          <StatCard
            label="Pending leave requests"
            value={pendingLeave.length}
            hint="Waiting for approval (sample)"
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Headcount by department</h2>
            {headcountByDepartment ? (
              headcountByDepartment.map(({ department, count }) => (
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
              ))
            ) : (
              <p style={mutedStyle}>
                {loading ? "Loading…" : "Department figures are unavailable."}
              </p>
            )}
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Pending leave requests (sample)</h2>
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
                    {sampleEmployeeById.get(request.employeeId)?.name ?? "Unknown"}
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
            <h2 style={panelTitleStyle}>Recent activity (sample)</h2>
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
