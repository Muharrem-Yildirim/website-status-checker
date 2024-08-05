import { LogTypes } from "../schemas/log";
import { log } from "./log-service";

export async function ping(websites) {
  for await (const WEBSITE of websites) {
    fetch(`${WEBSITE.protocol}://${WEBSITE.hostname}`)
      .then((res) => {
        if (res.ok) {
          log(
            WEBSITE,
            LogTypes.INFO,
            `Successfully connected to ${WEBSITE.hostname}.`
          );
        } else {
          log(
            WEBSITE,
            LogTypes.ERROR,
            `Error while connecting to ${WEBSITE.hostname}, response code is [${res.status} ${res.statusText}].`
          );
        }
      })
      .catch((error) => {
        log(
          WEBSITE,
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
