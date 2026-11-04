import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Play,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { fetchAssessments } from '../services/api';

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAssessments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAssessments(statusFilter ? { status: statusFilter } : {});
      setAssessments(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Unable to load assessment records.'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const filteredAssessments = assessments.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const patientName = item.patient?.fullName?.toLowerCase() || '';
    const patientId = item.patient?.patientId?.toLowerCase() || '';
    const sessionId = item.sessionId?.toLowerCase() || '';
    return (
      patientName.includes(term) ||
      patientId.includes(term) ||
      sessionId.includes(term)
    );
  });

  const completedCount = assessments.filter((a) => a.status === 'completed').length;
  const inProgressCount = assessments.filter((a) => a.status === 'in_progress').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Assessment Sessions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage all K.I.E.I. test administrations, in-progress questionnaires, and scored profiles.
          </p>
        </div>

        <Link
          to="/assessments/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" /> Start New Assessment
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Sessions</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{assessments.length}</p>
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 shadow-sm">
          <span className="text-xs font-semibold text-teal-700">Completed & Scored</span>
          <p className="mt-1 text-2xl font-bold text-teal-900">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <span className="text-xs font-semibold text-amber-700">In Progress</span>
          <p className="mt-1 text-2xl font-bold text-amber-900">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Test Instrument</span>
          <p className="mt-1 text-sm font-bold text-slate-800">KIEI-70 (1976)</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate name, Patient ID, or Session ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Assessment Sessions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Session ID</th>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Raw / C-Scale</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Loading sessions from MongoDB Atlas…
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    No assessment sessions found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((session) => {
                  const isCompleted = session.status === 'completed';
                  return (
                    <tr key={session._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        {session.sessionId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {session.patient?.fullName || '—'}
                        </div>
                        <div className="text-xs text-slate-400">
                          ID: {session.patient?.patientId} • {session.patient?.gender || '—'}, Age{' '}
                          {session.patient?.age || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-xs text-slate-600">
                        {session.administrationMethod === 'self' ? 'Self-Administered' : 'Clinician'}
                      </td>
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/20">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            <Clock className="h-3 w-3" /> In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <div>
                            <span className="font-bold text-slate-900">{session.rawScore}</span>
                            <span className="text-xs text-slate-400"> / 241</span>
                            <div className="text-xs font-semibold text-teal-700">
                              C-Scale {session.cScaleScore} ({session.classification})
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Pending submission</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(session.updatedAt || session.startedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isCompleted ? (
                          <Link
                            to={`/reports?highlight=${session.sessionId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-600 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Report
                          </Link>
                        ) : (
                          <Link
                            to={`/kiei-test?session=${session.sessionId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                          >
                            <Play className="h-3.5 w-3.5 fill-white" />
                            Resume Test
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssessmentsPage;
