import express from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { post as postRecipe } from "../controllers/recipe/execute.js";

/**
 * Routes for recipe execution.
 *
 * POST /execute
 * Executes a recipe (body: recipe object); returns aggregated terminal results.
 */
const router = express.Router();

router.post("/execute", asyncHandler(postRecipe));

export default router;
