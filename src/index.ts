import { initCrons } from "./cron";
import * as mongoose from "./lib/mongoose";
import { initRoutes } from "./routes";
import Log, { LogTypes } from "./schemas/log";
import Host from "./schemas/host";
import { log } from "./services/log-service";
import dotenv from "dotenv";
global.loggingEnabled = false;

dotenv.config();

async function main() {
	if (typeof process.env.MONGODB_URI != "undefined") {
		await mongoose.connect();
		global.loggingEnabled = true;
	}
}

process.on("uncaughtException", (error) => {
	console.log("uncaughtException", error);
});

main();
initRoutes();
initCrons();
