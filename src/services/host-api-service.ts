import { StatusCodes } from "http-status-codes";
import Host, { Plan } from "../schemas/host";

const getHosts = (
	req: Request & {
		query: { ownerIdentifier?: string; page?: string; limit?: string };
	},
	res
) => {
	const ownerIdentifier = (req.query?.ownerIdentifier as string) || "";
	const _page = parseInt(req.query?.page as string) || 1;
	let _limit = parseInt(req.query?.limit as string) || 120;

	if (_limit > 120) _limit = 120;

	const _skip = (_page - 1) * _limit;

	let filter: { ownerIdentifier?: string } = {};

	if (ownerIdentifier !== "") filter = { ownerIdentifier };

	Host.find(filter, {}, { skip: _skip, limit: _limit })
		.populate({
			path: "logs",
			options: { sort: { createdAt: -1 }, limit: 120 },
		})
		.then((hosts) => {
			res.json({
				success: true,
				data: hosts,
			});
		})
		.catch((err) => {
			res.status(500).json({
				success: false,
				message: "Error fetching hosts.",
				details: err,
			});
		});
};

const getHostById = (
	req: Request & {
		query: { ownerIdentifier?: string; page?: string; limit?: string };
		params: { id: string };
	},
	res
) => {
	const ownerIdentifier = req.query?.ownerIdentifier;
	const _page = parseInt(req.query?.page as string) || 1;
	let _limit = parseInt(req.query?.limit as string) || 120;

	if (_limit > 120) _limit = 120;

	const _skip = (_page - 1) * _limit;

	let filter: { _id: string; ownerIdentifier?: string } = {
		_id: req.params.id,
	};
	if (ownerIdentifier) filter = { ownerIdentifier, _id: req.params.id };

	Host.findOne(filter)
		.populate({
			path: "logs",
			options: {
				sort: { createdAt: -1 },
				skip: _skip,
				limit: _limit,
			},
		})

		.then((host) => {
			if (!host) throw new Error("Host not found");

			res.json({
				success: true,
				data: host,
			});
		})
		.catch((err) => {
			res.status(500).json({
				success: false,
				message: "Error fetching host.",
				details: err,
			});
		});
};

const saveHost = async (
	req: Request & { validatedBody: any; query: { ownerIdentifier?: string } },
	res
) => {
	console.log("Received request:", req.body);
	const { hostname, ownerIdentifier, plan } = req.validatedBody;

	console.log(req.validatedBody);

	const isAlreadyExists = await Host.findOne({
		ownerIdentifier,
		hostname,
	});

	if (isAlreadyExists) {
		return res.status(403).json({
			success: false,
			message: "Host already exists.",
		});
	}

	var limit = 5;

	if (plan == Plan.PAID) {
		limit = 25;
	}

	const count = await Host.countDocuments({
		ownerIdentifier,
	});

	if (count >= limit) {
		return res.status(403).json({
			success: false,
			message: "You have reached the limit of hosts.",
		});
	}

	Host.create({ ...req.validatedBody })
		.then((data) => {
			res.json({
				success: true,
				message: `Successfully registered ${hostname}.`,
				data,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				success: false,
				message: "Error registering host.",
				details: err.message,
			});
		});
};

const updateHost = async (
	req: Request & { validatedBody: any; params: { id: string } },
	res
) => {
	console.log("Received request:", req.body);
	const { hostname, ownerIdentifier } = req.validatedBody;
	const { id } = req.params;

	Host.updateOne(
		{ ownerIdentifier, _id: id },
		{ ...req.validatedBody },
		{
			returnDocument: "after",
		}
	)
		.then((data) => {
			res.json({
				success: true,
				message: `Successfully registered ${hostname}.`,
				data,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				success: false,
				message:
					err.code === 11000
						? "Host already exists."
						: "Error registering host.",
				details: err,
			});
		});
};

const deleteHost = (
	req: Request & {
		query: { ownerIdentifier?: string };
		params: { id: string };
	},
	res
) => {
	const ownerIdentifier = (req.query?.ownerIdentifier as string) ?? "";
	const { id } = req.params;

	Host.findOneAndDelete({ ownerIdentifier, _id: id })
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
};

export { getHosts, getHostById, saveHost, updateHost, deleteHost };
