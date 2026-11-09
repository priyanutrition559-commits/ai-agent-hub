import { createFileRoute } from "@tanstack/react-router";
import { PasswordRecovery } from "@/features/auth/password-recovery";
export const Route = createFileRoute("/account/recovery")({
  head: () => ({
    meta: [
      { title: "Set a new password | Technology Universe" },
      { name: "robots", content: "noindex" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: PasswordRecovery,
});
