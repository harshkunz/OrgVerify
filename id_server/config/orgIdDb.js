import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_ORG_ID_URI || process.env.MONGODB_NATIONAL_ID_URI;
    if (!connectionString) {
      throw new Error("MONGODB_ORG_ID_URI or MONGODB_NATIONAL_ID_URI is not defined in .env");
    }
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    });
    console.log("Organization ID MongoDB connected successfully ");
  } catch (error) {
    console.error("Error in connecting to MongoDB Organization ID:", error);
    process.exit(1);
  }
}

export default connectDB;

