import { useState, useEffect, useCallback } from 'react';
import { fetchBackendHealth, fetchDatabaseHealth, fetchTestConnection } from '../services/api';

export const useSystemStatus = (autoPollIntervalMs = 0) => {
  const [frontendStatus] = useState({
    status: 'connected',
    message: 'Client React application loaded successfully',
    timestamp: new Date().toISOString(),
  });

  const [backendState, setBackendState] = useState({
    status: 'checking', // 'checking' | 'connected' | 'error'
    data: null,
    latency: null,
    error: null,
    lastChecked: null,
  });

  const [dbState, setDbState] = useState({
    status: 'checking', // 'checking' | 'connected' | 'error'
    data: null,
    latency: null,
    error: null,
    lastChecked: null,
  });

  const [integrationState, setIntegrationState] = useState({
    status: 'checking',
    data: null,
    error: null,
  });

  const checkStatus = useCallback(async () => {
    // Reset to checking
    setBackendState((prev) => ({ ...prev, status: 'checking', error: null }));
    setDbState((prev) => ({ ...prev, status: 'checking', error: null }));
    setIntegrationState((prev) => ({ ...prev, status: 'checking', error: null }));

    // Check Backend
    const backendRes = await fetchBackendHealth();
    if (backendRes.success && backendRes.data?.status === 'UP') {
      setBackendState({
        status: 'connected',
        data: backendRes.data,
        latency: backendRes.latency,
        error: null,
        lastChecked: new Date().toISOString(),
      });
    } else {
      setBackendState({
        status: 'error',
        data: null,
        latency: null,
        error: backendRes.error,
        lastChecked: new Date().toISOString(),
      });
    }

    // Check Database
    const dbRes = await fetchDatabaseHealth();
    if (dbRes.success && dbRes.data?.connected) {
      setDbState({
        status: 'connected',
        data: dbRes.data,
        latency: dbRes.latency,
        error: null,
        lastChecked: new Date().toISOString(),
      });
    } else {
      setDbState({
        status: 'error',
        data: dbRes.data,
        latency: null,
        error: dbRes.error || (dbRes.data?.status === 'DISCONNECTED' ? 'MongoDB connection is offline' : 'Database connection error'),
        lastChecked: new Date().toISOString(),
      });
    }

    // Check Integration
    const intRes = await fetchTestConnection();
    setIntegrationState({
      status: intRes.success && intRes.data?.overallStatus === 'HEALTHY' ? 'connected' : 'error',
      data: intRes.data,
      error: intRes.error,
    });
  }, []);

  useEffect(() => {
    checkStatus();

    if (autoPollIntervalMs > 0) {
      const timer = setInterval(checkStatus, autoPollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [checkStatus, autoPollIntervalMs]);

  return {
    frontendStatus,
    backendState,
    dbState,
    integrationState,
    refreshStatus: checkStatus,
  };
};

export default useSystemStatus;

