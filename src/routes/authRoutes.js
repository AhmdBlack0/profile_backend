import express from "express";

import { loginAdmin, registerAdmin } from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/login", asyncHandler(loginAdmin));
router.post("/register", asyncHandler(registerAdmin));

export default router;
