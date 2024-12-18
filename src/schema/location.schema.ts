import mongoose from "mongoose";
import { z } from "zod";

const locationSchema = new mongoose.Schema({
  address_line1: {
    type: String,
    required: true,
  },
  address_line2: {
    type: String,
    default: "",
  },
});

export const locationSchemaValidation = z.object({
  address_line1: z.string(),
  address_line2: z.string(),
});

export const Location = mongoose.model("Location", locationSchema);
