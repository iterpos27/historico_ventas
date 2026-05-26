import * as branchService from '../services/branchService.js';
import * as goalService from '../services/goalService.js';
import * as salesService from '../services/salesService.js';
import { listSyncRuns } from '../services/syncLogService.js';
import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const admin = asyncHandler(async (req, res) => {
  const period = req.query.periodo;
  const [
    total,
    ventasPorAlmacen,
    cumplimiento,
    branches,
    goals,
    users,
    historial,
    syncHistory
  ] = await Promise.all([
    salesService.getTotalSales(req.user, period),
    salesService.getSalesByBranch(req.user, period),
    salesService.getGoalCompliance(req.user, period),
    branchService.listBranches(req.user),
    goalService.listGoals(req.user, period),
    userService.listUsers(),
    salesService.getMonthlyHistory(req.user),
    listSyncRuns()
  ]);

  res.json({ total, ventasPorAlmacen, cumplimiento, branches, goals, users, historial, syncHistory });
});
