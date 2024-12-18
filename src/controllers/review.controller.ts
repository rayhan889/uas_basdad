import { Request, Response } from "express";
import { Review, reviewSchemaValidation } from "../schema/review.schema";
import type { UserRequest } from "../schema/user.schema";
import mongoose from "mongoose";
import { Driver } from "../schema/driver.schema";

export const createReview = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userInfo = (req as UserRequest).user.userInfo;

    const { reviewee_email, rating, comment } = reviewSchemaValidation.parse(
      req.body
    );

    const driver = Driver.findOne({ email: reviewee_email });

    if (!driver) {
      res.status(404).json({ error: "Reviewee not found" });
      return;
    }

    const existingDriverReviews = await Review.find({
      reviewee: reviewee_email,
    });

    const totalReviews = existingDriverReviews.length + 1;
    let overallRating: number;

    if (totalReviews === 0) {
      overallRating = rating;
    } else {
      const totalRatingSum =
        existingDriverReviews.reduce((sum, review) => sum + review.rating, 0) +
        rating;
      overallRating = totalRatingSum / totalReviews;
    }

    await Driver.updateOne(
      { email: reviewee_email },
      { $set: { rating: overallRating } }
    );

    const newReview = new Review({
      reviewee: reviewee_email,
      reviewer: userInfo.email,
      rating,
      comment,
      timestamp: Date.now(),
    });
    await Review.create([newReview], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Review created!",
      reviewee: reviewee_email,
      rating,
      comment,
    });
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
