import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  Play,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { fetchPatients, createAssessment } from '../services/api';

const NewAssessmentPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [administrationMethod, setAdministrationMethod] = useState('clinician');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await fetchPatients({ limit: 100 });
        if (mounted) {
          setPatients(result.patients || []);
          if (result.patients?.length > 0) {
            setSelectedPatientId(result.patients[0]._id);
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load patient records. Please verify backend connection.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPatient = patients.find((p) => p._id === selectedPatientId);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a registered patient.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const session = await createAssessment({
        patientId: selectedPatientId,
        administrationMethod,
      });
      navigate(`/kiei-test?session=${session.sessionId}`);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Unable to initialize assessment session.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/20">
          <FileText className="h-3.5 w-3.5" />
          Kundu Introversion–Extraversion Inventory (K.I.E.I.)
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Initialize New Assessment Session
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a registered patient and set administration parameters according to the Kundu (1976) psychometric manual.
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStart} className="space-y-6">
        {/* Step 1: Patient Selection */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                1
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">Select Patient</h2>
                <p className="text-xs text-slate-500">Patient must have verified consent on file</p>
              </div>
            </div>
            <Link
              to="/patients"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              <Users className="h-3.5 w-3.5" />
              Manage / Register New Patient
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="py-6 text-center text-sm text-slate-400">Loading registered patients…</div>
            ) : patients.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">No patients registered yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Please register a patient before starting an assessment.
                </p>
                <Link
                  to="/patients"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  <Users className="h-3.5 w-3.5" /> Register Patient
                </Link>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Patient Name / ID
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.fullName} ({p.patientId}) — {p.gender}, Age {p.age || 'N/A'} — Consent: {p.consentStatus ? 'Verified' : 'Pending'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedPatient && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                  <div>
                    <span className="text-slate-400">Patient ID:</span>
                    <p className="font-semibold text-slate-800">{selectedPatient.patientId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Gender / Age:</span>
                    <p className="font-semibold text-slate-800">
                      {selectedPatient.gender}, {selectedPatient.age || '—'} yrs
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Mobile:</span>
                    <p className="font-semibold text-slate-800">{selectedPatient.mobile || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Informed Consent:</span>
                    <p
                      className={`font-semibold ${
                        selectedPatient.consentStatus ? 'text-teal-600' : 'text-rose-600'
                      }`}
                    >
                      {selectedPatient.consentStatus ? '✓ Consent Verified' : '✗ Missing Consent'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Administration Method */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              2
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">Administration Mode</h2>
              <p className="text-xs text-slate-500">Choose how the questionnaire will be delivered</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label
              className={`relative flex cursor-pointer flex-col rounded-xl border p-4 shadow-sm transition-all ${
                administrationMethod === 'clinician'
                  ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="adminMethod"
                value="clinician"
                checked={administrationMethod === 'clinician'}
                onChange={(e) => setAdministrationMethod(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Clinician-Administered</span>
                <UserCheck className="h-5 w-5 text-teal-600" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Psychologist reads items or supervises questionnaire responses directly, recording candidate answers in real time.
              </p>
              <span className="mt-3 inline-block text-[11px] font-semibold text-teal-700">
                Recommended for formal clinical assessment
              </span>
            </label>

            <label
              className={`relative flex cursor-pointer flex-col rounded-xl border p-4 shadow-sm transition-all ${
                administrationMethod === 'self'
                  ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="adminMethod"
                value="self"
                checked={administrationMethod === 'self'}
                onChange={(e) => setAdministrationMethod(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Self-Administered</span>
                <Play className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Candidate interacts with the screen directly in a quiet environment, proceeding through instructions and questions independently.
              </p>
              <span className="mt-3 inline-block text-[11px] font-semibold text-indigo-700">
                Standard psychometric inventory format
              </span>
            </label>
          </div>
        </div>

        {/* Step 3: Assessment Protocol & Instrument Specifications */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">Assessment Protocol Overview</h3>
          <p className="mt-1 text-xs text-slate-500">
            K.I.E.I. standardized structure as established by Dr. Ramanath Kundu (1976)
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-xs font-bold text-teal-700">Block A</span>
              <p className="text-[11px] text-slate-500">Q1–Q11 (11 items)</p>
              <p className="mt-1 text-[10px] text-slate-400">4 choices</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-xs font-bold text-teal-700">Block B</span>
              <p className="text-[11px] text-slate-500">Q12–Q28 (17 items)</p>
              <p className="mt-1 text-[10px] text-slate-400">5-point degree</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-xs font-bold text-teal-700">Block C</span>
              <p className="text-[11px] text-slate-500">Q29–Q42 (14 items)</p>
              <p className="mt-1 text-[10px] text-slate-400">3 preferences</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-xs font-bold text-teal-700">Block D</span>
              <p className="text-[11px] text-slate-500">Q43–Q56 (14 items)</p>
              <p className="mt-1 text-[10px] text-slate-400">3 truth levels</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-xs font-bold text-teal-700">Block E</span>
              <p className="text-[11px] text-slate-500">Q57–Q70 (14 items)</p>
              <p className="mt-1 text-[10px] text-slate-400">2 choices (Y/N)</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" /> Total 70 items • Est. 15–20 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-600" /> Automatic MongoDB Atlas sync & autosave
            </span>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/assessments"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !selectedPatientId || !selectedPatient?.consentStatus}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {submitting ? (
              'Initializing Session…'
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                Begin K.I.E.I. Questionnaire
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAssessmentPage;
