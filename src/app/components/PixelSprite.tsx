import type { Palette, SpriteRows } from "../lib/sprites";

interface PixelSpriteProps {
  rows: SpriteRows;
  palette: Palette;
  size: number; // rendered width in px; height follows the sprite's aspect ratio
  className?: string;
  label?: string; // set for meaningful images; omit for decoration
}

// Draws a character-grid sprite as crisp SVG pixels.
export function PixelSprite({ rows, palette, size, className = "", label }: PixelSpriteProps) {
  const w = rows[0].length;
  const h = rows.length;
  return (
    <svg
      width={size}
      height={(size * h) / w}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      className={`select-none ${label ? "" : "pointer-events-none"} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          palette[c] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={palette[c]} /> : null
        )
      )}
    </svg>
  );
}
