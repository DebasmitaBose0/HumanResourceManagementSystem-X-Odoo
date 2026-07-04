import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, LeaveRequest, UserRole, LeaveStatus } from './types';
import { getStoredData, saveStoredData } from './data';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('hrms_theme') as 'light' | 'dark') || 'light';
  });

  // Session state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedViewRole, setSelectedViewRole] = useState<UserRole>('EMPLOYEE');
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Load initial data from localStorage on mount
  useEffect(() => {
    const data = getStoredData();
    setEmployees(data.employees);
    setAttendance(data.attendance);
    setLeaves(data.leaves);

    // Check if session already active in localStorage
    const storedSession = localStorage.getItem('hrms_current_session');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      // Double check user still exists
      const foundUser = data.employees.find((emp: User) => emp.id === parsedSession.id);
      if (foundUser) {
        setCurrentUser(foundUser);
        setSelectedViewRole(foundUser.role);
        setActiveTab(foundUser.role === 'ADMIN' ? 'employees' : 'profile');
      }
    }
  }, []);

  // Theme side effects
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hrms_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Save changes to localStorage whenever data changes
  const persistChanges = (
    updatedEmployees: User[],
    updatedAttendance: AttendanceRecord[],
    updatedLeaves: LeaveRequest[]
  ) => {
    setEmployees(updatedEmployees);
    setAttendance(updatedAttendance);
    setLeaves(updatedLeaves);
    saveStoredData({
      employees: updatedEmployees,
      attendance: updatedAttendance,
      leaves: updatedLeaves,
    });
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setSelectedViewRole(user.role);
    setActiveTab(user.role === 'ADMIN' ? 'employees' : 'profile');
    localStorage.setItem('hrms_current_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hrms_current_session');
  };

  const handleRegisterSuccess = (newUser: User) => {
    const updatedEmployees = [...employees, newUser];
    persistChanges(updatedEmployees, attendance, leaves);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === updatedUser.id ? updatedUser : emp
    );
    persistChanges(updatedEmployees, attendance, leaves);
    setCurrentUser(updatedUser);
    
    // Update active storage session
    const currentSession = localStorage.getItem('hrms_current_session');
    if (currentSession) {
      const parsed = JSON.parse(currentSession);
      if (parsed.id === updatedUser.id) {
        localStorage.setItem('hrms_current_session', JSON.stringify(updatedUser));
      }
    }
  };

  const handleUpdateEmployee = (updatedUser: User) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === updatedUser.id ? updatedUser : emp
    );
    persistChanges(updatedEmployees, attendance, leaves);

    // If edited employee is current user, update current user state too
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteEmployee = (empId: string) => {
    const updatedEmployees = employees.filter((emp) => emp.id !== empId);
    persistChanges(updatedEmployees, attendance, leaves);
  };

  const handleAddAttendance = (record: AttendanceRecord) => {
    const updatedAttendance = [...attendance, record];
    persistChanges(employees, updatedAttendance, leaves);
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    const updatedAttendance = attendance.map((att) =>
      att.id === record.id ? record : att
    );
    persistChanges(employees, updatedAttendance, leaves);
  };

  const handleApplyLeave = (leave: LeaveRequest) => {
    const updatedLeaves = [...leaves, leave];
    persistChanges(employees, attendance, updatedLeaves);
  };

  const handleUpdateLeaveStatus = (leaveId: string, status: LeaveStatus, comment?: string) => {
    const updatedLeaves = leaves.map((l) => {
      if (l.id === leaveId) {
        return {
          ...l,
          status,
          adminComment: comment || l.adminComment,
        };
      }
      return l;
    });

    // If leave is approved, let's automatically log an attendance record with status 'Leave'
    // for all dates within the leave range that are in the system.
    let updatedAttendance = [...attendance];
    const leaveToUpdate = leaves.find((l) => l.id === leaveId);
    
    if (leaveToUpdate && status === 'Approved') {
      const start = new Date(leaveToUpdate.startDate);
      const end = new Date(leaveToUpdate.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Skip weekend dates
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Check if attendance already has a record for this date and employee
        const existingRecordIdx = updatedAttendance.findIndex(
          (rec) => rec.employeeId === leaveToUpdate.employeeId && rec.date === dateStr
        );

        const leaveAttendanceRecord: AttendanceRecord = {
          id: `att-leave-${leaveToUpdate.employeeId}-${dateStr}-${Date.now()}`,
          employeeId: leaveToUpdate.employeeId,
          date: dateStr,
          checkIn: null,
          checkOut: null,
          status: 'Leave',
        };

        if (existingRecordIdx >= 0) {
          // Update existing to Leave
          updatedAttendance[existingRecordIdx] = {
            ...updatedAttendance[existingRecordIdx],
            status: 'Leave',
            checkIn: null,
            checkOut: null,
          };
        } else {
          // Add new record
          updatedAttendance.push(leaveAttendanceRecord);
        }
      }
    }

    persistChanges(employees, updatedAttendance, updatedLeaves);
  };

  // If no session, show Login Screen
  if (!currentUser) {
    return (
      <Login
        employees={employees}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300" id="hrms-workspace">
      
      {/* Dynamic Navigation Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        selectedViewRole={selectedViewRole}
        setSelectedViewRole={setSelectedViewRole}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Viewport */}
      {['employees', 'attendance_records', 'leave_approvals', 'payroll_control'].includes(activeTab) ? (
        <AdminDashboard
          employees={employees}
          attendance={attendance}
          leaves={leaves}
          activeTab={activeTab}
          onAddEmployee={handleUpdateEmployee} // Or separate onboard function
          onUpdateEmployee={handleUpdateEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onUpdateLeaveStatus={handleUpdateLeaveStatus}
        />
      ) : (
        <EmployeeDashboard
          currentUser={currentUser}
          attendance={attendance}
          leaves={leaves}
          activeTab={activeTab}
          onUpdateProfile={handleUpdateProfile}
          onAddAttendance={handleAddAttendance}
          onUpdateAttendance={handleUpdateAttendance}
          onApplyLeave={handleApplyLeave}
        />
      )}

    </div>
  );
}
