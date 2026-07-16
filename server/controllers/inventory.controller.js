import Service from '../models/Service.js';
import Extra from '../models/Extra.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

// ── Services ──

export const getServiceImage = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).select('imageData imageContentType');
  if (!service || !service.imageData) throw new ApiError(404, 'Image not found');
  res.set('Content-Type', service.imageContentType);
  res.send(service.imageData);
});

export const getServices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.active === 'true') filter.isActive = true;
  const services = await Service.find(filter).sort({ createdAt: -1 });
  success(res, services);
});

export const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');
  success(res, service);
});

export const createService = asyncHandler(async (req, res) => {
  const { name, category, description, price, durationMinutes } = req.body;
  const serviceData = {
    name,
    category: category || 'haircut',
    description: description || '',
    price: parseFloat(price),
    durationMinutes: parseInt(durationMinutes, 10),
  };

  if (req.file) {
    serviceData.imageData = req.file.buffer;
    serviceData.imageContentType = req.file.mimetype;
  }

  const service = await Service.create(serviceData);
  
  if (req.file) {
    service.image = `/api/services/${service._id}/image`;
    await service.save();
  }

  success(res, service, 'Service created', 201);
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');

  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.category !== undefined) updates.category = req.body.category;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.price !== undefined) updates.price = parseFloat(req.body.price);
  if (req.body.durationMinutes !== undefined) updates.durationMinutes = parseInt(req.body.durationMinutes, 10);
  if (req.body.isActive !== undefined) updates.isActive = req.body.isActive === 'true' || req.body.isActive === true;
  
  if (req.file) {
    updates.imageData = req.file.buffer;
    updates.imageContentType = req.file.mimetype;
    updates.image = `/api/services/${req.params.id}/image`;
  }

  const updated = await Service.findByIdAndUpdate(req.params.id, updates, { new: true });
  success(res, updated, 'Service updated');
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');
  success(res, null, 'Service deleted');
});

// ── Extras ──

export const getExtras = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.active === 'true') filter.isActive = true;
  const extras = await Extra.find(filter).sort({ createdAt: -1 });
  success(res, extras);
});

export const getExtra = asyncHandler(async (req, res) => {
  const extra = await Extra.findById(req.params.id);
  if (!extra) throw new ApiError(404, 'Extra not found');
  success(res, extra);
});

export const createExtra = asyncHandler(async (req, res) => {
  const { name, price, durationMinutes } = req.body;
  const extra = await Extra.create({
    name,
    price: parseFloat(price),
    durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 0,
  });
  success(res, extra, 'Extra created', 201);
});

export const updateExtra = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.price !== undefined) updates.price = parseFloat(req.body.price);
  if (req.body.durationMinutes !== undefined) updates.durationMinutes = parseInt(req.body.durationMinutes, 10);
  if (req.body.isActive !== undefined) updates.isActive = req.body.isActive === 'true' || req.body.isActive === true;

  const extra = await Extra.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!extra) throw new ApiError(404, 'Extra not found');
  success(res, extra, 'Extra updated');
});

export const deleteExtra = asyncHandler(async (req, res) => {
  const extra = await Extra.findByIdAndDelete(req.params.id);
  if (!extra) throw new ApiError(404, 'Extra not found');
  success(res, null, 'Extra deleted');
});
