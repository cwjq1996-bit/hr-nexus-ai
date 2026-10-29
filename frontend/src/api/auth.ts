import type { LoginResponse } from "../types/auth";
import { request } from "./client";

export function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    authenticated: false,
  });
}
