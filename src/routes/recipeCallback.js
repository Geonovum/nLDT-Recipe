import express from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { post as postCallback } from "../controllers/recipe/callback.js";

/**
 * Routes for recipe execution callbacks.
 * Mount path: /recipe/:jobId (typically)
 *
 * POST /callback/:jobId?type=success|failed
 * Receives callbacks when an async recipe job completes.
 */
const router = express.Router();

router.post("/callback/:jobId", asyncHandler(postCallback));

export default router;
