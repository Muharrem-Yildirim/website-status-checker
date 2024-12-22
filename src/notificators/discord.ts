import { notifyLogger } from "../lib/pino";
import Notificator from "./notificator";
import { ActivityType, Client, GatewayIntentBits } from "discord.js";

class Discord extends Notificator {
	_client: Client = null;

	client() {
		return this._client;
	}

	init() {
		this._client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.DirectMessages,
			],
		});

		this._client.login(process.env.DISCORD_TOKEN).then(() => {
			notifyLogger.info("Discord client logged in.");

			this._client.once("ready", () => {
				notifyLogger.info("Discord client ready.");

				this.updateActivity();
			});
		});

		setInterval(() => {
			this.updateActivity();
		}, 1 * 60 * 1000);
	}

	updateActivity() {
		const emojis = ["✨", "🎉", "🌟"];

		this._client.user.setActivity(
			global.totalHostCount !== null
				? `Checking ${global.totalHostCount} hosts.. ${
						emojis[Math.floor(Math.random() * (emojis.length - 1))]
				  }`
				: `Checking.. ${
						emojis[Math.floor(Math.random() * (emojis.length - 1))]
				  }`,
			{
				type: ActivityType.Watching,
			}
		);
	}

	notify(subject, message, hostname, target) {
		this.client()
			.users.fetch(target)
			.then((user) => {
				user.send(subject + "\n\n" + message);

				notifyLogger.info({
					msg: "Discord message sent",
					subject,
					message,
					hostname,
					target,
				});
			})
			.catch(() => {
				notifyLogger.info({
					msg: "Discord message failed",
					subject,
					message,
					hostname,
					target,
				});
			});
	}
}

const discord = new Discord();

export default discord;
