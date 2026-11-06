import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  Play,
  AlertCircle,
  ShieldCheck,
  Clock,
  Users,
  ArrowLeft,
  Plus,
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
          setError('Failed to load patient records. Please verify connection.');
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
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <Link
        to="/assessments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Assessments
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Start Personality Assessment
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Prepare a new K.I.E.I. session for a patient.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStart} className="space-y-6">
        {/* Step 1: Select Patient */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Choose Patient
            </h2>
            <Link
              to="/patients"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              <Plus className="h-3.5 w-3.5" /> Register New Patient
            </Link>
          </div>

          {loading ? (
            <p className="py-4 text-xs text-slate-400">Loading patients…</p>
          ) : patients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm font-medium text-slate-700">No patients registered yet</p>
              <Link
                to="/patients"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
              >
                <Users className="h-3.5 w-3.5" /> Register Patient First
              </Link>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select from registered patients:
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              >
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.fullName} ({p.patientId}) — {p.gender}, Age {p.age || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedPatient && (
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <span className="text-slate-400">Patient ID:</span>
                <p className="font-semibold text-slate-800">{selectedPatient.patientId}</p>
              </div>
              <div>
                <span className="text-slate-400">Gender & Age:</span>
                <p className="font-semibold text-slate-800">
                  {selectedPatient.gender}, {selectedPatient.age || '—'} yrs
                </p>
              </div>
              <div>
                <span className="text-slate-400">Consent on file:</span>
                <p className={`font-semibold ${selectedPatient.consentStatus ? 'text-teal-700' : 'text-rose-600'}`}>
                  {selectedPatient.consentStatus ? '✓ Verified' : 'Missing Consent'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Contact:</span>
                <p className="font-semibold text-slate-800">{selectedPatient.mobile || '—'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Test Mode */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            2. Who is taking the test?
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                administrationMethod === 'clinician'
                  ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600'
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
              <span className="font-bold text-slate-900 text-sm">Psychologist Administered</span>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                The psychologist conducts the session and marks answers for the patient.
              </p>
            </label>

            <label
              className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                administrationMethod === 'self'
                  ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600'
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
              <span className="font-bold text-slate-900 text-sm">Patient Direct Test</span>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                The patient reads each question on the screen and clicks their answers directly.
              </p>
            </label>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/assessments"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || !selectedPatientId}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              'Starting…'
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                Begin Questionnaire
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAssessmentPage;
