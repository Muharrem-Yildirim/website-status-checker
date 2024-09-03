import telegram from "../notificators/telegram";
import mail from "../notificators/mail";
import Log, { LogTypes } from "../schemas/log";

async function log(website, type, message) {
  const log = new Log({
    type,
    website,
    message,
    isUp: type == LogTypes.ERROR ? false : true,
  });

  if (type == LogTypes.ERROR) {
    if (
      website.notifyOptions.telegram &&
      website.notifyOptions?.telegram?.target != "" &&
      website.notifyOptions?.telegram?.target != null
    )
      telegram.notify(
        `[${type}] ${message}`,
        website.hostname,
        website.notifyOptions?.telegram?.target
      );

    if (
      website.notifyOptions.email &&
      website.notifyOptions?.email?.target != "" &&
      website.notifyOptions?.email?.target != null
    )
      mail.notify(
        `[${type}] ${message}`,
        website.hostname,
        website.notifyOptions?.email?.target
      );
  }

  console.log(`[${type}] ${message}`);

  if (global.loggingEnabled) await log.save();
}

export { log };
