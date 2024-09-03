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
    if (website.notifyOptions.telegram) telegram.notify(`[${type}] ${message}`);

    if (website.notifyOptions.email)
      mail.notify(`[${type}] ${message}`, website.hostname);
  }

  console.log(`[${type}] ${message}`);

  if (global.loggingEnabled) await log.save();
}

export { log };
