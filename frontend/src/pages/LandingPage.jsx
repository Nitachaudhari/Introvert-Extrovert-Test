import React from 'react';
import { RefreshCw, Server, Database, Globe, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import useSystemStatus from '../hooks/useSystemStatus';
import StatusCard from '../components/StatusCard';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  const { frontendStatus, backendState, dbState, integrationState, refreshStatus } = useSystemStatus(10000);

  const isAllConnected =
    frontendStatus.status === 'connected' &&
    backendState.status === 'connected' &&
    dbState.status === 'connected';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-700/50">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            Phase 1 • Technical Foundation & Cloud Connectivity
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Psychometric Assessment Management System
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Enterprise-grade, secure psychometric assessment platform. This phase verifies full-stack environment
            integrity, end-to-end database transactions, and cloud service orchestration across Netlify, Render, and MongoDB Atlas.
          </p>
        </div>
      </div>

      {/* Primary System Status Section (Mandated in Prompt) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              System Status
              {isAllConnected && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Systems Operational
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time live telemetry testing endpoints against client, Node.js API, and MongoDB Atlas.
            </p>
          </div>
          <button
            onClick={refreshStatus}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 self-start sm:self-auto"
            title="Refresh connectivity check"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            Re-check Connections
          </button>
        </div>

        {/* 3 Status Cards: Frontend, Backend, Database */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* 1. Frontend */}
          <StatusCard
            type="frontend"
            title="Frontend"
            subtitle="React 18 + Vite SPA"
            status={frontendStatus.status}
            details={{
              framework: 'React + Tailwind',
              environment: import.meta.env.MODE || 'development',
              origin: window.location.origin,
            }}
          />

          {/* 2. Backend */}
          <StatusCard
            type="backend"
            title="Backend"
            subtitle="Node.js + Express REST API"
            status={backendState.status}
            latency={backendState.latency}
            error={backendState.error}
            details={
              backendState.data
                ? {
                    status: backendState.data.status,
                    environment: backendState.data.environment,
                    uptime: `${backendState.data.uptimeSeconds}s`,
                  }
                : {
                    endpoint: '/api/health',
                  }
            }
          />

          {/* 3. Database */}
          <StatusCard
            type="database"
            title="Database"
            subtitle="MongoDB Atlas"
            status={dbState.status}
            latency={dbState.latency}
            error={dbState.error}
            details={
              dbState.data
                ? {
                    database: dbState.data.databaseName,
                    state: dbState.data.status,
                  }
                : {
                    target: 'psychometric_assessment_db',
                    endpoint: '/api/db-health',
                  }
            }
          />
        </div>
      </div>

      {/* Integration Summary & Phase 1 Scope Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-2">Phase 1 Infrastructure Architecture</h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            The foundation follows strict separation of concerns. The frontend communicates with the backend exclusively via RESTful JSON contracts, and all database interactions are isolated within the secure backend service.
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <strong>Security:</strong> Secrets are isolated in backend environment variables.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <strong>CORS Policy:</strong> Whitelisted cross-origin validation between Netlify and Render.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <strong>Database:</strong> Dedicated cluster on MongoDB Atlas (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">psychometric_assessment_db</code>).
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Phase 1 Boundary</span>
            <h3 className="text-base font-bold text-white mt-1 mb-2">Technical Foundation & Verification</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assessment questionnaires, psychological models, K.I.E.I. algorithms, and patient record management are reserved strictly for Phase 2 once cloud verification is certified.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Deep Diagnostics Page</span>
            <Link
              to="/status"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              View Full Diagnostics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

