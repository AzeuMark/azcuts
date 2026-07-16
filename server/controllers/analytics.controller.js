import * as analyticsService from '../services/analytics.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

export const getSummary = asyncHandler(async (req, res) => {
  const range = req.query.range || 'daily';
  const data = await analyticsService.getSummary(range);
  success(res, data);
});

export const getSales = asyncHandler(async (req, res) => {
  const range = req.query.range || 'daily';
  const data = await analyticsService.getSales(range);
  success(res, data);
});

export const getReport = asyncHandler(async (req, res) => {
  const range = req.query.range || 'daily';
  const format = req.query.format || 'json';

  if (!['json', 'csv'].includes(format)) {
    throw new ApiError(400, 'Format must be json or csv');
  }

  const data = await analyticsService.getReport(range, format);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=azcuts-report-${range}.csv`);
    return res.send(data);
  }

  success(res, data);
});
