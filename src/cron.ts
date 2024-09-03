import cron from "node-cron";
import Website, { Plan } from "./schemas/website";
import { ping } from "./services/checker-service";

async function job() {
  const FREE_PLAN_WEBSITES = await Website.find({
    lastCheck: {
      $lt: new Date(
        Date.now() -
          1000 * (parseInt(process.env.CHECK_INTERVAL) || 60 * 60) * 2
      ),
    },
    plan: Plan.FREE,
  });

  const PAID_PLAN_WEBSITES = await Website.find({
    lastCheck: {
      $lt: new Date(
        Date.now() - 1000 * (parseInt(process.env.CHECK_INTERVAL) || 60 * 60)
      ),
    },
    plan: Plan.PAID,
  });

  ping(FREE_PLAN_WEBSITES);
  ping(PAID_PLAN_WEBSITES);
}

export function initCrons() {
  cron.schedule("* * * * *", job);

  console.log("Crons initialized");
}
