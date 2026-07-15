import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Settings from '../models/Settings.js';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');
const seedDir = path.join(__dirname, '..', 'seed');

export default async function bootstrap() {
  // Ensure uploads directory
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Seed settings singleton if missing
  const existingSettings = await Settings.findById('system');
  if (!existingSettings) {
    const raw = fs.readFileSync(path.join(seedDir, 'settings.seed.json'), 'utf-8');
    await Settings.create(JSON.parse(raw));
    console.log('Settings seeded');
  }

  // Seed admin if no admin exists
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const raw = fs.readFileSync(path.join(seedDir, 'admin.seed.json'), 'utf-8');
    const adminData = JSON.parse(raw);
    // Remove MongoDB Compass metadata fields
    delete adminData._comment;
    delete adminData.createdAt;
    delete adminData.updatedAt;
    delete adminData.discountDefault;
    // Password is pre-hashed, but we need to set it as plaintext so the pre-save hook hashes it
    // Since it's already hashed, we'll create with a known password
    adminData.password = 'Admin@123';
    await User.create(adminData);
    console.log('Admin seeded (admin@azcuts.com / Admin@123)');
  }
}
