const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const { connectDB } = require('../src/config/db');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const createAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME) {
    throw new Error('Set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NAME in backend/.env before running this script.');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Set JWT_SECRET to at least 32 characters before creating the administrator.');
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  }
  if (!(await connectDB())) {
    throw new Error('MongoDB is not configured or could not be reached.');
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) {
    throw new Error(`An account already exists for ${email}.`);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({ name: ADMIN_NAME.trim(), email, passwordHash, role: 'admin' });
  console.log(`Administrator account created for ${email}. Remove the bootstrap credentials from the environment.`);
};

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });
