import cron from "node-cron";
import Website, { Plans } from "./schemas/website";
import { ping } from "./services/checker-service";

export function initCrons() {
  cron.schedule("* * * * *", async function () {
    const FREE_PLAN_WEBSITES = await Website.find({
      lastChecked: {
        $lt: new Date(
          Date.now() -
            1000 * (parseInt(process.env.CHECK_INTERVAL) || 60 * 60) * 2
        ),
      },
      plan: Plans.FREE,
    });

    const PAID_PLAN_WEBSITES = await Website.find({
      lastChecked: {
        $lt: new Date(
          Date.now() - 1000 * (parseInt(process.env.CHECK_INTERVAL) || 60 * 60)
        ),
      },
      plan: Plans.PAID,
    });

    ping(FREE_PLAN_WEBSITES);
    ping(PAID_PLAN_WEBSITES);
  });

  console.log("Crons initialized");
}
