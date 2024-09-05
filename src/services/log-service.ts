import telegram from "../notificators/telegram";
import mail from "../notificators/mail";
import Log, { LogTypes } from "../schemas/log";
import webhook from "../notificators/webhook";

async function log(host, type, message) {
	const log = new Log({
		type,
		host,
		message,
		isUp: type == LogTypes.ERROR ? false : true,
	});

	if (type == LogTypes.ERROR) {
		if (
			host.notifyOptions.telegram?.isActive &&
			host.notifyOptions?.telegram?.target != "" &&
			host.notifyOptions?.telegram?.target != null
		)
			telegram.notify(
				`[${type}] ${message}`,
				host.hostname,
				host.notifyOptions?.telegram?.target
			);

		if (
			host.notifyOptions.email?.isActive &&
			host.notifyOptions?.email?.target != "" &&
			host.notifyOptions?.email?.target != null
		)
			mail.notify(
				`[${type}] ${message}`,
				host.hostname,
				host.notifyOptions?.email?.target
			);

		if (
			host.notifyOptions.webhook?.isActive &&
			host.notifyOptions?.webhook?.target != "" &&
			host.notifyOptions?.webhook?.target != null
		) {
			webhook.notify(
				`[${type}] ${message}`,
				host.hostname,
				host.notifyOptions?.webhook?.target
			);
		}
	}

	console.log(`[${new Date().toUTCString()}] [${type}] ${message}`);

	if (global.loggingEnabled) await log.save();
}

export { log };
