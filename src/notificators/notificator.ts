export default abstract class Notificator {
  protected abstract client(): any;

  abstract notify(string, hostname?): any;
}
