import { Schema, model } from "mongoose";

export enum Plan {
	FREE = "free",
	PAID = "paid",
}

export interface IHost {
	plan: Plan;
	ownerIdentifier: string;
	hostname: string;
	protocol: "http" | "https";
	notifyOptions: {
		mail: boolean;
		telegram: boolean;
	};
	checkCount: number;
	failedCheckCount: number;
	lastCheck: Date;
	isActive: boolean;
	logs: Schema.Types.ObjectId[];
}

const hostSchema = new Schema<IHost>(
	{
		plan: { type: String, required: true, default: Plan.FREE },
		ownerIdentifier: { type: String, required: true },
		hostname: { type: String, required: true },
		protocol: { type: String, required: true, default: "http" },
		notifyOptions: {
			email: {
				isActive: { type: Boolean, required: true, default: false },
				target: { type: String, required: false, default: null },
			},
			telegram: {
				isActive: { type: Boolean, required: true, default: false },
				target: { type: String, required: false, default: null },
			},
			webhook: {
				isActive: { type: Boolean, required: true, default: false },
				target: { type: String, required: false, default: null },
			},
			discord: {
				isActive: { type: Boolean, required: true, default: false },
				target: { type: String, required: false, default: null },
			},
		},
		checkCount: { type: Number, required: true, default: 0 },
		failedCheckCount: { type: Number, required: true, default: 0 },
		lastCheck: { type: Date, required: false, default: null },
		isActive: { type: Boolean, required: true, default: false },
	},
	{
		timestamps: true,
		toJSON: {
			virtuals: true,
		},
	}
);

hostSchema.index({ ownerIdentifier: 1, hostname: 1 }, { unique: true });
hostSchema.index({ plan: 1 });
hostSchema.index({ isActive: 1 });
hostSchema.index({ checkCount: 1, failedCheckCount: 1 });

hostSchema.virtual("logs", {
	ref: "Log",
	localField: "_id",
	foreignField: "host",
	justOne: false,
});

const Host = model<IHost>("Host", hostSchema);

export default Host;
