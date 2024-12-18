require("dotenv").config();

import express from "express";
import router from "./routes";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./db";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1", router);

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
});
