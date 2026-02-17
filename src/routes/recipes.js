import express from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { post as postRecipe } from "../controllers/recipe/execute.js";
import { post as postRecipeRef } from "../controllers/recipe/executeRef.js";

/**
 * Routes for recipe execution.
 *
 * POST /execute
 * Executes a recipe (body: recipe object); returns aggregated terminal results.
 */
const router = express.Router();

router.post("/execute", asyncHandler(postRecipe));
router.post("/executeref", asyncHandler(postRecipeRef));

export default router;
