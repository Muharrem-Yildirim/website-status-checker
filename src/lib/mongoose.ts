import mongoose from "mongoose";

export const connect = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Connected to MongoDB.");
};
export const disconnect = async () => {
  await mongoose.disconnect();

  console.log("Disconnected from MongoDB.");
};
