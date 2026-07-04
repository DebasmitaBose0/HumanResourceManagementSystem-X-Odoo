import { User, AttendanceRecord, LeaveRequest } from './types';

export const INITIAL_EMPLOYEES: User[] = [
  {
    id: 'emp-0001',
    employeeId: 'EMP-0001',
    email: 'manisha@company.com',
    role: 'ADMIN',
    name: 'Manisha Debnath',
    phone: '+1 (555) 010-1000',
    address: '888 Broadway Ave, New York, NY 10003',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    jobTitle: 'HR Director',
    department: 'Human Resources',
    joiningDate: '2022-01-10',
    salaryStructure: {
      basic: 9500,
      allowances: 1500,
      deductions: 500,
      netSalary: 10500,
    },
    documents: [
      { id: 'doc-1', name: 'Employment_Contract.pdf', uploadDate: '2022-01-10', size: '2.4 MB' },
      { id: 'doc-2', name: 'NDA_Manisha_Debnath.pdf', uploadDate: '2022-01-10', size: '1.1 MB' }
    ]
  },
  {
    id: 'emp-1002',
    employeeId: 'EMP-1002',
    email: 'debasmita@company.com',
    role: 'EMPLOYEE',
    name: 'Debasmita Bose',
    phone: '+1 (555) 019-2834',
    address: '123 Maple Street, San Francisco, CA 94102',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    joiningDate: '2024-03-15',
    salaryStructure: {
      basic: 8500,
      allowances: 1200,
      deductions: 400,
      netSalary: 9300,
    },
    documents: [
      { id: 'doc-3', name: 'Offer_Letter_Debasmita.pdf', uploadDate: '2024-03-01', size: '1.8 MB' },
      { id: 'doc-4', name: 'NDA_Signed_Debasmita.pdf', uploadDate: '2024-03-15', size: '1.2 MB' },
      { id: 'doc-5', name: 'Direct_Deposit_Authorization.pdf', uploadDate: '2024-03-16', size: '650 KB' }
    ]
  },
  {
    id: 'emp-1003',
    employeeId: 'EMP-1003',
    email: 'joiat@company.com',
    role: 'EMPLOYEE',
    name: 'Joiat Paul',
    phone: '+1 (555) 017-9921',
    address: '456 Oak Avenue, Austin, TX 78701',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    jobTitle: 'Lead Product Designer',
    department: 'Design',
    joiningDate: '2024-06-01',
    salaryStructure: {
      basic: 7800,
      allowances: 1000,
      deductions: 350,
      netSalary: 8450,
    },
    documents: [
      { id: 'doc-6', name: 'Offer_Letter_Joiat.pdf', uploadDate: '2024-05-15', size: '1.9 MB' },
      { id: 'doc-7', name: 'NDA_Signed_Joiat.pdf', uploadDate: '2024-06-01', size: '1.1 MB' }
    ]
  },
  {
    id: 'emp-1004',
    employeeId: 'EMP-1004',
    email: 'jisjnu@company.com',
    role: 'EMPLOYEE',
    name: 'Jisjnu Paul',
    phone: '+1 (555) 014-3829',
    address: '101 Rome Blvd, Chicago, IL 60601',
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    jobTitle: 'QA Analyst',
    department: 'Engineering',
    joiningDate: '2025-02-20',
    salaryStructure: {
      basic: 6200,
      allowances: 700,
      deductions: 300,
      netSalary: 6600,
    },
    documents: [
      { id: 'doc-8', name: 'Offer_Letter_Jisjnu.pdf', uploadDate: '2025-02-10', size: '1.5 MB' }
    ]
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Debasmita Bose (EMP-1002) - Monday June 29 to Friday July 3, 2026
  { id: 'att-1', employeeId: 'EMP-1002', date: '2026-06-29', checkIn: '09:05:12', checkOut: '17:35:44', status: 'Present' },
  { id: 'att-2', employeeId: 'EMP-1002', date: '2026-06-30', checkIn: '08:55:00', checkOut: '17:40:11', status: 'Present' },
  { id: 'att-3', employeeId: 'EMP-1002', date: '2026-07-01', checkIn: '09:00:15', checkOut: '13:00:00', status: 'Half-day' },
  { id: 'att-4', employeeId: 'EMP-1002', date: '2026-07-02', checkIn: '09:12:33', checkOut: '18:02:15', status: 'Present' },
  { id: 'att-5', employeeId: 'EMP-1002', date: '2026-07-03', checkIn: '08:58:20', checkOut: '17:05:50', status: 'Present' },

  // Joiat Paul (EMP-1003) - Monday June 29 to Friday July 3, 2026
  { id: 'att-6', employeeId: 'EMP-1003', date: '2026-06-29', checkIn: '09:15:00', checkOut: '17:00:00', status: 'Present' },
  { id: 'att-7', employeeId: 'EMP-1003', date: '2026-06-30', checkIn: '09:22:45', checkOut: '17:45:00', status: 'Present' },
  { id: 'att-8', employeeId: 'EMP-1003', date: '2026-07-01', checkIn: null, checkOut: null, status: 'Leave' },
  { id: 'att-9', employeeId: 'EMP-1003', date: '2026-07-02', checkIn: '09:10:00', checkOut: '17:15:30', status: 'Present' },
  { id: 'att-10', employeeId: 'EMP-1003', date: '2026-07-03', checkIn: '09:05:11', checkOut: '17:02:00', status: 'Present' },

  // Jisjnu Paul (EMP-1004)
  { id: 'att-11', employeeId: 'EMP-1004', date: '2026-06-29', checkIn: '08:45:00', checkOut: '17:15:00', status: 'Present' },
  { id: 'att-12', employeeId: 'EMP-1004', date: '2026-06-30', checkIn: '08:50:00', checkOut: '17:30:00', status: 'Present' },
  { id: 'att-13', employeeId: 'EMP-1004', date: '2026-07-01', checkIn: '08:48:00', checkOut: '17:10:00', status: 'Present' },
  { id: 'att-14', employeeId: 'EMP-1004', date: '2026-07-02', checkIn: null, checkOut: null, status: 'Absent' },
  { id: 'att-15', employeeId: 'EMP-1004', date: '2026-07-03', checkIn: '08:55:00', checkOut: '17:00:00', status: 'Present' },
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'EMP-1002',
    employeeName: 'Debasmita Bose',
    leaveType: 'Sick',
    startDate: '2026-07-06',
    endDate: '2026-07-08',
    reason: 'Dental surgery and subsequent recovery. Doctor notes will be uploaded.',
    status: 'Pending',
    appliedOn: '2026-07-02'
  },
  {
    id: 'leave-2',
    employeeId: 'EMP-1003',
    employeeName: 'Joiat Paul',
    leaveType: 'Paid',
    startDate: '2026-07-01',
    endDate: '2026-07-01',
    reason: 'Personal urgent business in the afternoon.',
    status: 'Approved',
    adminComment: 'Approved. Enjoy your time-off.',
    appliedOn: '2026-06-28'
  },
  {
    id: 'leave-3',
    employeeId: 'EMP-1002',
    employeeName: 'Debasmita Bose',
    leaveType: 'Paid',
    startDate: '2026-06-20',
    endDate: '2026-06-22',
    reason: 'Summer weekend trip.',
    status: 'Rejected',
    adminComment: 'Unfortunately, this period overlaps with our critical project release. Please reschedule if possible.',
    appliedOn: '2026-06-10'
  }
];

