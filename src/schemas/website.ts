import { Schema, model } from "mongoose";

export enum Plans {
  FREE = "free",
  PAID = "paid",
}

export interface IWebsite {
  plan: Plans;
  hostname: string;
  lastChecked: Date;
}

const websiteSchema = new Schema<IWebsite>(
  {
    plan: { type: String, required: true, default: Plans.FREE },
    hostname: { type: String, required: true, unique: true },
    lastChecked: { type: Date, required: false, default: null },
  },
  {
    timestamps: true,
  }
);

const Website = model<IWebsite>("Website", websiteSchema);

export default Website;
