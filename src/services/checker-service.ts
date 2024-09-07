import axios from "axios";
import { LogTypes } from "../schemas/log";
import { log } from "./log-service";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
	retries: 3,
	retryDelay: (retryCount) => retryCount * 1000,
	onRetry: (retryCount, error) => {
		console.log(
			`Retrying... ${retryCount} time(s). Message: `,
			error.message
		);
	},
	retryCondition: () => true,
});

export async function ping(hosts) {
	for await (const host of hosts) {
		axios
			.get(`${host.protocol}://${host.hostname}`, {
				timeout: 5000,
			})
			.then(() => {
				log(
					host,
					LogTypes.INFO,
					`Successfully connected to ${host.hostname}.`
				);
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
