import cron from "node-cron";
import Host, { Plan } from "./schemas/host";
import { ping } from "./services/checker-service";
import notificatorMap from "./notificators/notificator-map";

function initNotificators() {
	Object.keys(notificatorMap).forEach(async (target) => {
		notificatorMap[target]()
			.then((notificator) => {
				if (notificator.default.init) notificator.default.init();
			})
			.catch(console.error);
	});
}

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

	if (process.env.NODE_ENV !== "production") {
		job();
	}

	console.log("Crons initialized");

	initNotificators();
}
