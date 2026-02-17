import express from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { post as postRecipe } from "../controllers/recipe/execute.js";

const router = express.Router();

router.post("/execute", asyncHandler(postRecipe));

export default router;
