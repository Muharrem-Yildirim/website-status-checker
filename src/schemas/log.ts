import { Schema, model } from "mongoose";

export enum LogTypes {
  ERROR = "error",
  INFO = "info",
}

export interface ILog {
  website: Schema.Types.ObjectId;
  type: LogTypes;
  message: string;
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
  },
  {
    timestamps: true,
  }
);

const Log = model<ILog>("Log", logSchema);

export default Log;
