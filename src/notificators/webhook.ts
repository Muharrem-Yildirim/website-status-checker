import axios from "axios";
import Notificator from "./notificator";

class Webhook extends Notificator {
	client() {
		return axios.create();
	}
	notify(subject, message, hostname, target) {
		this.client().post(target, { hostname, message: message });
	}
}

const webhook = new Webhook();

export default webhook;
