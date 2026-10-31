import React, { useState } from 'react';
import useSystemStatus from '../hooks/useSystemStatus';
import { RefreshCw, CheckCircle, XCircle, Clock, ShieldCheck, Terminal } from 'lucide-react';
import { fetchTestConnection } from '../services/api';

export const StatusPage = () => {
  const { frontendStatus, backendState, dbState, integrationState, refreshStatus } = useSystemStatus();
  const [testingConnection, setTestingConnection] = useState(false);
  const [customTestResult, setCustomTestResult] = useState(null);

  const runFullTest = async () => {
    setTestingConnection(true);
    const res = await fetchTestConnection();
    setCustomTestResult(res);
    setTestingConnection(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Diagnostic Center</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            In-depth inspection of REST APIs, MongoDB connection state, and live payloads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshStatus}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={runFullTest}
            disabled={testingConnection}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm disabled:opacity-50"
          >
            {testingConnection ? 'Running Integration Test...' : 'Run Integration Test (/api/test-connection)'}
          </button>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-slate-800">1. Client SPA</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Active</span>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5">
            <p><strong>URL:</strong> {window.location.origin}</p>
            <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
            <p><strong>API Target:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:5000'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-slate-800">2. Backend API</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              backendState.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {backendState.status.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5">
            <p><strong>Status:</strong> {backendState.data?.status || 'Unreachable'}</p>
            <p><strong>Latency:</strong> {backendState.latency ? `${backendState.latency} ms` : 'N/A'}</p>
            <p><strong>Uptime:</strong> {backendState.data ? `${backendState.data.uptimeSeconds}s` : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-slate-800">3. MongoDB Atlas</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              dbState.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {dbState.status.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5">
            <p><strong>DB Name:</strong> psychometric_assessment_db</p>
            <p><strong>Connection:</strong> {dbState.status === 'connected' ? 'Established' : 'Offline / Error'}</p>
            <p><strong>Ping Latency:</strong> {dbState.data?.latencyMs ? `${dbState.data.latencyMs} ms` : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Raw Diagnostic Payloads */}
      <div className="bg-slate-900 rounded-xl p-6 text-slate-200 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">Live API Response Inspector</span>
          </div>
          <span className="text-[11px] text-slate-500">Security Rule: Zero Credentials Exposed</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-emerald-400 mb-1">▶ GET /api/health Response:</div>
            <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-slate-300">
              {JSON.stringify(backendState.data || { error: backendState.error }, null, 2)}
            </pre>
          </div>

          <div>
            <div className="text-teal-400 mb-1">▶ GET /api/db-health Response:</div>
            <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-slate-300">
              {JSON.stringify(dbState.data || { error: dbState.error }, null, 2)}
            </pre>
          </div>

          {customTestResult && (
            <div>
              <div className="text-sky-400 mb-1">▶ GET /api/test-connection Response:</div>
              <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-slate-300">
                {JSON.stringify(customTestResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusPage;

