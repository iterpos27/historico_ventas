import * as goalService from '../services/goalService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  res.json(await goalService.listGoals(req.user, req.query.periodo));
});
export const create = asyncHandler(async (req, res) => res.status(201).json(await goalService.createGoal(req.body)));
export const update = asyncHandler(async (req, res) => res.json(await goalService.updateGoal(req.params.id, req.body)));
export const deactivate = asyncHandler(async (req, res) => res.json(await goalService.deactivateGoal(req.params.id)));
export const copy = asyncHandler(async (req, res) => res.status(201).json(await goalService.copyGoals(req.body)));
