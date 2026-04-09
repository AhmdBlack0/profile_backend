import express from "express";

import {
  createItem,
  deleteItem,
  getSingleton,
  listItems,
  updateItem,
  upsertSingleton,
} from "../controllers/contentController.js";
import { requireAdminAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.use(requireAdminAuth);

router.get("/singleton/:resource", asyncHandler(getSingleton));
router.put("/singleton/:resource", asyncHandler(upsertSingleton));

router.get("/list/:resource", asyncHandler(listItems));
router.post("/list/:resource", asyncHandler(createItem));
router.put("/list/:resource/:id", asyncHandler(updateItem));
router.delete("/list/:resource/:id", asyncHandler(deleteItem));

export default router;
