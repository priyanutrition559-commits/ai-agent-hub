# AI Agent Hub

integrate ai agents

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0370c85b-8cd1-491f-97e7-2f73ad9ac7b6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Technology Universe integration foundation

Start with [the implementation audit](docs/IMPLEMENTATION-REPORT.md). This branch adds the navigable integration workspace and tested policy/SDK building blocks, **not a production-connected agent executor**. Live MCP actions remain blocked pending the Lovable-managed database and trusted execution gateway.

- [Architecture, threat model and runtime boundaries](docs/MCP-ARCHITECTURE.md)
- [Database / RLS handoff for Lovable](docs/DATABASE-HANDOFF.md)
- [Local setup and operator runbook](docs/OPERATOR-RUNBOOK.md)

Use `bun install --frozen-lockfile`, then `bun run dev -- --host 0.0.0.0`.
