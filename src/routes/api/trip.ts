import express from "express";

import {
  getTrips,
  bookATrip,
  completeTrip,
  getVehicleListsByCapacity,
  getVehicleLists,
  getTripsByUserEmail,
} from "../../controllers/trip.controller";
import { verifyToken } from "../../middleware/verifyToken";

const router = express.Router();

router.get("/", getTrips);
router.get("/vehicles", getVehicleLists);
router.get("/vehicles/:capacity", getVehicleListsByCapacity);
router.get("/user", verifyToken, getTripsByUserEmail);
router.post("/", verifyToken, bookATrip);
router.post("/payment", verifyToken, completeTrip);

export default router;
