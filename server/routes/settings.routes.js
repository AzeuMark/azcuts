import { Router } from 'express';
import Settings from '../models/Settings.js';
import Service from '../models/Service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';

const router = Router();

// Public: shop info + active services for landing page
router.get('/public', asyncHandler(async (req, res) => {
  const settings = await Settings.findById('system');
  const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
  const extras = await (await import('../models/Extra.js')).default.find({ isActive: true }).sort({ createdAt: -1 });
  success(res, {
    shopInfo: settings?.shopInfo || {},
    storeHours: settings?.storeHours || {},
    nicknames: settings?.nicknames || [],
    timezone: settings?.timezone || 'Asia/Manila',
    services,
    extras,
  });
}));

// Admin: full settings
router.get('/', asyncHandler(async (req, res) => {
  const settings = await Settings.findById('system');
  success(res, settings);
}));

// Admin: update settings
router.put('/', asyncHandler(async (req, res) => {
  const updates = {};
  const allowed = ['systemMode', 'timezone', 'region', 'country', 'currency', 'taxRate', 'slotStepMinutes', 'storeHours', 'shopInfo', 'nicknames'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const settings = await Settings.findByIdAndUpdate('system', { $set: updates }, { new: true, upsert: true });
  success(res, settings, 'Settings updated');
}));

// Admin: nickname management
router.post('/nicknames', asyncHandler(async (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ success: false, message: 'Nickname value required' });
  const settings = await Settings.findByIdAndUpdate('system', { $addToSet: { nicknames: value } }, { new: true });
  success(res, settings?.nicknames, 'Nickname added');
}));

router.put('/nicknames', asyncHandler(async (req, res) => {
  const { oldValue, newValue } = req.body;
  if (!oldValue || !newValue) return res.status(400).json({ success: false, message: 'Both oldValue and newValue required' });
  const settings = await Settings.findById('system');
  if (!settings) return res.status(404).json({ success: false, message: 'Settings not found' });
  const idx = settings.nicknames.indexOf(oldValue);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Nickname not found' });
  settings.nicknames[idx] = newValue;
  await settings.save();
  success(res, settings.nicknames, 'Nickname updated');
}));

router.delete('/nicknames', asyncHandler(async (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ success: false, message: 'Nickname value required' });
  const settings = await Settings.findByIdAndUpdate('system', { $pull: { nicknames: value } }, { new: true });
  success(res, settings?.nicknames, 'Nickname removed');
}));

export default router;
