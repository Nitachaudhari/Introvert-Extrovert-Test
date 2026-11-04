import React from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Lock,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UsersPage = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Clinical Staff & Access Control
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Role-Based Access Control (RBAC), authorized evaluating psychologists, and active session security.
        </p>
      </header>

      {/* Active User Session Profile */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Active Staff Session</h2>
            <p className="text-xs text-slate-500">Currently logged in staff credentials</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <span className="text-xs font-semibold text-slate-400">Staff Member Name</span>
            <p className="mt-1 text-base font-bold text-slate-900">{user?.name || 'Authorized Staff'}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <span className="text-xs font-semibold text-slate-400">Email Address</span>
            <p className="mt-1 text-sm font-semibold text-slate-800">{user?.email || '—'}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <span className="text-xs font-semibold text-slate-400">Clinical Role</span>
            <p className="mt-1 text-sm font-bold capitalize text-teal-700">{user?.role || 'Staff'}</p>
          </div>
        </div>
      </div>

      {/* RBAC Role Definitions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Role Permissions & Responsibilities</h2>
        <p className="text-xs text-slate-500">
          Hierarchy of permissions for clinical psychometric data protection
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
            <div className="flex items-center gap-2 font-bold text-teal-800 text-xs">
              <ShieldCheck className="h-4 w-4" /> Lead Psychologist / Admin
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Full access: register patients, administer K.I.E.I., lock and score assessments, edit clinical observations, generate official signed PDF reports, and manage settings.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <UserCheck className="h-4 w-4 text-teal-600" /> Psychometrist
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Standard access: register patients, administer K.I.E.I. test sessions, record responses, trigger scoring engine, and view generated reports.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <Lock className="h-4 w-4 text-slate-500" /> Clinical Assistant
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Restricted access: initiate new assessment sessions and view patient demographic records. Clinical notes and raw scoring formulas remain protected.
            </p>
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Security & Authentication Standards</h2>
        <div className="mt-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span>Passwords hashed with industry-standard bcrypt (salt rounds = 12).</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span>Stateless JSON Web Token (JWT) session tokens with 8-hour expiry and signed validation.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span>Protected API endpoints require explicit Authorization headers for all mutating actions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
