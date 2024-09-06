import axios from "axios";
import { LogTypes } from "../schemas/log";
import { log } from "./log-service";

export async function ping(hosts) {
	for await (const host of hosts) {
		axios
			.get(`${host.protocol}://${host.hostname}`, {
				timeout: 5000,
			})
			.then((res) => {
				if (res.ok) {
					log(
						host,
						LogTypes.INFO,
						`Successfully connected to ${host.hostname}.`
					);
				} else {
					log(
						host,
						LogTypes.ERROR,
						`Error while connecting to ${host.hostname}, response code is [${res.status} ${res.statusText}].`
					);
				}
			})
			.catch(async (error) => {
				log(
					host,
					LogTypes.ERROR,
					`Error while connecting to ${host.hostname}, message is [${error.message}].`
				);

				await host.updateOne({
					$where: {
						hostname: host.hostname,
					},
					$set: {
						lastCheck: new Date(),
					},
					$inc: {
						failedCheckCount: 1,
					},
				});
			})
			.finally(async () => {
				await host.updateOne({
					$where: {
						hostname: host.hostname,
					},
					$set: {
						lastCheck: new Date(),
					},
					$inc: {
						checkCount: 1,
					},
				});
			});
	}
}
