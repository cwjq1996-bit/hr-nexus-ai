import { clearSession, getState } from "../auth/sessionStore";

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

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  // Send the access token. Only the login request turns this off.
  authenticated?: boolean;
};

// FastAPI reports its own error text as { "detail": "..." }.
async function readDetail(response: Response): Promise<string | null> {
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null && "detail" in data) {
      const detail = (data as { detail: unknown }).detail;
      if (typeof detail === "string") return detail;
    }
  } catch {
    // The body was not JSON. Fall back to a generic message.
  }
  return null;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal, authenticated = true } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const tokenSent = authenticated ? (getState().session?.token ?? null) : null;
  if (tokenSent) headers.Authorization = `Bearer ${tokenSent}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      0,
      "Cannot reach the API. Check that the backend is running on port 8000.",
    );
  }

  if (response.ok) return (await response.json()) as T;

  if (authenticated && response.status === 401) {
    // End the session only if the token that was rejected is still the current
    // one, so a slow old request cannot sign out a newer login.
    if (tokenSent !== null && getState().session?.token === tokenSent) {
      clearSession("expired");
    }
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  const detail = await readDetail(response);
  switch (response.status) {
    case 401:
      // A failed login. The server's text is deliberately the same for a wrong
      // password and an unknown email.
      throw new ApiError(401, detail ?? "Incorrect email or password.");
    case 403:
      throw new ApiError(403, "You do not have permission to do that.");
    case 404:
      throw new ApiError(404, "Not found.");
    case 422:
      throw new ApiError(422, "Check the details you entered and try again.");
    case 503:
      throw new ApiError(503, detail ?? "The service is unavailable.");
    default:
      throw new ApiError(
        response.status,
        `The server returned an error (${response.status}).`,
      );
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
