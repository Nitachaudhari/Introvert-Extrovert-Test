import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Database,
  ShieldCheck,
  Building,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Activity,
  Save,
} from 'lucide-react';
import { fetchBackendHealth, fetchDatabaseHealth } from '../services/api';

const SettingsPage = () => {
  const [clinicName, setClinicName] = useState(
    localStorage.getItem('kiei_clinic_name') || 'Department of Clinical Psychology'
  );
  const [leadPsychologist, setLeadPsychologist] = useState(
    localStorage.getItem('kiei_lead_psychologist') || 'Dr. Clinical Psychologist, Ph.D.'
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const [backendStatus, setBackendStatus] = useState('checking');
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    fetchBackendHealth().then((res) => setBackendStatus(res.success ? 'healthy' : 'unreachable'));
    fetchDatabaseHealth().then((res) => setDbStatus(res.success ? 'connected' : 'disconnected'));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('kiei_clinic_name', clinicName);
    localStorage.setItem('kiei_lead_psychologist', leadPsychologist);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Application & Clinical Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage clinical documentation details, test instrument parameters, and monitor infrastructure connectivity.
        </p>
      </header>

      {/* Clinic & Report Branding */}
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-semibold text-slate-900">Clinical Report Configuration</h2>
            <p className="text-xs text-slate-500">
              Customize institutional branding displayed on generated K.I.E.I. assessment reports
            </p>
          </div>
          {savedNotice && (
            <span className="text-xs font-bold text-teal-600">✓ Settings Saved!</span>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Clinic / Department Name
            </label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Default Lead Psychologist / Evaluator
            </label>
            <input
              type="text"
              value={leadPsychologist}
              onChange={(e) => setLeadPsychologist(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              <Save className="h-4 w-4" /> Save Clinic Configuration
            </button>
          </div>
        </div>
      </form>

      {/* Psychometric Instrument Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Psychometric Instrument Status</h2>
        <p className="text-xs text-slate-500">
          Standardized psychometric inventory specifications and verification records
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
            <div className="flex items-center gap-2 text-teal-800 font-semibold text-xs">
              <CheckCircle2 className="h-4 w-4" /> Verified Instrument
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">
              Kundu Introversion–Extraversion Inventory (K.I.E.I.)
            </p>
            <p className="mt-1 text-xs text-slate-600">
              70 standardized items across 5 distinct clinical blocks (A to E).
            </p>
            <div className="mt-3 text-[11px] text-teal-700">
              Scoring Engine: Table 5 C-Scale (Kundu 1976 Manual)
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
              <ShieldCheck className="h-4 w-4 text-teal-600" /> Standardization Norms
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">
              Indian Standardization Sample (N = 318)
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Norm Mean: 144.88 • Standard Deviation: 12.70
            </p>
            <div className="mt-3 text-[11px] text-slate-500">
              Department of Psychology, Calcutta University
            </div>
          </div>
        </div>
      </div>

      {/* System Health & Diagnostics */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-semibold text-slate-900">Infrastructure Health</h2>
            <p className="text-xs text-slate-500">
              Real-time connectivity status to Render Backend and MongoDB Atlas
            </p>
          </div>
          <Link
            to="/status"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            <Activity className="h-3.5 w-3.5" />
            Full Technical Diagnostics
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <span className="text-xs text-slate-400">Node/Express Server:</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  backendStatus === 'healthy' ? 'bg-teal-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-sm font-bold capitalize text-slate-800">
                {backendStatus}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <span className="text-xs text-slate-400">MongoDB Atlas Database:</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  dbStatus === 'connected' ? 'bg-teal-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-sm font-bold capitalize text-slate-800">
                {dbStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
