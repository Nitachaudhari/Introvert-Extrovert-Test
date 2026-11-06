import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Award,
  Save,
  Clock,
  ArrowLeft,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  Check,
  Stethoscope,
  HeartHandshake,
  Globe2,
} from 'lucide-react';
import {
  fetchReports,
  fetchAssessmentReport,
  updateAssessmentReport,
} from '../services/api';
import {
  REPORT_UI_TRANSLATIONS,
  BLOCK_DIMENSIONS,
  C_SCALE_LOCALIZATION,
} from '../data/kieiReportTranslations';

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
  const urlLang = searchParams.get('lang');

  const [reportLanguage, setReportLanguage] = useState(urlLang || 'en');
  const [reportsList, setReportsList] = useState([]);
  const [activeReportData, setActiveReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');
  const [observationsInput, setObservationsInput] = useState('');
  const [psychologistNameInput, setPsychologistNameInput] = useState('Dr. Parag Mahajan');
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
        setPsychologistNameInput(data.report?.psychologistName || 'Dr. Parag Mahajan');

        if (!urlLang) {
          const sessionLang = data.session?.testLanguage || data.report?.language;
          if (sessionLang && ['en', 'hi', 'mr'].includes(sessionLang)) {
            setReportLanguage(sessionLang);
          }
        }
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

  const cScaleDetails = activeReportData?.scoringSummary?.cScaleDetails;
  const cPoint = activeReportData?.scoringSummary?.cScaleScore;
  const isSevereOrMarked = cPoint <= 1 || cPoint >= 9;

  const t = REPORT_UI_TRANSLATIONS[reportLanguage] || REPORT_UI_TRANSLATIONS.en;
  const cScaleInfo = (cPoint !== undefined && cPoint !== null) ? (C_SCALE_LOCALIZATION[cPoint] || {}) : {};

  const localizedClassification =
    cScaleInfo.classification?.[reportLanguage] ||
    activeReportData?.scoringSummary?.classification;

  const localizedSeverity =
    cScaleInfo.severityLevel?.[reportLanguage] ||
    cScaleDetails?.severityLevel ||
    t.standardContinuum;

  const localizedExplanation =
    cScaleInfo.detailedExplanation?.[reportLanguage] ||
    cScaleDetails?.detailedExplanation ||
    activeReportData?.report?.interpretation;

  const localizedDailyLife =
    cScaleInfo.dailyLifeImpact?.[reportLanguage] ||
    cScaleDetails?.dailyLifeImpact;

  const localizedVulnerabilities =
    cScaleInfo.potentialVulnerabilities?.[reportLanguage] ||
    cScaleDetails?.potentialVulnerabilities ||
    [];

  const localizedSolutions =
    cScaleInfo.clinicalSolutions?.[reportLanguage] ||
    cScaleDetails?.clinicalSolutions ||
    [];

  const getDimensionName = (block) =>
    BLOCK_DIMENSIONS[block]?.[reportLanguage] || BLOCK_DIMENSIONS[block]?.en;

  return (
    <div className="space-y-6 pb-16">
      {/* If viewing a single report */}
      {activeReportData ? (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Action Bar (Hidden in Print) */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> {t.backToList}
            </button>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Language Switcher Pill */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                <Globe2 className="h-4 w-4 text-teal-700 ml-1.5" />
                <span className="text-[11px] font-semibold text-slate-600 mr-1 hidden sm:inline">
                  {t.reportLanguage}:
                </span>
                {[
                  { code: 'en', label: 'English' },
                  { code: 'mr', label: 'मराठी' },
                  { code: 'hi', label: 'हिन्दी' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setReportLanguage(l.code)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      reportLanguage === l.code
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <span className="font-mono text-xs text-slate-400 hidden md:inline">
                {t.reportIdLabel} {activeReportData.report?.reportId}
              </span>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-teal-700 transition-colors"
              >
                <Printer className="h-4 w-4" /> {t.printButton}
              </button>
            </div>
          </div>

          {/* Clinical Document Container (Printable) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm print:border-none print:p-0 print:shadow-none space-y-8">
            {/* Clinic Brand & Document Header */}
            <div className="border-b-2 border-teal-800 pb-6 text-center space-y-2">
              <div className="inline-block rounded-md bg-teal-50 px-3.5 py-1 font-mono text-xs font-bold text-teal-800">
                {t.documentBadge}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {t.testTitle}
              </h1>
              <p className="text-xs text-slate-600">
                {t.department}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 pt-1">
                <span className="font-semibold text-teal-800">{t.supervisingDoctor}: {psychologistNameInput}</span>
                <span>•</span>
                <span>{t.normBaseline}</span>
                <span>•</span>
                <span>{t.normMean}</span>
                <span>•</span>
                <span>{t.cScaleMetric}</span>
              </div>
            </div>

            {/* Candidate Demographics */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {t.demographicsTitle}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-slate-400">{t.fullName}</span>
                  <p className="font-bold text-slate-900">
                    {activeReportData.session?.patient?.fullName || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t.patientId}</span>
                  <p className="font-mono font-bold text-slate-900">
                    {activeReportData.session?.patient?.patientId || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t.ageGender}</span>
                  <p className="font-bold text-slate-900">
                    {activeReportData.session?.patient?.age || '—'} {t.years} / {activeReportData.session?.patient?.gender || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t.contactEmail}</span>
                  <p className="font-medium text-slate-700">
                    {activeReportData.session?.patient?.mobile || activeReportData.session?.patient?.email || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t.education}</span>
                  <p className="font-medium text-slate-700">
                    {activeReportData.session?.patient?.education || 'Standard'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t.occupation}</span>
                  <p className="font-medium text-slate-700">
                    {activeReportData.session?.patient?.occupation || 'Candidate'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t.adminMode}</span>
                  <p className="font-bold capitalize text-slate-800">
                    {activeReportData.session?.administrationMethod === 'self' ? t.selfAdmin : t.clinicianAdmin}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">{t.assessmentDate}</span>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 text-center">
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  {t.rawScoreLabel}
                </span>
                <p className="mt-2 text-4xl font-black text-teal-950">
                  {activeReportData.scoringSummary?.rawScore}
                </p>
                <p className="mt-1 text-[11px] text-teal-700">{t.rawScoreRange}</p>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 text-center">
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  {t.cScaleLabel}
                </span>
                <p className="mt-2 text-4xl font-black text-teal-950">
                  {t.point} {activeReportData.scoringSummary?.cScaleScore}
                </p>
                <p className="mt-1 text-[11px] text-teal-700">{t.cScaleRange}</p>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 text-center">
                <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  {t.classificationLabel}
                </span>
                <p className="mt-2 text-2xl font-black text-teal-950">
                  {localizedClassification}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-teal-800">
                  {localizedSeverity}
                </p>
              </div>
            </div>

            {/* Severe / Marked Deviation Alert if Applicable */}
            {isSevereOrMarked && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-5 flex items-start gap-3.5">
                <ShieldAlert className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-amber-950">
                  <h4 className="font-bold text-sm text-amber-900">
                    {t.alertTitle}
                  </h4>
                  <p className="leading-relaxed">
                    {cPoint <= 1 ? t.alertMessageExtravert : t.alertMessageIntrovert}
                  </p>
                </div>
              </div>
            )}

            {/* Visual 11-Point C-Scale Continuum Profile */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t.continuumTitle}
                </h4>
                <span className="text-[11px] text-slate-500">
                  {t.continuumSubtitle}
                </span>
              </div>

              <div className="grid grid-cols-11 gap-1 text-center">
                {C_SCALE_BANDS.map((band) => {
                  const isCurrent = band.point === activeReportData.scoringSummary?.cScaleScore;
                  return (
                    <div
                      key={band.point}
                      className={`flex flex-col items-center justify-between rounded-lg p-2 transition-all ${isCurrent
                          ? 'border-2 border-teal-700 bg-teal-600 text-white shadow-md ring-2 ring-teal-300'
                          : 'border border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                    >
                      <span className="text-xs font-black">{band.point}</span>
                      <span
                        className={`text-[9px] font-semibold truncate w-full ${isCurrent ? 'text-white' : 'text-slate-500'
                          }`}
                        title={band.label}
                      >
                        {band.point <= 3 ? t.extravert : band.point <= 6 ? t.ambivert : t.introvert}
                      </span>
                      <span className={`text-[8px] ${isCurrent ? 'text-teal-100' : 'text-slate-400'}`}>
                        {band.range}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Personality Explanation */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {t.explanationTitle}
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {localizedExplanation}
              </p>
              {localizedDailyLife && (
                <div className="rounded-lg bg-white p-4 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1">{t.dailyLifeTitle}</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {localizedDailyLife}
                  </p>
                </div>
              )}
            </div>

            {/* Potential Vulnerabilities / Challenges */}
            {localizedVulnerabilities && localizedVulnerabilities.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-700" />
                  {t.vulnerabilitiesTitle}
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {localizedVulnerabilities.map((vuln, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{vuln}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actionable Clinical Solutions & Recommendations */}
            {localizedSolutions && localizedSolutions.length > 0 && (
              <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-teal-100 pb-2">
                  <HeartHandshake className="h-5 w-5 text-teal-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                    {t.solutionsTitle}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {localizedSolutions.map((sol, idx) => (
                    <div key={idx} className="rounded-xl bg-white p-3.5 border border-teal-100 shadow-2xs flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed pt-0.5">{sol}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Block-by-Block Dimensional Profile Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.blockTableTitle}
              </h4>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 uppercase text-slate-600">
                    <tr>
                      <th className="p-3">{t.colSection}</th>
                      <th className="p-3">{t.colDimension}</th>
                      <th className="p-3">{t.colItems}</th>
                      <th className="p-3">{t.colCandidateScore}</th>
                      <th className="p-3">{t.colNormMean}</th>
                      <th className="p-3">{t.colOrientation}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block A</td>
                      <td className="p-3 text-slate-800">{getDimensionName('A')}</td>
                      <td className="p-3 text-slate-500">Q1–Q11 (11)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.A}
                      </td>
                      <td className="p-3 text-slate-500">27.86 (SD 3.36)</td>
                      <td className="p-3 text-slate-700 font-medium">
                        {activeReportData.scoringSummary?.blockScores?.A > 28 ? t.introverted : t.extraverted}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block B</td>
                      <td className="p-3 text-slate-800">{getDimensionName('B')}</td>
                      <td className="p-3 text-slate-500">Q12–Q28 (17)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.B}
                      </td>
                      <td className="p-3 text-slate-500">42.22 (SD 6.36)</td>
                      <td className="p-3 text-slate-700 font-medium">
                        {activeReportData.scoringSummary?.blockScores?.B > 42 ? t.introverted : t.extraverted}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block C</td>
                      <td className="p-3 text-slate-800">{getDimensionName('C')}</td>
                      <td className="p-3 text-slate-500">Q29–Q42 (14)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.C}
                      </td>
                      <td className="p-3 text-slate-500">28.91 (SD 4.14)</td>
                      <td className="p-3 text-slate-700 font-medium">
                        {activeReportData.scoringSummary?.blockScores?.C > 29 ? t.introverted : t.extraverted}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block D</td>
                      <td className="p-3 text-slate-800">{getDimensionName('D')}</td>
                      <td className="p-3 text-slate-500">Q43–Q56 (14)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.D}
                      </td>
                      <td className="p-3 text-slate-500">25.48 (SD 3.30)</td>
                      <td className="p-3 text-slate-700 font-medium">
                        {activeReportData.scoringSummary?.blockScores?.D > 25 ? t.introverted : t.extraverted}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-teal-800">Block E</td>
                      <td className="p-3 text-slate-800">{getDimensionName('E')}</td>
                      <td className="p-3 text-slate-500">Q57–Q70 (14)</td>
                      <td className="p-3 font-bold text-slate-900">
                        {activeReportData.scoringSummary?.blockScores?.E}
                      </td>
                      <td className="p-3 text-slate-500">21.28 (SD 2.43)</td>
                      <td className="p-3 text-slate-700 font-medium">
                        {activeReportData.scoringSummary?.blockScores?.E > 21 ? t.introverted : t.extraverted}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctor's Custom Clinical Notes (Editable) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-teal-700" />
                  {t.doctorNotesTitle}
                </h4>
                {notesSaveSuccess && (
                  <span className="text-xs font-bold text-teal-600">✓ {t.notesSaved}</span>
                )}
              </div>

              <div className="space-y-3 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      {t.supervisingDoctor}:
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
                    {t.doctorNotesTitle}:
                  </label>
                  <textarea
                    rows={4}
                    value={observationsInput}
                    onChange={(e) => setObservationsInput(e.target.value)}
                    placeholder={t.doctorNotesPlaceholder}
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
                    {savingNotes ? t.savingNotes : t.saveNotes}
                  </button>
                </div>
              </div>

              {/* Print View of Observations */}
              <div className="hidden mt-3 print:block text-xs leading-relaxed text-slate-800 space-y-1">
                <p><strong>{t.supervisingDoctor}:</strong> {psychologistNameInput}</p>
                <p className="whitespace-pre-wrap">{observationsInput || 'Assessment administered and scored according to standardized psychometric guidelines.'}</p>
              </div>
            </div>

            {/* Disclaimer & Sign-off Block */}
            <div className="border-t border-slate-200 pt-6 space-y-6">
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3.5 text-[11px] leading-relaxed text-slate-600 border border-slate-200">
                <ShieldAlert className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                <span>
                  {t.clinicalNotice}
                </span>
              </div>

              <div className="flex items-end justify-between text-xs text-slate-600 pt-4">
                <div>
                  <p className="font-bold text-slate-800">{t.evaluatingPsychologist}</p>
                  <p className="text-[11px] text-slate-500">{t.statusVerified}</p>
                </div>

                <div className="text-right">
                  <div className="border-b border-slate-400 pb-1 w-56 text-center font-serif italic text-slate-900 text-sm">
                    {psychologistNameInput}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">{t.verifiedApproved}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Reports Ledger List */
        <div className="space-y-6 max-w-6xl mx-auto">
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Layers className="h-4 w-4" /> View All Sessions
            </Link>
          </div>

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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Report ID</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Raw Score</th>
                  <th className="px-6 py-4">C-Scale Classification</th>
                  <th className="px-6 py-4">Supervising Doctor</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Loading reports…
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
                        {report.psychologistName || 'Dr. Parag Mahajan'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectReport(report.testSession?.sessionId)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-teal-700 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View Report
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
