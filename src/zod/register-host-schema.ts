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
      email: z.union([
        z.object({
          isActive: z.literal(true),
          target: z
            .string()
            .min(1, { message: "Email target is required." })
            .email({ message: "Please enter a valid email address." })
            .optional()
            .nullable()
            .default(null),
        }),
        z.object({
          isActive: z.literal(false),
          target: z.string().optional().nullable().default(null),
        }),
      ]),
      telegram: z.union([
        z.object({
          isActive: z.literal(true),
          target: z
            .string()
            .min(1, { message: "Telegram target is required." })
            .optional()
            .nullable()
            .default(null),
        }),
        z.object({
          isActive: z.literal(false),
          target: z.string().optional().nullable().default(null),
        }),
      ]),
    })
    .strict(),
  isActive: z.boolean().optional().default(false),
  protocol: z.enum(["http", "https"]),
});
