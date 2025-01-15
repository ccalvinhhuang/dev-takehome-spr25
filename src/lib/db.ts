import mongoose from "mongoose";

const MONGO_URI = "mongodb://127.0.0.1:27017/dev-takehome";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

export default connectDB;
