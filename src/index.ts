import { initCrons } from "./cron";
import * as mongoose from "./lib/mongoose";
import { initRoutes } from "./routes";
import dotenv from "dotenv";
import mainLogger from "./lib/pino";
global.loggingEnabled = false;

dotenv.config();

const OS = require("os");
process.env.UV_THREADPOOL_SIZE = OS.cpus().length;

async function main() {
	mainLogger.info(`Thread pool size: ${process.env.UV_THREADPOOL_SIZE}`);

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
