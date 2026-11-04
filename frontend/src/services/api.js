import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchBackendHealth = async () => {
  try {
    const startTime = performance.now();
    const response = await apiClient.get('/api/health');
    return {
      success: true,
      data: response.data,
      latency: Math.round(performance.now() - startTime),
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Cannot reach backend server',
      status: error.response?.status || 0,
      code: error.code,
    };
  }
};

export const fetchDatabaseHealth = async () => {
  try {
    const startTime = performance.now();
    const response = await apiClient.get('/api/db-health');
    return {
      success: true,
      data: response.data,
      latency: Math.round(performance.now() - startTime),
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      data: error.response?.data || null,
      error: error.response?.data?.message || error.message || 'Cannot connect to database',
      status: error.response?.status || 0,
      code: error.code,
    };
  }
};

export const fetchTestConnection = async () => {
  try {
    const startTime = performance.now();
    const response = await apiClient.get('/api/test-connection');
    return {
      success: true,
      data: response.data,
      latency: Math.round(performance.now() - startTime),
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      data: error.response?.data || null,
      error: error.response?.data?.message || error.message || 'Integration check failed',
      status: error.response?.status || 0,
    };
  }
};

export const fetchDashboardSummary = async () => {
  try {
    const startTime = performance.now();
    const response = await apiClient.get('/api/dashboard/summary');
    return {
      success: true,
      data: response.data.data,
      latency: Math.round(performance.now() - startTime),
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message || 'Failed to fetch dashboard data',
      status: error.response?.status || 0,
    };
  }
};

export const fetchPatients = async ({ search = '', gender = '', page = 1 } = {}) => {
  const response = await apiClient.get('/api/patients', {
    params: { search: search || undefined, gender: gender || undefined, page },
  });
  return response.data.data;
};

export const createPatient = async (patient) => {
  const response = await apiClient.post('/api/patients', patient);
  return response.data.data;
};

export const updatePatient = async (id, patient) => {
  const response = await apiClient.patch(`/api/patients/${id}`, patient);
  return response.data.data;
};

export const fetchPatient = async (id) => {
  const response = await apiClient.get(`/api/patients/${id}`);
  return response.data.data;
};

export const fetchAssessments = async (filters = {}) => {
  const response = await apiClient.get('/api/assessments', { params: filters });
  return response.data.data;
};

export const createAssessment = async (payload) => {
  const response = await apiClient.post('/api/assessments', payload);
  return response.data.data;
};

export const fetchAssessment = async (sessionId) => {
  const response = await apiClient.get(`/api/assessments/${sessionId}`);
  return response.data.data;
};

export const saveAssessmentProgress = async (sessionId, payload) => {
  const response = await apiClient.put(`/api/assessments/${sessionId}/progress`, payload);
  return response.data.data;
};

export const submitAssessment = async (sessionId, payload) => {
  const response = await apiClient.post(`/api/assessments/${sessionId}/submit`, payload);
  return response.data.data;
};

export const fetchAssessmentReport = async (sessionId) => {
  const response = await apiClient.get(`/api/assessments/${sessionId}/report`);
  return response.data.data;
};

export const updateAssessmentReport = async (sessionId, payload) => {
  const response = await apiClient.patch(`/api/assessments/${sessionId}/report`, payload);
  return response.data.data;
};

export const fetchReports = async () => {
  const response = await apiClient.get('/api/reports');
  return response.data.data;
};

export const fetchReportById = async (id) => {
  const response = await apiClient.get(`/api/reports/${id}`);
  return response.data.data;
};

export default apiClient;
