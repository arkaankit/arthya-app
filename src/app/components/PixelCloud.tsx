// 8-bit cloud sprite (Obscura decoration). o = outline, w = fill, m = shade, . = empty.
const SPRITE = [
  "......oooo........",
  ".....owwwwo.ooo...",
  "...oowwwwwwowwwoo.",
  "..owwwwwwwwwwwwwwo",
  ".owwwwwwwwwwwwwwmo",
  "owwwwwwwwwwwwwwmmo",
  "ommwwwwwwwwwwmmmmo",
  ".ommmmmmmmmmmmmmo.",
  "..oooooooooooooo..",
];

const FILL: Record<string, string> = {
  o: "var(--cloud-outline)",
  w: "var(--cloud-fill)",
  m: "var(--cloud-shade)",
};

export function PixelCloud({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={(size * SPRITE.length) / SPRITE[0].length}
      viewBox={`0 0 ${SPRITE[0].length} ${SPRITE.length}`}
      shapeRendering="crispEdges"
      className={`pointer-events-none select-none ${className}`}
    >
      {SPRITE.flatMap((row, y) =>
        [...row].map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={FILL[c]} />))
      )}
    </svg>
  );
}
