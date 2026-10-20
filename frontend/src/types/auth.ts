export type Role = "Admin" | "Employee";

// The signed-in account, as returned by POST /auth/login and GET /auth/me.
export type CurrentUser = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "bearer";
  expiresIn: number; // seconds
  user: CurrentUser;
};
