import express from "express";

import { getPublicContent } from "../controllers/contentController.js";
import { sendContactEmail } from "../controllers/contactMailController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/content", asyncHandler(getPublicContent));
router.post("/contact", asyncHandler(sendContactEmail));

export default router;
