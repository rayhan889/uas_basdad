import type { RequestHandler, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import {
  Driver,
  DriverVehicle,
  driverVehicleSchemaValidation,
} from "../schema/driver.schema";
import { Vehicle, vehicleSchemaValidation } from "../schema/vehicle.schema";

export const getDrivers = async (_: Request, res: Response) => {
  try {
    const drivers = await Driver.aggregate([
      {
        $lookup: {
          from: "drivervehicles",
          localField: "email",
          foreignField: "driver_email",
          as: "driver_vehicle_info",
        },
      },
      {
        $unwind: "$driver_vehicle_info",
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "driver_vehicle_info.vehicle_license_plate",
          foreignField: "vehicle_license_plate",
          as: "vehicle_info",
        },
      },
      {
        $unwind: "$vehicle_info",
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          phone: { $first: "$phone" },
          address: { $first: "$address" },
          rating: { $first: "$rating" },
          status: { $first: "$status" },
          vehicles: { $push: "$vehicle_info" },
        },
      },
      {
        $sort: {
          rating: -1,
        },
      },
    ]);
    res.json(drivers);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occured..." });
    }
  }
};

export const getDriverById = async (req: Request, res: Response) => {
  try {
    const driverId = req.params.id;

    const driver = await Driver.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(driverId) },
      },
      {
        $lookup: {
          from: "drivervehicles",
          localField: "email",
          foreignField: "driver_email",
          as: "driver_vehicle_info",
        },
      },
      {
        $unwind: {
          path: "$driver_vehicle_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "driver_vehicle_info.vehicle_license_plate",
          foreignField: "vehicle_license_plate",
          as: "vehicle_info",
        },
      },
      {
        $unwind: { path: "$vehicle_info", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          phone: { $first: "$phone" },
          address: { $first: "$address" },
          rating: { $first: "$rating" },
          status: { $first: "$status" },
          vehicles: { $push: "$vehicle_info" },
        },
      },
    ]);

    if (driver.length > 0) {
      res.status(200).json(driver[0]);
    } else {
      res.status(404).json({ error: "Driver not found" });
    }
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred..." });
    }
  }
};

export const createDriver = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { driver, vehicle } = driverVehicleSchemaValidation.parse(req.body);

    // await driverVehicleSchemaValidation.parseAsync(driver);
    // await vehicleSchemaValidation.parseAsync(vehicle);

    const driverWithEmail = await Driver.findOne({ email: driver.email });
    const vehicleWithLicensePlate = await Vehicle.findOne({
      vehicle_license_plate: vehicle.vehicle_license_plate,
    });

    if (driverWithEmail) {
      res.status(400).json({ error: "Driver with this email already exists" });
      return;
    }

    if (vehicleWithLicensePlate) {
      res
        .status(400)
        .json({ error: "Vehicle with this license plate already exists" });
      return;
    }

    const newDriver = await Driver.create([{ ...driver }], { session });
    const newVehicle = await Vehicle.create([{ ...vehicle }], { session });

    const driverVehicle = {
      driver_email: driver.email,
      vehicle_license_plate: vehicle.vehicle_license_plate,
    };
    await DriverVehicle.create([driverVehicle], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Driver created!",
      driver: newDriver[0],
      vehicle: newVehicle[0],
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    } else if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred..." });
    }
  }
};
