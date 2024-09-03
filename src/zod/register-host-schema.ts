import z from "zod";

export const registerHostValidation = z.object({
  ownerIdentifier: z.string(),
  hostname: z.string().min(1),
  notifyOptions: z
    .object({
      email: z.boolean().optional().default(false),
      telegram: z.boolean().optional().default(false),
    })
    .strict(),
  isActive: z.boolean().optional().default(false),
  protocol: z.enum(["http", "https"]),
});
