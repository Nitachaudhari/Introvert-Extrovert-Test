const mongoose = require('mongoose');

const TARGET_DB_NAME = 'psychometric_assessment_db';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your_mongodb_atlas_connection_string') {
    console.warn('⚠️  MONGODB_URI is not configured in .env. Database connection skipped.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: TARGET_DB_NAME,
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    console.log(`✅ MongoDB Atlas Connected: host="${conn.connection.host}", database="${conn.connection.name}"`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection event error: ${err.message}`);
});

const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    stateCode,
    status: states[stateCode] || 'unknown',
    databaseName: mongoose.connection.name || TARGET_DB_NAME,
    host: mongoose.connection.host ? mongoose.connection.host.replace(/:.*@/, '@') : null,
  };
};

module.exports = {
  connectDB,
  getDbStatus,
  TARGET_DB_NAME,
};

