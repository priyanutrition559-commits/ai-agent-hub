# Workspace UX and reusable component contract

## Visual language

Warm off-white surfaces, forest accents, restrained borders/elevation and a coordinated dark theme extend the existing Tailwind/shadcn tokens. No replacement GS logo, external brand image or remote font is invented. The current mark is the existing generic workflow icon. The hero workflow is a labelled illustration, not execution telemetry.

CSS tokens remain in `src/styles.css`. `surface-card`, `hero-wash` and `eyebrow` define shared visual treatments. Existing reduced-motion CSS is retained. Focus styles are visible and content remains readable without motion or canvas. Decorative 3D/canvas and glass effects were not introduced: they are not required for the functional workflow and need a separate performance/accessibility review.

## Reusable components

| Component | Contract |
|---|---|
| AppShell | Shared navigation, footer, skip link, responsive layout, theme and command entry point. Never authorizes requests. |
| PageHeader | One page heading, supporting description, optional actions. |
| StatusBadge | Text-based availability state; never infers a live connection from catalogue presence. |
| ConnectorCard | Metadata-only provider detail link; typography placeholders instead of unverified logos. |
| EmptyState | Explicit absence of results with an optional safe recovery action. |
| Pagination | Bounded result navigation, accessible disabled previous/next actions. |
| CommandPalette | Cmd/Ctrl+K and button trigger; static internal routes/catalogue/guides only. No arbitrary URL, model call, tool invocation or remote search. |
| WorkflowPreview | Draft name/model/limits and illustrative permission gates. Does not simulate execution or diagnostic logs. |
| PasswordResetRequest | Same-origin recovery target, duplicate-submit lock, provider-safe errors and generic accepted response. |
| PasswordRecovery | Recovery event required, fresh provider user verification, password validation, update and global sign-out attempt. |

## Agent builder

Purpose → Boundaries → Review. Inputs survive step changes within the mounted form. Instructions are progressively disclosed with a native details element. Steps are labelled navigation, not tab widgets. Number indicators are decorative so accessible button names remain stable. Inline errors use stable field names plus associated descriptions. Final validation is authoritative regardless of step navigation. A busy lock prevents duplicate validation submissions.

This is not a multi-node orchestration engine. No tool selection, drag-to-connect graph, persistence, LLM calls, runs, approvals or execution diagnostics are fabricated. Current validation handlers still return configuration-required after authentication.

## Auth deployment prerequisites

Configure each real deployment origin and `/account/recovery` redirect in the authentication provider. Validate email templates/delivery in staging. No callback allows a user-supplied external return URL. Opening the recovery page alone does not enable password changes; a normal sign-in event does not activate recovery. Reloading after a consumed recovery event may require a new email link. A successful password update and a failed session-revocation attempt are reported separately.

Provider rate limits, live email acceptance, token expiry behavior and multi-device session revocation must still be verified. Unit tests use mocks and do not prove a configured mail service or production authentication.

## Button/action audit for new surfaces

- Palette opens/closes, filters locally and navigates to fixed known routes; Escape restores focus.
- Directory filters, sort, reset and pagination alter real bundled results. Search is not represented as database search.
- Documentation search and section anchors navigate real bundled content.
- Roadmap filter changes the visible versioned checklist, not deployment state.
- Agent steps preserve in-memory input and enforce schema validation. Test run stays disabled with a visible backend prerequisite.
- Recovery calls real configured Supabase auth APIs. Missing/failed configuration never produces fake success.
- No commerce, role-assignment or irreversible external action controls were added without a backend.

## Test coverage and limits

Playwright includes 360/768/1440px overflow checks; dark/light axe WCAG 2 A/AA and 2.1 AA scans on eight new routes; all three agent steps; the command-palette empty state; keyboard open/select/close/focus restoration; reduced motion; hydration controls; catalogue pagination; docs; and roadmap filtering. All are Chromium tests. Manual screen-reader review, visual zoom/touch validation and additional browser engines remain pending. Passing automated axe checks is not an accessibility certification.
