const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function testConnection() {
  console.log('Testing MongoDB Atlas connection...');
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  // Mask credentials in log for security
  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
  console.log(`Connecting to: ${maskedUri}`);

  try {
    const startTime = Date.now();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      dbName: 'psychometric_assessment_db',
    });
    const latency = Date.now() - startTime;
    console.log(`SUCCESS: Connected to MongoDB Atlas! Latency: ${latency}ms`);
    console.log(`Database Name: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);

    // Ping the database
    const pingResult = await mongoose.connection.db.admin().ping();
    console.log('Admin Ping Result:', pingResult);

    await mongoose.disconnect();
    console.log('Disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('FAILED to connect to MongoDB Atlas:');
    console.error(error.message);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('Hint: The username or password in the connection string may be incorrect.');
    } else if (error.message.includes('whitelist') || error.message.includes('selection timed out') || error.message.includes('ENOTFOUND')) {
      console.error('Hint: Check MongoDB Atlas Network Access. Ensure IP 0.0.0.0/0 (or your current IP) is added to the Network Access Allowlist.');
    }
    process.exit(1);
  }
}

testConnection();
