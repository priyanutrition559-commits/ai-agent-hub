import { createFileRoute } from "@tanstack/react-router";
import { AgentBuilder } from "@/features/agents/agent-builder";
export const Route = createFileRoute("/agents")({
  head: () => ({ meta: [{ title: "Design an agent | Technology Universe" }] }),
  component: AgentBuilder,
});
