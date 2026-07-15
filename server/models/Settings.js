import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'system' },
    systemMode: { type: String, enum: ['online', 'maintenance', 'offline'], default: 'online' },
    timezone: { type: String, default: 'Asia/Manila' },
    region: { type: String, default: 'Philippines' },
    country: { type: String, default: 'PH' },
    currency: { type: String, default: 'PHP' },
    taxRate: { type: Number, default: 0 },
    slotStepMinutes: { type: Number, default: 30 },
    storeHours: {
      mon: { open: String, close: String, closed: Boolean },
      tue: { open: String, close: String, closed: Boolean },
      wed: { open: String, close: String, closed: Boolean },
      thu: { open: String, close: String, closed: Boolean },
      fri: { open: String, close: String, closed: Boolean },
      sat: { open: String, close: String, closed: Boolean },
      sun: { open: String, close: String, closed: Boolean },
    },
    nicknames: [String],
    shopInfo: {
      name: { type: String, default: 'AzCuts' },
      tagline: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      mapEmbedUrl: { type: String, default: '' },
      socials: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        tiktok: { type: String, default: '' },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
