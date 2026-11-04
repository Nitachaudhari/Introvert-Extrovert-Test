import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Eye, Pencil, Plus, Search, X } from 'lucide-react';
import {
  createPatient,
  fetchPatient,
  fetchPatients,
  updatePatient,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  fullName: '',
  dob: '',
  gender: '',
  mobile: '',
  email: '',
  education: '',
  occupation: '',
  address: '',
  consentStatus: false,
  clinicalNotes: '',
};

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'The patient request could not be completed.';

const PatientsPage = () => {
  const { user } = useAuth();
  const requestSequence = useRef(0);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const loadPatients = useCallback(async () => {
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError('');
    try {
      const result = await fetchPatients({ search, gender, page: pagination.page });
      if (requestId !== requestSequence.current) return;
      setPatients(result.patients);
      setPagination(result.pagination);
    } catch (requestError) {
      if (requestId !== requestSequence.current) return;
      setError(getErrorMessage(requestError));
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [search, gender, pagination.page]);

  useEffect(() => {
    const timer = window.setTimeout(loadPatients, search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadPatients, search]);

  const openNewPatient = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEditPatient = (patient) => {
    setEditingId(patient._id);
    setForm({
      ...emptyForm,
      ...patient,
      dob: patient.dob ? new Date(patient.dob).toISOString().slice(0, 10) : '',
      consentStatus: Boolean(patient.consentStatus),
    });
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const saved = editingId
        ? await updatePatient(editingId, form)
        : await createPatient(form);
      setFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      if (selectedPatient?.patient?._id === saved._id) {
        setSelectedPatient((current) => ({ ...current, patient: saved }));
      }
      await loadPatients();
    } catch (requestError) {
      setFormError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const showPatient = async (id) => {
    setError('');
    try {
      setSelectedPatient(await fetchPatient(id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="mt-1 text-sm text-slate-500">Manage consented patient records and assessment history.</p>
        </div>
        <button
          type="button"
          onClick={openNewPatient}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Register patient
        </button>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {formOpen && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? 'Edit patient' : 'Register patient'}</h2>
            <button type="button" onClick={() => setFormOpen(false)} aria-label="Close form" className="rounded p-1 text-slate-500 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Full name *
              <input required maxLength={120} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Date of birth *
              <input required type="date" max={new Date().toISOString().slice(0, 10)} value={form.dob} onChange={(event) => setForm({ ...form, dob: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Gender *
              <select required value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2">
                <option value="">Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Mobile *
              <input required maxLength={40} value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email
              <input type="email" maxLength={254} value={form.email || ''} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Education
              <input value={form.education || ''} onChange={(event) => setForm({ ...form, education: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Occupation
              <input value={form.occupation || ''} onChange={(event) => setForm({ ...form, occupation: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Address
              <input value={form.address || ''} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            {user?.role !== 'assistant' && (
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Clinical notes
                <textarea rows={3} value={form.clinicalNotes || ''} onChange={(event) => setForm({ ...form, clinicalNotes: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
            )}
            <label className="flex items-start gap-2 text-sm text-slate-700 sm:col-span-2">
              <input type="checkbox" required checked={Boolean(form.consentStatus)} onChange={(event) => setForm({ ...form, consentStatus: event.target.checked })} className="mt-1" />
              <span>Patient consent for registration and assessment record processing has been obtained. *</span>
            </label>
            {formError && <p role="alert" className="text-sm text-rose-700 sm:col-span-2">{formError}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <button disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create patient'}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input aria-label="Search patients" placeholder="Search name, patient ID, mobile or email" value={search} onChange={(event) => { setSearch(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm" />
          </label>
          <select aria-label="Filter by gender" value={gender} onChange={(event) => { setGender(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">All genders</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Age / Gender</th>
                <th className="px-4 py-3">Consent</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{patient.fullName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{patient.patientId}</td>
                  <td className="px-4 py-3 text-slate-600">{patient.age ?? '—'} / {patient.gender}</td>
                  <td className="px-4 py-3">{patient.consentStatus ? 'Recorded' : 'Missing'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {user?.role !== 'assistant' && (
                        <>
                          <button type="button" onClick={() => showPatient(patient._id)} className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"><Eye className="h-3.5 w-3.5" /> View</button>
                          <button type="button" onClick={() => openEditPatient(patient)} className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && patients.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">No patient records found.</td></tr>
              )}
              {loading && <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">Loading patient records…</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>{pagination.total} patient record{pagination.total === 1 ? '' : 's'}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1 || loading} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} className="rounded border border-slate-200 px-2 py-1 disabled:opacity-40">Previous</button>
            <span className="px-2 py-1">Page {pagination.page} of {Math.max(1, pagination.pages)}</span>
            <button disabled={pagination.page >= pagination.pages || loading} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} className="rounded border border-slate-200 px-2 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>

      {selectedPatient && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selectedPatient.patient.fullName}</h2>
              <p className="text-sm text-slate-500">{selectedPatient.patient.patientId} · {selectedPatient.patient.email || 'No email'}</p>
            </div>
            <button type="button" onClick={() => setSelectedPatient(null)} aria-label="Close patient profile" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
            <p>Mobile: {selectedPatient.patient.mobile}</p>
            <p>Age: {selectedPatient.patient.age ?? '—'}</p>
            <p>Consent: {selectedPatient.patient.consentStatus ? 'Recorded' : 'Missing'}</p>
          </div>
          {selectedPatient.patient.clinicalNotes && (
            <p className="mt-4 whitespace-pre-wrap rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Clinical notes: {selectedPatient.patient.clinicalNotes}</p>
          )}
          <h3 className="mt-6 font-semibold text-slate-900">Assessment history</h3>
          {selectedPatient.assessments.length ? (
            <ul className="mt-2 divide-y divide-slate-100">
              {selectedPatient.assessments.map((assessment) => (
                <li key={assessment._id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <span>{assessment.testName} · {assessment.sessionId}</span>
                  <span className="capitalize text-slate-500">{assessment.status.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-slate-500">No assessment history is recorded.</p>}
        </section>
      )}
    </div>
  );
};

export default PatientsPage;