export const getStoredData = () => {
  const employeesStr = localStorage.getItem('hrms_employees');
  const attendanceStr = localStorage.getItem('hrms_attendance');
  const leavesStr = localStorage.getItem('hrms_leaves');

  let employees = employeesStr ? JSON.parse(employeesStr) : INITIAL_EMPLOYEES;
  let attendance = attendanceStr ? JSON.parse(attendanceStr) : INITIAL_ATTENDANCE;
  let leaves = leavesStr ? JSON.parse(leavesStr) : INITIAL_LEAVES;

  // Smart migration: Reset store if there is old demo data
  const hasOldData = employees.some((emp: any) => emp.name === 'John Doe' || emp.name === 'Sarah Jenkins');
  if (hasOldData) {
    employees = INITIAL_EMPLOYEES;
    attendance = INITIAL_ATTENDANCE;
    leaves = INITIAL_LEAVES;
    saveStoredData({ employees, attendance, leaves });
    localStorage.removeItem('hrms_current_session');
  }

  return { employees, attendance, leaves };
};

export const saveStoredData = (data: {
  employees: User[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
}) => {
  localStorage.setItem('hrms_employees', JSON.stringify(data.employees));
  localStorage.setItem('hrms_attendance', JSON.stringify(data.attendance));
  localStorage.setItem('hrms_leaves', JSON.stringify(data.leaves));
};
