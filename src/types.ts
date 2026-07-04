export type UserRole = 'ADMIN' | 'EMPLOYEE';

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave';

export interface SalaryStructure {
  basic: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
}

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  address: string;
  profilePicture: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  salaryStructure: SalaryStructure;
  documents: EmployeeDocument[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:MM:SS
  checkOut: string | null; // HH:MM:SS
  status: AttendanceStatus;
}

export type LeaveType = 'Paid' | 'Sick' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  adminComment?: string;
  appliedOn: string; // YYYY-MM-DD
}
