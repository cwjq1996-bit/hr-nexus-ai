import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { errorMessage, fetchEmployees } from "../api/employees";
import StatusBadge from "../components/StatusBadge";
import MainLayout from "../layouts/MainLayout";
import type { Department, Employee, EmploymentStatus } from "../types/hr";

const DEPARTMENTS: Department[] = [
  "Engineering",
  "People",
  "Sales",
  "Operations",
  "Finance",
];
const STATUSES: EmploymentStatus[] = ["Active", "On leave", "Probation"];

type Result = {
  key: string;
  employees: Employee[] | null;
  error: string | null;
};

const controlStyle = {
  padding: "8px 12px",
  fontSize: "15px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "white",
  color: "#0f172a",
} as const;

const cellStyle = {
  padding: "12px 16px",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "15px",
  color: "#334155",
} as const;

const headerCellStyle = {
  ...cellStyle,
  fontSize: "13px",
  fontWeight: 600,
  color: "#64748b",
  backgroundColor: "#f8fafc",
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Employees() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<Department | "">("");
  const [status, setStatus] = useState<EmploymentStatus | "">("");
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  // Wait until the user stops typing before asking the API.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const key = `${search}|${department}|${status}|${reloadCount}`;

  useEffect(() => {
    const controller = new AbortController();

    fetchEmployees({ search, department, status }, controller.signal)
      .then((employees) => setResult({ key, employees, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ key, employees: null, error: errorMessage(error) });
      });

    // Cancels the request if the filters change before it finishes.
    return () => controller.abort();
  }, [key, search, department, status]);

  // Loading is derived: the stored result belongs to an older set of filters.
  const loading = result === null || result.key !== key;
  const employees = result?.employees ?? [];
  const hasFilters = searchInput !== "" || department !== "" || status !== "";

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setDepartment("");
    setStatus("");
  }

  return (
    <MainLayout>
      <div style={{ textAlign: "left" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 4px", color: "#0f172a" }}>
          Employees
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px" }}>
          Search and filter the people in your organisation.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <input
            type="search"
            placeholder="Search name, email or role"
            aria-label="Search employees"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            style={{ ...controlStyle, minWidth: "260px", flex: "1 1 260px" }}
          />
          <select
            aria-label="Filter by department"
            value={department}
            onChange={(event) =>
              setDepartment(event.target.value as Department | "")
            }
            style={controlStyle}
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as EmploymentStatus | "")
            }
            style={controlStyle}
          >
            <option value="">All statuses</option>
            {STATUSES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              style={{ ...controlStyle, cursor: "pointer" }}
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.1)",
            overflowX: "auto",
          }}
        >
          {loading ? (
            <p style={{ padding: "24px", color: "#64748b", margin: 0 }}>
              Loading employees…
            </p>
          ) : result?.error ? (
            <div style={{ padding: "24px" }}>
              <p style={{ color: "#b91c1c", margin: "0 0 12px" }} role="alert">
                {result.error}
              </p>
              <button
                type="button"
                onClick={() => setReloadCount((count) => count + 1)}
                style={{ ...controlStyle, cursor: "pointer" }}
              >
                Try again
              </button>
            </div>
          ) : employees.length === 0 ? (
            <p style={{ padding: "24px", color: "#64748b", margin: 0 }}>
              No employees match these filters.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Name</th>
                  <th style={headerCellStyle}>Role</th>
                  <th style={headerCellStyle}>Department</th>
                  <th style={headerCellStyle}>Status</th>
                  <th style={headerCellStyle}>Start date</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td style={cellStyle}>
                      <Link
                        to={`/employees/${employee.id}`}
                        style={{ color: "#1d4ed8", fontWeight: 500 }}
                      >
                        {employee.name}
                      </Link>
                      <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                        {employee.email}
                      </div>
                    </td>
                    <td style={cellStyle}>{employee.role}</td>
                    <td style={cellStyle}>{employee.department}</td>
                    <td style={cellStyle}>
                      <StatusBadge status={employee.status} />
                    </td>
                    <td style={cellStyle}>{formatDate(employee.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !result?.error && employees.length > 0 ? (
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "12px" }}>
            Showing {employees.length}{" "}
            {employees.length === 1 ? "employee" : "employees"}.
          </p>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default Employees;
