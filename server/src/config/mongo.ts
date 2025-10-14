import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

export async function connectMongo() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error", error);
    throw error;
  }
}

export { mongoose };
