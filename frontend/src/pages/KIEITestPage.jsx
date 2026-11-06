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
  ListOrdered,
  Eye,
  Lock,
  ArrowLeft,
  Globe2,
} from 'lucide-react';
import { KIEI_QUESTIONS } from '../data/kieiQuestions';
import {
  UI_TRANSLATIONS,
  BLOCK_GUIDES,
  STANDARD_OPTIONS,
  QUESTION_LOCALIZATION,
} from '../data/kieiTranslations';
import {
  fetchAssessment,
  saveAssessmentProgress,
  submitAssessment,
} from '../services/api';

const KIEITestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');

  const [language, setLanguage] = useState(
    () => localStorage.getItem('kiei_test_lang') || 'en'
  );

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0); // 0 to 69
  const [answers, setAnswers] = useState({}); // { [questionNumber]: selectedOption }
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'saving' | 'error'
  const [showPalette, setShowPalette] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const saveTimerRef = useRef(null);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('kiei_test_lang', lang);
  };

  const ui = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;

  // Fetch initial session
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
        if (data.testLanguage && ['en', 'hi', 'mr'].includes(data.testLanguage)) {
          setLanguage(data.testLanguage);
        }
        if (data.status === 'completed') {
          return;
        }

        const loadedAnswers = {};
        if (Array.isArray(data.answers)) {
          data.answers.forEach((ans) => {
            loadedAnswers[ans.questionNumber] = ans.selectedOption;
          });
        }
        setAnswers(loadedAnswers);

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

  // Debounced Autosave
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
            testLanguage: language,
          });

          setSyncStatus('synced');
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setReviewOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      triggerAutosave(answers, prevIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJump = (index) => {
    setCurrentIndex(index);
    setShowPalette(false);
    triggerAutosave(answers, index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / 70) * 100);

  const currentQuestion = KIEI_QUESTIONS[currentIndex];
  const currentBlock = currentQuestion?.block;

  // Localized Question & Options
  const localizedQ = QUESTION_LOCALIZATION[currentQuestion?.number]?.[language];
  const questionText = localizedQ?.text || currentQuestion?.text;

  let displayOptions = currentQuestion?.options || [];
  if (language !== 'en') {
    if (currentBlock === 'A' && localizedQ?.options) {
      displayOptions = localizedQ.options;
    } else if (STANDARD_OPTIONS[currentBlock]?.[language]) {
      displayOptions = STANDARD_OPTIONS[currentBlock][language];
    }
  }

  const sectionGuide =
    BLOCK_GUIDES[currentBlock]?.[language] || BLOCK_GUIDES[currentBlock]?.en || { title: `Section ${currentBlock}`, tip: '' };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const formatted = Object.entries(answers).map(([num, opt]) => ({
        questionNumber: Number(num),
        selectedOption: opt,
      }));

      await submitAssessment(sessionId, {
        answers: formatted,
        testLanguage: language,
      });
      navigate(`/reports?highlight=${sessionId}&lang=${language}`);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || err.message || 'Scoring validation failed.'
      );
      setSubmitting(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          <FileText className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">No Assessment Selected</h1>
        <p className="text-sm text-slate-500">
          To begin taking the test, please select or start a session from the Assessments tab.
        </p>
        <Link
          to="/assessments"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-700"
        >
          <ArrowLeft className="h-4 w-4" /> Go to Assessments Hub
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Loading questionnaire…</p>
      </div>
    );
  }

  if (session?.status === 'completed') {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-teal-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Assessment Completed</h2>
        <p className="mt-2 text-sm text-slate-600">
          This test for <strong className="text-slate-900">{session.patient?.fullName}</strong> has already been completed and scored.
        </p>
        <div className="mt-5 rounded-xl bg-teal-50/70 p-4 border border-teal-100 text-left">
          <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">Test Result</span>
          <p className="text-lg font-bold text-teal-950 mt-1">
            {session.classification} (C-Scale Point {session.cScaleScore})
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Raw Score: {session.rawScore} / 241</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to={`/reports?highlight=${session.sessionId}`}
            className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-700"
          >
            View Full Clinical Report
          </Link>
          <Link
            to="/assessments"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      {/* Top Patient, Language & Progress Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                {ui.testTitle}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-600 font-medium">
                {session?.patient?.fullName || 'Candidate'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl mt-1">
              {ui.questionOf} {currentIndex + 1} <span className="text-slate-400 font-normal">{ui.ofTotal}</span>
            </h1>
          </div>

          {/* Language Selector Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-center bg-slate-100 p-1 rounded-xl">
            <Globe2 className="h-4 w-4 text-slate-500 ml-1.5" />
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${language === 'en'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${language === 'hi'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('mr')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${language === 'mr'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            {answeredCount} {ui.ofTotal} {ui.answered}
          </span>
          <button
            type="button"
            onClick={() => setShowPalette(!showPalette)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            <ListOrdered className="h-3.5 w-3.5" />
            {showPalette ? ui.hideJump : ui.jumpToQuestion}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Collapsible Question Jump Grid */}
        {showPalette && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">{ui.clickToJump}</p>
            <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-14">
              {KIEI_QUESTIONS.map((q, idx) => {
                const hasAnswer = answers[q.number] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.number}
                    type="button"
                    onClick={() => handleJump(idx)}
                    className={`h-7 w-7 rounded-lg text-xs font-semibold transition-all ${isCurrent
                        ? 'border-2 border-slate-900 bg-teal-600 text-white font-bold'
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
        )}
      </div>

      {/* Section Helper Banner */}
      <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-xs font-bold text-teal-900 uppercase tracking-wider">{sectionGuide.title}</p>
        <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{sectionGuide.tip}</p>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-xs">
            {currentQuestion?.number}
          </span>
          <h2 className="text-lg font-medium leading-relaxed text-slate-900 sm:text-xl pt-0.5">
            {questionText}
          </h2>
        </div>

        {/* Option Selection Cards */}
        <div className="space-y-3 pt-2">
          {displayOptions.map((option, idx) => {
            const isSelected = answers[currentQuestion.number] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelectOption(currentQuestion.number, option.value)}
                className={`group flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${isSelected
                    ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-600 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all ${isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-white text-slate-500 group-hover:border-slate-400'
                      }`}
                  >
                    {isSelected ? '✓' : currentBlock === 'E' ? option.value : idx + 1}
                  </div>
                  <span
                    className={`text-sm sm:text-base ${isSelected ? 'font-semibold text-teal-950' : 'text-slate-800'
                      }`}
                  >
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> {ui.previous}
          </button>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Cloud className="h-3.5 w-3.5 text-teal-600" /> {ui.autoSaved}
          </div>

          {currentIndex < 69 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
            >
              {ui.next} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-teal-700 transition-colors"
            >
              <span>{ui.finishReview}</span>
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Answer Review & Submit Modal */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{ui.reviewTitle}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {ui.reviewSubtitle.replace('{name}', session?.patient?.fullName || '')}
                  </p>
                </div>
                <button
                  onClick={() => setReviewOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3.5 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{ui.completionStatus}</span>
                {answeredCount < 70 ? (
                  <span className="font-bold text-rose-600">
                    {ui.remainingMsg.replace('{count}', String(70 - answeredCount))}
                  </span>
                ) : (
                  <span className="font-bold text-teal-700">
                    {ui.allAnswered}
                  </span>
                )}
              </div>
            </div>

            {submitError && (
              <div className="mx-6 mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {submitError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100">
              {KIEI_QUESTIONS.map((q, idx) => {
                const ans = answers[q.number];
                const locQ = QUESTION_LOCALIZATION[q.number]?.[language];
                const qDisplay = locQ?.text || q.text;

                let optDisplay = ans;
                if (ans !== undefined) {
                  if (q.block === 'A' && locQ?.options) {
                    const match = locQ.options.find((o) => o.value === ans);
                    if (match) optDisplay = match.label;
                  } else if (STANDARD_OPTIONS[q.block]?.[language]) {
                    const match = STANDARD_OPTIONS[q.block][language].find((o) => o.value === ans);
                    if (match) optDisplay = match.label;
                  }
                }

                return (
                  <div key={q.number} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 max-w-md truncate">
                      <span className="font-bold text-slate-500 w-6">#{q.number}</span>
                      <span className="text-slate-800 truncate">{qDisplay}</span>
                    </div>
                    <div>
                      {ans !== undefined ? (
                        <span className="rounded bg-teal-50 px-2 py-0.5 font-semibold text-teal-800">
                          {String(optDisplay).slice(0, 24)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentIndex(idx);
                            setReviewOpen(false);
                          }}
                          className="rounded bg-rose-100 px-2 py-0.5 font-semibold text-rose-700 hover:bg-rose-200"
                        >
                          Answer Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 p-5 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {ui.backToQuestions}
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting || answeredCount < 70}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-teal-700 disabled:opacity-50"
              >
                {submitting ? ui.scoring : ui.submitReport}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KIEITestPage;
