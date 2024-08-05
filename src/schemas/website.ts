import { Schema, model } from "mongoose";

export enum Plans {
  FREE = "free",
  PAID = "paid",
}

export interface IWebsite {
  plan: Plans;
  hostname: string;
  protocol: "http" | "https";
  notifyOptions: {
    mail: boolean;
    telegram: boolean;
  };
  lastChecked: Date;
}

const websiteSchema = new Schema<IWebsite>(
  {
    plan: { type: String, required: true, default: Plans.FREE },
    hostname: { type: String, required: true, unique: true },
    protocol: { type: String, required: true, default: "http" },
    notifyOptions: {
      mail: { type: Boolean, required: true, default: false },
      telegram: { type: Boolean, required: true, default: false },
    },
    lastChecked: { type: Date, required: false, default: null },
  },
  {
    timestamps: true,
  }
);

const Website = model<IWebsite>("Website", websiteSchema);

export default Website;
