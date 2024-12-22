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
	const baseQuery = {
		$or: [
			{
				lastCheck: null,
			},
		],
		isActive: true,
	};

	const freeQuery = {
		...baseQuery,
		$or: [
			{
				lastCheck: {
					$lt: new Date(
						Date.now() -
							1000 *
								(parseInt(process.env.FREE_CHECK_INTERVAL) ||
									60 * 60)
					),
				},
			},
			...baseQuery.$or,
		],
		plan: Plan.FREE,
	};

	const FREE_PLAN_WEBSITES = await Host.find({
		...freeQuery,
		plan: Plan.FREE,
	});

	const paidQuery = {
		...baseQuery,
		$or: [
			{
				lastCheck: {
					$lt: new Date(
						Date.now() -
							1000 *
								(parseInt(process.env.PAID_CHECK_INTERVAL) ||
									2 * 60)
					),
				},
			},
			...baseQuery.$or,
		],
		plan: Plan.FREE,
	};

	const PAID_PLAN_WEBSITES = await Host.find({
		...paidQuery,
		plan: Plan.PAID,
	});

	ping(FREE_PLAN_WEBSITES);
	ping(PAID_PLAN_WEBSITES);

	global.totalHostCount =
		FREE_PLAN_WEBSITES.length + PAID_PLAN_WEBSITES.length;
}

export function initCrons() {
	cron.schedule("* * * * *", job);

	if (process.env.NODE_ENV !== "production") {
		job();
	}

	console.log("Crons initialized");

	initNotificators();
}
