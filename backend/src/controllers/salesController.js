import * as salesService from '../services/salesService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const total = asyncHandler(async (req, res) => {
  res.json(await salesService.getTotalSales(req.user, req.query.periodo));
});

export const resumen = asyncHandler(async (req, res) => {
  res.json(await salesService.getSalesSummary(req.user, req.query.periodo));
});

export const porAlmacen = asyncHandler(async (req, res) => {
  res.json(await salesService.getSalesByBranch(req.user, req.query.periodo));
});

export const cumplimientoMetas = asyncHandler(async (req, res) => {
  res.json(await salesService.getGoalCompliance(req.user, req.query.periodo));
});

export const historialMensual = asyncHandler(async (req, res) => {
  res.json(await salesService.getMonthlyHistory(req.user));
});
