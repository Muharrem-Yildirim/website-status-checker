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
			console.log("Discord client started");

			this._client.once("ready", () => {
				console.log("Discord client ready");

				this._client.user.setActivity("Checking..", {
					type: ActivityType.Watching,
				});
			});
		});
	}

	notify(subject, message, hostname, target) {
		this.client()
			.users.fetch(target)
			.then((user) => {
				user.send(message);
			});
	}
}

const discord = new Discord();

export default discord;
