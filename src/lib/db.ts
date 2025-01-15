import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI: string =
  process.env.MONGO_URL ||
  (() => {
    throw new Error("MONGO_URL not in env variables");
  })();

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("yay!");
  } catch (err) {
    console.error("oops!", err);
    process.exit(1);
  }
};

export default connectDB;
