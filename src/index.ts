import { initCrons } from "./cron";
import * as mongoose from "./lib/mongoose";
import { initRoutes } from "./routes";
import dotenv from "dotenv";
import mainLogger from "./lib/pino";
global.loggingEnabled = false;

dotenv.config();

async function main() {
	if (typeof process.env.MONGODB_URI != "undefined") {
		await mongoose.connect();

		global.loggingEnabled = true;
	}
}

process.on("uncaughtException", (error) => {
	mainLogger.error(error);
});

main();
initRoutes();
initCrons();

global.totalHostCount = null;
