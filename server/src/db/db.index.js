import mongoose from "mongoose";
import { config } from "dotenv";

config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully!");
    
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB");
    });
    
    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });
    
    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected");
    });
    
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;