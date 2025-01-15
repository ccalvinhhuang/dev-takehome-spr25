import mongoose from "mongoose";

const MONGO_URI = "mongodb://127.0.0.1:27017/dev-takehome";
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
