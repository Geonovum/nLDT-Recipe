import express from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { post as postCallback } from "../controllers/process/callback.js";

const router = express.Router();

router.post("/callback/:jobId", asyncHandler(postCallback));

export default router;
