import Service from '../models/Service.js';
import Extra from '../models/Extra.js';
import Settings from '../models/Settings.js';

export async function buildPriceSnapshot(serviceId, extraIds = [], discountPercent = 0) {
  const service = await Service.findById(serviceId);
  if (!service) throw new Error('Service not found');

  const settings = await Settings.findById('system');
  const taxRate = settings?.taxRate || 0;
  const currency = settings?.currency || 'PHP';

  const base = service.price;

  let extrasTotal = 0;
  const extrasSnapshot = [];
  if (extraIds && extraIds.length > 0) {
    const extras = await Extra.find({ _id: { $in: extraIds } });
    for (const ext of extras) {
      extrasTotal += ext.price;
      extrasSnapshot.push({ id: ext._id, name: ext.name, price: ext.price });
    }
  }

  const subtotal = base + extrasTotal;
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * taxRate * 100) / 100;
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;

  return {
    base,
    extras: extrasSnapshot,
    subtotal,
    discountPercent,
    discountAmount,
    taxRate,
    taxAmount,
    total,
    currency,
  };
}
