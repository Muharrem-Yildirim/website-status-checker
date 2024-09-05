import axios from "axios";
import Notificator from "./notificator";

class Webhook extends Notificator {
	client() {
		return axios.create();
	}
	notify(string, hostname, target) {
		this.client().post(target, { hostname, message: string });
	}
}

const webhook = new Webhook();

export default webhook;
