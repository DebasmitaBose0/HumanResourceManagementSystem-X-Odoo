import React from 'react';
import { User, UserRole } from '../types';
import { 
  User as UserIcon, Calendar, FileText, Landmark, Users, CheckSquare, LogOut, ShieldAlert, Laptop, Sun, Moon
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  selectedViewRole: UserRole;
  setSelectedViewRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  selectedViewRole,
  setSelectedViewRole,
  theme,
  toggleTheme,
}: SidebarProps) {
  
  // Tabs depends on active view role
  const getNavItems = () => {
    if (selectedViewRole === 'ADMIN') {
      return [
        { id: 'employees', label: 'Employee Registry', icon: Users },
        { id: 'attendance_records', label: 'Attendance logs', icon: Calendar },
        { id: 'leave_approvals', label: 'Leave Approvals', icon: CheckSquare },
        { id: 'payroll_control', label: 'Payroll Manager', icon: Landmark },
      ];
    } else {
      return [
        { id: 'profile', label: 'My Profile', icon: UserIcon },
        { id: 'attendance_self', label: 'My Attendance', icon: Calendar },
        { id: 'leaves_self', label: 'My Time-Off', icon: CheckSquare },
        { id: 'payroll_self', label: 'My Payroll', icon: FileText },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-full lg:w-72 bg-gradient-to-b from-odoo-primary to-odoo-dark text-white flex flex-col justify-between shrink-0 lg:h-screen lg:sticky lg:top-0 shadow-xl" id="app-sidebar">
      <div>
        {/* Sidebar Header Brand */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between" id="sidebar-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-display font-bold text-lg shadow-sm">
              O
            </div>
            <div>
              <h2 className="font-display font-bold text-base tracking-tight">odoo <span className="text-[10px] bg-white/15 text-white/90 px-1.5 py-0.5 rounded-full font-sans font-medium">HRMS</span></h2>
              <p className="text-[10px] text-white/50">Workspace Suite</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>

        {/* Current logged-in user summary */}
        <div className="p-6 border-b border-white/10 bg-black/10" id="sidebar-user-summary">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.profilePicture} 
              alt={currentUser.name} 
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 shadow-md"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{currentUser.name}</h3>
              <p className="text-xs text-white/60 truncate font-medium">{currentUser.jobTitle}</p>
              <span className="mt-1 inline-block text-[9px] bg-white/20 text-white font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* HR Switch view mode if Admin */}
          {currentUser.role === 'ADMIN' && (
            <div className="mt-4 bg-white/10 rounded-xl p-3" id="sidebar-role-toggle">
              <div className="flex justify-between items-center text-[10px] text-white/70 font-semibold mb-2.5 px-1 uppercase tracking-wider">
                <span className="flex items-center gap-1"><Laptop className="w-3 h-3" /> Preview Role</span>
                <span className="bg-odoo-accent px-1.5 py-0.2 rounded-full text-white text-[8px]">HR privileged</span>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <button
                  type="button"
                  id="toggle-view-admin"
                  onClick={() => {
                    setSelectedViewRole('ADMIN');
                    setActiveTab('employees');
                  }}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-between ${selectedViewRole === 'ADMIN' ? 'bg-white text-odoo-primary shadow-sm font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                >
                  <span>Admin View</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedViewRole === 'ADMIN' ? 'bg-odoo-primary' : 'bg-transparent'}`}></span>
                </button>
                <button
                  type="button"
                  id="toggle-view-employee"
                  onClick={() => {
                    setSelectedViewRole('EMPLOYEE');
                    setActiveTab('profile');
                  }}
                  className={`w-full py-2 px-3 text-left text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-between ${selectedViewRole === 'EMPLOYEE' ? 'bg-white text-odoo-primary shadow-sm font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                >
                  <span>Employee View</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedViewRole === 'EMPLOYEE' ? 'bg-odoo-primary' : 'bg-transparent'}`}></span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation items list */}
        <nav className="p-4 space-y-1" id="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all text-left cursor-pointer group ${
                  isSelected 
                    ? 'bg-white text-odoo-primary shadow-md font-semibold' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isSelected ? 'text-odoo-primary' : 'text-white/40 group-hover:text-white/80'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / Theme / Logout */}
      <div className="p-4 border-t border-white/10 space-y-3" id="sidebar-footer">
        
        {/* Theme Toggle Widget */}
        <div className="flex items-center justify-between px-3 py-2 bg-black/15 rounded-xl border border-white/5" id="sidebar-theme-toggle">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-semibold">Theme Mode</span>
          <button
            type="button"
            id="sidebar-btn-theme-toggle"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-xs font-semibold cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="text-[10px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-300" />
                <span className="text-[10px]">Dark</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold text-rose-200 hover:bg-rose-950/30 hover:text-rose-100 transition-all text-left cursor-pointer group"
        >
          <span className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-rose-300 group-hover:-translate-x-0.5 transition-transform" />
            Logout Session
          </span>
          <span className="text-[10px] font-mono text-white/30 group-hover:text-white/50">{currentUser.employeeId}</span>
        </button>
      </div>
    </aside>
  );
}
