import mongoose from "mongoose";
import { z } from "zod";
import { vehicleSchemaValidation } from "./vehicle.schema";

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    default: "available",
  },
  license_id: {
    type: String,
    required: true,
    unique: true,
  },
});

const driverVehicleSchema = new mongoose.Schema({
  driver_email: {
    type: String,
    required: true,
    unique: true,
  },
  vehicle_license_plate: {
    type: String,
    required: true,
    unique: true,
  },
});

export const driverSchemaValidation = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  license_id: z.string(),
});

export const driverVehicleSchemaValidation = z.object({
  driver: driverSchemaValidation,
  vehicle: vehicleSchemaValidation,
});

export const Driver = mongoose.model("Driver", driverSchema);
export const DriverVehicle = mongoose.model(
  "DriverVehicle",
  driverVehicleSchema
);
