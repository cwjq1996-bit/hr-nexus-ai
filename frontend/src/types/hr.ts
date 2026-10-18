export type Department =
  | "Engineering"
  | "People"
  | "Sales"
  | "Operations"
  | "Finance";

export type EmploymentStatus = "Active" | "On leave" | "Probation";

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: Department;
  status: EmploymentStatus;
  startDate: string; // ISO date, e.g. "2024-03-01"
};

export type LeaveType = "Annual" | "Sick" | "Parental" | "Unpaid";

export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string; // ISO date
  endDate: string; // ISO date
  days: number;
  status: LeaveStatus;
};

export type CandidateStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected";

export type Candidate = {
  id: string;
  name: string;
  roleApplied: string;
  stage: CandidateStage;
  appliedOn: string; // ISO date
};

export type JobOpening = {
  id: string;
  title: string;
  department: Department;
  openings: number;
};

export type ActivityItem = {
  id: string;
  message: string;
  date: string; // ISO date
};
