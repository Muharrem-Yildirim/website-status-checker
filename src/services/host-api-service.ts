import { StatusCodes } from "http-status-codes";
import Website, { Plan } from "../schemas/website";

const getHosts = (req: Request & { query: { filter?: string } }, res) => {
  const filter = JSON.parse((req.query?.filter as string) ?? "{}");

  Website.find(filter)
    .populate({
      path: "logs",
      options: { sort: { createdAt: -1 }, limit: 120 },
    })
    .then((websites) => {
      res.json({
        success: true,
        data: websites,
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
    query: { ownerIdentifier?: string };
    params: { id: string };
  },
  res
) => {
  const ownerIdentifier = (req.query?.ownerIdentifier as string) ?? "";

  Website.findOne({ ownerIdentifier, _id: req.params.id })
    .populate({
      path: "logs",
      options: { sort: { createdAt: -1 }, limit: 120 },
    })

    .then((website) => {
      if (!website) throw new Error("Website not found");

      res.json({
        success: true,
        data: website,
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

const saveHost = async (
  req: Request & { validatedBody: any; query: { ownerIdentifier?: string } },
  res
) => {
  console.log("Received request:", req.body);
  const { hostname, ownerIdentifier, plan } = req.validatedBody;

  const isAlreadyExists = await Website.findOne({
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

  const count = await Website.countDocuments({
    ownerIdentifier,
  });

  if (count >= limit) {
    return res.status(403).json({
      success: false,
      message: "You have reached the limit of hosts.",
    });
  }

  Website.create({ ...req.validatedBody })
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

  Website.updateOne(
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

  Website.findOneAndDelete({ ownerIdentifier, _id: id })
    .then((website) => {
      if (!website) {
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
