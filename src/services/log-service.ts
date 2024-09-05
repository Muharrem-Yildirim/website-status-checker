import notificatorMap from "../notificators/notificator-map";
import Log, { LogTypes } from "../schemas/log";

async function log(host, type, message) {
	const log = new Log({
		type,
		host,
		message,
		isUp: type == LogTypes.ERROR ? false : true,
	});

	if (type == LogTypes.ERROR) {
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
	}

	console.log(`[${new Date().toUTCString()}] [${type}] ${message}`);

	if (global.loggingEnabled) await log.save();
}

export { log };
