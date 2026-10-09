import { Check } from "lucide-react";
import { useData } from "../lib/data-context";
import { BADGES, badgeProgress, crystalState, levelInfo, UNLOCKS } from "../lib/game";
import { BADGE_LOCKED, BADGE_SPRITES, CLOUD, CLOUD_PALETTE, CRYSTAL, CRYSTAL_BY_STATE } from "../lib/sprites";
import { PixelSprite } from "./PixelSprite";
import { PlayerAvatar } from "./PlayerAvatar";
import { savedAgo } from "./SaveLoadView";

// Player profile: avatar with unlocks, level, active quests, badges and the Calm mode switch.
export function ProfileView({ onOpenSaves }: { onOpenSaves: () => void }) {
  const { game, xp, quests, badgeFacts, setCalm, profile } = useData();
  const { level, title, floor, next } = levelInfo(xp);
  const nextUnlock = UNLOCKS.find(u => u.level > level);
  const crystal = crystalState(game.saves);
  const calm = game.calm;
  const scene = !calm && level >= 4;
  const name = game.player?.name || profile?.name || "Player";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="page-title">Profile</h2>
        <button
          onClick={onOpenSaves}
          className="h-11 flex items-center gap-2 rounded-md border border-border bg-card px-3 text-[13px] font-semibold hover:bg-secondary"
        >
          <PixelSprite rows={CRYSTAL} palette={CRYSTAL_BY_STATE[crystal.state]} size={20} />
          {savedAgo(crystal.days)}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[340px_minmax(0,1fr)_minmax(0,1fr)] gap-4 sm:gap-6 items-start">
        <div className="md:col-span-2 lg:col-span-1 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] lg:grid-cols-1 gap-4 sm:gap-6">
          <div className="bg-card border border-border rounded-2xl shadow-card p-4 sm:p-6 flex lg:flex-col items-center gap-4 lg:text-center">
            <div className="relative overflow-hidden shrink-0 w-24 h-24 sm:w-[120px] sm:h-[120px] lg:w-[168px] lg:h-[168px] rounded-xl bg-secondary flex items-end justify-center">
              {scene && (
                <>
                  <PixelSprite rows={CLOUD} palette={CLOUD_PALETTE} size={36} className="absolute left-1 top-2 opacity-90" />
                  <PixelSprite rows={CLOUD} palette={CLOUD_PALETTE} size={26} className="absolute right-1 top-6 opacity-90" />
                </>
              )}
              {game.player ? (
                <PlayerAvatar size={84} className="relative mb-1 sm:w-[100px] sm:h-auto lg:w-[140px]" />
              ) : (
                <span className="self-center text-xs text-muted-foreground px-2">Create a player in Settings → Replay setup</span>
              )}
            </div>
            <div className="min-w-0 flex-1 w-full flex flex-col gap-1.5">
              <span className="text-lg font-bold">{name}</span>
              {calm ? (
                <span className="text-[13px] text-muted-foreground">Calm mode is on. XP, quests and badges are hidden; progress is still kept.</span>
              ) : (
                <>
                  <span className="text-[13px] font-semibold text-orange-600 dark:text-orange-400">Level {level} · {title}</span>
                  <div className="h-2.5 rounded-sm bg-secondary overflow-hidden" role="progressbar" aria-label="XP to next level" aria-valuemin={floor} aria-valuemax={next} aria-valuenow={xp}>
                    <div className="h-full bg-orange-500" style={{ width: `${Math.round(((xp - floor) / (next - floor)) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{xp} XP · {next - xp} XP to level {level + 1}</span>
                  {nextUnlock && <span className="text-xs text-muted-foreground">Next unlock at level {nextUnlock.level}: {nextUnlock.label.toLowerCase()}</span>}
                </>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p id="calm-label" className="text-sm font-bold">Calm mode</p>
              <p className="text-xs text-muted-foreground">Hide XP, quests and badges. Your money data is unchanged.</p>
            </div>
            <button
              role="switch"
              aria-checked={calm}
              aria-labelledby="calm-label"
              onClick={() => setCalm(!calm)}
              className={`shrink-0 w-[52px] h-8 rounded-md p-[3px] flex transition-colors ${calm ? "bg-orange-500 justify-end" : "bg-border justify-start"}`}
            >
              <span className="block w-[26px] h-[26px] rounded bg-white" />
            </button>
          </div>
        </div>

        {!calm && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-bold">Active quests</h3>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </span>
            </div>
            {quests.map(q => (
              <div key={q.id} className="bg-card border border-border rounded-xl px-3.5 py-3 flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-sm font-bold">{q.title}</span>
                    <span className="text-xs text-muted-foreground">{q.detail}</span>
                  </div>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">+{q.xp} XP</span>
                </div>
                <div className="h-1.5 rounded-sm bg-secondary overflow-hidden">
                  <div className="h-full bg-orange-300" style={{ width: `${q.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border px-3.5 py-2.5 text-[13px] text-muted-foreground">
              <Check className="w-4 h-4" strokeWidth={2.5} />
              {game.ledger.length} {game.ledger.length === 1 ? "quest" : "quests"} completed · {xp} XP earned
            </div>
          </div>
        )}

        {!calm && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-bold">Badges</h3>
              <span className="text-xs text-muted-foreground">{game.badges.length} of {BADGES.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {BADGES.map(b => {
                const earned = game.badges.find(x => x.id === b.id);
                const [cur, target] = badgeProgress(b.id, game.ledger, badgeFacts);
                const sprite = BADGE_SPRITES[b.id];
                return (
                  <div key={b.id} className={`rounded-xl border border-border px-1.5 py-3 flex flex-col items-center gap-1.5 text-center ${earned ? "bg-card" : "bg-secondary/60"}`}>
                    <PixelSprite rows={sprite.rows} palette={earned ? sprite.palette : BADGE_LOCKED} size={36} className={earned ? "" : "opacity-60"} label={b.name} />
                    <span className="text-xs font-bold leading-tight">{b.name}</span>
                    <span className="text-[11px] leading-tight text-muted-foreground">
                      {earned
                        ? `Earned ${new Date(earned.at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`
                        : target > 1 ? `${b.hint} · ${cur} of ${target}` : b.hint}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
