import TelegramBot from "node-telegram-bot-api";
import Notificator from "./notificator";

class Telegram extends Notificator {
	client() {
		return new TelegramBot(process.env.TELEGRAM_TOKEN);
	}
	notify(subject, message, hostname, target) {
		this.client().sendMessage(target, subject + "\n\n" + message);
	}
}

const telegram = new Telegram();

export default telegram;
