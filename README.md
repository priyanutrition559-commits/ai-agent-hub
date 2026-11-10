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

### Latest workspace continuation

See [Phases 1–10 status](docs/PHASES-1-10-STATUS.md) and [UX/component contracts](docs/UX-AND-COMPONENTS.md). The app now includes a refined light/dark workspace, Cmd/Ctrl+K navigation, progressive agent draft builder, password recovery screens, documentation and a transparent `/roadmap`. Production execution remains blocked pending the managed backend and secure worker.

### Safe master validation and gateway hardening

The supplied generation scaffold was adapted to the actual Tailwind v4 / managed-Lovable repository. Run `./generate-master.sh` for typecheck, lint, unit tests and production build; add `--e2e` with a provisioned Playwright browser. `--install` uses the frozen lockfile and requires Bun 1.4.4. No managed schema, tokens or configuration files are overwritten.

See [DONE.md](DONE.md), [PENDING_TASKS.md](PENDING_TASKS.md), and [gateway security boundaries](docs/GATEWAY-SECURITY.md). `Dockerfile.ci` validates the code in a Node container; it is not a production server image or a deployed worker.

### Stack Atlas branding and public landing page

The supplied Guidesoft mark now appears across the workspace, with real favicon/Apple icon derivatives. Visit `/product` for the public Stack Atlas landing page; `/` remains the existing Ecosystem Control Panel. The SVG-first Motion hero, animated catalogue layouts, keyboard-accessible tabs and mobile drawer honor reduced motion. See [branding and motion](docs/BRANDING-AND-MOTION.md) for implementation and fallback details. Existing TanStack runtime, routes and catalogue records are preserved.


## Repository maintenance

- Supplied brand mark: `public/brand-logo.svg` (favicon asset: `public/favicon.svg`).
- Automated dependency installation and available lint/typecheck/test/build checks: [ChatGPT Agent CI](.github/workflows/chatgpt-agent-ci.yml).
- Outstanding verification and project-specific work: [PENDING_TASKS.md](PENDING_TASKS.md).
- Lovable AI agents are not part of this maintenance workflow; use ChatGPT as the coordinating agent.
