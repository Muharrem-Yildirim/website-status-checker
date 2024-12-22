import axios, { AxiosError, isAxiosError } from "axios";
import { LogTypes } from "../schemas/log";
import { log } from "./log-service";
import axiosRetry, { isRetryableError, isNetworkError } from "axios-retry";
import { checkerLogger } from "../lib/pino";

const TIMEOUT = 10000;

axiosRetry(axios, {
	retries: 3,
	shouldResetTimeout: true,
	retryDelay: (retryCount) => retryCount * TIMEOUT,
	onRetry: async (retryCount, error) => {
		const errorDetail = isAxiosError(error)
			? "Host is: " + (error as AxiosError).config.url
			: "Not axios error";

		checkerLogger.info({
			msg: "Retrying... ",
			details: error.stack,
			times: retryCount,
			errorDetail,
		});
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
					checkerLogger.info({
						msg: "Successfully connected",
						status,
						host,
					});

					log(host, LogTypes.SUCCESS, null);
				})
				.catch(async (error) => {
					log(host, LogTypes.ERROR, error.message);

					checkerLogger.error({
						msg: "Error while connecting",
						error,
						host,
					});

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
