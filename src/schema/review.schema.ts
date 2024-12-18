import mongoose from "mongoose";
import { z } from "zod";

const reviewSchema = new mongoose.Schema({
  reviewee: {
    type: String,
    required: true,
  },
  reviewer: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

export const reviewSchemaValidation = z.object({
  reviewee_email: z.string().email(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
});

export const Review = mongoose.model("Review", reviewSchema);
