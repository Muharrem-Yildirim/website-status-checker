import { Schema, model } from "mongoose";

export enum LogTypes {
	ERROR = "error",
	INFO = "info",
}

export interface ILog {
	host: Schema.Types.ObjectId;
	type: LogTypes;
	message: string;
	isUp: boolean;
}

const logSchema = new Schema<ILog>(
	{
		host: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Host",
		},
		type: { type: String, required: true },
		message: { type: String, required: true },
		isUp: { type: Boolean, required: true, default: false },
	},
	{
		timestamps: true,
	}
);

logSchema.index({ host: 1 });
logSchema.index({ type: 1 });
logSchema.index({ isUp: 1 });
logSchema.index({ host: 1, type: 1 });
logSchema.index({ host: 1, isUp: 1 });
logSchema.index({ createdAt: -1 });

const Log = model<ILog>("Log", logSchema);

export default Log;
