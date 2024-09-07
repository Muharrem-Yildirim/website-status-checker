export default abstract class Notificator {
	protected abstract client(): any;

	abstract notify(string, hostname?, target?): any;

	init() {
		console.log("Notificator initialized, ", this.constructor.name);
	}
}
