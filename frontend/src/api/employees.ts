import type { Department, Employee, EmploymentStatus } from "../types/hr";

// The backend runs on port 8000 during development. Override it with
// VITE_API_URL in frontend/.env (see frontend/.env.example).
const API_BASE: string =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type EmployeeFilters = {
  search: string;
  department: Department | "";
  status: EmploymentStatus | "";
};

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      0,
      "Cannot reach the API. Check that the backend is running on port 8000.",
    );
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.status === 404
        ? "Not found."
        : `The server returned an error (${response.status}).`,
    );
  }
  return (await response.json()) as T;
}

export function fetchEmployees(
  filters: EmployeeFilters,
  signal: AbortSignal,
): Promise<Employee[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.department) params.set("department", filters.department);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  return getJson<Employee[]>(`/employees${query ? `?${query}` : ""}`, signal);
}

export function fetchEmployee(id: string, signal: AbortSignal): Promise<Employee> {
  return getJson<Employee>(`/employees/${encodeURIComponent(id)}`, signal);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
