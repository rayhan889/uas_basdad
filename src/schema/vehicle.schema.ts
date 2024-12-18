import mongoose from "mongoose";
import { z } from "zod";

const vehicleSchema = new mongoose.Schema({
  vehicle_license_plate: {
    type: String,
    required: true,
    unique: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

export const vehicleSchemaValidation = z.object({
  vehicle_license_plate: z.string().min(3).max(50),
  model: z.string().min(3).max(50),
  year: z.number().min(1900).max(2050),
  capacity: z.number().min(1).max(100),
  type: z.string().min(3).max(50),
});

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
