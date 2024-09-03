import { Schema, model } from "mongoose";

export enum Plan {
  FREE = "free",
  PAID = "paid",
}

export interface IWebsite {
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

const websiteSchema = new Schema<IWebsite>(
  {
    plan: { type: String, required: true, default: Plan.FREE },
    ownerIdentifier: { type: String, required: true },
    hostname: { type: String, required: true },
    protocol: { type: String, required: true, default: "http" },
    notifyOptions: {
      email: {
        isActive: { type: Boolean, required: true, default: false },
        target: { type: String, required: true, default: null },
      },
      telegram: {
        isActive: { type: Boolean, required: true, default: false },
        target: { type: String, required: true, default: null },
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

websiteSchema.index({ ownerIdentifier: 1, hostname: 1 }, { unique: true });
websiteSchema.virtual("logs", {
  ref: "Log",
  localField: "_id",
  foreignField: "website",
  justOne: false,
});

const Website = model<IWebsite>("Website", websiteSchema);

export default Website;
