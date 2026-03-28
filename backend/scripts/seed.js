require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');

const departments = [
  'Municipality',
  'Water Supply Department',
  'Public Works Department',
  'Electricity Department',
  'Sanitation Department',
  'Health Department',
  'Revenue Department',
  'Survey Department',
  'Fire Department'
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cross-department-portal');
  const existingAdmin = await User.findOne({ email: 'admin@portal.gov' });
  if (!existingAdmin) {
    await User.create({
      name: 'System Admin',
      email: 'admin@portal.gov',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin created: admin@portal.gov / admin123');
  }
  for (const name of departments) {
    await Department.findOneAndUpdate(
      { name },
      { name, code: name.replace(/\s+/g, '').slice(0, 6).toUpperCase() },
      { upsert: true }
    );
  }
  console.log('Departments seeded.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
