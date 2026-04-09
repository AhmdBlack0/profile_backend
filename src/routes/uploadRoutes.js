import express from "express";

import { deleteImage, uploadImage } from "../controllers/uploadController.js";
import { requireAdminAuth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.use(requireAdminAuth);

router.post("/", upload.single("file"), asyncHandler(uploadImage));
router.post("/delete", asyncHandler(deleteImage));

export default router;
