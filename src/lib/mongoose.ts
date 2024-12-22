import mongoose from "mongoose";
import mainLogger from "./pino";

export const connect = async () => {
	await mongoose.connect(process.env.MONGODB_URI, {
		minPoolSize: 2,
		maxPoolSize: 10,
	});

	mainLogger.info("Connected to MongoDB.");
};
export const disconnect = async () => {
	await mongoose.disconnect();

	mainLogger.info("Disconnected from MongoDB.");
};

export default mongoose;
