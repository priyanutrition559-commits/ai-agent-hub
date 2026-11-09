import { createFileRoute } from "@tanstack/react-router";
import { Directory } from "@/features/integrations/directory";
export const Route = createFileRoute("/integrations/")({
  head: () => ({ meta: [{ title: "Integrations | Technology Universe" }] }),
  component: Directory,
});
