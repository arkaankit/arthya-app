import { useData } from "../lib/data-context";
import { levelInfo, unlocksFor } from "../lib/game";
import { CREATURES, playerSprite } from "../lib/sprites";
import { PixelSprite } from "./PixelSprite";

// The player's creature wearing everything their level has unlocked. Calm mode shows the plain creature.
export function PlayerAvatar({ size, className = "" }: { size: number; className?: string }) {
  const { game, xp } = useData();
  if (!game.player) return null;
  const unlocks = game.calm ? [] : unlocksFor(levelInfo(xp).level);
  const sprite = playerSprite(game.player.creature, game.player.color, unlocks);
  const label = CREATURES.find(c => c.id === game.player!.creature)?.label ?? "Player";
  return <PixelSprite rows={sprite.rows} palette={sprite.palette} size={size} className={className} label={`${label} avatar`} />;
}
