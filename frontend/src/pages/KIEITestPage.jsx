import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Cloud,
  Check,
  RotateCcw,
  ListOrdered,
  HelpCircle,
  Eye,
  Lock,
} from 'lucide-react';
import { KIEI_QUESTIONS, BLOCK_METADATA } from '../data/kieiQuestions';
import {
  fetchAssessment,
  saveAssessmentProgress,
  submitAssessment,
} from '../services/api';

const KIEITestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0); // 0 to 69
  const [answers, setAnswers] = useState({}); // { [questionNumber]: selectedOption }
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'saving' | 'error'
  const [lastSaved, setLastSaved] = useState(null);

  // Review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showBlockInfo, setShowBlockInfo] = useState(true);

  const saveTimerRef = useRef(null);

  // Fetch initial session state
  useEffect(() => {
    let mounted = true;
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      try {
        setLoading(true);
        const data = await fetchAssessment(sessionId);
        if (!mounted) return;

        setSession(data);
        if (data.status === 'completed') {
          // Already completed, direct to report
          return;
        }

        // Populate answers map
        const loadedAnswers = {};
        if (Array.isArray(data.answers)) {
          data.answers.forEach((ans) => {
            loadedAnswers[ans.questionNumber] = ans.selectedOption;
          });
        }
        setAnswers(loadedAnswers);

        // Resume at saved question index
        if (typeof data.currentQuestionIndex === 'number') {
          setCurrentIndex(Math.min(69, Math.max(0, data.currentQuestionIndex)));
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message || err.message || 'Failed to load assessment session.'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSession();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // Debounced Autosave to MongoDB Atlas
  const triggerAutosave = useCallback(
    (newAnswers, newIndex) => {
      if (!sessionId || session?.status === 'completed') return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSyncStatus('saving');

      saveTimerRef.current = setTimeout(async () => {
        try {
          const formatted = Object.entries(newAnswers).map(([num, opt]) => ({
            questionNumber: Number(num),
            selectedOption: opt,
          }));

          await saveAssessmentProgress(sessionId, {
            answers: formatted,
            currentQuestionIndex: newIndex,
          });

          setSyncStatus('synced');
          setLastSaved(new Date());
        } catch (err) {
          console.error('Autosave error:', err);
          setSyncStatus('error');
        }
      }, 600);
    },
    [sessionId, session?.status]
  );

  const handleSelectOption = (questionNumber, optionValue) => {
    const updated = {
      ...answers,
      [questionNumber]: optionValue,
    };
    setAnswers(updated);
    triggerAutosave(updated, currentIndex);
  };

  const handleNext = () => {
    if (currentIndex < 69) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      triggerAutosave(answers, nextIdx);
    } else {
      setReviewOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      triggerAutosave(answers, prevIdx);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentIndex(index);
    triggerAutosave(answers, index);
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / 70) * 100);

  const currentQuestion = KIEI_QUESTIONS[currentIndex];
  const currentBlock = currentQuestion?.block;
  const currentBlockMeta = BLOCK_METADATA[currentBlock];

  // Submission handler
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const formatted = Object.entries(answers).map(([num, opt]) => ({
        questionNumber: Number(num),
        selectedOption: opt,
      }));

      const res = await submitAssessment(sessionId, {
        answers: formatted,
      });

      // Redirect to report view or reports list
      navigate(`/reports?highlight=${sessionId}`);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || err.message || 'Scoring validation failed.'
      );
      setSubmitting(false);
    }
  };

  // If no session is selected
  if (!sessionId) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          <FileText className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">No Assessment Session Specified</h1>
        <p className="mt-2 text-sm text-slate-500">
          Please initialize a new session or select an existing in-progress session to continue.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/assessments/new"
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Start New Assessment
          </Link>
          <Link
            to="/assessments"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Existing Sessions
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Loading K.I.E.I. session…</p>
      </div>
    );
  }

  if (session?.status === 'completed') {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-teal-200 bg-teal-50/50 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Assessment Already Completed</h2>
        <p className="mt-2 text-sm text-slate-600">
          Session <span className="font-mono font-semibold">{session.sessionId}</span> has already been scored and locked.
        </p>
        <div className="mt-4 rounded-xl border border-teal-200 bg-white p-4 text-left shadow-sm">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Raw Score:</span>
              <p className="text-base font-bold text-slate-900">{session.rawScore} / 241</p>
            </div>
            <div>
              <span className="text-slate-400">C-Scale Standard:</span>
              <p className="text-base font-bold text-teal-700">Point {session.cScaleScore} ({session.classification})</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to={`/reports?highlight=${session.sessionId}`}
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            View Clinical Report
          </Link>
          <Link
            to="/assessments"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Return to Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Top Clinical Header & Patient Summary */}
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700">
                K.I.E.I. Administration
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="font-mono text-xs font-semibold text-slate-600">
                {session?.sessionId}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs capitalize text-slate-500">
                Mode: {session?.administrationMethod || 'clinician'}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-slate-900">
              {session?.patient?.fullName || 'Candidate Record'}
            </h1>
            <p className="text-xs text-slate-500">
              ID: {session?.patient?.patientId} | Gender: {session?.patient?.gender || '—'} | Age:{' '}
              {session?.patient?.age || '—'} yrs
            </p>
          </div>

          {/* Sync Badge */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
              <Cloud
                className={`h-3.5 w-3.5 ${
                  syncStatus === 'saving'
                    ? 'animate-pulse text-amber-500'
                    : syncStatus === 'synced'
                    ? 'text-teal-600'
                    : 'text-rose-500'
                }`}
              />
              <span className="text-slate-600">
                {syncStatus === 'saving'
                  ? 'Saving to MongoDB…'
                  : syncStatus === 'synced'
                  ? 'Autosaved'
                  : 'Sync Error'}
              </span>
            </div>

            <button
              onClick={() => setReviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-600 bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
            >
              <Eye className="h-3.5 w-3.5" />
              Review ({answeredCount}/70)
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">
              Question {currentIndex + 1} of 70
            </span>
            <span className="font-semibold text-teal-700">
              {answeredCount} of 70 answered ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Block Notification / Instructions Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-teal-600 px-2 py-0.5 text-xs font-bold text-white">
              {currentBlockMeta?.name}
            </span>
            <h2 className="text-sm font-semibold text-slate-900">
              {currentBlockMeta?.description}
            </h2>
            <span className="text-xs text-slate-500">
              (Items {currentBlockMeta?.range[0]} to {currentBlockMeta?.range[1]})
            </span>
          </div>
          <button
            onClick={() => setShowBlockInfo(!showBlockInfo)}
            className="text-xs font-medium text-teal-700 hover:text-teal-800"
          >
            {showBlockInfo ? 'Hide Instructions' : 'Show Instructions'}
          </button>
        </div>
        {showBlockInfo && (
          <p className="mt-2 text-xs leading-relaxed text-slate-700">
            <strong className="text-slate-900">Instructions:</strong> {currentBlockMeta?.instructions}
          </p>
        )}
      </div>

      {/* Main Active Question Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {currentQuestion?.number}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Section {currentBlock} • Item #{currentQuestion?.number}
            </span>
          </div>
          {answers[currentQuestion?.number] !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
              <Check className="h-3.5 w-3.5" /> Answer Recorded
            </span>
          )}
        </div>

        {/* Question Text */}
        <h3 className="mt-5 text-lg font-medium leading-relaxed text-slate-900 sm:text-xl">
          {currentQuestion?.text}
        </h3>

        {/* Options List */}
        <div className="mt-6 space-y-3">
          {currentQuestion?.options.map((option) => {
            const isSelected = answers[currentQuestion.number] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption(currentQuestion.number, option.value)}
                className={`group flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-white text-slate-500 group-hover:border-slate-400'
                    }`}
                  >
                    {isSelected ? '✓' : option.value}
                  </span>
                  <span
                    className={`text-sm ${
                      isSelected ? 'font-semibold text-teal-950' : 'text-slate-700'
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Actions */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          <div className="text-xs font-medium text-slate-400">
            {currentIndex + 1} of 70
          </div>

          {currentIndex < 69 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              Review & Submit <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 70-Item Question Palette Jump Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <ListOrdered className="h-4 w-4" />
            Question Palette (Jump to Any Item)
          </h4>
          <span className="text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-teal-600 mr-1" /> Answered ({answeredCount})
            <span className="inline-block h-2 w-2 rounded-full bg-slate-200 ml-3 mr-1" /> Unanswered ({70 - answeredCount})
          </span>
        </div>

        <div className="mt-4 grid grid-cols-10 gap-1.5 sm:grid-cols-14">
          {KIEI_QUESTIONS.map((q, idx) => {
            const hasAnswer = answers[q.number] !== undefined;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.number}
                type="button"
                onClick={() => handleJumpToQuestion(idx)}
                title={`Q${q.number} (${q.block}): ${hasAnswer ? 'Answered' : 'Unanswered'}`}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'border-2 border-slate-900 bg-teal-600 text-white font-bold ring-2 ring-teal-300'
                    : hasAnswer
                    ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {q.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Answer Review & Final Submission Modal */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Review K.I.E.I. Responses</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Candidate: {session?.patient?.fullName} ({session?.patient?.patientId}) • Session {sessionId}
                  </p>
                </div>
                <button
                  onClick={() => setReviewOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Progress summary inside modal */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <span className="text-slate-500">Total Completion:</span>
                  <span className="ml-2 font-bold text-slate-900">
                    {answeredCount} / 70 Items ({progressPercent}%)
                  </span>
                </div>
                {answeredCount < 70 ? (
                  <span className="font-semibold text-rose-600">
                    ⚠️ {70 - answeredCount} items remaining before submission
                  </span>
                ) : (
                  <span className="font-semibold text-teal-700">
                    ✓ All 70 items answered and verified
                  </span>
                )}
              </div>
            </div>

            {submitError && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Questions Table */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Block</th>
                    <th className="p-2">Question Snippet</th>
                    <th className="p-2">Selected Answer</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {KIEI_QUESTIONS.map((q, idx) => {
                    const ans = answers[q.number];
                    const chosenOption = q.options.find((o) => o.value === ans);

                    return (
                      <tr
                        key={q.number}
                        className={ans === undefined ? 'bg-rose-50/50' : 'hover:bg-slate-50/50'}
                      >
                        <td className="p-2 font-mono font-bold text-slate-700">{q.number}</td>
                        <td className="p-2 font-semibold text-teal-700">{q.block}</td>
                        <td className="p-2 text-slate-800 max-w-xs truncate">{q.text}</td>
                        <td className="p-2">
                          {ans !== undefined ? (
                            <span className="rounded bg-teal-100 px-2 py-0.5 font-semibold text-teal-800">
                              {chosenOption?.label || ans}
                            </span>
                          ) : (
                            <span className="rounded bg-rose-100 px-2 py-0.5 font-semibold text-rose-700">
                              Missing
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentIndex(idx);
                              setReviewOpen(false);
                            }}
                            className="text-teal-600 hover:text-teal-800 font-semibold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 p-6 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue Answering
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting || answeredCount < 70}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {submitting ? (
                  'Scoring Assessment…'
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Lock & Submit Final Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KIEITestPage;
