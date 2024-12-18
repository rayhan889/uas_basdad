import express from "express";

import {
  getDrivers,
  createDriver,
  getDriverById,
} from "../../controllers/driver.controller";
import { verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/", verifyToken, getDrivers);
router.get("/:id", verifyToken, getDriverById);
router.post("/", createDriver);

export default router;
