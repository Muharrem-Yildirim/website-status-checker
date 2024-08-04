import express, { Request } from "express";
import { validateData } from "./middleware/validation-middleware";
import { registerHostValidation } from "./zod/register-host-schema";
import Website from "./schemas/website";

const app = express();

export async function initRoutes() {
  app.listen(3000, () => {
    console.log(`Server listening on port ${3000}`);
  });

  app.use(express.static("public"));
  app.use(express.json());

  app.post(
    "/api/register-host",
    validateData(registerHostValidation),
    (req: Request, res) => {
      console.log("Received request:", req.body);
      const { hostname } = req.body;

      Website.findOneAndUpdate(
        { hostname },
        { hostname },
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
}
