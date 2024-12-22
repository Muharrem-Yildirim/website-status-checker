import { notifyLogger } from "../lib/pino";

export default abstract class Notificator {
	protected abstract client(): any;

	abstract notify(subject, message, hostname, target?): any;

	init() {
		notifyLogger.info("Notificator initialized, " + this.constructor.name);
	}
}
