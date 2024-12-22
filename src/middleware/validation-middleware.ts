import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

import { StatusCodes } from "http-status-codes";
import { httpLogger } from "../lib/pino";

export function validateData(schema: z.ZodObject<any, any>) {
	return async (
		req: Request & { validatedBody: any },
		res: Response,
		next: NextFunction
	) => {
		try {
			req.validatedBody = await schema.parse(req.body);

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.errors.map((issue: any) => ({
					message: `${issue.path.join(".")} is ${issue.message}`,
				}));

				httpLogger.error({
					msg: `Validation error.`,
					details: errorMessages,
				});

				res.status(StatusCodes.BAD_REQUEST).json({
					success: false,
					error: "Invalid data",
					details: errorMessages,
				});
			} else {
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					success: false,
					error: "Internal Server Error",
				});
			}
		}
	};
}
