import telegram from "../notificators/telegram";
import mail from "../notificators/mail";
import Log, { LogTypes } from "../schemas/log";

async function log(hostname, type, message) {
  const log = new Log({ type, hostname, message });

  if (type == LogTypes.ERROR) {
    telegram.notify(`[${type}] ${message}`);
    mail.notify(`[${type}] ${message}`, hostname);
  }

  console.log(`[${type}] ${message}`);

  if (global.loggingEnabled) await log.save();
}

export { log };
