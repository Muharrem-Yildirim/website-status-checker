import { Schema, model } from "mongoose";

export enum LogTypes {
  ERROR = "error",
  INFO = "info",
}

export interface ILog {
  website: Schema.Types.ObjectId;
  type: LogTypes;
  message: string;
  isUp: boolean;
}

const logSchema = new Schema<ILog>(
  {
    website: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Website",
    },
    type: { type: String, required: true },
    message: { type: String, required: true },
    isUp: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

const Log = model<ILog>("Log", logSchema);

export default Log;
