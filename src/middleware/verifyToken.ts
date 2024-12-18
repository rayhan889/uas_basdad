require("dotenv").config();

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

export interface UserRequest extends Request {
  user: string | JwtPayload;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.sendStatus(401);
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN,
    (error: VerifyErrors, decoded: JwtPayload) => {
      if (error) {
        res.status(403).json({ message: "Invalid token!" });
        return;
      }
      (req as UserRequest).user = decoded;
      next();
    }
  );
};
