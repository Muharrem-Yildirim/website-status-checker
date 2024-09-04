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

const Log = model<ILog>("Log", logSchema);

export default Log;
