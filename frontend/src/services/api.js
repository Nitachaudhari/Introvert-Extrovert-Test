import axios from 'axios';

// Resolve API base URL with fallback to local development port
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch Backend Health: GET /api/health
 */
export const fetchBackendHealth = async () => {
  try {
    const startTime = performance.now();
    const response = await apiClient.get('/api/health');
    const latency = Math.round(performance.now() - startTime);
    return {
      success: true,
      data: response.data,
      latency,
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

/**
 * Fetch Database Health: GET /api/db-health
 */
export const fetchDatabaseHealth = async () => {
  try {
    const startTime = performance.now();
    const response = await apiClient.get('/api/db-health');
    const latency = Math.round(performance.now() - startTime);
    return {
      success: true,
      data: response.data,
      latency,
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

/**
 * Fetch Full Integration Test: GET /api/test-connection
 */
export const fetchTestConnection = async () => {
  try {
    const startTime = performance.now();
    const response = await apiClient.get('/api/test-connection');
    const latency = Math.round(performance.now() - startTime);
    return {
      success: true,
      data: response.data,
      latency,
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

export default apiClient;

