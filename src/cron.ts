import cron from "node-cron";
import Host, { Plan } from "./schemas/host";
import { ping } from "./services/checker-service";

async function job() {
  const FREE_PLAN_WEBSITES = await Host.find({
    lastCheck: {
      $lt: new Date(
        Date.now() -
          1000 * (parseInt(process.env.CHECK_INTERVAL) || 60 * 60) * 2
      ),
    },
    isActive: true,
    plan: Plan.FREE,
  });

  const PAID_PLAN_WEBSITES = await Host.find({
    lastCheck: {
      $lt: new Date(
        Date.now() - 1000 * (parseInt(process.env.CHECK_INTERVAL) || 60 * 60)
      ),
    },
    isActive: true,
    plan: Plan.PAID,
  });

  ping(FREE_PLAN_WEBSITES);
  ping(PAID_PLAN_WEBSITES);
}

export function initCrons() {
  cron.schedule("* * * * *", job);

  console.log("Crons initialized");
}
