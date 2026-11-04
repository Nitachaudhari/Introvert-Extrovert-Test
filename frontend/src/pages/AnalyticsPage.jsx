import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Users,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { fetchDashboardSummary, fetchAssessments } from '../services/api';

const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dashRes, assessData] = await Promise.all([
          fetchDashboardSummary(),
          fetchAssessments(),
        ]);
        if (dashRes.success) setSummary(dashRes.data);
        setAssessments(assessData || []);
      } catch (err) {
        setError('Failed to load psychometric analytics data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const completed = assessments.filter((a) => a.status === 'completed' && a.cScaleScore !== null);

  // Compute Personality Classification Breakdown
  const classificationCounts = {
    extravert: 0, // C-Scale 0 to 3
    ambivert: 0,  // C-Scale 4 to 6
    introvert: 0, // C-Scale 7 to 10
  };

  let totalRawScoreSum = 0;

  completed.forEach((session) => {
    totalRawScoreSum += session.rawScore || 0;
    const cScale = session.cScaleScore;
    if (cScale <= 3) classificationCounts.extravert += 1;
    else if (cScale <= 6) classificationCounts.ambivert += 1;
    else classificationCounts.introvert += 1;
  });

  const totalCompleted = completed.length || 1;
  const avgRawScore = completed.length ? Math.round(totalRawScoreSum / completed.length) : 0;
  const indianNormMean = 144.88;
  const deviation = avgRawScore ? (avgRawScore - indianNormMean).toFixed(1) : 0;

  const extravertPct = Math.round((classificationCounts.extravert / totalCompleted) * 100);
  const ambivertPct = Math.round((classificationCounts.ambivert / totalCompleted) * 100);
  const introvertPct = Math.round((classificationCounts.introvert / totalCompleted) * 100);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Psychometric Analytics & Cohort Distribution
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Population insights, normative benchmarks against Dr. Ramanath Kundu’s Indian sample (N=318), and monthly assessment throughput.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Evaluations</span>
          <p className="mt-2 text-3xl font-black text-slate-900">{assessments.length}</p>
          <span className="mt-1 inline-block text-[11px] text-teal-600 font-semibold">
            {completed.length} finalized & scored
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Cohort Mean Raw Score</span>
          <p className="mt-2 text-3xl font-black text-teal-900">{avgRawScore || '—'}</p>
          <span className="mt-1 inline-block text-[11px] text-slate-500">
            vs Standard Norm: {indianNormMean}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Deviation from Norm</span>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-3xl font-black text-slate-900">
              {deviation > 0 ? `+${deviation}` : deviation}
            </span>
            {deviation > 0 ? (
              <ArrowUpRight className="h-5 w-5 text-amber-500" />
            ) : deviation < 0 ? (
              <ArrowDownRight className="h-5 w-5 text-teal-500" />
            ) : (
              <Minus className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <span className="mt-1 inline-block text-[11px] text-slate-500">
            {deviation > 0 ? 'Leans toward Introversion' : 'Leans toward Extraversion'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Registered Patients</span>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {summary?.cards?.totalPatients || 0}
          </p>
          <span className="mt-1 inline-block text-[11px] text-slate-500">Active records</span>
        </div>
      </div>

      {/* Cohort Classification Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Cohort Personality Trait Distribution
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Categorization across Extraversion (C-Scale 0–3), Ambiversion (4–6), and Introversion (7–10)
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-sky-700">Extravert (C-Scale 0–3)</span>
                <span className="text-slate-900">{classificationCounts.extravert} candidates ({completed.length ? extravertPct : 0}%)</span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${completed.length ? extravertPct : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-teal-700">Ambivert (C-Scale 4–6, Central Range)</span>
                <span className="text-slate-900">{classificationCounts.ambivert} candidates ({completed.length ? ambivertPct : 0}%)</span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${completed.length ? ambivertPct : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-indigo-700">Introvert (C-Scale 7–10)</span>
                <span className="text-slate-900">{classificationCounts.introvert} candidates ({completed.length ? introvertPct : 0}%)</span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${completed.length ? introvertPct : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
            In standard clinical psychometrics, approximately 54% of typical populations fall within the central Ambivert band (C-Scale 4–6), with normal bell-curve tails towards Extraversion and Introversion.
          </div>
        </div>

        {/* Monthly Activity Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Monthly Evaluation Throughput
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Total administered and completed assessment sessions across recent months
          </p>

          <div className="mt-6 divide-y divide-slate-100">
            {(summary?.monthlyStats || []).map((month) => {
              const dateLabel = new Date(month._id.year, month._id.month - 1).toLocaleDateString(
                undefined,
                { month: 'long', year: 'numeric' }
              );
              return (
                <div key={`${month._id.year}-${month._id.month}`} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{dateLabel}</span>
                    <span className="ml-2 text-slate-400">({month.completed} completed)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700">{month.count} sessions</span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${Math.min(100, month.count * 10)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {summary?.monthlyStats?.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400">
                No monthly activity recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
