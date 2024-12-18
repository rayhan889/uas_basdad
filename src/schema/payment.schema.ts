import mongoose from "mongoose";
import { z } from "zod";

const paymentSchema = new mongoose.Schema({
  transaction_code: {
    type: String,
    required: true,
    unique: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

const paymentDetailsSchema = new mongoose.Schema({
  payment_id: {
    type: String,
    required: true,
  },
  trip_id: {
    type: String,
    required: true,
  },
  customer_email: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "success",
  },
});

export const paymentSchemaValidation = z.object({
  trip_id: z.string(),
  amount: z.number(),
});

export const Payment = mongoose.model("Payment", paymentSchema);
export const PaymentDetails = mongoose.model(
  "PaymentDetails",
  paymentDetailsSchema
);
