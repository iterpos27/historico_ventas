import * as branchService from '../services/branchService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => res.json(await branchService.listBranches(req.user)));
export const create = asyncHandler(async (req, res) => res.status(201).json(await branchService.createBranch(req.body)));
export const update = asyncHandler(async (req, res) => res.json(await branchService.updateBranch(req.params.id, req.body)));
export const deactivate = asyncHandler(async (req, res) => res.json(await branchService.deactivateBranch(req.params.id)));
