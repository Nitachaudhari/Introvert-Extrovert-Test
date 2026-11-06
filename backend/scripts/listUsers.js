const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const User = require('../src/models/User');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'psychometric_assessment_db' });
  const users = await User.find({}, 'name email role active createdAt');
  console.log('EXISTING_USERS_LIST:');
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);

