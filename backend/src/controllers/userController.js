import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (_req, res) => res.json(await userService.listUsers()));
export const create = asyncHandler(async (req, res) => res.status(201).json(await userService.createUser(req.body)));
export const update = asyncHandler(async (req, res) => res.json(await userService.updateUser(req.params.id, req.body)));
export const deactivate = asyncHandler(async (req, res) => res.json(await userService.deactivateUser(req.params.id)));
