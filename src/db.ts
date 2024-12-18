import mongoose from "mongoose";

const DB_URL = process.env.MONGODB_URL;

if (!DB_URL) {
  throw new Error("Please set the MONGODB_URL environment variable");
}

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Connection error", error);
  }
};

export default connectDB;
