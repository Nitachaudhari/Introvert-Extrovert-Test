const mongoose = require('mongoose');
const { getDbStatus, TARGET_DB_NAME } = require('../config/db');

/**
 * GET /api/health
 * Returns basic server health status
 */
const getHealth = (req, res) => {
  res.status(200).json({
    status: 'UP',
    application: 'Psychometric Assessment Management System',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
};

/**
 * GET /api/db-health
 * Checks actual MongoDB connection and returns real connection state
 */
const getDbHealth = async (req, res) => {
  const dbStatus = getDbStatus();
  const isConnected = dbStatus.stateCode === 1;

  let pingOk = false;
  let pingLatencyMs = null;

  if (isConnected && mongoose.connection.db) {
    try {
      const startTime = Date.now();
      await mongoose.connection.db.admin().ping();
      pingLatencyMs = Date.now() - startTime;
      pingOk = true;
    } catch (pingErr) {
      pingOk = false;
    }
  }

  const responsePayload = {
    status: isConnected && pingOk ? 'CONNECTED' : (isConnected ? 'CONNECTED_PING_FAILED' : 'DISCONNECTED'),
    connected: isConnected && pingOk,
    databaseName: TARGET_DB_NAME,
    timestamp: new Date().toISOString(),
    ...(pingLatencyMs !== null && { latencyMs: pingLatencyMs }),
  };

  if (!isConnected || !pingOk) {
    return res.status(503).json(responsePayload);
  }

  return res.status(200).json(responsePayload);
};

/**
 * GET /api/test-connection
 * Checks whether backend and database are functioning together
 */
const testConnection = async (req, res) => {
  const dbStatus = getDbStatus();
  const isDbConnected = dbStatus.stateCode === 1;

  let dbPingTime = null;
  let dbHealthy = false;

  if (isDbConnected && mongoose.connection.db) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      dbPingTime = Date.now() - start;
      dbHealthy = true;
    } catch (err) {
      dbHealthy = false;
    }
  }

  const allHealthy = dbHealthy;

  return res.status(allHealthy ? 200 : 503).json({
    application: 'Psychometric Assessment Management System',
    overallStatus: allHealthy ? 'HEALTHY' : 'DEGRADED',
    backend: {
      status: 'OPERATIONAL',
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor(process.uptime()),
    },
    database: {
      status: dbHealthy ? 'OPERATIONAL' : 'OFFLINE',
      databaseName: TARGET_DB_NAME,
      connected: dbHealthy,
      latencyMs: dbPingTime,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
  getDbHealth,
  testConnection,
};

