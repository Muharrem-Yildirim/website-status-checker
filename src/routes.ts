import express, { Request } from "express";
import { validateData } from "./middleware/validation-middleware";
import { registerHostValidation } from "./zod/register-host-schema";
import Website from "./schemas/website";
import { StatusCodes } from "http-status-codes";
import expressBasicAuth from "express-basic-auth";

const APP = express();
const API_ROUTER = express.Router();

export async function initRoutes() {
  APP.listen(3000, () => {
    console.log(`Server listening on port ${3000}`);
  });

  APP.use(express.static("public"));
  APP.use(express.json());

  APP.use("/api", API_ROUTER);

  API_ROUTER.use(
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

  API_ROUTER.get("/hosts", (req: Request, res) => {
    Website.find({}).then((websites) => {
      res.json({
        success: true,
        data: websites,
      });
    });
  });

  API_ROUTER.post(
    "/register-host",
    validateData(registerHostValidation),
    (req: Request, res) => {
      console.log("Received request:", req.body);
      const { hostname, notifyOptions } = req.body;

      Website.findOneAndUpdate(
        { hostname },
        { hostname, notifyOptions },
        {
          upsert: true,
        }
      )
        .then(() => {
          res.json({
            success: true,
            message: `Successfully registered ${hostname}.`,
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

  API_ROUTER.delete("/unregister-host/:hostname", (req: Request, res) => {
    console.log("Received request:", req.params);
    const { hostname } = req.params;

    Website.findOneAndDelete({ hostname })
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
