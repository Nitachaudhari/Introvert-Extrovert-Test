import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Activity,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import useSystemStatus from '../hooks/useSystemStatus';
import { useAuth } from '../context/AuthContext';

// Clean, streamlined navigation without confusing duplicate tabs
const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Assessments', path: '/assessments', icon: ClipboardList },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const ClinicalLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { dbState } = useSystemStatus(30000);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight block">
                K.I.E.I. Assessment
              </span>
              <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider block -mt-0.5">
                Clinical Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Start Action Button in Sidebar */}
        <div className="p-3">
          <Link
            to="/assessments/new"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start New Test</span>
          </Link>
        </div>

        {/* Clinical Sidebar Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Navigation
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 shadow-sm border border-teal-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-600" />}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer: System Status */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <Link
            to="/status"
            className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  dbState.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px] font-medium text-slate-700">
                {dbState.status === 'connected' ? 'MongoDB Atlas Live' : 'Database Checking'}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-teal-700 hover:underline">
              Diagnostics
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-slate-700">Clinical Assessment Portal</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs border border-teal-200">
                {(user?.name || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  {user?.name}
                </span>
                <span className="block text-[10px] capitalize text-slate-500 font-medium">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClinicalLayout;
