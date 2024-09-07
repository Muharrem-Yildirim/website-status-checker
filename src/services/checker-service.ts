import axios, { AxiosError, isAxiosError } from "axios";
import { LogTypes } from "../schemas/log";
import { log } from "./log-service";
import axiosRetry, { isRetryableError, isNetworkError } from "axios-retry";

const TIMEOUT = 10000;

axiosRetry(axios, {
	retries: 3,
	shouldResetTimeout: true,
	retryDelay: (retryCount) => retryCount * TIMEOUT,
	onRetry: async (retryCount, error) => {
		console.log(
			`Retrying... ${retryCount} time(s). Message: `,
			error.message,
			isAxiosError(error)
				? "Host is: " + (error as AxiosError).config.url
				: "Not axios error"
		);
	},
	retryCondition: (error) => {
		return (
			isRetryableError(error) ||
			isNetworkError(error) ||
			error.code === "ECONNABORTED"
		);
	},
});

export function ping(hosts) {
	for (const host of hosts) {
		host.updateOne({
			$where: {
				hostname: host.hostname,
			},
			$set: {
				lastCheck: new Date(),
			},
			$inc: {
				checkCount: 1,
			},
		}).then(() => {
			axios
				.get(`${host.protocol}://${host.hostname}`, {
					timeout: TIMEOUT,
					validateStatus: (status) => {
						return status < 500;
					},
				})
				.then(({ status }) => {
					console.log("Success, Status: ", status, host.hostname);
					log(host, LogTypes.SUCCESS, null);
				})
				.catch(async (error) => {
					log(host, LogTypes.ERROR, error.message);

					await host.updateOne({
						$where: {
							hostname: host.hostname,
						},
						$inc: {
							failedCheckCount: 1,
						},
					});
				});
		});
	}
}
