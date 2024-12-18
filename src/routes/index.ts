import express from "express";

import auth from "./api/auth";
import users from "./api/user";
import driver from "./api/driver";
import trip from "./api/trip";
import review from "./api/review";

const router = express.Router();

router.use("/auth", auth);
router.use("/users", users);
router.use("/drivers", driver);
router.use("/trips", trip);
router.use("/review", review);

export default router;
