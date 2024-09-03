import z from "zod";

export const registerHostValidation = z.object({
  ownerIdentifier: z.string(),
  hostname: z
    .string()
    .regex(/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/, {
      message: "Please enter a valid hostname.",
    })
    .min(1, { message: "Hostname is required" }),
  notifyOptions: z
    .object({
      email: z.boolean().optional().default(false),
      telegram: z.boolean().optional().default(false),
    })
    .strict(),
  isActive: z.boolean().optional().default(false),
  protocol: z.enum(["http", "https"]),
});
