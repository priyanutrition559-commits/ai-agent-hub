import { createFileRoute } from "@tanstack/react-router";
import { Directory } from "@/features/integrations/directory";
export const Route = createFileRoute("/explorer")({
  head: () => ({ meta: [{ title: "Technology Explorer | Technology Universe" }] }),
  component: () => <Directory explorer />,
});
