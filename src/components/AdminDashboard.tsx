import React, { useState } from 'react';
import { User, AttendanceRecord, LeaveRequest, AttendanceStatus, LeaveStatus } from '../types';
import { 
  Users, Calendar, CheckSquare, Landmark, Search, Plus, Edit2, Check, X, FileText, CheckCircle, 
  AlertCircle, Filter, Trash2, ArrowRight, UserCheck, HelpCircle, Save 
} from 'lucide-react';

interface AdminDashboardProps {
  employees: User[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  activeTab: string;
  onAddEmployee: (employee: User) => void;
  onUpdateEmployee: (employee: User) => void;
  onDeleteEmployee: (empId: string) => void;
  onUpdateLeaveStatus: (leaveId: string, status: LeaveStatus, comment?: string) => void;
}

export default function AdminDashboard({
  employees,
  attendance,
  leaves,
  activeTab,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onUpdateLeaveStatus,
}: AdminDashboardProps) {

  // Global search & filters
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // New Employee Onboarding form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newRole, setNewRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');
  const [newBasic, setNewBasic] = useState('6000');
  const [newAllowances, setNewAllowances] = useState('800');
  const [newDeductions, setNewDeductions] = useState('300');
  const [onboardError, setOnboardError] = useState('');
  const [onboardSuccess, setOnboardSuccess] = useState('');

  // Editing employee state
  const [editingEmp, setEditingEmp] = useState<User | null>(null);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBasic, setEditBasic] = useState('');
  const [editAllowances, setEditAllowances] = useState('');
  const [editDeductions, setEditDeductions] = useState('');

  // Attendance filter
  const [attSearch, setAttSearch] = useState('');
  const [attStatusFilter, setAttStatusFilter] = useState<string>('All');

  // Leave approval comments
  const [adminComments, setAdminComments] = useState<{ [key: string]: string }>({});

  // Payroll state
  const [editingPayrollEmp, setEditingPayrollEmp] = useState<User | null>(null);
  const [payrollBasic, setPayrollBasic] = useState('');
  const [payrollAllowances, setPayrollAllowances] = useState('');
  const [payrollDeductions, setPayrollDeductions] = useState('');
  const [payrollSuccess, setPayrollSuccess] = useState('');

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(employeeSearch.toLowerCase());
    
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Filter attendance logs
  const filteredAttendance = attendance.filter((rec) => {
    const emp = employees.find(e => e.employeeId === rec.employeeId);
    const empName = emp ? emp.name : '';
    const matchesSearch = 
      rec.employeeId.toLowerCase().includes(attSearch.toLowerCase()) ||
      empName.toLowerCase().includes(attSearch.toLowerCase()) ||
      rec.date.includes(attSearch);

    const matchesStatus = attStatusFilter === 'All' || rec.status === attStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Onboard submit
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError('');
    setOnboardSuccess('');

    if (!newId || !newName || !newEmail || !newJobTitle) {
      setOnboardError('Please fill in Name, Email, Employee ID, and Job Title.');
      return;
    }

    // Check conflict
    const idExists = employees.some(e => e.employeeId.toUpperCase() === newId.toUpperCase());
    const emailExists = employees.some(e => e.email.toLowerCase() === newEmail.toLowerCase());

    if (idExists) {
      setOnboardError('Employee ID already exists.');
      return;
    }
    if (emailExists) {
      setOnboardError('Email Address already exists.');
      return;
    }

    const basicVal = parseFloat(newBasic) || 0;
    const allowVal = parseFloat(newAllowances) || 0;
    const dedVal = parseFloat(newDeductions) || 0;

    const newEmp: User = {
      id: `emp-${Date.now()}`,
      employeeId: newId.toUpperCase(),
      email: newEmail,
      role: newRole,
      name: newName,
      phone: newPhone || '+1 (555) 000-0000',
      address: newAddress || 'Not specified',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      jobTitle: newJobTitle,
      department: newDepartment,
      joiningDate: new Date().toISOString().split('T')[0],
      salaryStructure: {
        basic: basicVal,
        allowances: allowVal,
        deductions: dedVal,
        netSalary: basicVal + allowVal - dedVal
      },
      documents: [
        { id: `doc-onboard-${Date.now()}`, name: 'Onboarding_Declaration.pdf', uploadDate: new Date().toISOString().split('T')[0], size: '380 KB' }
      ]
    };

    onAddEmployee(newEmp);
    setOnboardSuccess(`Successfully onboarded ${newName}!`);
    setNewId('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setNewJobTitle('');
    setTimeout(() => {
      setOnboardSuccess('');
      setShowAddForm(false);
    }, 2000);
  };

  // Start editing employee
  const handleStartEdit = (emp: User) => {
    setEditingEmp(emp);
    setEditJobTitle(emp.jobTitle);
    setEditDepartment(emp.department);
    setEditPhone(emp.phone);
    setEditAddress(emp.address);
    setEditBasic(emp.salaryStructure.basic.toString());
    setEditAllowances(emp.salaryStructure.allowances.toString());
    setEditDeductions(emp.salaryStructure.deductions.toString());
  };

  // Submit employee edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    const basicVal = parseFloat(editBasic) || 0;
    const allowVal = parseFloat(editAllowances) || 0;
    const dedVal = parseFloat(editDeductions) || 0;

    const updated: User = {
      ...editingEmp,
      jobTitle: editJobTitle,
      department: editDepartment,
      phone: editPhone,
      address: editAddress,
      salaryStructure: {
        basic: basicVal,
        allowances: allowVal,
        deductions: dedVal,
        netSalary: basicVal + allowVal - dedVal
      }
    };

    onUpdateEmployee(updated);
    setEditingEmp(null);
  };

  // Start editing payroll
  const handleStartPayrollEdit = (emp: User) => {
    setEditingPayrollEmp(emp);
    setPayrollBasic(emp.salaryStructure.basic.toString());
    setPayrollAllowances(emp.salaryStructure.allowances.toString());
    setPayrollDeductions(emp.salaryStructure.deductions.toString());
  };

  // Save payroll changes
  const handleSavePayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayrollEmp) return;

