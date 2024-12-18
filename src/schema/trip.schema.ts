import mongoose from "mongoose";
import { z } from "zod";

const tripSchema = new mongoose.Schema({
  user_email: {
    type: String,
    required: true,
  },
  vehicle_license_plate: {
    type: String,
    required: true,
  },
  fare: {
    type: Number,
    required: true,
    default: 0,
  },
  distance: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    default: "ongoing",
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const tripLocationSchema = new mongoose.Schema({
  trip_id: {
    type: String,
    required: true,
    unique: true,
  },
  pickup_location: {
    type: String,
    required: true,
  },
  dropoff_location: {
    type: String,
    required: true,
  },
});

export const tripSchemaValidation = z.object({
  vehicle_license_plate: z.string().min(3).max(50),
  pickup_location: z.string(),
  dropoff_location: z.string(),
});

export const Trip = mongoose.model("Trip", tripSchema);
export const TripLocation = mongoose.model("TripLocation", tripLocationSchema);
