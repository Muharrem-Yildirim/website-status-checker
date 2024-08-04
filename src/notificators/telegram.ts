import TelegramBot from "node-telegram-bot-api";
import Notificator from "./notificator";

class Telegram extends Notificator {
  client() {
    return new TelegramBot(process.env.TELEGRAM_TOKEN);
  }
  notify(string) {
    this.client().sendMessage(process.env.TELEGRAM_CHAT_ID, string);
  }
}

const telegram = new Telegram();

export default telegram;
