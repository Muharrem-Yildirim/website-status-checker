import telegram from "../notificators/telegram";
import mail from "../notificators/mail";
import Log, { LogTypes } from "../schemas/log";

async function log(host, type, message) {
  const log = new Log({
    type,
    host,
    message,
    isUp: type == LogTypes.ERROR ? false : true,
  });

  if (type == LogTypes.ERROR) {
    if (
      host.notifyOptions.telegram &&
      host.notifyOptions?.telegram?.target != "" &&
      host.notifyOptions?.telegram?.target != null
    )
      telegram.notify(
        `[${type}] ${message}`,
        host.hostname,
        host.notifyOptions?.telegram?.target
      );

    if (
      host.notifyOptions.email &&
      host.notifyOptions?.email?.target != "" &&
      host.notifyOptions?.email?.target != null
    )
      mail.notify(
        `[${type}] ${message}`,
        host.hostname,
        host.notifyOptions?.email?.target
      );
  }

  console.log(`[${type}] ${message}`);

  if (global.loggingEnabled) await log.save();
}

export { log };
