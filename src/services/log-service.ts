import notificatorMap from "../notificators/notificator-map";
import Log, { LogTypes } from "../schemas/log";

async function log(host, type, message) {
	const log = new Log({
		type,
		host,
		message,
		isUp: type == LogTypes.ERROR ? false : true,
	});

	const lastLog = await Log.findOne({ host: host._id }).sort({
		createdAt: -1,
	});

	if (
		type == LogTypes.ERROR &&
		(!lastLog || lastLog.isUp) //status is changed
	) {
		Object.keys(notificatorMap).forEach(async (target) => {
			if (
				host.notifyOptions[target]?.isActive &&
				host.notifyOptions[target]?.target != "" &&
				host.notifyOptions[target]?.target != null
			) {
				notificatorMap[target]()
					.then((notificator) => {
						notificator.default.notify(
							`[${type}] ${message}`,
							host.hostname,
							host.notifyOptions[target]?.target
						);

						console.log(
							"Notified target:",
							target,
							"Options",
							host.notifyOptions[target]
						);
					})
					.catch(console.error);
			}
		});
	} else {
		console.log("Skipped notification for ", host.hostname);
	}

	console.log(`[${new Date().toUTCString()}] [${type}] ${message}`);

	if (global.loggingEnabled) await log.save();
}

export { log };
