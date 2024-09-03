import express, { Request } from "express";
import { validateData } from "./middleware/validation-middleware";
import { registerHostValidation } from "./zod/register-host-schema";
import Website from "./schemas/website";
import { StatusCodes } from "http-status-codes";
import expressBasicAuth from "express-basic-auth";
import Log from "./schemas/log";
import { SortOrder } from "mongoose";

const app = express();
const apiRouter = express.Router();

export async function initRoutes() {
  app.listen(3000, () => {
    console.log(`Server listening on port ${3000}`);
  });

  app.use(express.static("public"));
  app.use(express.json());

  app.use("/api", apiRouter);

  apiRouter.use(
    expressBasicAuth({
      users: {
        [process.env.BASIC_AUTH_USERNAME]: process.env.BASIC_AUTH_PASSWORD,
      },
      unauthorizedResponse: () => {
        return {
          success: false,
          message: "Invalid credentials",
        };
      },
    })
  );

  apiRouter.get("/uptime-history", async (req: Request, res) => {
    const filter = JSON.parse((req.query?.filter as string) ?? "{}");
    const ownerIdentifier = (req.query?.ownerIdentifier as string) ?? "";
    const limit = parseInt((req.query?.limit as string) ?? "120");
    const sort = { createdAt: -1 };
    const skip = parseInt((req.query?.skip as string) ?? "0");

    const result = await Log.aggregate([
      {
        $match: {
          ...filter,
        },
      },
      {
        $lookup: {
          from: "websites",
          localField: "website",
          foreignField: "_id",
          as: "website",
        },
      },
      {
        $unwind: "$website",
      },
      // {
      //   $match: {
      //     "website.ownerIdentifier": ownerIdentifier,
      //   },
      // },
      {
        $sort: sort as any,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return res.json({
      success: true,
      data: result,
    });
  });

  apiRouter.get("/statistics", async (req: Request, res) => {
    const filter = JSON.parse((req.query?.filter as string) ?? "{}");

    const totalHosts = await Website.find(filter).countDocuments();
    var totalChecks = 0;
    var totalFailedChecks = 0;

    try {
      totalChecks =
        (
          await Website.aggregate([
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
      //
      console.log(err);
    }

    try {
      totalFailedChecks =
        (
          await Website.aggregate([
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
      //
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
  });

  apiRouter.get("/hosts", (req: Request, res) => {
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
  });

  apiRouter.get("/hosts/:id", (req: Request, res) => {
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
  });

  apiRouter.post(
    "/hosts",
    validateData(registerHostValidation),
    (req: Request & { validatedBody: any }, res) => {
      console.log("Received request:", req.body);
      const { hostname, ownerIdentifier } = req.validatedBody;

      Website.findOneAndUpdate(
        { hostname, ownerIdentifier },
        { ...req.validatedBody },
        {
          upsert: true,
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
          res.status(500).json({
            success: false,
            message: "Error registering host.",
            details: err,
          });
        });
    }
  );

  apiRouter.delete("/hosts/:id", (req: Request, res) => {
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
  });

  apiRouter.delete("/unregister-host/:hostname", (req: Request, res) => {
    console.log("Received request:", req.params);
    const { hostname, ownerIdentifier } = req.params;

    Website.findOneAndDelete({ hostname, ownerIdentifier })
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
  });
}
