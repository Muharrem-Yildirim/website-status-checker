import Notificator from "./notificator";
import { Client, GatewayIntentBits } from "discord.js";

class Discord extends Notificator {
	_client: Client = null;

	client() {
		if (!this._client) {
			this._client = new Client({
				intents: [
					GatewayIntentBits.Guilds,
					GatewayIntentBits.DirectMessages,
				],
			});

			this._client.login(process.env.DISCORD_TOKEN);
		}

		return this._client;
	}
	notify(string, hostname, target) {
		this.client()
			.users.fetch(target)
			.then((user) => {
				user.send(string);
			});
	}
}

const discord = new Discord();

export default discord;
