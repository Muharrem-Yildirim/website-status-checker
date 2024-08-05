import z from "zod";

export const registerHostValidation = z.object({
  hostname: z.string(),
});
