import express from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { post as postCallback } from "../controllers/process/callback.js";

/**
 * Routes for process execution callbacks.
 * Mount path: /process/:jobId (typically)
 *
 * POST /callback/:jobId?type=success|failed
 * Receives callbacks when an async process job completes.
 */
const router = express.Router();

router.post("/callback/:jobId", asyncHandler(postCallback));

export default router;
