import z from "zod";

export const registerHostValidation = z.object({
  hostname: z.string(),
  notifyOptions: z
    .object({
      mail: z.boolean().optional().default(false),
      telegram: z.boolean().optional().default(false),
    })
    .strict(),
});
