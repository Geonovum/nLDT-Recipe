import express from "express";

import { asyncHandler } from "../middlewares/asyncHandler.js";
import { get as getLandingPage } from "../controllers/common/core/landingPage.js";
import { get as getConformance } from "../controllers/common/core/conformance.js";
import { get as getAPI }         from "../controllers/common/core/api.js";

const router = express.Router();

router.get("/", asyncHandler(getLandingPage));
router.get("/conformance", asyncHandler(getConformance));
router.get("/api", asyncHandler(getAPI));
router.get("/api.:ext", asyncHandler(getAPI));

export default router;


