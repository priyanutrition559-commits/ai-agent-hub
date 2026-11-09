# Stack Atlas by Guidesoft — branding, landing page and motion

## Runtime and data preservation

This repository is TanStack Start, not Next.js. It currently has nine bundled connector metadata records; no 46-tool database catalogue was found or recreated. Database-managed directories, generated schema/types, server functions, gateway code and existing navigation destinations are unchanged.

`/` remains the existing dashboard, now titled Ecosystem Control Panel in page metadata and its eyebrow. `/product` is the public Stack Atlas marketing landing page. CTAs link directly to `/`, `/explorer`, `/agents`, the existing docs and roadmap. No dashboard redirect or route migration was introduced.

## Brand assets

- `public/brand/guidesoft-logo.png`: original user-supplied PNG, copied unchanged.
- `public/brand/guidesoft-mark.png`: 256px display derivative retaining alpha transparency.
- `public/favicon.ico`: real multi-resolution ICO (16, 32, 48, 64, 128, 256px).
- `public/apple-touch-icon.png`: 180px derivative.
- `BrandLogo`: shared image component with explicit dimensions and accessible/decorative variants.

The supplied mark is used in the app header, above Stack Atlas in the desktop sidebar, and in the marketing header/footer/hero. TanStack root `head()` links the favicon and Apple icon. No Next.js layout or metadata API was added. `scripts/generate-brand-assets.py` reproduces assets with Pillow without modifying the original. Pillow is a local asset-tool dependency, not an application/runtime dependency.

## Hero and performance strategy

`EcosystemHero` is a deterministic low-poly SVG ecosystem sphere with a Motion perspective wrapper. No R3F/Three.js/WebGL runtime or canvas is required. Consequently, the high-fidelity SVG is already the renderer when WebGL is unavailable; there is no blank canvas or renderer-download delay. The same component upgrades the dashboard hero and the new public hero.

On desktop with fine hover input, at least 768px viewport, more than four reported CPU cores and more than 4GB reported memory (when those properties exist), pointer position drives spring-smoothed rotateX/rotateY values. Save-data, reduced-motion, hidden-document and offscreen states disable interaction. Mobile/coarse-pointer devices retain the static SVG. Pointer leave returns the graph to neutral. There is no continuous animation loop or per-frame React state update. SVG content is server-rendered and remains visible without JavaScript.

Transforms and opacity are used for movement. This reduces layout work but does **not** guarantee 60fps on every device. GPU compositing and frame rate depend on hardware/browser/load; no universal performance claim is made. Real-device profiling remains useful before introducing heavier scenes or perpetual effects.

## Other transitions

- Catalogue cards: `AnimatePresence` and spring position layout animations across search, sort, filters and pagination. Exiting links are removed from keyboard/accessibility navigation immediately. The existing catalogue and result counts are unchanged.
- Marketing tabs: scoped `layoutId` selected indicator and short panel opacity/translate transitions. Radix supplies arrow-key tab semantics; controls wait for hydration before accepting interaction.
- Marketing mobile drawer: Radix focus trapping, Escape/close handling and focus restoration, with Motion enter/exit transforms. Existing app sidebar links remain intact.
- Root `MotionConfig reducedMotion="user"`, explicit component reduced-motion handling, and the existing CSS media rule suppress spatial animation when requested.

## Verification

Eight new Playwright cases cover the supplied image, real favicon signature, CTA destination, pointer-responsive SVG, mobile/reduced-motion fallback, 2560px overflow, drawer focus containment/restoration, keyboard tabs, and light/dark axe checks. Existing catalogue, account, draft builder, keyboard and responsive tests remain in the suite. Final local verification: 127 unit/component/protocol tests passed; all 30 Chromium E2E tests passed; typecheck, lint and production build passed. Lint retains 13 pre-existing Fast Refresh warnings.

This branding pass does not connect providers, change permissions, deploy databases or enable agent execution. Marketing copy explicitly distinguishes available UI from pending production backend work. No fabricated testimonials, customers, live activity or tool-count claims were added.
