import type {
  ActivityItem,
  Candidate,
  Department,
  Employee,
  JobOpening,
  LeaveRequest,
} from "../types/hr";

// All names and emails below are fictional placeholder data.

export const departments: Department[] = [
  "Engineering",
  "People",
  "Sales",
  "Operations",
  "Finance",
];

export const employees: Employee[] = [
  { id: "e1", name: "Amelia Hart", email: "amelia.hart@example.com", role: "Engineering Manager", department: "Engineering", status: "Active", startDate: "2021-02-08" },
  { id: "e2", name: "Noah Bennett", email: "noah.bennett@example.com", role: "Software Engineer", department: "Engineering", status: "Active", startDate: "2022-06-20" },
  { id: "e3", name: "Priya Shah", email: "priya.shah@example.com", role: "Data Engineer", department: "Engineering", status: "On leave", startDate: "2023-01-16" },
  { id: "e4", name: "Lucas Moreau", email: "lucas.moreau@example.com", role: "Frontend Developer", department: "Engineering", status: "Probation", startDate: "2026-08-24" },
  { id: "e5", name: "Grace Okafor", email: "grace.okafor@example.com", role: "HR Business Partner", department: "People", status: "Active", startDate: "2020-09-14" },
  { id: "e6", name: "Ethan Clarke", email: "ethan.clarke@example.com", role: "Talent Acquisition Lead", department: "People", status: "Active", startDate: "2022-03-07" },
  { id: "e7", name: "Sofia Rossi", email: "sofia.rossi@example.com", role: "Account Executive", department: "Sales", status: "Active", startDate: "2023-05-02" },
  { id: "e8", name: "Oliver Grant", email: "oliver.grant@example.com", role: "Sales Development Rep", department: "Sales", status: "Probation", startDate: "2026-09-07" },
  { id: "e9", name: "Hannah Lee", email: "hannah.lee@example.com", role: "Operations Coordinator", department: "Operations", status: "Active", startDate: "2021-11-29" },
  { id: "e10", name: "Mateo Alvarez", email: "mateo.alvarez@example.com", role: "Facilities Manager", department: "Operations", status: "On leave", startDate: "2019-04-15" },
  { id: "e11", name: "Isla Murray", email: "isla.murray@example.com", role: "Financial Controller", department: "Finance", status: "Active", startDate: "2020-01-20" },
  { id: "e12", name: "Daniel Foster", email: "daniel.foster@example.com", role: "Payroll Analyst", department: "Finance", status: "Active", startDate: "2024-07-01" },
];

export const jobOpenings: JobOpening[] = [
  { id: "j1", title: "Senior Backend Engineer", department: "Engineering", openings: 2 },
  { id: "j2", title: "HR Coordinator", department: "People", openings: 1 },
  { id: "j3", title: "Sales Manager", department: "Sales", openings: 1 },
  { id: "j4", title: "Accounts Assistant", department: "Finance", openings: 1 },
];

export const candidates: Candidate[] = [
  { id: "c1", name: "Jamie Walsh", roleApplied: "Senior Backend Engineer", stage: "Interview", appliedOn: "2026-10-01" },
  { id: "c2", name: "Aisha Rahman", roleApplied: "Senior Backend Engineer", stage: "Screening", appliedOn: "2026-10-08" },
  { id: "c3", name: "Tom Fletcher", roleApplied: "HR Coordinator", stage: "Offer", appliedOn: "2026-09-22" },
  { id: "c4", name: "Chloe Dubois", roleApplied: "Sales Manager", stage: "Applied", appliedOn: "2026-10-14" },
  { id: "c5", name: "Ravi Patel", roleApplied: "Accounts Assistant", stage: "Rejected", appliedOn: "2026-09-30" },
  { id: "c6", name: "Megan Cole", roleApplied: "HR Coordinator", stage: "Hired", appliedOn: "2026-09-10" },
];

export const leaveRequests: LeaveRequest[] = [
  { id: "l1", employeeId: "e2", type: "Annual", startDate: "2026-11-02", endDate: "2026-11-06", days: 5, status: "Pending" },
  { id: "l2", employeeId: "e7", type: "Annual", startDate: "2026-12-21", endDate: "2026-12-31", days: 7, status: "Pending" },
  { id: "l3", employeeId: "e9", type: "Sick", startDate: "2026-10-19", endDate: "2026-10-20", days: 2, status: "Pending" },
  { id: "l4", employeeId: "e3", type: "Parental", startDate: "2026-09-28", endDate: "2027-03-26", days: 130, status: "Approved" },
  { id: "l5", employeeId: "e11", type: "Unpaid", startDate: "2026-11-16", endDate: "2026-11-16", days: 1, status: "Rejected" },
];

export const recentActivity: ActivityItem[] = [
  { id: "a1", message: "Tom Fletcher moved to the Offer stage for HR Coordinator", date: "2026-10-16" },
  { id: "a2", message: "Hannah Lee requested 2 days of sick leave", date: "2026-10-16" },
  { id: "a3", message: "Megan Cole accepted the HR Coordinator role", date: "2026-10-15" },
  { id: "a4", message: "Chloe Dubois applied for Sales Manager", date: "2026-10-14" },
  { id: "a5", message: "Oliver Grant started a probation review cycle", date: "2026-10-12" },
];
