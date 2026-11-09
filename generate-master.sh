#!/usr/bin/env bash
# Safe adaptation of the supplied scaffold: validate existing code, never overwrite it.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
install=false
e2e=false
for arg in "$@"; do
  case "$arg" in
    --install) install=true ;;
    --e2e) e2e=true ;;
    *) printf 'Unknown option: %s\nUsage: ./generate-master.sh [--install] [--e2e]\n' "$arg" >&2; exit 2 ;;
  esac
done
printf '\nTechnology Universe — non-destructive validation\n'
command -v node >/dev/null || { echo 'Node 22+ is required.' >&2; exit 1; }
node -e 'if (Number(process.versions.node.split(".")[0]) < 22) process.exit(1)'
if "$install"; then
  command -v bun >/dev/null || { echo 'Install Bun 1.4.4 before using --install.' >&2; exit 1; }
  bun install --frozen-lockfile
fi
[[ -d node_modules ]] || { echo 'Dependencies missing. Run Bun 1.4.4 install --frozen-lockfile.' >&2; exit 1; }
# Preserve Tailwind v4 CSS, managed schema, generated types and secrets.
npm run typecheck
npm run lint
npm test
npm run build
if "$e2e"; then
  npm run test:e2e
else
  echo 'Browser checks NOT RUN; use --e2e with a provisioned Playwright browser.'
fi
printf '\nSelected checks passed. This is NOT a production-readiness certification.\n'
printf 'Managed schema, secret storage, provider authorization and execution workflows remain prerequisites.\n'
printf 'See DONE.md, PENDING_TASKS.md and docs/GATEWAY-SECURITY.md.\n'
