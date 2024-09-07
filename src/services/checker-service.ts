import axios, { AxiosError, isAxiosError } from "axios";
import { LogTypes } from "../schemas/log";
import { log } from "./log-service";
import axiosRetry, { isNetworkError } from "axios-retry";

const TIMEOUT = 10000;

axiosRetry(axios, {
	retries: 3,
	shouldResetTimeout: true,
	retryDelay: (retryCount) => retryCount * TIMEOUT,
	onRetry: (retryCount, error) => {
		console.log(
			`Retrying... ${retryCount} time(s). Message: `,
			error.message,
			isAxiosError(error)
				? "Host is: " + (error as AxiosError).config.url
				: "Not axios error"
		);
	},
	retryCondition: (error) => {
		return isNetworkError(error) || error.response?.status >= 500;
	},
});

export function ping(hosts) {
	for (const host of hosts) {
		axios
			.get(`${host.protocol}://${host.hostname}`, {
				timeout: TIMEOUT,
				validateStatus: function (status) {
					return status < 500;
				},
			})
			.then(() => {
				log(host, LogTypes.SUCCESS, null);
			})
			.catch(async (error) => {
				log(host, LogTypes.ERROR, error.message);

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
