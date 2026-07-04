import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, LeaveRequest, LeaveType } from '../types';
import { 
  User as UserIcon, Calendar, CheckSquare, FileText, UploadCloud, Clock, Edit3, Save, Phone, MapPin, 
  Plus, CheckCircle, XCircle, AlertCircle, File, Download, CalendarCheck, ShieldAlert, Sparkles, Trash2 
} from 'lucide-react';

interface EmployeeDashboardProps {
  currentUser: User;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  activeTab: string;
  onUpdateProfile: (updatedUser: User) => void;
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onApplyLeave: (leave: LeaveRequest) => void;
}

export default function EmployeeDashboard({
  currentUser,
  attendance,
  leaves,
  activeTab,
  onUpdateProfile,
  onAddAttendance,
  onUpdateAttendance,
  onApplyLeave,
}: EmployeeDashboardProps) {

  // Current live clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editAddress, setEditAddress] = useState(currentUser.address);
  const [editProfilePic, setEditProfilePic] = useState(currentUser.profilePicture);

  // File drag & drop simulator
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Leave Form state
  const [leaveType, setLeaveType] = useState<LeaveType>('Paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveError, setLeaveError] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState('');

  // Filter attendance & leaves for current user
  const myAttendance = attendance.filter(att => att.employeeId === currentUser.employeeId);
  const myLeaves = leaves.filter(l => l.employeeId === currentUser.employeeId);

  // Check if checked in today
  const todayStr = new Date().toISOString().split('T')[0]; // 2026-07-04
  const todayRecord = myAttendance.find(att => att.date === todayStr);

  const handleCheckIn = () => {
    const timeStr = currentTime.toTimeString().split(' ')[0]; // HH:MM:SS
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: currentUser.employeeId,
      date: todayStr,
      checkIn: timeStr,
      checkOut: null,
      status: 'Present'
    };
    onAddAttendance(newRecord);
  };

  const handleCheckOut = () => {
    if (todayRecord) {
      const timeStr = currentTime.toTimeString().split(' ')[0]; // HH:MM:SS
      const updatedRecord: AttendanceRecord = {
        ...todayRecord,
        checkOut: timeStr,
        status: 'Present' // Marked as Present once completed
      };
      onUpdateAttendance(updatedRecord);
    }
  };

  // Submit Profile update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      phone: editPhone,
      address: editAddress,
      profilePicture: editProfilePic
    });
    setIsEditingProfile(false);
  };

  // Drag & Drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      addNewDocument(file.name, file.size);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      addNewDocument(file.name, file.size);
    }
  };

  const addNewDocument = (fileName: string, bytesSize: number) => {
    // Format size
    const sizeStr = bytesSize > 1024 * 1024 
      ? `${(bytesSize / (1024 * 1024)).toFixed(1)} MB`
      : `${(bytesSize / 1024).toFixed(0)} KB`;
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: fileName,
      uploadDate: new Date().toISOString().split('T')[0],
      size: sizeStr
    };

    onUpdateProfile({
      ...currentUser,
      documents: [newDoc, ...currentUser.documents]
    });

    setUploadSuccess(`"${fileName}" successfully uploaded and registered!`);
    setTimeout(() => setUploadSuccess(''), 4000);
  };

  const handleDeleteDoc = (docId: string) => {
    onUpdateProfile({
      ...currentUser,
      documents: currentUser.documents.filter(d => d.id !== docId)
    });
  };

  const handleDownloadDoc = (docName: string) => {
    try {
      let content = '';
      let mimeType = 'application/octet-stream';

      if (docName.toLowerCase().endsWith('.pdf')) {
        content = `%PDF-1.4\n%...\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 100 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(Simulated Workspace Document: ${docName}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000018 00000 n\n0000000067 00000 n\n0000000122 00000 n\n0000000223 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n375\n%%EOF`;
        mimeType = 'application/pdf';
      } else {
        content = `Simulated document content for: ${docName}\nDownloaded from Workspace HR Platform.`;
        mimeType = 'text/plain';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = docName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleDownloadPayslip = () => {
    const filename = `Payslip_June_2026_${currentUser.employeeId}.pdf`;
    const content = `%PDF-1.4\n%...\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 200 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(WORKSPACE PAYSLIP - JUNE 2026) Tj\n0 -20 Td\n(Employee ID: ${currentUser.employeeId}) Tj\n0 -15 Td\n(Employee Name: ${currentUser.name}) Tj\n0 -15 Td\n(Net Disbursed Salary: Rs. ${currentUser.salaryStructure.netSalary}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000018 00000 n\n0000000067 00000 n\n0000000122 00000 n\n0000000223 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n375\n%%EOF`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Submit Leave Request
  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveError('');
    setLeaveSuccess('');

    if (!startDate || !endDate || !leaveReason) {
      setLeaveError('Please specify start date, end date, and reason.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setLeaveError('Start date cannot be after the End date.');
      return;
    }

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      leaveType,
      startDate,
      endDate,
      reason: leaveReason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    onApplyLeave(newRequest);
    setLeaveSuccess('Leave request applied successfully! It is pending HR review.');
    setStartDate('');
    setEndDate('');
    setLeaveReason('');
    setTimeout(() => setLeaveSuccess(''), 5000);
  };

  // Render Monthly Calendar for July 2026
  // July 1st is Wednesday, has 31 days.
  const renderJulyCalendar = () => {
    const daysInMonth = 31;
    const startOffset = 3; // Wednesday is index 3 (Sun=0, Mon=1, Tue=2, Wed=3)
    const weeks = [];
    let currentWeek: (number | null)[] = Array(startOffset).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h4 className="font-display font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-odoo-primary" />
            Attendance Calendar (July 2026)
          </h4>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Half-day</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Leave</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeks.flatMap((week, weekIdx) => 
            week.map((day, dayIdx) => {
              if (day === null) {
                return <div key={`empty-${weekIdx}-${dayIdx}`} className="aspect-square bg-slate-50/50 dark:bg-slate-800/20 rounded-lg"></div>;
              }

              // Format date key
              const dayStr = day < 10 ? `0${day}` : `${day}`;
              const fullDateStr = `2026-07-${dayStr}`;

              // Find attendance record
              const attRecord = myAttendance.find(att => att.date === fullDateStr);
              
              // Find approved leave
              const isOnLeave = myLeaves.some(l => 
                l.status === 'Approved' && 
                new Date(fullDateStr) >= new Date(l.startDate) && 
                new Date(fullDateStr) <= new Date(l.endDate)
              );

              let cellBg = 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400';
              let statusDot = null;

              if (attRecord) {
                if (attRecord.status === 'Present') {
                  cellBg = 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 font-bold';
                  statusDot = <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>;
                } else if (attRecord.status === 'Half-day') {
                  cellBg = 'bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 font-bold';
                  statusDot = <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-500"></span>;
                } else if (attRecord.status === 'Leave') {
                  cellBg = 'bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-purple-800 dark:text-purple-400 font-bold';
                  statusDot = <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-500"></span>;
                } else if (attRecord.status === 'Absent') {
                  cellBg = 'bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-400 font-bold';
                  statusDot = <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500"></span>;
                }
              } else if (isOnLeave) {
                cellBg = 'bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-purple-800 dark:text-purple-400 font-bold';
                statusDot = <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-purple-500"></span>;
              } else if (dayIdx === 0 || dayIdx === 6) {
                // Weekend
                cellBg = 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500';
              }

              return (
                <div 
                  key={`day-${day}`} 
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs relative ${cellBg} transition-all hover:scale-105`}
                  title={attRecord ? `${attRecord.status} Check-In: ${attRecord.checkIn || 'N/A'}` : isOnLeave ? 'Approved Leave' : 'No Log'}
                >
                  <span className="absolute top-1.5 text-[11px]">{day}</span>
                  {statusDot}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950" id="employee-dashboard-viewport">
      
      {/* Upper header action area */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="employee-header">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-white tracking-tight">
            {activeTab === 'profile' && "Employee Profile Management"}
            {activeTab === 'attendance_self' && "Attendance Tracking"}
            {activeTab === 'leaves_self' && "Leave & Time-Off Management"}
            {activeTab === 'payroll_self' && "Payroll / Salary breakdown"}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {activeTab === 'profile' && "Review documents, personal folders and salary setup"}
            {activeTab === 'attendance_self' && "Check-in or check-out and review historical timesheets"}
            {activeTab === 'leaves_self' && "Apply for Paid, Sick or Unpaid leaves and track approval status"}
            {activeTab === 'payroll_self' && "Transparency review of current basic structure and tax deductions"}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-2 self-stretch sm:self-auto shadow-sm">
          <Clock className="w-4 h-4 text-odoo-primary animate-pulse shrink-0" />
          <div className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold text-right">
            <div>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div className="text-odoo-primary dark:text-amber-400 tracking-widest font-bold text-sm mt-0.5">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>
      </header>

      {/* Main Container viewport */}
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="panel-employee-profile">
            
            {/* Column 1: Info */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-odoo-primary/5 rounded-full blur-2xl pointer-events-none" />
                
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                      <img 
                        src={editProfilePic} 
                        alt="Avatar preview" 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border" 
                      />
                      <div className="flex-1 space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Avatar URL</label>
                        <input 
                          type="text" 
                          value={editProfilePic} 
                          onChange={(e) => setEditProfilePic(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-500 focus:outline-none focus:border-odoo-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                        <input 
                          type="text" 
                          value={editPhone} 
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-odoo-primary focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Home Address</label>
                        <input 
                          type="text" 
                          value={editAddress} 
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-odoo-primary focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProfile(false)}
                        className="border border-slate-200 text-slate-500 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-odoo-primary hover:bg-odoo-dark text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-odoo-primary/10 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="flex items-center gap-4">
                        <img 
                          src={currentUser.profilePicture} 
                          alt={currentUser.name} 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm" 
                        />
                        <div>
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {currentUser.department}
                          </span>
                          <h3 className="font-display font-bold text-xl text-slate-800 mt-1">{currentUser.name}</h3>
                          <p className="text-sm text-slate-500">{currentUser.jobTitle}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Profile Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Identification</span>
                        <span className="font-mono text-sm text-slate-700 font-bold mt-1 block">{currentUser.employeeId}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
                        <span className="text-sm text-slate-700 mt-1 block font-medium">{currentUser.email}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Phone</span>
                        <span className="text-sm text-slate-700 mt-1 block font-medium flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {currentUser.phone}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Home Address</span>
                        <span className="text-sm text-slate-700 mt-1 block font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {currentUser.address}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Joined</span>
                        <span className="text-sm text-slate-700 mt-1 block font-medium">{currentUser.joiningDate}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employment Status</span>
                        <span className="mt-1 inline-block text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">
                          Active Full-Time
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Documents Folder Card with Drag & Drop */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800">Documents folder</h3>
                  <p className="text-xs text-slate-400">Review and manage verified files or upload tax onboarding declarations</p>
                </div>

                {uploadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {uploadSuccess}
                  </div>
                )}

                {/* Drag and drop zone */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                    dragActive 
                      ? 'border-odoo-primary bg-odoo-light/50' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="file" 
                    id="file-upload-input" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Drag and drop file here, or click to choose from system</p>
                  <p className="text-[10px] text-slate-400 mt-1">Supports PDF, PNG, DOCX up to 10MB</p>
                </div>

                {/* Documents list table */}
                <div className="space-y-2 mt-4" id="employee-documents-list">
                  {currentUser.documents.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No documents uploaded yet.</p>
                  ) : (
                    currentUser.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <File className="w-4 h-4 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Uploaded on {doc.uploadDate} • {doc.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            type="button"
                            onClick={() => handleDownloadDoc(doc.name)}
                            className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Column 2: Quick stats / Summary */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-gradient-to-br from-odoo-primary to-odoo-dark text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <h4 className="text-xs font-bold text-white/55 uppercase tracking-widest">Monthly Payslip (June)</h4>
                <div className="mt-4 space-y-1">
                  <p className="text-[10px] text-white/60">Net Disbursed Salary</p>
                  <p className="text-3xl font-display font-bold text-white font-mono">₹{currentUser.salaryStructure.netSalary.toLocaleString()}</p>
                </div>
                <div className="mt-6 border-t border-white/10 pt-4 flex justify-between items-center text-xs">
                  <span className="text-white/60">Account Status</span>
                  <span className="bg-emerald-400/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full">Paid</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <h4 className="font-display font-bold text-slate-800 text-sm">Attendance Summary (This Week)</h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                    <p className="text-lg font-display font-bold text-emerald-700 font-mono">
                      {myAttendance.filter(a => a.status === 'Present').length}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Days Present</p>
                  </div>
                  <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/50">
                    <p className="text-lg font-display font-bold text-purple-700 font-mono">
                      {myAttendance.filter(a => a.status === 'Leave').length}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Approved Leaves</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 leading-relaxed font-medium">
                  Average weekly check-in time: <span className="font-semibold text-slate-700">09:03 AM</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance_self' && (
          <div className="space-y-6" id="panel-employee-attendance">
            
            {/* Clocking Simulator Section */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-5 space-y-2">
                <span className="text-[10px] bg-odoo-primary/10 text-odoo-primary font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Clocking Card
                </span>
                <h3 className="font-display font-bold text-xl text-slate-800">Check-In / Check-Out</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log your office hours on time. Late arrivals or early departures are logged for payroll accuracy.
                </p>
              </div>

              {/* Status Ticking */}
              <div className="md:col-span-3 text-center md:border-l md:border-r border-slate-100 py-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Status</p>
                {todayRecord ? (
                  <div className="mt-2 space-y-1">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${todayRecord.checkOut ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                      {todayRecord.checkOut ? 'Shift Completed' : 'Active Shift'}
                    </span>
                    <p className="text-xs text-slate-500 font-mono mt-1">In: {todayRecord.checkIn}</p>
                    {todayRecord.checkOut && <p className="text-xs text-slate-500 font-mono">Out: {todayRecord.checkOut}</p>}
                  </div>
                ) : (
                  <div className="mt-2">
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-400">
                      Not Clocked In
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Ready to start today's log</p>
                  </div>
                )}
              </div>

              {/* Action trigger */}
              <div className="md:col-span-4 flex justify-center">
                {!todayRecord ? (
                  <button
                    type="button"
                    id="btn-clock-in"
                    onClick={handleCheckIn}
                    className="w-full max-w-[240px] bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-2xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102"
                  >
                    <Clock className="w-4 h-4 text-white" />
                    Clock In Shift
                  </button>
                ) : !todayRecord.checkOut ? (
                  <button
                    type="button"
                    id="btn-clock-out"
                    onClick={handleCheckOut}
                    className="w-full max-w-[240px] bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-2xl text-sm shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102"
                  >
                    <Clock className="w-4 h-4 text-white" />
                    Clock Out Shift
                  </button>
                ) : (
                  <div className="text-center p-3 bg-slate-50 rounded-2xl w-full max-w-[240px] border border-slate-100">
                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-700">All Done For Today!</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Logs submitted to HR</p>
                  </div>
                )}
              </div>

            </div>

            {/* Attendance List Logs */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800">My Attendance History</h3>
              
              <div className="overflow-x-auto" id="employee-attendance-history-table">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Date</th>
                      <th className="px-4 py-3">Check-In Time</th>
                      <th className="px-4 py-3">Check-Out Time</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-r-xl">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400">No attendance history available. Check-in above to start.</td>
                      </tr>
                    ) : (
                      [...myAttendance].reverse().map((rec) => {
                        let statusColor = 'bg-slate-100 text-slate-600';
                        if (rec.status === 'Present') statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                        if (rec.status === 'Half-day') statusColor = 'bg-amber-50 text-amber-700 border border-amber-100';
                        if (rec.status === 'Leave') statusColor = 'bg-purple-50 text-purple-700 border border-purple-100';
                        if (rec.status === 'Absent') statusColor = 'bg-rose-50 text-rose-700 border border-rose-100';

                        // Calculate working hours simple mock
                        let hoursStr = '--';
                        if (rec.checkIn && rec.checkOut) {
                          const [inH, inM] = rec.checkIn.split(':').map(Number);
                          const [outH, outM] = rec.checkOut.split(':').map(Number);
                          const diffHours = (outH + outM / 60) - (inH + inM / 60);
                          hoursStr = `${diffHours.toFixed(1)} hrs`;
                        } else if (rec.checkIn) {
                          hoursStr = 'Active';
                        }

                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-700">{rec.date}</td>
                            <td className="px-4 py-3.5 font-mono text-slate-600">{rec.checkIn || '--'}</td>
                            <td className="px-4 py-3.5 font-mono text-slate-600">{rec.checkOut || '--'}</td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                                {rec.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-slate-800 font-mono">{hoursStr}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TIME OFF TAB */}
        {activeTab === 'leaves_self' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="panel-employee-time-off">
            
            {/* Column 1: Apply Leave Form */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800">Apply for leave</h3>
                  <p className="text-xs text-slate-400">Submit requests for sickness, paid vacation or unpaid family time-off</p>
                </div>

                {leaveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {leaveSuccess}
                  </div>
                )}

                {leaveError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold">
                    {leaveError}
                  </div>
                )}

                <form onSubmit={handleApplyLeaveSubmit} className="space-y-4" id="leave-request-form">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Leave Type *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Paid', 'Sick', 'Unpaid'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          id={`leave-type-btn-${type}`}
                          onClick={() => setLeaveType(type as LeaveType)}
                          className={`py-2 px-3 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            leaveType === type 
                              ? 'border-odoo-primary bg-odoo-light text-odoo-primary' 
                              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                          }`}
                        >
                          {type} Leave
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date *</label>
                      <input 
                        id="leave-start-date"
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-odoo-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date *</label>
                      <input 
                        id="leave-end-date"
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-odoo-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks / Reason *</label>
                    <textarea
                      id="leave-reason"
                      rows={3}
                      placeholder="Specify the reason for applying leave..."
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-odoo-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    id="leave-submit-btn"
                    className="w-full bg-odoo-primary hover:bg-odoo-dark text-white font-semibold py-2.5 rounded-xl text-xs shadow-md shadow-odoo-primary/20 transition-colors cursor-pointer"
                  >
                    Submit Application
                  </button>
                </form>
              </div>

            </div>

            {/* Column 2: Calendar & Leave list */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Monthly calendar displaying Present/Absent markers */}
              {renderJulyCalendar()}

              {/* History list */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-base text-slate-800">My Leave Applications</h3>
                
                <div className="space-y-3" id="employee-leaves-list">
                  {myLeaves.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No previous leave applications logged.</p>
                  ) : (
                    [...myLeaves].reverse().map((req) => {
                      let statusBadge = 'bg-slate-100 text-slate-600';
                      let statusIcon = <AlertCircle className="w-3.5 h-3.5" />;
                      if (req.status === 'Approved') {
                        statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                        statusIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
                      } else if (req.status === 'Rejected') {
                        statusBadge = 'bg-rose-50 text-rose-700 border border-rose-100';
                        statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-500" />;
                      }

                      return (
                        <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">
                              {req.leaveType} Leave
                            </span>
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge}`}>
                              {statusIcon}
                              {req.status}
                            </span>
                          </div>
                          
                          <div className="text-xs text-slate-700 font-semibold font-mono">
                            {req.startDate} to {req.endDate}
                          </div>

                          <p className="text-xs text-slate-500 italic">" {req.reason} "</p>

                          {req.adminComment && (
                            <div className="mt-2 text-[10px] bg-white p-2 rounded-lg border border-slate-200 text-slate-600">
                              <span className="font-bold text-slate-800">Admin Comment:</span> {req.adminComment}
                            </div>
                          )}

                          <div className="text-[9px] text-slate-400 text-right">
                            Applied on {req.appliedOn}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PAYROLL TAB */}
        {activeTab === 'payroll_self' && (
          <div className="max-w-3xl mx-auto space-y-6" id="panel-employee-payroll">
            
            {/* Paycheck breakdown details */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 lg:p-8 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-odoo-accent/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Structure
                </span>
                <h3 className="font-display font-bold text-2xl text-slate-800 mt-2">Salary & Payroll Statement</h3>
                <p className="text-xs text-slate-400 mt-1">This statement represents the officially contracted remuneration model verified by HR</p>
              </div>

              {/* Grid of basic, allowances, deductions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Basic Contracted Pay</p>
                  <p className="text-2xl font-display font-bold text-slate-800 font-mono mt-2">₹{currentUser.salaryStructure.basic.toLocaleString()}</p>
                  <span className="text-[9px] text-slate-400 block mt-1">Base value before benefits</span>
                </div>

                <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-100/30">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Allowances & Benefits</p>
                  <p className="text-2xl font-display font-bold text-emerald-800 font-mono mt-2">+₹{currentUser.salaryStructure.allowances.toLocaleString()}</p>
                  <span className="text-[9px] text-emerald-500 block mt-1">Medical, transport & utility</span>
                </div>

                <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100/30">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Deductions & Taxes</p>
                  <p className="text-2xl font-display font-bold text-rose-800 font-mono mt-2">-₹{currentUser.salaryStructure.deductions.toLocaleString()}</p>
                  <span className="text-[9px] text-rose-500 block mt-1">Income withholding & health pool</span>
                </div>

              </div>

              {/* Graphical progress representation */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Earnings Retention Rate</span>
                  <span className="font-mono font-bold text-odoo-accent">
                    {((currentUser.salaryStructure.netSalary / (currentUser.salaryStructure.basic + currentUser.salaryStructure.allowances)) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-odoo-accent" 
                    style={{ width: `${(currentUser.salaryStructure.netSalary / (currentUser.salaryStructure.basic + currentUser.salaryStructure.allowances)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Total payout card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Net Pay (Disbursed)</p>
                  <p className="text-3xl font-display font-bold text-odoo-primary font-mono mt-1">₹{currentUser.salaryStructure.netSalary.toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  id="btn-download-payslip"
                  onClick={handleDownloadPayslip}
                  className="bg-odoo-primary hover:bg-odoo-dark text-white font-semibold py-2 px-4 rounded-xl text-xs shadow-md shadow-odoo-primary/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download June Payslip (PDF)
                </button>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 text-[10px] text-amber-800 leading-relaxed font-medium">
                ⚠️ Payroll data is verified and marked read-only. For disputes regarding basic structure or tax bracket mappings, please initiate an official request ticket to the HR administrator.
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
