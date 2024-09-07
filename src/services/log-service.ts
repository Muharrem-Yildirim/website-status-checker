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

	const isStatusChanged = !lastLog || lastLog.isUp !== log.isUp;

	if (isStatusChanged) {
		broadcast(host, type, message);
	} else {
		console.log("Skipped notification for ", host.hostname);
	}

	console.log(
		`[${new Date().toUTCString()}] [${type}] ${
			message ?? "Successfully connected."
		}`,
		host.hostname
	);

	if (global.loggingEnabled) await log.save();
}

function broadcast(host, type, message) {
	Object.keys(notificatorMap).forEach(async (target) => {
		if (
			host.notifyOptions[target]?.isActive &&
			host.notifyOptions[target]?.target != "" &&
			host.notifyOptions[target]?.target != null
		) {
			const _subject =
				type === LogTypes.ERROR
					? `❌ Your Site is Down - ${host.hostname}`
					: `✅ Your Site is Up - ${host.hostname}`;

			const _message =
				type === LogTypes.ERROR
					? `Hi, your site ${host.hostname} is down. The response was: [${message}].`
					: `Hi, your site ${host.hostname} is up again.`;

			notificatorMap[target]()
				.then((notificator) => {
					notificator.default.notify(
						_subject,
						_message,
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

export { log };
