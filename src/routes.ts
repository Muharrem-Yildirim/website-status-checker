import express, { Request } from "express";
import { validateData } from "./middleware/validation-middleware";
import { registerHostValidation } from "./zod/register-host-schema";
import Host, { Plan } from "./schemas/host";
import { StatusCodes } from "http-status-codes";
import expressBasicAuth from "express-basic-auth";
import {
	deleteHost,
	getHostById,
	getHosts,
	saveHost,
	updateHost,
} from "./services/host-api-service";
import { getStatistics } from "./services/statistics-api-service";
import http from "http";
import compression from "compression";

const app = express();
const apiRouter = express.Router();
const server = http.createServer(app);
const port = process.env.LISTEN_PORT || 3000;

export async function initRoutes() {
	server.keepAliveTimeout = 5000;
	server.headersTimeout = 10000;

	server.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});

	app.use(express.static("public"));
	app.use(express.json());
	app.use(compression());

	app.use("/api", apiRouter);

	apiRouter.use(
		expressBasicAuth({
			users: {
				[process.env.BASIC_AUTH_USERNAME]:
					process.env.BASIC_AUTH_PASSWORD,
			},
			unauthorizedResponse: () => {
				return {
					success: false,
					message: "Invalid credentials",
				};
			},
		})
	);

	apiRouter.get("/statistics", getStatistics);

	apiRouter.get("/hosts", getHosts);

	apiRouter.get("/hosts/:id", getHostById);

	apiRouter.post("/hosts", validateData(registerHostValidation), saveHost);

	apiRouter.put(
		"/hosts/:id",
		validateData(registerHostValidation),
		updateHost
	);

	apiRouter.delete("/hosts/:id", deleteHost);

	apiRouter.delete("/unregister-host/:hostname", (req: Request, res) => {
		console.log("Received request:", req.params);
		const { hostname, ownerIdentifier } = req.params;

		Host.findOneAndDelete({ hostname, ownerIdentifier })
			.then((host) => {
				if (!host) {
					return res.status(404).json({
						success: false,
						message: "Hostname not found.",
					});
				}

				res.status(StatusCodes.NO_CONTENT).json({});
			})
			.catch((err) => {
				res.status(500).json({
					success: false,
					message: "Error unregistering host.",
					details: err,
				});
			});
	});
}
