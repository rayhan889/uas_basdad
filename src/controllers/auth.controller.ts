import type { RequestHandler, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  User,
  signInSchemaValidation,
  signUpSchemaValidation,
} from "../schema/user.schema";
import mongoose from "mongoose";
import { ZodError } from "zod";

export const signUp: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address } =
      signUpSchemaValidation.parse(req.body);

    const userWithEmail = await User.findOne({ email });

    if (!userWithEmail) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        refreshToken: "",
      });
      await user.save();

      res.status(201).json(user);
    } else {
      res.status(400).json({ error: "Email already exists" });
    }
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

export const signIn: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = signInSchemaValidation.parse(req.body);

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  } else {
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    if (matchPassword) {
      const accessToken = await jwt.sign(
        {
          userInfo: {
            name: user.name,
            email: user.email,
          },
        },
        process.env.ACCESS_TOKEN,
        {
          expiresIn: "1d",
        }
      );
      const refreshToken = await jwt.sign(
        { name: user.name, email: user.email },
        process.env.REFRESH_TOKEN,
        {
          expiresIn: "1d",
        }
      );
      try {
        await User.updateOne({ _id: user._id }, { refreshToken });
        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
};

export const signOut: RequestHandler = async (req: Request, res: Response) => {
  const cookie = req.cookies;
  if (!cookie?.jwt) {
    res.sendStatus(401);
    return;
  }

  const refreshToken = cookie.jwt;
  const { email, refreshToken: refreshTokenUser } = await User.findOne({
    refreshToken,
  });

  if (!refreshTokenUser) {
    res.clearCookie("jwt", refreshToken);
    return;
  }

  try {
    await User.updateOne({ email }, { refreshToken: null });
    res.clearCookie("jwt", refreshToken);
    res.json({ message: "Successfully logged out" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