    const basicVal = parseFloat(payrollBasic) || 0;
    const allowVal = parseFloat(payrollAllowances) || 0;
    const dedVal = parseFloat(payrollDeductions) || 0;

    const updated: User = {
      ...editingPayrollEmp,
      salaryStructure: {
        basic: basicVal,
        allowances: allowVal,
        deductions: dedVal,
        netSalary: basicVal + allowVal - dedVal
      }
    };

    onUpdateEmployee(updated);
    setEditingPayrollEmp(null);
    setPayrollSuccess(`Salary structure updated successfully for ${editingPayrollEmp.name}!`);
    setTimeout(() => setPayrollSuccess(''), 4000);
  };

  const handleLeaveAction = (leaveId: string, status: LeaveStatus) => {
    const comment = adminComments[leaveId] || '';
    onUpdateLeaveStatus(leaveId, status, comment);
    // Clear comment field
    setAdminComments(prev => {
      const copy = { ...prev };
      delete copy[leaveId];
      return copy;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950" id="admin-dashboard-viewport">
      
      {/* Upper Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="admin-header">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
            {activeTab === 'employees' && "Employee Registry & Onboarding"}
            {activeTab === 'attendance_records' && "Global Attendance Records"}
            {activeTab === 'leave_approvals' && "Leave Approval Workflows"}
            {activeTab === 'payroll_control' && "Enterprise Payroll Manager"}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {activeTab === 'employees' && "Provision new accounts, edit salaries and view corporate registry"}
            {activeTab === 'attendance_records' && "Track staff entry logs, check-in times and calculate shift completions"}
            {activeTab === 'leave_approvals' && "Review pending leave requests, check reason and write authorization remarks"}
            {activeTab === 'payroll_control' && "Oversee base pays, calculate withholdings and trigger final monthly payslips"}
          </p>
        </div>
        {activeTab === 'employees' && (
          <button
            type="button"
            id="btn-trigger-onboard"
            onClick={() => setShowAddForm(true)}
            className="bg-odoo-primary hover:bg-odoo-dark text-white font-semibold py-2 px-4 rounded-xl text-xs shadow-md shadow-odoo-primary/25 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            Onboard New Employee
          </button>
        )}
        {activeTab === 'payroll_control' && (
          <button
            type="button"
            id="btn-finalize-all-payroll"
            onClick={() => alert('Corporate payroll for the month of June 2026 has been locked and disbursed successfully!')}
            className="bg-odoo-accent hover:bg-odoo-accent-hover text-white font-semibold py-2 px-4 rounded-xl text-xs shadow-md shadow-odoo-accent/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Finalize Monthly Payroll
          </button>
        )}
      </header>

      {/* Viewport container */}
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* EMPLOYEE REGISTRY TAB */}
        {activeTab === 'employees' && (
          <div className="space-y-6" id="panel-admin-employees">
            
            {/* Search/Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="employee-registry-search"
                  type="text"
                  placeholder="Search by ID, Name or Email..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-odoo-primary focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold">Department:</span>
                <select
                  id="employee-dept-filter"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-odoo-primary cursor-pointer font-medium"
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="admin-employees-table-container">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Employee Details</th>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Basic Pay</th>
                      <th className="px-6 py-4">Net Salary</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={emp.profilePicture} 
                              alt={emp.name} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                            />
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{emp.name}</p>
                              <p className="text-slate-400 text-xs mt-0.5">{emp.jobTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-600">{emp.employeeId}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${emp.role === 'ADMIN' ? 'bg-odoo-primary/10 text-odoo-primary' : 'bg-slate-100 text-slate-500'}`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-slate-600">₹{emp.salaryStructure.basic.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">₹{emp.salaryStructure.netSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              id={`btn-edit-emp-${emp.employeeId}`}
                              onClick={() => handleStartEdit(emp)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-odoo-primary transition-colors cursor-pointer"
                              title="Modify Employee Settings"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {emp.id !== 'emp-0001' && (
                              <button
                                type="button"
                                id={`btn-delete-emp-${emp.employeeId}`}
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${emp.name}?`)) {
                                    onDeleteEmployee(emp.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Terminate Employee Profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* GLOBAL ATTENDANCE RECORDS TAB */}
        {activeTab === 'attendance_records' && (
          <div className="space-y-6" id="panel-admin-attendance">
            
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="attendance-log-search"
                  type="text"
                  placeholder="Search by Employee name, ID, or Date..."
                  value={attSearch}
                  onChange={(e) => setAttSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-odoo-primary focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold">Status:</span>
                <select
                  id="attendance-status-filter"
                  value={attStatusFilter}
                  onChange={(e) => setAttStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-odoo-primary cursor-pointer font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Leave">On Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            {/* Attendance list table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="admin-attendance-table-container">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Log Date</th>
                      <th className="px-6 py-4">Check-In</th>
                      <th className="px-6 py-4">Check-Out</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Working Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...filteredAttendance].reverse().map((rec) => {
                      const emp = employees.find(e => e.employeeId === rec.employeeId);
                      
                      let statusBadge = 'bg-slate-100 text-slate-600';
                      if (rec.status === 'Present') statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                      if (rec.status === 'Half-day') statusBadge = 'bg-amber-50 text-amber-700 border border-amber-100';
                      if (rec.status === 'Leave') statusBadge = 'bg-purple-50 text-purple-700 border border-purple-100';
                      if (rec.status === 'Absent') statusBadge = 'bg-rose-50 text-rose-700 border border-rose-100';

                      let hrsStr = '--';
                      if (rec.checkIn && rec.checkOut) {
                        const [inH, inM] = rec.checkIn.split(':').map(Number);
                        const [outH, outM] = rec.checkOut.split(':').map(Number);
                        const diffHours = (outH + outM / 60) - (inH + inM / 60);
                        hrsStr = `${diffHours.toFixed(1)} hrs`;
                      } else if (rec.checkIn) {
                        hrsStr = 'In-Progress';
                      }

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800">{emp ? emp.name : 'Unknown Staff'}</td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-600">{rec.employeeId}</td>
                          <td className="px-6 py-4 font-bold text-slate-600">{rec.date}</td>
                          <td className="px-6 py-4 font-mono">{rec.checkIn || '--'}</td>
                          <td className="px-6 py-4 font-mono">{rec.checkOut || '--'}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge}`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800 font-mono">{hrsStr}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* LEAVE APPROVAL WORKFLOWS TAB */}
        {activeTab === 'leave_approvals' && (
          <div className="space-y-6" id="panel-admin-leaves">
            
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800">Review Leave Request Logs</h3>
              <p className="text-xs text-slate-400">Review, approve, or decline incoming employee leave requests. Adding a descriptive rejection or appreciation remark helps team coherence.</p>
              
              <div className="space-y-4" id="admin-leaves-registry">
                {leaves.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No leave requests currently logged in the workspace.</p>
                ) : (
                  [...leaves].reverse().map((req) => {
                    const emp = employees.find(e => e.employeeId === req.employeeId);
                    
                    return (
                      <div key={req.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-sm transition-all">
                        
                        <div className="space-y-3 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-bold text-slate-800 text-sm">{req.employeeName}</span>
                            <span className="font-mono text-[10px] font-bold text-slate-400">{req.employeeId}</span>
                            <span className="text-[9px] bg-odoo-primary/10 text-odoo-primary font-bold px-2 py-0.5 rounded-full uppercase">
                              {req.leaveType} Leave
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          <div className="text-xs font-bold font-mono text-slate-600 flex items-center gap-1.5">
                            <span>Requested Duration:</span>
                            <span className="bg-white border px-2 py-0.5 rounded-md text-slate-700">{req.startDate} to {req.endDate}</span>
                          </div>

                          <p className="text-xs text-slate-500 bg-white/60 p-2.5 rounded-xl border border-slate-100 italic">" {req.reason} "</p>

                          {req.adminComment && (
                            <div className="text-[10px] bg-slate-100/80 p-2.5 rounded-xl text-slate-600 font-medium">
                              <span className="font-bold text-slate-800">HR Decision Note:</span> {req.adminComment}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {req.status === 'Pending' ? (
                          <div className="w-full md:w-64 space-y-3 shrink-0">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Decision Comment</label>
                              <input
                                id={`leave-comment-input-${req.id}`}
                                type="text"
                                placeholder="Write comments or reasons..."
                                value={adminComments[req.id] || ''}
                                onChange={(e) => setAdminComments({ ...adminComments, [req.id]: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-700"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                id={`btn-approve-leave-${req.id}`}
                                onClick={() => handleLeaveAction(req.id, 'Approved')}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-1.5 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                type="button"
                                id={`btn-reject-leave-${req.id}`}
                                onClick={() => handleLeaveAction(req.id, 'Rejected')}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-1.5 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <X className="w-3.5 h-3.5" /> Decline
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic font-medium shrink-0">
                            Finalized by Admin
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* PAYROLL MANAGER TAB */}
        {activeTab === 'payroll_control' && (
          <div className="space-y-6" id="panel-admin-payroll">
            
            {payrollSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                {payrollSuccess}
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="admin-payroll-table-container">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-display font-bold text-lg text-slate-800">Financial Ledger Outlays</h3>
                <p className="text-xs text-slate-400">Review net employee outlays and modify salary scales directly.</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Basic Pay</th>
                      <th className="px-6 py-4">Allowances</th>
                      <th className="px-6 py-4">Deductions</th>
                      <th className="px-6 py-4">Net Outlay</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{emp.name}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-600">{emp.employeeId}</td>
                        <td className="px-6 py-4 font-mono font-medium">₹{emp.salaryStructure.basic.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono font-medium text-emerald-600">+₹{emp.salaryStructure.allowances.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono font-medium text-rose-500">-₹{emp.salaryStructure.deductions.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">₹{emp.salaryStructure.netSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            id={`btn-payroll-edit-${emp.employeeId}`}
                            onClick={() => handleStartPayrollEdit(emp)}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Landmark className="w-3 h-3 text-slate-400" /> Adjust Scale
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ADJUST PAYROLL SCALE DIALOG MODAL */}
      {editingPayrollEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-adjust-payroll">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-800">Adjust Remuneration Scale</h3>
              <p className="text-xs text-slate-400 mt-1">Modifying wages for <span className="font-bold text-slate-600">{editingPayrollEmp.name}</span> ({editingPayrollEmp.employeeId})</p>
            </div>

            <form onSubmit={handleSavePayroll} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Basic Contract Wage (₹) *</label>
                <input
                  id="payroll-input-basic"
                  type="number"
                  value={payrollBasic}
                  onChange={(e) => setPayrollBasic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-odoo-primary text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Allowances & Utility Perks (₹)</label>
                <input
                  id="payroll-input-allowances"
                  type="number"
                  value={payrollAllowances}
                  onChange={(e) => setPayrollAllowances(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-odoo-primary text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Withholding Taxes & Deductions (₹)</label>
                <input
                  id="payroll-input-deductions"
                  type="number"
                  value={payrollDeductions}
                  onChange={(e) => setPayrollDeductions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-odoo-primary text-slate-800"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border text-center space-y-1 font-mono">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Net Outlay</span>
                <p className="text-2xl font-bold text-odoo-primary">
                  ₹{( (parseFloat(payrollBasic) || 0) + (parseFloat(payrollAllowances) || 0) - (parseFloat(payrollDeductions) || 0) ).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  id="btn-cancel-payroll-adjust"
                  onClick={() => setEditingPayrollEmp(null)}
                  className="flex-1 border border-slate-200 text-slate-500 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-payroll-adjust"
                  className="flex-1 bg-odoo-primary hover:bg-odoo-dark text-white font-semibold py-2.5 rounded-xl text-xs shadow-md shadow-odoo-primary/20 cursor-pointer"
                >
                  Save Wage Scale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED MODIFY EMPLOYEE SETTINGS DIALOG MODAL */}
      {editingEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-edit-employee">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-800">Edit Employee Profile & Salary</h3>
              <p className="text-xs text-slate-400 mt-1">Altering organizational attributes for <span className="font-bold text-slate-600">{editingEmp.name}</span></p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Job Title</label>
                  <input
                    type="text"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Contact</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Home Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Adjust Salary Structure</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Basic Pay (₹)</label>
                    <input
                      type="number"
                      value={editBasic}
                      onChange={(e) => setEditBasic(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Allowances (₹)</label>
                    <input
                      type="number"
                      value={editAllowances}
                      onChange={(e) => setEditAllowances(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Deductions (₹)</label>
                    <input
                      type="number"
                      value={editDeductions}
                      onChange={(e) => setEditDeductions(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  id="btn-cancel-edit"
                  onClick={() => setEditingEmp(null)}
                  className="flex-1 border border-slate-200 text-slate-500 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-edit"
                  className="flex-1 bg-odoo-primary hover:bg-odoo-dark text-white font-semibold py-2.5 rounded-xl text-xs shadow-md shadow-odoo-primary/20 cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ONBOARD NEW EMPLOYEE PROFILE DIALOG MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="modal-onboard-employee">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-800">Onboard New Employee</h3>
              <p className="text-xs text-slate-400 mt-1">Initialize organizational settings, basic pay wage and identity profiles</p>
            </div>

            {onboardError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                {onboardError}
              </div>
            )}

            {onboardSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold">
                {onboardSuccess}
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-4 max-h-[460px] overflow-y-auto pr-2" id="onboard-employee-form">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Employee ID *</label>
                  <input
                    id="onboard-emp-id"
                    type="text"
                    placeholder="EMP-1005"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input
                    id="onboard-name"
                    type="text"
                    placeholder="Jane Austen"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                  <input
                    id="onboard-email"
                    type="email"
                    placeholder="jane.austen@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Contact</label>
                  <input
                    id="onboard-phone"
                    type="text"
                    placeholder="+1 (555) 303-9121"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Home Address</label>
                <input
                  id="onboard-address"
                  type="text"
                  placeholder="300 Spruce Avenue, Portland, OR"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Job Title *</label>
                  <input
                    id="onboard-job-title"
                    type="text"
                    placeholder="Security Engineer"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                  <select
                    id="onboard-department"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800 cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role Type</label>
                  <select
                    id="onboard-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'EMPLOYEE')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800 cursor-pointer"
                  >
                    <option value="EMPLOYEE">Regular Employee</option>
                    <option value="ADMIN">Admin / HR Officer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Basic Wage (₹) *</label>
                  <input
                    id="onboard-basic"
                    type="number"
                    value={newBasic}
                    onChange={(e) => setNewBasic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Allowances (₹)</label>
                  <input
                    id="onboard-allowances"
                    type="number"
                    value={newAllowances}
                    onChange={(e) => setNewAllowances(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deductions (₹)</label>
                  <input
                    id="onboard-deductions"
                    type="number"
                    value={newDeductions}
                    onChange={(e) => setNewDeductions(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-odoo-primary text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  id="btn-cancel-onboard"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border border-slate-200 text-slate-500 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel Onboarding
                </button>
                <button
                  type="submit"
                  id="btn-confirm-onboard"
                  className="flex-1 bg-odoo-primary hover:bg-odoo-dark text-white font-semibold py-2.5 rounded-xl text-xs shadow-md shadow-odoo-primary/20 cursor-pointer"
                >
                  Onboard & Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
