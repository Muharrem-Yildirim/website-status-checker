export default abstract class Notificator {
	protected abstract client(): any;

	abstract notify(subject, message, hostname, target?): any;

	init() {
		console.log("Notificator initialized, ", this.constructor.name);
	}
}
