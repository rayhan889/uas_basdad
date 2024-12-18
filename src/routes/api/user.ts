import express from "express";

import { getUsers } from "../../controllers/user.controller";
import { verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/", verifyToken, getUsers);

export default router;
