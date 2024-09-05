import cron from "node-cron";
import Host, { Plan } from "./schemas/host";
import { ping } from "./services/checker-service";

async function job() {
	const query = {
		$or: [
			{
				lastCheck: {
					$lt: new Date(
						Date.now() -
							1000 *
								(parseInt(process.env.CHECK_INTERVAL) ||
									60 * 60) *
								2
					),
				},
			},
			{
				lastCheck: null,
			},
		],
		isActive: true,
	};

	const FREE_PLAN_WEBSITES = await Host.find({
		...query,
		plan: Plan.FREE,
	});

	const PAID_PLAN_WEBSITES = await Host.find({
		...query,
		plan: Plan.PAID,
	});

	ping(FREE_PLAN_WEBSITES);
	ping(PAID_PLAN_WEBSITES);
}

export function initCrons() {
	cron.schedule("* * * * *", job);

	console.log("Crons initialized");
}
