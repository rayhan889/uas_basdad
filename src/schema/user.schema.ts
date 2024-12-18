import mongoose from "mongoose";
import { z } from "zod";
import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

export interface UserRequest extends Request {
  user: {
    userInfo:
      | JwtPayload
      | {
          email: string;
          username: string;
          iat: number;
          exp: number;
        };
  };
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

export const signUpSchemaValidation = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(50),
  phone: z.string(),
  address: z.string(),
});

export const signInSchemaValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

export const User = mongoose.model("User", userSchema);
