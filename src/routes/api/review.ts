import express from "express";

import { createReview } from "../../controllers/review.controller";
import { verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

router.post("/", verifyToken, createReview);

export default router;
