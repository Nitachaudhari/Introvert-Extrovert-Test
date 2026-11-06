import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Play,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Sparkles,
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

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Friendly, Professional Hero Banner */}
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 via-white to-teal-50/50 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100/70 px-3 py-1 text-xs font-bold text-teal-800">
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
              Kundu Introversion–Extraversion Inventory (K.I.E.I.)
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Personality Assessment Hub
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Start a new 70-question test for a patient, resume an incomplete session, or review verified clinical reports.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to="/assessments/new"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-teal-700 transition-all hover:shadow-lg active:scale-98"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Start New Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, Patient ID, or Session ID…"
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
            <option value="">All Tests ({assessments.length})</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed & Scored</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Simple, Professional Assessment Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Test Session</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Result Summary</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading tests…
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <p className="text-sm font-medium text-slate-600">No assessments found.</p>
                    <Link
                      to="/assessments/new"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
                    >
                      <PlusCircle className="h-4 w-4" /> Start your first test now
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((session) => {
                  const isCompleted = session.status === 'completed';
                  return (
                    <tr key={session._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {session.patient?.fullName || 'Patient Record'}
                        </div>
                        <div className="text-xs text-slate-400">
                          ID: {session.patient?.patientId} • {session.patient?.gender || '—'}, Age{' '}
                          {session.patient?.age || '—'}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {session.sessionId}
                        <span className="block text-[11px] text-slate-400 capitalize">
                          {session.administrationMethod === 'self' ? 'Patient Direct' : 'Clinician Assisted'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/20">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            <Clock className="h-3.5 w-3.5" /> In Progress
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <div>
                            <span className="font-bold text-slate-900">
                              {session.classification || 'Scored'}
                            </span>
                            <div className="text-xs text-teal-700 font-medium">
                              C-Scale Point {session.cScaleScore} (Score {session.rawScore}/241)
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {session.answers?.length || 0} of 70 answered
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(session.updatedAt || session.startedAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isCompleted ? (
                          <Link
                            to={`/reports?highlight=${session.sessionId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-600 bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Report
                          </Link>
                        ) : (
                          <Link
                            to={`/kiei-test?session=${session.sessionId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
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
