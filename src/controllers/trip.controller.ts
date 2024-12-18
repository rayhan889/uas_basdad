import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  Trip,
  tripSchemaValidation,
  TripLocation,
} from "../schema/trip.schema";
import { User, type UserRequest } from "../schema/user.schema";
import { ZodError } from "zod";
import type { OpenCageAPIResponse, Result } from "../types/opencage.type";
import { distanceBetweenTwoPoints } from "../helpers/calcDistance";
import { calculatePrice } from "../helpers/calcPrice";
import {
  Payment,
  PaymentDetails,
  paymentSchemaValidation,
} from "../schema/payment.schema";
import { generateRandomCode } from "../helpers/genRandomCode";
import { Driver, DriverVehicle } from "../schema/driver.schema";
import { Vehicle } from "../schema/vehicle.schema";

const getLocation = async (locationStr: string) => {
  const splitLocationStr = locationStr.split(",");

  if (splitLocationStr.length > 4) {
    throw new Error("Location cannot be more than 4 words");
  }

  let apiUrl = `https://api.opencagedata.com/geocode/v1/json?&key=${process.env.OPENCAGE_API}`;

  const street = splitLocationStr[0] ?? "";
  const city = splitLocationStr[1] ?? "";
  const state = splitLocationStr[2] ?? "";
  const country = splitLocationStr[3] ?? "";

  apiUrl =
    `https://api.opencagedata.com/geocode/v1/json?` +
    `&q=${street}%20${city}%20${state}%20${country}` +
    `&limit=1&key=${process.env.OPENCAGE_API}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch IP address");
  }

  const data = await response.json();
  return data;
};

export const getTrips = async (_: Request, res: Response) => {
  try {
    const trips = await Trip.aggregate([
      {
        $lookup: {
          from: "triplocations",
          let: { tripId: "$_id" },
          pipeline: [{ $match: { $expr: { $eq: ["$trip_id", "$$tripId"] } } }],
          as: "trip_locations",
        },
      },
      {
        $project: {
          _id: 1,
          user_email: 1,
          vehicle_license_plate: 1,
          details: {
            distance: "$distance",
            fare: "$fare",
            status: "$status",
            timestamp: "$timestamp",
            trip_locations: "$trip_locations",
          },
        },
      },
    ]);
    res.json(trips);
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

export const getTripsByUserEmail = async (req: Request, res: Response) => {
  try {
    const userInfo = (req as UserRequest).user.userInfo;

    const trips = await Trip.aggregate([
      {
        $match: {
          user_email: userInfo.email,
        },
      },
      {
        $lookup: {
          from: "triplocations",
          let: { tripId: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$trip_id", "$$tripId"],
                },
              },
            },
          ],
          as: "trip_locations",
        },
      },
      {
        $group: {
          _id: "$_id",
          vehicle_license_plate: { $first: "$vehicle_license_plate" },
          distance: { $first: "$distance" },
          fare: { $first: "$fare" },
          status: { $first: "$status" },
          timestamp: { $first: "$timestamp" },
          trip_locations: { $push: "$trip_locations" },
        },
      },
      {
        $sort: {
          timestamp: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    const avgDistance =
      trips.reduce((sum, trip) => sum + trip.distance, 0) / trips.length;
    const totalFare = trips.reduce((sum, trip) => sum + trip.fare, 0);

    if (trips.length > 0) {
      res.status(200).json({
        total: trips.length,
        avgDistance,
        totalFare,
        trips,
      });
    } else {
      res.status(404).json({ error: "Trips not found" });
    }
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

export const getVehicleLists = async (_: Request, res: Response) => {
  try {
    const vehicles = await Vehicle.aggregate([
      {
        $group: {
          _id: "$capacity",
          name: { $first: "$model" },
          year: { $first: "$year" },
          vehicle_license_plate: { $first: "$vehicle_license_plate" },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);
    if (!vehicles) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    res.json(vehicles);
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

export const getVehicleListsByCapacity = async (
  req: Request,
  res: Response
) => {
  try {
    const vehicleCapacity = req.params.capacity;

    if (Number(vehicleCapacity) < 1 || Number(vehicleCapacity) > 8) {
      res.status(400).json({ error: "Invalid vehicle capacity" });
      return;
    }

    const vehicles = await Vehicle.find({
      capacity: Number(vehicleCapacity),
    });

    if (!vehicles) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    res.json(vehicles);
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

export const bookATrip = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userInfo = (req as UserRequest).user.userInfo;

    const { vehicle_license_plate, pickup_location, dropoff_location } =
      tripSchemaValidation.parse(req.body);

    let distance: number = 0;

    const pickupLocationInfo = (await getLocation(
      pickup_location as string
    )) as OpenCageAPIResponse;
    const dropoffLocationInfo = (await getLocation(
      dropoff_location as string
    )) as OpenCageAPIResponse;

    const pickupLocationResults: Result[] = pickupLocationInfo.results;
    const dropoffLocationResults: Result[] = dropoffLocationInfo.results;

    const pickupLocationLat: number = pickupLocationResults[0].geometry.lat;
    const pickupLocationLng: number = pickupLocationResults[0].geometry.lng;
    const dropoffLocationLat: number = dropoffLocationResults[0].geometry.lat;
    const dropoffLocationLng: number = dropoffLocationResults[0].geometry.lng;

    distance = distanceBetweenTwoPoints(
      pickupLocationLat,
      pickupLocationLng,
      dropoffLocationLat,
      dropoffLocationLng
    );

    if (distance >= 80) {
      res.status(400).json({ error: "Distance cannot be more than 80 km" });
      return;
    }

    const price = Math.round(calculatePrice(distance));

    const driverVehicle = await DriverVehicle.findOne({
      vehicle_license_plate,
    });

    if (!driverVehicle) {
      res
        .status(404)
        .json({ error: "No driver associated with this vehicle." });
      return;
    }

    const driverEmail = driverVehicle.driver_email;

    // const driver = await Driver.findOneAndUpdate(
    //   { email: driverEmail },
    //   { $set: { status: "booked" } },
    //   { new: true, session }
    // );
    const driver = await Driver.findOne({ email: driverEmail });

    if (driver.status === "booked") {
      res.status(400).json({ error: "Driver is already booked" });
      return;
    }

    const trip = new Trip({
      user_email: userInfo.email,
      vehicle_license_plate,
      distance,
      fare: price,
      timestamp: Date.now(),
    });
    const newTrip = await Trip.create([trip], { session });
    const tripLocation = {
      trip_id: newTrip[0]._id,
      pickup_location,
      dropoff_location,
    };
    await TripLocation.create([tripLocation], { session });
    await driver.updateOne({ $set: { status: "booked" } });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Trip created!",
      distance,
      fare: price,
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

export const completeTrip = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userInfo = (req as UserRequest).user.userInfo;
    const { amount, trip_id } = paymentSchemaValidation.parse(req.body);

    const trip = await Trip.findOne({ _id: trip_id });
    const customer = await User.findOne({ email: userInfo.email });

    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    if (trip.status === "completed") {
      res.status(400).json({ error: "Trip is already completed" });
      return;
    }

    if (amount < trip.fare) {
      res.status(400).json({ error: "Amount is less than the fare" });
      return;
    }

    const driverVehicle = await DriverVehicle.findOne({
      vehicle_license_plate: trip.vehicle_license_plate,
    });

    const driverEmail = driverVehicle.driver_email;

    await Driver.findOneAndUpdate(
      { email: driverEmail },
      { $set: { status: "available" } }
    );

    const randomCode = generateRandomCode();

    await trip.updateOne({ $set: { status: "completed" } });

    const payment = new Payment({
      transaction_code: randomCode,
      timestamp: Date.now(),
    });
    const newPayment = await Payment.create([payment], { session });
    const paymentDetails = new PaymentDetails({
      amount: trip.fare,
      payment_id: newPayment[0]._id,
      customer_email: customer.email,
      trip_id: trip._id,
    });
    await PaymentDetails.create([paymentDetails], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Trip completed!",
      amount,
      transaction_code: randomCode,
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
