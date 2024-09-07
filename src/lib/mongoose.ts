import mongoose from "mongoose";

export const connect = async () => {
	await mongoose.connect(process.env.MONGODB_URI, {
		minPoolSize: 2,
		maxPoolSize: 10,
	});

	console.log("Connected to MongoDB.");
};
export const disconnect = async () => {
	await mongoose.disconnect();

	console.log("Disconnected from MongoDB.");
};
