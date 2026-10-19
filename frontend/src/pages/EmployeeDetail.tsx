import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError, errorMessage, fetchEmployee } from "../api/employees";
import StatusBadge from "../components/StatusBadge";
import MainLayout from "../layouts/MainLayout";
import type { Employee } from "../types/hr";

type Result = {
  id: string;
  employee: Employee | null;
  notFound: boolean;
  error: string | null;
};

const labelStyle = {
  fontSize: "13px",
  color: "#64748b",
  margin: "0 0 4px",
} as const;

const valueStyle = {
  fontSize: "16px",
  color: "#0f172a",
  margin: 0,
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <div style={valueStyle}>{children}</div>
    </div>
  );
}

function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    fetchEmployee(id, controller.signal)
      .then((employee) =>
        setResult({ id, employee, notFound: false, error: null }),
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const notFound = error instanceof ApiError && error.status === 404;
        setResult({
          id,
          employee: null,
          notFound,
          error: notFound ? null : errorMessage(error),
        });
      });

    return () => controller.abort();
  }, [id]);

  const loading = id !== undefined && (result === null || result.id !== id);
  const current = result && result.id === id ? result : null;

  return (
    <MainLayout>
      <div style={{ textAlign: "left" }}>
        <Link to="/employees" style={{ color: "#1d4ed8", fontSize: "14px" }}>
          ← Back to employees
        </Link>

        {loading ? (
          <p style={{ color: "#64748b", marginTop: "24px" }}>
            Loading employee…
          </p>
        ) : !id || current?.notFound ? (
          <p style={{ color: "#334155", marginTop: "24px" }}>
            That employee does not exist.
          </p>
        ) : current?.error ? (
          <p style={{ color: "#b91c1c", marginTop: "24px" }} role="alert">
            {current.error}
          </p>
        ) : current?.employee ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.1)",
              padding: "24px",
              marginTop: "16px",
            }}
          >
            <h1 style={{ fontSize: "28px", margin: "0 0 4px", color: "#0f172a" }}>
              {current.employee.name}
            </h1>
            <p style={{ fontSize: "16px", color: "#64748b", margin: "0 0 24px" }}>
              {current.employee.role}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              <Field label="Email">{current.employee.email}</Field>
              <Field label="Department">{current.employee.department}</Field>
              <Field label="Status">
                <StatusBadge status={current.employee.status} />
              </Field>
              <Field label="Start date">
                {formatDate(current.employee.startDate)}
              </Field>
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}

export default EmployeeDetail;
