import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  Save,
  Clock,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import {
  fetchReports,
  fetchAssessmentReport,
  updateAssessmentReport,
} from '../services/api';

const C_SCALE_BANDS = [
  { point: 0, label: 'Extremely Extravert', range: '≤ 75' },
  { point: 1, label: 'Grossly Extravert', range: '76–89' },
  { point: 2, label: 'Moderately Extravert', range: '90–112' },
  { point: 3, label: 'Slightly Extravert', range: '113–130' },
  { point: 4, label: 'Ambivert', range: '131–144' },
  { point: 5, label: 'Ambivert (Median)', range: '145–157' },
  { point: 6, label: 'Ambivert', range: '158–171' },
  { point: 7, label: 'Slightly Introvert', range: '172–185' },
  { point: 8, label: 'Moderately Introvert', range: '186–199' },
  { point: 9, label: 'Grossly Introvert', range: '200–228' },
  { point: 10, label: 'Extremely Introvert', range: '≥ 229' },
];

const ReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightedSession = searchParams.get('highlight');

  const [reportsList, setReportsList] = useState([]);
  const [activeReportData, setActiveReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');
  const [observationsInput, setObservationsInput] = useState('');
  const [psychologistNameInput, setPsychologistNameInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaveSuccess, setNotesSaveSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all reports
  const loadReportsList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchReports();
      setReportsList(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Unable to retrieve clinical reports.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportsList();
  }, [loadReportsList]);

  // Load specific report if highlighted
  useEffect(() => {
    if (!highlightedSession) {
      setActiveReportData(null);
      return;
    }

    const loadSingleReport = async () => {
      try {
        setReportLoading(true);
        const data = await fetchAssessmentReport(highlightedSession);
        setActiveReportData(data);
        setObservationsInput(data.report?.observations || '');
        setPsychologistNameInput(data.report?.psychologistName || 'Dr. Clinical Psychologist');
      } catch (err) {
        setError('Failed to load clinical report for session ' + highlightedSession);
      } finally {
        setReportLoading(false);
      }
    };

    loadSingleReport();
  }, [highlightedSession]);

  const handleSelectReport = (sessionId) => {
    setSearchParams({ highlight: sessionId });
  };

  const handleBackToList = () => {
    setSearchParams({});
    setActiveReportData(null);
  };

  const handleSaveObservations = async () => {
    if (!activeReportData?.session?.sessionId) return;
    setSavingNotes(true);
    setNotesSaveSuccess(false);
    try {
      await updateAssessmentReport(activeReportData.session.sessionId, {
        observations: observationsInput,
        psychologistName: psychologistNameInput,
      });
      setNotesSaveSuccess(true);
      setTimeout(() => setNotesSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save clinical observations: ' + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredReports = reportsList.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const patientName = r.patient?.fullName?.toLowerCase() || '';
    const patientId = r.patient?.patientId?.toLowerCase() || '';
    const reportId = r.reportId?.toLowerCase() || '';
    const sessionId = r.testSession?.sessionId?.toLowerCase() || '';
    return (
      patientName.includes(term) ||
      patientId.includes(term) ||
      reportId.includes(term) ||
      sessionId.includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* If viewing a single report */}
      {activeReportData ? (
        <div className="space-y-6">
          {/* Action Bar (Hidden in Print) */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:hidden sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Reports List
            </button>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-400">
                Report ID: {activeReportData.report?.reportId}
              </span>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                <Printer className="h-4 w-4" /> Print / Export PDF
              </button>
            </div>
          </div>

          {/* Clinical Document Container (Printable) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:border-none print:p-0 print:shadow-none">
            {/* Clinic Brand & Document Header */}
            <div className="border-b-2 border-teal-800 pb-6 text-center">
              <div className="inline-block rounded-md bg-teal-50 px-3 py-1 font-mono text-xs font-bold text-teal-800">
                CLINICAL PSYCHOMETRIC EVALUATION REPORT
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Kundu Introversion–Extraversion Inventory (K.I.E.I.)
              </h1>
              <p className="mt-1 text-xs text-slate-600">
                Department of Psychology, University of Calcutta (Standardized Psychometric Instrument)
              </p>
              <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span>Standardization Sample: N = 318</span>
                <span>•</span>
                <span>Norm Mean: 144.88 (SD: 12.70)</span>
                <span>•</span>
                <span>Standard Score: 11-Point C-Scale</span>
              </div>
            </div>

            {/* Candidate Demographics */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Candidate Demographics & Administration
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-slate-400">Full Name:</span>
                  <p className="font-bold text-slate-900">
                    {activeReportData.session?.patient?.fullName || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Patient ID:</span>
                  <p className="font-mono font-bold text-slate-900">
                    {activeReportData.session?.patient?.patientId || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Age / Gender:</span>
                  <p className="font-bold text-slate-900">
                    {activeReportData.session?.patient?.age || '—'} yrs / {activeReportData.session?.patient?.gender || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Contact / Email:</span>
                  <p className="font-medium text-slate-700">
                    {activeReportData.session?.patient?.mobile || activeReportData.session?.patient?.email || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Education:</span>
                  <p className="font-medium text-slate-700">
                    {activeReportData.session?.patient?.education || 'Standard'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Occupation:</span>
                  <p className="font-medium text-slate-700">
                    {activeReportData.session?.patient?.occupation || 'Candidate'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Administration Mode:</span>
                  <p className="font-bold capitalize text-slate-800">
                    {activeReportData.session?.administrationMethod || 'Clinician-Administered'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Date Assessed:</span>
                  <p className="font-bold text-slate-800">
                    {new Date(activeReportData.session?.completedAt || Date.now()).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Scores Banner */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 text-center">
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Total Raw Score
                </span>
                <p className="mt-2 text-4xl font-black text-teal-950">
                  {activeReportData.scoringSummary?.rawScore}
                </p>
                <p className="mt-1 text-[11px] text-teal-700">Theoretical Range: 70 – 241</p>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 text-center">
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  C-Scale Standard Score
                </span>
                <p className="mt-2 text-4xl font-black text-teal-950">
                  Point {activeReportData.scoringSummary?.cScaleScore}
                </p>
                <p className="mt-1 text-[11px] text-teal-700">11-Point Standard Continuum (0–10)</p>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 text-center">
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Clinical Classification
                </span>
                <p className="mt-2 text-2xl font-black text-teal-950">
                  {activeReportData.scoringSummary?.classification}
                </p>
                <p className="mt-1 text-[11px] text-teal-700">
                  Normative Z-Score: {activeReportData.scoringSummary?.zScore > 0 ? '+' : ''}
                  {activeReportData.scoringSummary?.zScore} σ
                </p>
              </div>
            </div>

            {/* Visual 11-Point C-Scale Continuum */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  11-Point C-Scale Continuum Profile
                </h4>
                <span className="text-[11px] text-slate-500">
                  Extraversion (0–3) • Ambiversion (4–6) • Introversion (7–10)
                </span>
              </div>

              {/* Band Bars */}
              <div className="mt-4 grid grid-cols-11 gap-1 text-center">
                {C_SCALE_BANDS.map((band) => {
                  const isCurrent = band.point === activeReportData.scoringSummary?.cScaleScore;
                  return (
                    <div
                      key={band.point}
                      className={`flex flex-col items-center justify-between rounded-lg p-2 transition-all ${
                        isCurrent
                          ? 'border-2 border-teal-700 bg-teal-600 text-white shadow-md ring-2 ring-teal-300'
                          : 'border border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black">{band.point}</span>
                      <span
                        className={`text-[9px] font-semibold truncate w-full ${
                          isCurrent ? 'text-white' : 'text-slate-500'
                        }`}
                        title={band.label}
                      >
                        {band.point <= 3 ? 'Extravert' : band.point <= 6 ? 'Ambivert' : 'Introvert'}
                      </span>
                      <span
                        className={`text-[8px] ${
                          isCurrent ? 'text-teal-100' : 'text-slate-400'
                        }`}
                      >
                        {band.range}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Block-by-Block Dimensional Profile Table */}
            <div className="mt-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Block-by-Block Dimensional Analysis & Normative Comparison
              </h4>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 uppercase text-slate-600">
                    <tr>
                      <th className="p-3">Block Section</th>
                      <th className="p-3">Measurement Dimension</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Candidate Score</th>
                      <th className="p-3">Standard Norm Mean (SD)</th>
                      <th className="p-3">Score Direction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block A</td>
                      <td className="p-3 text-slate-800">Objective Situations & Social Occupations</td>
                      <td className="p-3 text-slate-500">Q1–Q11 (11)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.A}
                      </td>
                      <td className="p-3 text-slate-500">27.86 (SD 3.36)</td>
                      <td className="p-3 text-slate-700">
                        {activeReportData.scoringSummary?.blockScores?.A > 28 ? 'Introverted' : 'Extraverted'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block B</td>
                      <td className="p-3 text-slate-800">Introspective Activities & Attitudes</td>
                      <td className="p-3 text-slate-500">Q12–Q28 (17)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.B}
                      </td>
                      <td className="p-3 text-slate-500">42.22 (SD 6.36)</td>
                      <td className="p-3 text-slate-700">
                        {activeReportData.scoringSummary?.blockScores?.B > 42 ? 'Introverted' : 'Extraverted'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block C</td>
                      <td className="p-3 text-slate-800">Preference Comparison of Paired Activities</td>
                      <td className="p-3 text-slate-500">Q29–Q42 (14)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.C}
                      </td>
                      <td className="p-3 text-slate-500">28.91 (SD 4.14)</td>
                      <td className="p-3 text-slate-700">
                        {activeReportData.scoringSummary?.blockScores?.C > 29 ? 'Introverted' : 'Extraverted'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block D</td>
                      <td className="p-3 text-slate-800">Feeling & Emotional Behavior Statements</td>
                      <td className="p-3 text-slate-500">Q43–Q56 (14)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.D}
                      </td>
                      <td className="p-3 text-slate-500">25.48 (SD 3.30)</td>
                      <td className="p-3 text-slate-700">
                        {activeReportData.scoringSummary?.blockScores?.D > 25 ? 'Introverted' : 'Extraverted'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block E</td>
                      <td className="p-3 text-slate-800">Habit & Dispositional Dispositions (Y/N)</td>
                      <td className="p-3 text-slate-500">Q57–Q70 (14)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.E}
                      </td>
                      <td className="p-3 text-slate-500">21.28 (SD 2.43)</td>
                      <td className="p-3 text-slate-700">
                        {activeReportData.scoringSummary?.blockScores?.E > 21 ? 'Introverted' : 'Extraverted'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Psychological Interpretation */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Authoritative Psychological Interpretation (Kundu 1976 Standard)
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">
                {activeReportData.report?.interpretation || activeReportData.scoringSummary?.cScaleDetails?.interpretation}
              </p>
            </div>

            {/* Lead Psychologist Observations (Editable) */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Clinical Observations & Recommendations
                </h4>
                {notesSaveSuccess && (
                  <span className="text-xs font-bold text-teal-600">✓ Notes Saved!</span>
                )}
              </div>

              <div className="mt-4 space-y-3 print:hidden">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Evaluating Psychologist Name:
                    </label>
                    <input
                      type="text"
                      value={psychologistNameInput}
                      onChange={(e) => setPsychologistNameInput(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600">
                    Clinical Notes & Behavioral Observations:
                  </label>
                  <textarea
                    rows={4}
                    value={observationsInput}
                    onChange={(e) => setObservationsInput(e.target.value)}
                    placeholder="Enter clinical notes, test-taking demeanor, or qualitative observations here…"
                    className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveObservations}
                    disabled={savingNotes}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {savingNotes ? 'Saving…' : 'Save Clinical Observations'}
                  </button>
                </div>
              </div>

              {/* Print View of Observations */}
              <div className="hidden mt-3 print:block text-xs leading-relaxed text-slate-800">
                <p><strong>Evaluating Psychologist:</strong> {psychologistNameInput}</p>
                <p className="mt-2 whitespace-pre-wrap">{observationsInput}</p>
              </div>
            </div>

            {/* Disclaimer & Official Sign-off Block */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex items-start gap-3 rounded-lg bg-amber-50/70 p-3 text-[11px] leading-relaxed text-amber-900 border border-amber-200">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                <span>
                  <strong>Clinical Notice:</strong> This psychometric inventory evaluates non-pathological behavioral
                  dispositions and personality tendencies on the Introversion-Extraversion dimension. It does not
                  constitute an independent psychiatric diagnosis or disease classification. Results must be interpreted
                  in conjunction with comprehensive clinical interviews.
                </span>
              </div>

              <div className="mt-8 flex items-end justify-between text-xs text-slate-600 pt-4">
                <div>
                  <p>Department of Clinical Psychology</p>
                  <p className="text-[10px] text-slate-400">Psychometric Assessment Management System</p>
                </div>

                <div className="text-right">
                  <div className="border-b border-slate-400 pb-1 w-48 text-center font-serif italic text-slate-800">
                    {psychologistNameInput}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">Authorized Clinical Signature & Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* If browsing reports ledger */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Clinical Assessment Reports
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Review verified K.I.E.I. psychometric reports, C-Scale profiles, and printable clinical summaries.
              </p>
            </div>

            <Link
              to="/assessments"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Layers className="h-4 w-4" /> View All Sessions
            </Link>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by candidate name, Patient ID, or Report ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Reports Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Report ID</th>
                  <th className="px-6 py-3.5">Patient Details</th>
                  <th className="px-6 py-3.5">Raw Score</th>
                  <th className="px-6 py-3.5">C-Scale Classification</th>
                  <th className="px-6 py-3.5">Evaluator</th>
                  <th className="px-6 py-3.5">Generated Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Loading reports from MongoDB Atlas…
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-500">
                      No clinical reports found. Complete an assessment session to generate a report.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        {report.reportId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {report.patient?.fullName || '—'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {report.patient?.patientId} • {report.patient?.gender || '—'}, Age{' '}
                          {report.patient?.age || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {report.testSession?.rawScore || '—'} / 241
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/20">
                          Point {report.testSession?.cScaleScore} — {report.testSession?.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {report.psychologistName || 'Dr. Clinical Psychologist'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectReport(report.testSession?.sessionId)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View Clinical Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
