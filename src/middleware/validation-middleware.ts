import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

import { StatusCodes } from "http-status-codes";

export function validateData(schema: z.ZodObject<any, any>) {
  return async (
    req: Request & { validatedBody: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("request came", req.body);

      req.validatedBody = await schema.parse(req.body);

      console.log("validation success", req.validatedBody);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));

        console.log("validation error", errorMessages);

        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Invalid data",
          details: errorMessages,
        });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ success: false, error: "Internal Server Error" });
      }
    }
  };
}
