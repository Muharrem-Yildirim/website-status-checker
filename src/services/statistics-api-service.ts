import Host from "../schemas/host";

const getStatistics = async (
	req: Request & { query: { filter?: string } },
	res
) => {
	const filter = JSON.parse((req.query?.filter as string) ?? "{}");

	const totalHosts = await Host.find(filter).countDocuments();
	var totalChecks = 0;
	var totalFailedChecks = 0;

	try {
		totalChecks =
			(
				await Host.aggregate([
					{
						$match: filter,
					},
					{
						$group: {
							_id: null,
							checkCount: { $sum: "$checkCount" },
						},
					},
				])
			)[0]?.checkCount ?? 0;
	} catch (err) {
		console.log(err);
	}

	try {
		totalFailedChecks =
			(
				await Host.aggregate([
					{
						$match: filter,
					},
					{
						$group: {
							_id: null,
							failedCheckCount: { $sum: "$failedCheckCount" },
						},
					},
				])
			)[0]?.failedCheckCount ?? 0;
	} catch (err) {
		console.log(err);
	}

	return res.json({
		success: true,
		data: {
			totalHosts,
			totalChecks,
			totalFailedChecks,
		},
	});
};

export { getStatistics };
