import { Schema, model } from "mongoose";

export enum LogTypes {
  ERROR = "error",
  INFO = "info",
}

export interface ILog {
  hostname: string;
  type: LogTypes;
  message: string;
}

const logSchema = new Schema<ILog>(
  {
    hostname: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Log = model<ILog>("Log", logSchema);

export default Log;
