import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";

const nodes = Array.from({ length: 24 }, (_, i) => {
  const y = 1 - (i / 23) * 2;
  const radius = Math.sqrt(1 - y * y);
  const angle = i * Math.PI * (3 - Math.sqrt(5));
  return { x: 250 + Math.cos(angle) * radius * 172, y: 250 + y * 172, z: Math.sin(angle) * radius };
});
const edges = nodes.flatMap((node, i) =>
  nodes
    .map((other, j) => ({
      i,
      j,
      distance: Math.hypot(node.x - other.x, node.y - other.y, (node.z - other.z) * 172),
    }))
    .filter((edge) => edge.j > edge.i && edge.distance < 145),
);

/** SVG-first 3D scene: no WebGL dependency, renderer download, or idle animation loop. */
export function EcosystemHero() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const reduced = useReducedMotion();
  const [capable, setCapable] = useState(false);
  const id = useId().replace(/:/g, "");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 95, damping: 22, mass: 0.7 });
  const rotateY = useSpring(y, { stiffness: 95, damping: 22, mass: 0.7 });
  useEffect(() => {
    const media = matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    const hardware = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const sync = () =>
      setCapable(
        media.matches &&
          !document.hidden &&
          !hardware.connection?.saveData &&
          (hardware.deviceMemory === undefined || hardware.deviceMemory > 4) &&
          (hardware.hardwareConcurrency === undefined || hardware.hardwareConcurrency > 4),
      );
    sync();
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const interactive = capable && visible && !reduced;
  useEffect(() => {
    if (!interactive) {
      x.set(0);
      y.set(0);
    }
  }, [interactive, x, y]);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!interactive) return;
    const box = event.currentTarget.getBoundingClientRect();
    x.set(-((event.clientY - box.top) / box.height - 0.5) * 14);
    y.set(((event.clientX - box.left) / box.width - 0.5) * 18);
  }
  return (
    <figure className="min-w-0">
      <div
        ref={ref}
        data-testid="ecosystem-scene"
        data-renderer="svg"
        data-interactive={interactive ? "true" : "false"}
        className="ecosystem-scene relative mx-auto aspect-square w-full max-w-[530px]"
        onPointerMove={move}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={{ perspective: 1000 }}
      >
        <div
          className="absolute inset-[15%] rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <motion.div
          className="relative size-full"
          style={{
            rotateX: interactive ? rotateX : 0,
            rotateY: interactive ? rotateY : 0,
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox="0 0 500 500"
            className="size-full overflow-visible"
            role="img"
            aria-labelledby={`${id}-title ${id}-desc`}
          >
            <title id={`${id}-title`}>A connected technology ecosystem</title>
            <desc id={`${id}-desc`}>
              An illustrative low-poly network surrounds the Guidesoft brand mark. This is not a
              live connection map.
            </desc>
            <defs>
              <radialGradient id={`${id}-glow`}>
                <stop offset="0" stopColor="currentColor" stopOpacity=".12" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g className="text-primary">
              <circle cx="250" cy="250" r="215" fill={`url(#${id}-glow)`} />
              <ellipse
                cx="250"
                cy="250"
                rx="218"
                ry="78"
                transform="rotate(-24 250 250)"
                fill="none"
                stroke="currentColor"
                strokeOpacity=".16"
                strokeDasharray="3 6"
              />
              <ellipse
                cx="250"
                cy="250"
                rx="202"
                ry="128"
                transform="rotate(42 250 250)"
                fill="none"
                stroke="currentColor"
                strokeOpacity=".14"
              />
              {edges.map(({ i, j }) => (
                <line
                  key={`${i}-${j}`}
                  x1={nodes[i]!.x}
                  y1={nodes[i]!.y}
                  x2={nodes[j]!.x}
                  y2={nodes[j]!.y}
                  stroke="currentColor"
                  strokeWidth=".8"
                  strokeOpacity={nodes[i]!.z > 0 ? 0.32 : 0.12}
                />
              ))}
              {nodes.map((node, i) => (
                <g key={i}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.z > 0 ? 8 : 5}
                    fill="currentColor"
                    opacity=".08"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.z > 0 ? 3.5 : 2}
                    fill="currentColor"
                    opacity={node.z > 0 ? 0.8 : 0.35}
                  />
                </g>
              ))}
            </g>
            <circle cx="250" cy="250" r="64" fill="var(--card)" stroke="var(--border)" />
            <image href="/brand/guidesoft-mark.png" x="205" y="205" width="90" height="90" />
            <g fontFamily="ui-monospace, monospace" fontSize="9" fill="var(--muted-foreground)">
              <text x="40" y="82">
                01 / DISCOVER
              </text>
              <text x="350" y="124">
                02 / DESIGN
              </text>
              <text x="305" y="435">
                03 / CONTROL
              </text>
              <text x="38" y="368">
                PERMISSION FIRST
              </text>
            </g>
          </svg>
        </motion.div>
        <span className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border bg-card/80 px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-sm">
          Ecosystem illustration · not live telemetry
        </span>
      </div>
      <figcaption className="sr-only">
        Pointer-responsive on capable desktops. Static on mobile, reduced-motion and low-resource
        devices; works without WebGL.
      </figcaption>
    </figure>
  );
}
