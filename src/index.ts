import * as mongoose from "./lib/mongoose";
import { initRoutes } from "./routes";
import Log, { LogTypes } from "./schemas/log";
import Website from "./schemas/website";
import { log } from "./services/log-service";
import dotenv from "dotenv";
global.loggingEnabled = false;

dotenv.config();

const CHECK_INTERVAL: number = parseInt(process.env.CHECK_INTERVAL ?? "600");

async function main() {
  if (typeof process.env.WEBSITE_URL == "undefined") {
    console.error("WEBSITE_URL is not defined in .env file, exiting...");
    return;
  }

  if (typeof process.env.MONGODB_URI != "undefined") {
    await mongoose.connect();
    global.loggingEnabled = true;
  }

  console.log("Checker is running..");

  setInterval(ping, CHECK_INTERVAL * 1000);
}

async function ping() {
  const WEBSITE_URLS = Website.find({});

  for await (const WEBSITE of WEBSITE_URLS) {
    fetch(WEBSITE.hostname)
      .then((res) => {
        if (res.ok) {
          log(
            WEBSITE.hostname,
            LogTypes.INFO,
            `Successfully connected to ${WEBSITE.hostname}.`
          );
        } else {
          log(
            WEBSITE.hostname,
            LogTypes.ERROR,
            `Error while connecting to ${WEBSITE.hostname}, response code is [${res.status} ${res.statusText}].`
          );
        }
      })
      .catch((error) => {
        log(
          WEBSITE.hostname,
          LogTypes.ERROR,
          `Error while connecting to ${WEBSITE.hostname}, message is [${error.message}].`
        );
      })
      .finally(async () => {
        await WEBSITE.updateOne({
          $where: {
            hostname: WEBSITE.hostname,
          },
          $set: {
            lastChecked: new Date(),
          },
        });
      });
  }
}

main();
initRoutes();
