import { z } from "zod";
export const recoveryEmailSchema = z.string().trim().email().max(254);
export const passwordUpdateSchema = z
  .object({
    password: z
      .string()
      .min(12, "Use at least 12 characters.")
      .max(128, "Use no more than 128 characters."),
    confirmation: z.string(),
  })
  .refine((data) => data.password === data.confirmation, {
    path: ["confirmation"],
    message: "Passwords must match.",
  });
export function recoveryRedirect(origin: string) {
  const url = new URL(origin);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
    throw new Error("Invalid application origin.");
  // No caller-supplied return URL; the target is always this app's recovery route.
  return new URL("/account/recovery", url.origin).href;
}
