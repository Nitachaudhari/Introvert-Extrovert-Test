import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Clock3,
  FileText,
  RefreshCw,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { fetchDashboardSummary } from '../services/api';

const getRecentMonths = (monthlyStats) => {
  const counts = new Map(
    monthlyStats.map((item) => [`${item._id.year}-${item._id.month}`, item.count])
  );
  const today = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    return {
      label: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date),
      count: counts.get(key) || 0,
    };
  });
};

const DashboardView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchDashboardSummary();
    if (result.success && result.data) setData(result.data);
    else setError(result.error || 'Unable to load dashboard data.');
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const months = useMemo(() => getRecentMonths(data?.monthlyStats || []), [data]);
  const maxMonthlyCount = Math.max(1, ...months.map((month) => month.count));
  const cards = [
    { label: 'Registered Patients', value: data?.cards.totalPatients ?? 0, icon: Users },
    { label: 'Assessment Sessions', value: data?.cards.totalAssessments ?? 0, icon: ClipboardList },
    { label: 'Completed & Scored', value: data?.cards.completedTests ?? 0, icon: FileText },
    { label: 'Open Sessions', value: data?.cards.pendingTests ?? 0, icon: Clock3 },
  ];

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Clinical Operations & Inventory Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live patient management and K.I.E.I. psychometric assessment workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link
            to="/assessments/new"
            className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            + Start Assessment
          </Link>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
              </span>
              <Icon className="h-5 w-5 text-teal-600" />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '—' : value}</p>
          </article>
        ))}
      </section>

      {/* Graphs & Instrument Status Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-semibold text-slate-900">Assessment Throughput by Month</h2>
              <p className="text-xs text-slate-500">Monthly sessions recorded in MongoDB Atlas.</p>
            </div>
            <Link
              to="/assessments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              All sessions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid h-44 grid-cols-6 items-end gap-3">
            {months.map((month) => (
              <div key={month.label} className="flex h-full flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-slate-600">{month.count}</span>
                <div className="flex h-28 w-full items-end rounded-t bg-slate-100">
                  <div
                    className="w-full rounded-t bg-teal-600 transition-all duration-500"
                    style={{
                      height: `${month.count ? Math.max(8, (month.count / maxMonthlyCount) * 100) : 0}%`,
                    }}
                    aria-label={`${month.label}: ${month.count} sessions`}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">{month.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-teal-200 bg-teal-50/70 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-teal-800">
            <span className="flex h-2.5 w-2.5 rounded-full bg-teal-600 animate-pulse" />
            <h2 className="font-semibold text-teal-950">K.I.E.I. Instrument Active</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-teal-900">
            Kundu Introversion–Extraversion Inventory (70 items across Blocks A through E) is fully operational with verified psychometric scoring, Indian standardization norms (N=318), and Table 5 C-Scale mapping.
          </p>
          <div className="mt-3 rounded-lg border border-teal-200 bg-white p-3 text-xs">
            <span className="font-bold text-teal-900">Psychometric Norms:</span>
            <p className="text-[11px] text-slate-600">Mean: 144.88 • SD: 12.70 • Scale 0–10</p>
          </div>
          <Link
            to="/assessments/new"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-900 underline hover:text-teal-950"
          >
            Begin new assessment session <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>

      {/* Recent Sessions */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="font-semibold text-slate-900">Recent Assessment Sessions</h2>
            <p className="text-xs text-slate-500">Latest activity from clinical practice.</p>
          </div>
          <Link to="/assessments" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
            View all sessions
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Session</th>
                <th className="px-5 py-3">Administration</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentAssessments.map((session) => (
                <tr key={session._id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {session.patient?.fullName || 'Patient Record'}
                    <span className="block text-xs text-slate-400">
                      ID: {session.patient?.patientId || ''}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{session.sessionId}</td>
                  <td className="px-5 py-3 capitalize text-xs text-slate-600">
                    {session.administrationMethod}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        session.status === 'completed'
                          ? 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/20'
                          : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
                      }`}
                    >
                      {session.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {session.status === 'completed' ? (
                      <Link
                        to={`/reports?highlight=${session.sessionId}`}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                      >
                        View Report
                      </Link>
                    ) : (
                      <Link
                        to={`/kiei-test?session=${session.sessionId}`}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                      >
                        Resume
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && !data?.recentAssessments?.length && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-xs text-slate-500">
                    No assessment sessions recorded yet.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-xs text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
