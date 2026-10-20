import type { Department, Employee, EmploymentStatus } from "../types/hr";
import { request } from "./client";

// Re-exported so the pages that already import them from here keep working.
export { ApiError, errorMessage } from "./client";

export type EmployeeFilters = {
  search: string;
  department: Department | "";
  status: EmploymentStatus | "";
};

export function fetchEmployees(
  filters: EmployeeFilters,
  signal: AbortSignal,
): Promise<Employee[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.department) params.set("department", filters.department);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  return request<Employee[]>(`/employees${query ? `?${query}` : ""}`, {
    signal,
  });
}

export function fetchEmployee(id: string, signal: AbortSignal): Promise<Employee> {
  return request<Employee>(`/employees/${encodeURIComponent(id)}`, { signal });
}
