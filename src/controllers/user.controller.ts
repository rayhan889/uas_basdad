import { Request, Response } from "express";
import { User } from "../schema/user.schema";
import mongoose from "mongoose";

export const getUsers = async (_: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
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
