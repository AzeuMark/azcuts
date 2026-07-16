import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/azeubarbersalondb';

await mongoose.connect(MONGO_URI);

await User.deleteOne({ email: 'admin@azcuts.com' });

await User.create({
  fullName: 'Uelmark G. Valdehueza',
  nickname: 'Administrator',
  email: 'admin@azcuts.com',
  phone: '+639000000000',
  address: 'AzCuts Barber Shop & Salon HQ',
  password: 'admin',
  role: 'admin',
  status: 'active',
  isApproved: true,
});

console.log('Admin seeded: admin@azcuts.com / admin');
await mongoose.disconnect();
