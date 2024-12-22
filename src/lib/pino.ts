import pino from "pino";
import path from "path";
import fs from "fs";
import rotatingFileStream from "pino-rotating-file-stream";

const getLogDir = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return path.resolve("./logs", `${year}-${month}-${day}`);
};

const ensureLogDirExists = (logDir: string) => {
	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir, { recursive: true });
	}
};

const createLogger = (channel: string) => {
	const logDir = getLogDir();
	ensureLogDirExists(logDir);

	const transport = pino.transport({
		targets: [
			{
				target: "pino-rotating-file-stream",
				options: {
					path: logDir,
					filename: `${channel}.log`,
					size: "100M",
					maxSize: "1G",
					compress: true,
				},
				level: "info",
			},
			{
				target: "pino-pretty",
				options: {
					colorize: true,
				},
			},
		],
	});

	return pino(
		{
			level: process.env.PINO_LOG_LEVEL || "info",
			timestamp: pino.stdTimeFunctions.isoTime,
			base: { channel },
		},
		transport
	);
};

export const mainLogger = createLogger("main");
export const httpLogger = createLogger("http");
export const notifyLogger = createLogger("notify");
export const checkerLogger = createLogger("checker");

export default mainLogger;
