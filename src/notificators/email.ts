import nodemailer from "nodemailer";
import Notificator from "./notificator";

class Email extends Notificator {
	client() {
		const transporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			port: parseInt(process.env.MAIL_PORT),
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASSWORD,
			},
			secure: (process.env?.MAIL_SECURE ?? "true") === "true",
			tls: {
				rejectUnauthorized:
					(process.env?.MAIL_REJECT_UNAUTHORIZED ?? "true") ===
					"true",
			},
		});

		return transporter;
	}
	notify(subject, message, hostname, target) {
		this.client().sendMail({
			from: process.env.MAIL_FROM,
			to: target,
			subject: subject,
			text: subject,
			html: message,
		});
	}
}

const email = new Email();

export default email;
