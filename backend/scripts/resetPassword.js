const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const User = require('../src/models/User');

async function setPassword() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'psychometric_assessment_db' });

  const email = 'nitachaudhari1997@gmail.com';
  const newPassword = process.env.RESET_PASSWORD || 'Admin@12345678';

  const user = await User.findOne({ email });
  if (!user) {
    console.log(`User ${email} not found.`);
  } else {
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.active = true;
    await user.save();
    console.log(`Password for ${email} successfully updated to: ${newPassword}`);
  }

  await mongoose.disconnect();
}

setPassword().catch(console.error);

